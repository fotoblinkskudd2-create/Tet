-- RødPilleNorge Database Schema
-- Initial migration

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enums
CREATE TYPE user_role AS ENUM ('normie', 'rod_pille', 'moderator', 'admin');
CREATE TYPE subscription_tier AS ENUM ('free', 'elite');
CREATE TYPE vote_type AS ENUM ('up', 'down');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'dismissed');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    role user_role DEFAULT 'normie',
    red_pill_score INTEGER DEFAULT 0,
    lies_exposed_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_banned BOOLEAN DEFAULT FALSE,
    is_shadow_banned BOOLEAN DEFAULT FALSE,
    stripe_customer_id TEXT,
    subscription_tier subscription_tier DEFAULT 'free'
);

-- Posts table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source_url TEXT NOT NULL,
    media_urls JSONB DEFAULT '[]'::jsonb,
    tags TEXT[] DEFAULT '{}',
    ai_tags TEXT[] DEFAULT '{}',
    lie_score INTEGER CHECK (lie_score >= 0 AND lie_score <= 100),
    lie_analysis JSONB,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    red_pill_score INTEGER DEFAULT 0,
    controversial_factor FLOAT DEFAULT 1.0,
    is_flagged BOOLEAN DEFAULT FALSE,
    flag_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Votes table
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    vote_type vote_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT vote_target CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR
        (post_id IS NULL AND comment_id IS NOT NULL)
    ),
    UNIQUE(user_id, post_id),
    UNIQUE(user_id, comment_id)
);

-- Reports table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    ai_spam_score FLOAT,
    status report_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT report_target CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR
        (post_id IS NULL AND comment_id IS NOT NULL)
    )
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT NOT NULL,
    status subscription_status DEFAULT 'active',
    current_period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Donations table
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL, -- Amount in øre
    stripe_payment_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RSS Sources table
CREATE TABLE rss_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_fetched TIMESTAMPTZ
);

-- Known lies database (reference data)
CREATE TABLE known_lies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    party TEXT NOT NULL,
    claim TEXT NOT NULL,
    truth TEXT NOT NULL,
    source TEXT NOT NULL,
    category TEXT NOT NULL
);

-- Push tokens table
CREATE TABLE push_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform TEXT NOT NULL, -- 'ios', 'android', 'web'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, token)
);

-- Indexes for performance
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_red_pill_score ON posts(red_pill_score DESC);
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX idx_posts_ai_tags ON posts USING GIN(ai_tags);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_votes_user ON votes(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);
CREATE INDEX idx_users_username ON users(username);

-- Full text search on posts
CREATE INDEX idx_posts_fts ON posts USING GIN(
    to_tsvector('norwegian', title || ' ' || content)
);

-- Functions

-- Calculate red pill score
CREATE OR REPLACE FUNCTION calculate_red_pill_score(p_post_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_upvotes INTEGER;
    v_downvotes INTEGER;
    v_controversial FLOAT;
    v_score INTEGER;
BEGIN
    SELECT upvotes, downvotes, controversial_factor
    INTO v_upvotes, v_downvotes, v_controversial
    FROM posts WHERE id = p_post_id;

    v_score := GREATEST(0, (v_upvotes - v_downvotes) * v_controversial);

    UPDATE posts SET red_pill_score = v_score WHERE id = p_post_id;

    RETURN v_score;
END;
$$ LANGUAGE plpgsql;

-- Increment vote count
CREATE OR REPLACE FUNCTION increment_vote(p_post_id UUID, vote_field TEXT)
RETURNS VOID AS $$
BEGIN
    IF vote_field = 'upvotes' THEN
        UPDATE posts SET upvotes = upvotes + 1 WHERE id = p_post_id;
    ELSE
        UPDATE posts SET downvotes = downvotes + 1 WHERE id = p_post_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Decrement vote count
CREATE OR REPLACE FUNCTION decrement_vote(p_post_id UUID, vote_field TEXT)
RETURNS VOID AS $$
BEGIN
    IF vote_field = 'upvotes' THEN
        UPDATE posts SET upvotes = GREATEST(0, upvotes - 1) WHERE id = p_post_id;
    ELSE
        UPDATE posts SET downvotes = GREATEST(0, downvotes - 1) WHERE id = p_post_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Swap vote
CREATE OR REPLACE FUNCTION swap_vote(p_post_id UUID, inc_field TEXT, dec_field TEXT)
RETURNS VOID AS $$
BEGIN
    IF inc_field = 'upvotes' THEN
        UPDATE posts SET upvotes = upvotes + 1, downvotes = GREATEST(0, downvotes - 1) WHERE id = p_post_id;
    ELSE
        UPDATE posts SET downvotes = downvotes + 1, upvotes = GREATEST(0, upvotes - 1) WHERE id = p_post_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user red_pill_score when they receive upvotes
CREATE OR REPLACE FUNCTION update_user_score()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.post_id IS NOT NULL AND NEW.vote_type = 'up' THEN
            UPDATE users SET red_pill_score = red_pill_score + 1
            FROM posts WHERE posts.id = NEW.post_id AND users.id = posts.author_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.post_id IS NOT NULL AND OLD.vote_type = 'up' THEN
            UPDATE users SET red_pill_score = GREATEST(0, red_pill_score - 1)
            FROM posts WHERE posts.id = OLD.post_id AND users.id = posts.author_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_score
AFTER INSERT OR DELETE ON votes
FOR EACH ROW EXECUTE FUNCTION update_user_score();

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_posts_updated
BEFORE UPDATE ON posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, username)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users are viewable by everyone" ON users
    FOR SELECT USING (NOT is_shadow_banned OR auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Posts policies
CREATE POLICY "Posts are viewable by everyone" ON posts
    FOR SELECT USING (
        NOT is_flagged OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
    );

CREATE POLICY "Authenticated users can create posts" ON posts
    FOR INSERT WITH CHECK (
        auth.uid() = author_id AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('rod_pille', 'moderator', 'admin') AND NOT is_banned)
    );

CREATE POLICY "Authors can update own posts" ON posts
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors and mods can delete posts" ON posts
    FOR DELETE USING (
        auth.uid() = author_id OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
    );

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON comments
    FOR SELECT USING (NOT is_deleted);

CREATE POLICY "Authenticated users can create comments" ON comments
    FOR INSERT WITH CHECK (
        auth.uid() = author_id AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND NOT is_banned)
    );

CREATE POLICY "Authors can update own comments" ON comments
    FOR UPDATE USING (auth.uid() = author_id);

-- Votes policies
CREATE POLICY "Users can see own votes" ON votes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can vote" ON votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can change own votes" ON votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can remove own votes" ON votes
    FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can see own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
