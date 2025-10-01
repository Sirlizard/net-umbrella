/*
  # Enhanced User-Friend Interaction Tracking

  1. New Tables
    - `users` - User profiles linked to auth
    - Enhanced `friends` table with message counters
    - `friend_interactions` - Detailed interaction logging

  2. Features
    - One-to-many relationship: User → Friends
    - Automatic message counting via triggers
    - Last message timestamps tracking
    - Comprehensive interaction logging

  3. Security
    - Row Level Security on all tables
    - Users can only access their own data
    - Proper foreign key relationships

  4. Performance
    - Indexes for fast queries
    - Optimized for dashboard analytics
*/

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(auth_id)
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own profile
CREATE POLICY "Users can manage their own profile"
  ON users
  FOR ALL
  TO authenticated
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

-- Add message tracking columns to friends table
DO $$
BEGIN
  -- Add message sent count
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'friends' AND column_name = 'messages_sent_count'
  ) THEN
    ALTER TABLE friends ADD COLUMN messages_sent_count integer DEFAULT 0;
  END IF;

  -- Add message received count
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'friends' AND column_name = 'messages_received_count'
  ) THEN
    ALTER TABLE friends ADD COLUMN messages_received_count integer DEFAULT 0;
  END IF;

  -- Add last message sent timestamp
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'friends' AND column_name = 'last_message_sent'
  ) THEN
    ALTER TABLE friends ADD COLUMN last_message_sent timestamptz;
  END IF;

  -- Add last message received timestamp
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'friends' AND column_name = 'last_message_received'
  ) THEN
    ALTER TABLE friends ADD COLUMN last_message_received timestamptz;
  END IF;

  -- Add total interactions count
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'friends' AND column_name = 'total_interactions'
  ) THEN
    ALTER TABLE friends ADD COLUMN total_interactions integer DEFAULT 0;
  END IF;
END $$;

-- Create friend_interactions table for detailed interaction logging
CREATE TABLE IF NOT EXISTS friend_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  friend_id uuid REFERENCES friends(id) ON DELETE CASCADE,
  interaction_type text NOT NULL CHECK (interaction_type IN (
    'message_sent', 'message_received', 'call_made', 'call_received', 
    'meeting', 'email_sent', 'email_received', 'other'
  )),
  platform text,
  notes text,
  interaction_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on friend_interactions
ALTER TABLE friend_interactions ENABLE ROW LEVEL SECURITY;

-- Create policy for friend_interactions
CREATE POLICY "Users can manage interactions of their friends"
  ON friend_interactions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM friends 
      WHERE friends.id = friend_interactions.friend_id 
      AND friends.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM friends 
      WHERE friends.id = friend_interactions.friend_id 
      AND friends.user_id = auth.uid()
    )
  );

-- Function to update friend statistics when interactions are added
CREATE OR REPLACE FUNCTION update_friend_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update counters and timestamps based on interaction type
  IF NEW.interaction_type = 'message_sent' THEN
    UPDATE friends 
    SET 
      messages_sent_count = messages_sent_count + 1,
      last_message_sent = NEW.interaction_date,
      last_contacted = GREATEST(COALESCE(last_contacted, NEW.interaction_date), NEW.interaction_date),
      total_interactions = total_interactions + 1,
      updated_at = now()
    WHERE id = NEW.friend_id;
    
  ELSIF NEW.interaction_type = 'message_received' THEN
    UPDATE friends 
    SET 
      messages_received_count = messages_received_count + 1,
      last_message_received = NEW.interaction_date,
      last_contacted = GREATEST(COALESCE(last_contacted, NEW.interaction_date), NEW.interaction_date),
      total_interactions = total_interactions + 1,
      updated_at = now()
    WHERE id = NEW.friend_id;
    
  ELSE
    -- For other interaction types, just update total count and last contacted
    UPDATE friends 
    SET 
      total_interactions = total_interactions + 1,
      last_contacted = GREATEST(COALESCE(last_contacted, NEW.interaction_date), NEW.interaction_date),
      updated_at = now()
    WHERE id = NEW.friend_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update friend stats
DROP TRIGGER IF EXISTS trigger_update_friend_stats ON friend_interactions;
CREATE TRIGGER trigger_update_friend_stats
  AFTER INSERT ON friend_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_friend_stats();

-- Function to migrate existing message_records data
CREATE OR REPLACE FUNCTION migrate_existing_message_data()
RETURNS void AS $$
DECLARE
  rec RECORD;
  friend_rec RECORD;
  sent_count integer;
  received_count integer;
  last_sent timestamptz;
  last_received timestamptz;
BEGIN
  -- Loop through each friend to calculate their message statistics
  FOR friend_rec IN 
    SELECT f.id as friend_id, f.user_id
    FROM friends f
  LOOP
    -- Calculate sent messages count and last sent time
    SELECT 
      COUNT(*) FILTER (WHERE mr.type = 'sent'),
      MAX(mr.timestamp) FILTER (WHERE mr.type = 'sent')
    INTO sent_count, last_sent
    FROM message_records mr
    JOIN social_links sl ON sl.id = mr.social_link_id
    WHERE sl.friend_id = friend_rec.friend_id;
    
    -- Calculate received messages count and last received time
    SELECT 
      COUNT(*) FILTER (WHERE mr.type = 'received'),
      MAX(mr.timestamp) FILTER (WHERE mr.type = 'received')
    INTO received_count, last_received
    FROM message_records mr
    JOIN social_links sl ON sl.id = mr.social_link_id
    WHERE sl.friend_id = friend_rec.friend_id;
    
    -- Update friend with calculated statistics
    UPDATE friends 
    SET 
      messages_sent_count = COALESCE(sent_count, 0),
      messages_received_count = COALESCE(received_count, 0),
      last_message_sent = last_sent,
      last_message_received = last_received,
      total_interactions = COALESCE(sent_count, 0) + COALESCE(received_count, 0),
      last_contacted = GREATEST(COALESCE(last_sent, '1970-01-01'::timestamptz), COALESCE(last_received, '1970-01-01'::timestamptz)),
      updated_at = now()
    WHERE id = friend_rec.friend_id;
    
    -- Migrate message records to friend_interactions
    INSERT INTO friend_interactions (friend_id, interaction_type, platform, interaction_date)
    SELECT 
      friend_rec.friend_id,
      CASE 
        WHEN mr.type = 'sent' THEN 'message_sent'
        WHEN mr.type = 'received' THEN 'message_received'
      END,
      sl.platform,
      mr.timestamp
    FROM message_records mr
    JOIN social_links sl ON sl.id = mr.social_link_id
    WHERE sl.friend_id = friend_rec.friend_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the migration
SELECT migrate_existing_message_data();

-- Create comprehensive view for friend statistics
CREATE OR REPLACE VIEW friend_stats AS
SELECT 
  f.*,
  CASE 
    WHEN f.last_contacted >= (now() - interval '3 days') THEN 'recent'
    WHEN f.last_contacted >= (now() - interval '2 weeks') THEN 'moderate'
    WHEN f.last_contacted >= (now() - interval '1 month') THEN 'overdue'
    ELSE 'very_overdue'
  END as contact_status,
  EXTRACT(days FROM (now() - f.last_contacted))::integer as days_since_contact,
  (SELECT COUNT(*) FROM social_links WHERE friend_id = f.id) as social_platforms_count,
  (SELECT COUNT(*) FROM friend_interactions WHERE friend_id = f.id) as total_logged_interactions
FROM friends f;

-- Enable RLS on the view
ALTER VIEW friend_stats SET (security_invoker = true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_last_contacted ON friends(last_contacted);
CREATE INDEX IF NOT EXISTS idx_friend_interactions_friend_id ON friend_interactions(friend_id);
CREATE INDEX IF NOT EXISTS idx_friend_interactions_date ON friend_interactions(interaction_date);
CREATE INDEX IF NOT EXISTS idx_friend_interactions_type ON friend_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);

-- Function to create user profile automatically
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (auth_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();