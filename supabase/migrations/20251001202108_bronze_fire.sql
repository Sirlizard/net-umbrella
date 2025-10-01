/*
  # Enhanced User-Friend Interaction Tracking

  1. New Tables
    - `users` table to properly store user profiles
    - Enhanced `friends` table with message tracking counters
    - `friend_interactions` table to log all interactions
    
  2. Features
    - One-to-many relationship: User -> Friends
    - Message sent/received counters on friends table
    - Last interaction timestamps
    - Detailed interaction logging
    
  3. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Proper foreign key relationships
    
  4. Performance
    - Indexes for fast queries
    - Automatic counter updates via triggers
*/

-- Create users table if it doesn't exist (for proper user profiles)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own profile
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Add message tracking columns to friends table if they don't exist
DO $$
BEGIN
  -- Add messages_sent_count column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'friends' AND column_name = 'messages_sent_count'
  ) THEN
    ALTER TABLE friends ADD COLUMN messages_sent_count integer DEFAULT 0;
  END IF;

  -- Add messages_received_count column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'friends' AND column_name = 'messages_received_count'
  ) THEN
    ALTER TABLE friends ADD COLUMN messages_received_count integer DEFAULT 0;
  END IF;

  -- Add last_message_sent column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'friends' AND column_name = 'last_message_sent'
  ) THEN
    ALTER TABLE friends ADD COLUMN last_message_sent timestamptz;
  END IF;

  -- Add last_message_received column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'friends' AND column_name = 'last_message_received'
  ) THEN
    ALTER TABLE friends ADD COLUMN last_message_received timestamptz;
  END IF;

  -- Add total_interactions column
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
  friend_id uuid NOT NULL REFERENCES friends(id) ON DELETE CASCADE,
  interaction_type text NOT NULL CHECK (interaction_type IN ('message_sent', 'message_received', 'call_made', 'call_received', 'meeting', 'other')),
  platform text, -- e.g., 'instagram', 'whatsapp', 'sms', 'phone', 'in_person'
  notes text,
  interaction_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on friend_interactions table
ALTER TABLE friend_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies for friend_interactions
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
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_last_contacted ON friends(last_contacted);
CREATE INDEX IF NOT EXISTS idx_friends_messages_sent ON friends(messages_sent_count);
CREATE INDEX IF NOT EXISTS idx_friends_messages_received ON friends(messages_received_count);
CREATE INDEX IF NOT EXISTS idx_friend_interactions_friend_id ON friend_interactions(friend_id);
CREATE INDEX IF NOT EXISTS idx_friend_interactions_date ON friend_interactions(interaction_date);
CREATE INDEX IF NOT EXISTS idx_friend_interactions_type ON friend_interactions(interaction_type);

-- Function to update friend counters when interactions are added
CREATE OR REPLACE FUNCTION update_friend_counters()
RETURNS TRIGGER AS $$
BEGIN
  -- Update counters based on interaction type
  IF NEW.interaction_type = 'message_sent' THEN
    UPDATE friends 
    SET 
      messages_sent_count = messages_sent_count + 1,
      last_message_sent = NEW.interaction_date,
      last_contacted = GREATEST(last_contacted, NEW.interaction_date),
      total_interactions = total_interactions + 1,
      updated_at = now()
    WHERE id = NEW.friend_id;
    
  ELSIF NEW.interaction_type = 'message_received' THEN
    UPDATE friends 
    SET 
      messages_received_count = messages_received_count + 1,
      last_message_received = NEW.interaction_date,
      last_contacted = GREATEST(last_contacted, NEW.interaction_date),
      total_interactions = total_interactions + 1,
      updated_at = now()
    WHERE id = NEW.friend_id;
    
  ELSE
    -- For other interaction types, just update total and last contacted
    UPDATE friends 
    SET 
      total_interactions = total_interactions + 1,
      last_contacted = GREATEST(last_contacted, NEW.interaction_date),
      updated_at = now()
    WHERE id = NEW.friend_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update counters
DROP TRIGGER IF EXISTS trigger_update_friend_counters ON friend_interactions;
CREATE TRIGGER trigger_update_friend_counters
  AFTER INSERT ON friend_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_friend_counters();

-- Function to migrate existing message_records data to new structure
CREATE OR REPLACE FUNCTION migrate_existing_message_data()
RETURNS void AS $$
DECLARE
  social_record RECORD;
  friend_record RECORD;
  message_record RECORD;
BEGIN
  -- Loop through all social_links and their message_records
  FOR social_record IN 
    SELECT sl.*, f.id as friend_id, f.user_id
    FROM social_links sl
    JOIN friends f ON f.id = sl.friend_id
  LOOP
    -- Loop through message_records for this social link
    FOR message_record IN
      SELECT * FROM message_records 
      WHERE social_link_id = social_record.id
      ORDER BY timestamp
    LOOP
      -- Insert into friend_interactions
      INSERT INTO friend_interactions (
        friend_id,
        interaction_type,
        platform,
        interaction_date
      ) VALUES (
        social_record.friend_id,
        CASE 
          WHEN message_record.type = 'sent' THEN 'message_sent'
          WHEN message_record.type = 'received' THEN 'message_received'
        END,
        social_record.platform,
        message_record.timestamp
      );
    END LOOP;
  END LOOP;
  
  -- Update friend counters based on migrated data
  UPDATE friends SET
    messages_sent_count = (
      SELECT COUNT(*) FROM friend_interactions 
      WHERE friend_id = friends.id AND interaction_type = 'message_sent'
    ),
    messages_received_count = (
      SELECT COUNT(*) FROM friend_interactions 
      WHERE friend_id = friends.id AND interaction_type = 'message_received'
    ),
    last_message_sent = (
      SELECT MAX(interaction_date) FROM friend_interactions 
      WHERE friend_id = friends.id AND interaction_type = 'message_sent'
    ),
    last_message_received = (
      SELECT MAX(interaction_date) FROM friend_interactions 
      WHERE friend_id = friends.id AND interaction_type = 'message_received'
    ),
    total_interactions = (
      SELECT COUNT(*) FROM friend_interactions 
      WHERE friend_id = friends.id
    );
END;
$$ LANGUAGE plpgsql;

-- Run the migration function
SELECT migrate_existing_message_data();

-- Create a view for easy friend statistics querying
CREATE OR REPLACE VIEW friend_stats AS
SELECT 
  f.*,
  COALESCE(f.messages_sent_count, 0) as sent_count,
  COALESCE(f.messages_received_count, 0) as received_count,
  COALESCE(f.total_interactions, 0) as interaction_count,
  EXTRACT(DAYS FROM (now() - f.last_contacted))::integer as days_since_contact,
  CASE 
    WHEN f.last_contacted >= now() - interval '3 days' THEN 'recent'
    WHEN f.last_contacted >= now() - interval '14 days' THEN 'moderate'
    WHEN f.last_contacted >= now() - interval '30 days' THEN 'overdue'
    ELSE 'very_overdue'
  END as contact_status,
  (SELECT COUNT(*) FROM social_links WHERE friend_id = f.id) as social_platforms_count
FROM friends f;

-- Grant access to the view
GRANT SELECT ON friend_stats TO authenticated;

-- Create RLS policy for the view
CREATE POLICY "Users can view their own friend stats"
  ON friend_stats
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());