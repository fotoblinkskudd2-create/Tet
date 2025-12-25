CREATE TABLE IF NOT EXISTS vibes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vibe_description TEXT NOT NULL,
  playlist_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  cover_art_description TEXT,
  gonzo_text TEXT,
  color_palette JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for faster user queries
CREATE INDEX idx_vibes_user_id ON vibes(user_id);
CREATE INDEX idx_vibes_created_at ON vibes(created_at DESC);

-- Use existing trigger function for updated_at
DROP TRIGGER IF EXISTS set_timestamp ON vibes;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON vibes
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();
