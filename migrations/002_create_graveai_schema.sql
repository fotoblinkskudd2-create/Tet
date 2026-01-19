-- GraveAI/NecroPrompt Database Schema
-- Core tables for AI-powered deceased person simulation

-- Update users table to add subscription info
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users DROP COLUMN IF EXISTS rating;
ALTER TABLE users DROP COLUMN IF EXISTS games_played;
ALTER TABLE users DROP COLUMN IF EXISTS wins;
ALTER TABLE users DROP COLUMN IF EXISTS losses;
ALTER TABLE users DROP COLUMN IF EXISTS draws;

-- Deceased persons - the people being simulated
CREATE TABLE IF NOT EXISTS deceased_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  nickname TEXT,
  birth_date DATE,
  death_date DATE,
  relationship TEXT, -- 'mother', 'father', 'friend', 'partner', etc.
  profile_photo_url TEXT,
  personality_summary TEXT, -- AI-generated summary of personality
  voice_characteristics JSONB, -- tone, pitch, accent, speech patterns
  favorite_phrases TEXT[], -- array of common expressions
  emotional_patterns JSONB, -- happiness triggers, anger patterns, etc.
  dialect TEXT, -- 'bergensk', 'trøndersk', 'østlandsk', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_interaction_at TIMESTAMPTZ
);

CREATE INDEX idx_deceased_persons_user_id ON deceased_persons(user_id);
CREATE INDEX idx_deceased_persons_last_interaction ON deceased_persons(last_interaction_at);

-- Data sources uploaded for each person
CREATE TABLE IF NOT EXISTS data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deceased_person_id UUID NOT NULL REFERENCES deceased_persons(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL, -- 'whatsapp', 'imessage', 'email', 'facebook', 'instagram', 'twitter', 'voice_memo', 'photos', etc.
  file_name TEXT,
  file_size_bytes BIGINT,
  file_url TEXT,
  upload_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  processing_error TEXT,
  message_count INTEGER DEFAULT 0,
  date_range_start DATE,
  date_range_end DATE,
  metadata JSONB, -- extra info like chat names, participant lists, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX idx_data_sources_deceased_person ON data_sources(deceased_person_id);
CREATE INDEX idx_data_sources_status ON data_sources(upload_status);

-- Individual memories/messages extracted from data sources
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deceased_person_id UUID NOT NULL REFERENCES deceased_persons(id) ON DELETE CASCADE,
  data_source_id UUID REFERENCES data_sources(id) ON DELETE SET NULL,
  memory_type TEXT NOT NULL, -- 'message', 'email', 'post', 'photo_caption', 'voice_transcript', etc.
  content TEXT NOT NULL,
  content_language TEXT DEFAULT 'no', -- 'no', 'en', etc.
  timestamp TIMESTAMPTZ,
  participants TEXT[], -- other people involved in this memory
  location TEXT,
  emotion_detected TEXT, -- 'happy', 'sad', 'angry', 'sarcastic', 'loving', etc.
  context TEXT, -- conversational context or situation
  media_urls TEXT[], -- associated photos, videos, voice files
  embedding vector(1536), -- OpenAI ada-002 embeddings (1536 dimensions)
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_memories_deceased_person ON memories(deceased_person_id);
CREATE INDEX idx_memories_timestamp ON memories(timestamp);
CREATE INDEX idx_memories_emotion ON memories(emotion_detected);
-- Vector similarity search index (requires pgvector extension)
-- CREATE INDEX idx_memories_embedding ON memories USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Conversations between user and deceased person
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deceased_person_id UUID NOT NULL REFERENCES deceased_persons(id) ON DELETE CASCADE,
  title TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  context_summary TEXT, -- running summary of conversation for better coherence
  mood TEXT -- 'casual', 'therapy', 'nostalgic', 'confrontational', etc.
);

CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_conversations_deceased_person ON conversations(deceased_person_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

-- Individual messages in conversations
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user' or 'assistant' (the deceased)
  content TEXT NOT NULL,
  voice_url TEXT, -- if voice was generated for this message
  emotion TEXT, -- emotion expressed in response
  memories_used UUID[], -- array of memory IDs that informed this response
  tokens_used INTEGER, -- for billing/usage tracking
  model_used TEXT, -- 'llama-3.1-70b', 'claude-3-sonnet', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Voice samples for voice cloning
CREATE TABLE IF NOT EXISTS voice_samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deceased_person_id UUID NOT NULL REFERENCES deceased_persons(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  duration_seconds REAL,
  transcript TEXT,
  quality_score REAL, -- 0-1, how good this sample is for cloning
  elevenlabs_voice_id TEXT, -- ID from ElevenLabs after cloning
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_voice_samples_deceased_person ON voice_samples(deceased_person_id);

-- Subscription tracking
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL, -- 'free', 'premium', 'eternal'
  status TEXT NOT NULL, -- 'active', 'cancelled', 'expired', 'pending'
  price_paid_nok INTEGER,
  stripe_subscription_id TEXT,
  stripe_payment_intent_id TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  metadata JSONB
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Usage tracking for rate limiting and billing
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'chat_message', 'voice_generation', 'data_upload', etc.
  tokens_used INTEGER DEFAULT 0,
  cost_nok REAL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usage_logs_user_created ON usage_logs(user_id, created_at);

-- Shared access (family sharing feature)
CREATE TABLE IF NOT EXISTS shared_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deceased_person_id UUID NOT NULL REFERENCES deceased_persons(id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shared_with_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_level TEXT NOT NULL DEFAULT 'view', -- 'view', 'chat', 'edit'
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(deceased_person_id, shared_with_user_id)
);

CREATE INDEX idx_shared_access_shared_with ON shared_access(shared_with_user_id);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS set_timestamp_deceased_persons ON deceased_persons;
CREATE TRIGGER set_timestamp_deceased_persons
BEFORE UPDATE ON deceased_persons
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Comments for documentation
COMMENT ON TABLE deceased_persons IS 'People being simulated by the AI system';
COMMENT ON TABLE memories IS 'Individual messages, posts, and moments extracted from uploaded data';
COMMENT ON TABLE conversations IS 'Chat sessions between users and their deceased loved ones';
COMMENT ON TABLE messages IS 'Individual messages within conversations';
COMMENT ON COLUMN memories.embedding IS 'Vector embedding for semantic similarity search (requires pgvector)';
COMMENT ON COLUMN deceased_persons.personality_summary IS 'AI-generated personality profile based on all memories';
COMMENT ON COLUMN deceased_persons.favorite_phrases IS 'Common expressions like "æ faen", "jævlig bra", etc.';
