-- Leasing System Migration
-- AI-powered leasing recommendation system

-- Leasing categories (cars, apartments, equipment, etc.)
CREATE TABLE leasing_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Available leasing items
CREATE TABLE leasing_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES leasing_categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    monthly_price DECIMAL(10, 2) NOT NULL,
    deposit DECIMAL(10, 2) DEFAULT 0,
    min_lease_months INTEGER DEFAULT 12,
    max_lease_months INTEGER DEFAULT 48,
    specifications JSONB DEFAULT '{}',  -- Flexible specs (horsepower, sqm, features, etc.)
    image_url TEXT,
    provider VARCHAR(255),
    rating DECIMAL(3, 2) DEFAULT 0,
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User preferences for AI recommendations
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES leasing_categories(id) ON DELETE CASCADE,
    budget_min DECIMAL(10, 2),
    budget_max DECIMAL(10, 2),
    preferred_duration INTEGER,  -- in months
    priorities JSONB DEFAULT '{}',  -- e.g., {"eco_friendly": 10, "luxury": 5, "cost_effective": 8}
    usage_pattern TEXT,  -- e.g., "daily commute", "weekend trips", "family use"
    must_have_features TEXT[],
    nice_to_have_features TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, category_id)
);

-- AI-generated recommendations with reasoning
CREATE TABLE ai_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    preference_id UUID REFERENCES user_preferences(id) ON DELETE CASCADE,
    item_id UUID REFERENCES leasing_items(id) ON DELETE CASCADE,
    score DECIMAL(5, 2) NOT NULL,  -- AI confidence score (0-100)
    reasoning JSONB NOT NULL,  -- Detailed explanation of why this is recommended
    match_details JSONB,  -- How well it matches each preference criterion
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Active leasing contracts
CREATE TABLE leasing_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID REFERENCES leasing_items(id) ON DELETE CASCADE,
    recommendation_id UUID REFERENCES ai_recommendations(id) ON DELETE SET NULL,
    monthly_payment DECIMAL(10, 2) NOT NULL,
    deposit_paid DECIMAL(10, 2) NOT NULL,
    duration_months INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',  -- active, completed, cancelled
    satisfaction_rating INTEGER,  -- 1-5, filled after contract
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leasing_items_updated_at BEFORE UPDATE ON leasing_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leasing_contracts_updated_at BEFORE UPDATE ON leasing_contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_leasing_items_category ON leasing_items(category_id);
CREATE INDEX idx_leasing_items_price ON leasing_items(monthly_price);
CREATE INDEX idx_user_preferences_user ON user_preferences(user_id);
CREATE INDEX idx_ai_recommendations_user ON ai_recommendations(user_id);
CREATE INDEX idx_ai_recommendations_score ON ai_recommendations(score DESC);
CREATE INDEX idx_leasing_contracts_user ON leasing_contracts(user_id);
CREATE INDEX idx_leasing_contracts_status ON leasing_contracts(status);

-- Insert sample categories
INSERT INTO leasing_categories (name, description, icon) VALUES
    ('Biler', 'Personbiler og elektriske kjøretøy', '🚗'),
    ('Leiligheter', 'Urbane og moderne leiligheter', '🏠'),
    ('Elektronikk', 'Laptops, telefoner og enheter', '💻'),
    ('Utstyr', 'Verktøy og spesialutstyr', '🔧');

-- Insert sample leasing items for demonstration
INSERT INTO leasing_items (category_id, name, description, monthly_price, deposit, specifications, provider, rating, available)
SELECT
    c.id,
    'Tesla Model 3 Long Range',
    'Elektrisk sedan med fantastisk rekkevidde og autopilot',
    6500.00,
    25000.00,
    '{"range_km": 614, "acceleration_0_100": 4.4, "seats": 5, "eco_friendly": true, "autopilot": true, "luxury_level": 8}'::jsonb,
    'Tesla Leasing Norge',
    4.8,
    true
FROM leasing_categories c WHERE c.name = 'Biler';

INSERT INTO leasing_items (category_id, name, description, monthly_price, deposit, specifications, provider, rating, available)
SELECT
    c.id,
    'Toyota Yaris Hybrid',
    'Kompakt og økonomisk hybrid perfekt for byen',
    3200.00,
    15000.00,
    '{"range_km": 450, "fuel_consumption": 0.38, "seats": 5, "eco_friendly": true, "city_friendly": true, "luxury_level": 5}'::jsonb,
    'Toyota Leasing',
    4.5,
    true
FROM leasing_categories c WHERE c.name = 'Biler';

INSERT INTO leasing_items (category_id, name, description, monthly_price, deposit, specifications, provider, rating, available)
SELECT
    c.id,
    'BMW iX3',
    'Premium elektrisk SUV med sportlig kjøredynamikk',
    7800.00,
    35000.00,
    '{"range_km": 460, "acceleration_0_100": 6.8, "seats": 5, "eco_friendly": true, "luxury_level": 9, "cargo_space": 510}'::jsonb,
    'BMW Financial Services',
    4.7,
    true
FROM leasing_categories c WHERE c.name = 'Biler';

INSERT INTO leasing_items (category_id, name, description, monthly_price, deposit, specifications, provider, rating, available)
SELECT
    c.id,
    'Moderne 2-roms i Grünerløkka',
    'Sentral beliggenhet, nyrenovert med balkong',
    18500.00,
    55500.00,
    '{"sqm": 55, "rooms": 2, "floor": 3, "balcony": true, "parking": false, "location_score": 9, "modern": true}'::jsonb,
    'Urban Leasing AS',
    4.6,
    true
FROM leasing_categories c WHERE c.name = 'Leiligheter';

INSERT INTO leasing_items (category_id, name, description, monthly_price, deposit, specifications, provider, rating, available)
SELECT
    c.id,
    'MacBook Pro 16" M3 Max',
    'Kraftig laptop for kreativt arbeid og utvikling',
    1850.00,
    5000.00,
    '{"ram_gb": 36, "storage_tb": 1, "screen_inches": 16, "performance_score": 10, "portability": 7, "battery_hours": 18}'::jsonb,
    'Tech Lease Norway',
    4.9,
    true
FROM leasing_categories c WHERE c.name = 'Elektronikk';

INSERT INTO leasing_items (category_id, name, description, monthly_price, deposit, specifications, provider, rating, available)
SELECT
    c.id,
    'Dell XPS 13',
    'Ultraportabel og elegant arbeidslaptop',
    980.00,
    2500.00,
    '{"ram_gb": 16, "storage_tb": 0.512, "screen_inches": 13, "performance_score": 7, "portability": 10, "battery_hours": 12}'::jsonb,
    'Tech Lease Norway',
    4.4,
    true
FROM leasing_categories c WHERE c.name = 'Elektronikk';
