-- Create scripts table
CREATE TABLE IF NOT EXISTS scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  genre TEXT NOT NULL,
  location TEXT NOT NULL,
  main_conflict TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create scenes table
CREATE TABLE IF NOT EXISTS scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID REFERENCES scripts(id) ON DELETE CASCADE,
  scene_number INTEGER NOT NULL,
  location TEXT NOT NULL,
  time_of_day TEXT,
  description TEXT NOT NULL,
  camera_angle TEXT,
  dialogue JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(script_id, scene_number)
);

-- Create characters table
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID REFERENCES scripts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  actor_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(script_id, name)
);

-- Create indexes
CREATE INDEX idx_scripts_user_id ON scripts(user_id);
CREATE INDEX idx_scenes_script_id ON scenes(script_id);
CREATE INDEX idx_characters_script_id ON characters(script_id);

-- Create updated_at trigger for scripts
CREATE OR REPLACE FUNCTION update_scripts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER scripts_updated_at
BEFORE UPDATE ON scripts
FOR EACH ROW
EXECUTE FUNCTION update_scripts_updated_at();

-- Create updated_at trigger for scenes
CREATE OR REPLACE FUNCTION update_scenes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER scenes_updated_at
BEFORE UPDATE ON scenes
FOR EACH ROW
EXECUTE FUNCTION update_scenes_updated_at();

-- Create updated_at trigger for characters
CREATE OR REPLACE FUNCTION update_characters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER characters_updated_at
BEFORE UPDATE ON characters
FOR EACH ROW
EXECUTE FUNCTION update_characters_updated_at();
