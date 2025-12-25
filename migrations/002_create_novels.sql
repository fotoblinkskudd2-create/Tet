-- Create novels table to store generated novels
CREATE TABLE IF NOT EXISTS novels (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  genre TEXT NOT NULL,
  tone TEXT NOT NULL,
  chapters JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'generating', -- 'generating', 'completed', 'failed'
  total_chapters INTEGER DEFAULT 7,
  current_chapter INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_novels_user_id ON novels(user_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_novels_status ON novels(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_novels_created_at ON novels(created_at DESC);
