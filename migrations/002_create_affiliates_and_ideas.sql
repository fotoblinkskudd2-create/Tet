-- Affiliate Profiles Table
CREATE TABLE IF NOT EXISTS affiliate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  commission_tier VARCHAR(20) NOT NULL DEFAULT 'bronze',
  total_earnings DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_referrals INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_commission_tier CHECK (commission_tier IN ('bronze', 'silver', 'gold', 'platinum'))
);

-- Referrals Table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliate_profiles(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  commission_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'paid'))
);

-- Affiliate Clicks Table
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliate_profiles(id) ON DELETE CASCADE,
  product_url TEXT NOT NULL,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  converted BOOLEAN NOT NULL DEFAULT FALSE,
  conversion_date TIMESTAMPTZ
);

-- Generated Ideas Table
CREATE TABLE IF NOT EXISTS generated_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  categories JSONB NOT NULL DEFAULT '[]',
  details JSONB NOT NULL DEFAULT '{}',
  affiliate_opportunities JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_user_id ON affiliate_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_referral_code ON affiliate_profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_affiliate_id ON referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate_id ON affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_converted ON affiliate_clicks(converted);
CREATE INDEX IF NOT EXISTS idx_generated_ideas_user_id ON generated_ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_ideas_created_at ON generated_ideas(created_at DESC);

-- Triggers for updated_at timestamps
DROP TRIGGER IF EXISTS set_timestamp_affiliate_profiles ON affiliate_profiles;
CREATE TRIGGER set_timestamp_affiliate_profiles
BEFORE UPDATE ON affiliate_profiles
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_referrals ON referrals;
CREATE TRIGGER set_timestamp_referrals
BEFORE UPDATE ON referrals
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_generated_ideas ON generated_ideas;
CREATE TRIGGER set_timestamp_generated_ideas
BEFORE UPDATE ON generated_ideas
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();
