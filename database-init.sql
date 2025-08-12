-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  clerk_user_id TEXT PRIMARY KEY,
  username TEXT,
  avatar_url TEXT,
  storage_used BIGINT DEFAULT 0,
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create folders table
CREATE TABLE IF NOT EXISTS folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES user_profiles(clerk_user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create transcriptions table
CREATE TABLE IF NOT EXISTS transcriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES user_profiles(clerk_user_id) ON DELETE CASCADE,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  original_text TEXT NOT NULL,
  edited_text TEXT,
  audio_url TEXT,
  audio_duration REAL,
  language TEXT DEFAULT 'zh',
  format_type TEXT DEFAULT 'plain' CHECK (format_type IN ('plain', 'markdown', 'meeting', 'subtitle')),
  metadata JSONB DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transcription embeddings table
CREATE TABLE IF NOT EXISTS transcription_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transcription_id UUID REFERENCES transcriptions(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  embedding vector(1536),
  chunk_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES user_profiles(clerk_user_id) ON DELETE CASCADE,
  folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transcriptions_user_id ON transcriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_transcriptions_folder_id ON transcriptions(folder_id);
CREATE INDEX IF NOT EXISTS idx_transcriptions_created_at ON transcriptions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transcriptions_is_favorite ON transcriptions(is_favorite);
CREATE INDEX IF NOT EXISTS idx_transcriptions_language ON transcriptions(language);

CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_created_at ON folders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_folders_is_favorite ON folders(is_favorite);

CREATE INDEX IF NOT EXISTS idx_embeddings_transcription_id ON transcription_embeddings(transcription_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_embedding ON transcription_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_folder_id ON chat_sessions(folder_id);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_transcriptions_text_search ON transcriptions USING gin(to_tsvector('english', title || ' ' || original_text || ' ' || COALESCE(edited_text, '')));

-- Create function for similarity search
CREATE OR REPLACE FUNCTION search_similar_transcriptions(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  folder_filter uuid DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  transcription_id uuid,
  chunk_text text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    te.id,
    te.transcription_id,
    te.chunk_text,
    1 - (te.embedding <=> query_embedding) as similarity
  FROM transcription_embeddings te
  JOIN transcriptions t ON te.transcription_id = t.id
  WHERE 1 - (te.embedding <=> query_embedding) > match_threshold
    AND (folder_filter IS NULL OR t.folder_id = folder_filter)
  ORDER BY te.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_folders_updated_at
  BEFORE UPDATE ON folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transcriptions_updated_at
  BEFORE UPDATE ON transcriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcription_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Folders policies
CREATE POLICY "Users can view own folders" ON folders
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert own folders" ON folders
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own folders" ON folders
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can delete own folders" ON folders
  FOR DELETE USING (user_id = auth.jwt() ->> 'sub');

-- Transcriptions policies
CREATE POLICY "Users can view own transcriptions" ON transcriptions
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert own transcriptions" ON transcriptions
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own transcriptions" ON transcriptions
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can delete own transcriptions" ON transcriptions
  FOR DELETE USING (user_id = auth.jwt() ->> 'sub');

-- Embeddings policies
CREATE POLICY "Users can view own embeddings" ON transcription_embeddings
  FOR SELECT USING (
    transcription_id IN (
      SELECT id FROM transcriptions WHERE user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can insert own embeddings" ON transcription_embeddings
  FOR INSERT WITH CHECK (
    transcription_id IN (
      SELECT id FROM transcriptions WHERE user_id = auth.jwt() ->> 'sub'
    )
  );

-- Chat sessions policies
CREATE POLICY "Users can view own chat sessions" ON chat_sessions
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert own chat sessions" ON chat_sessions
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own chat sessions" ON chat_sessions
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can delete own chat sessions" ON chat_sessions
  FOR DELETE USING (user_id = auth.jwt() ->> 'sub');