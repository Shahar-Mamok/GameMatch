-- Create players table
CREATE TABLE players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  games TEXT[] NOT NULL,
  platforms TEXT[] NOT NULL,
  level TEXT NOT NULL,
  availability TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read all players
CREATE POLICY "Users can view all players" ON players
  FOR SELECT USING (true);

-- Create policy to allow users to update their own player profile
CREATE POLICY "Users can update own player profile" ON players
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own player profile
CREATE POLICY "Users can delete own player profile" ON players
  FOR DELETE USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own player profile
CREATE POLICY "Users can insert own player profile" ON players
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX players_user_id_idx ON players(user_id); 