-- Migration: Create articles table for news scanner
-- Date: 2026-01-16

CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    source TEXT NOT NULL,
    region TEXT NOT NULL, -- 'norway', 'usa', 'world'
    published_at TIMESTAMP NOT NULL,
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    raw_content TEXT,
    filtered_content TEXT, -- Fact-filtered content
    summary TEXT,
    category TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    metadata JSONB, -- Additional metadata about the article
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX idx_articles_region ON articles(region);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_source ON articles(source);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_fetched_at ON articles(fetched_at DESC);

-- Create table for user saved articles
CREATE TABLE IF NOT EXISTS user_saved_articles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, article_id)
);

CREATE INDEX idx_user_saved_articles_user_id ON user_saved_articles(user_id);
CREATE INDEX idx_user_saved_articles_saved_at ON user_saved_articles(saved_at DESC);
