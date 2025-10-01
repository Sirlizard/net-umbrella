/*
  # Enhanced Friends and Message Tracking Schema

  1. Updated Tables
    - `friends` table: Enhanced with message counters and tracking
    - `social_links` table: Updated with better message tracking
    - `message_records` table: Enhanced with more detailed tracking

  2. New Features
    - Message sent/received counters on friends table
    - Last message timestamps for both sent and received
    - Automatic triggers to update counters when messages are recorded
    - Better indexing for performance

  3. Security
    - All existing RLS policies maintained
    - New triggers for automatic counter updates
*/

-- Add new columns to friends table for message tracking
DO $$
BEGIN
  -- Add message counters if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'friends' AND column_name = 'messages_sent_count'
  ) THEN
    ALTER TABLE friends ADD COLUMN messages_sent_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'friends' AND column_name = 'messages_received_count'
  ) THEN
    ALTER TABLE friends ADD COLUMN messages_received_count integer DEFAULT 0;
  END IF;

  -- Add last message timestamps if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'friends' AND column_name = 'last_message_sent'
  ) THEN
    ALTER TABLE friends ADD COLUMN last_message_sent timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'friends' AND column_name = 'last_message_received'
  ) THEN
    ALTER TABLE friends ADD COLUMN last_message_received timestamptz;
  END IF;
END $$;

-- Create function to update friend message counters
CREATE OR REPLACE FUNCTION update_friend_message_counters()
RETURNS TRIGGER AS $$
DECLARE
  friend_record RECORD;
BEGIN
  -- Get the friend record through social_links
  SELECT f.* INTO friend_record
  FROM friends f
  JOIN social_links sl ON sl.friend_id = f.id
  WHERE sl.id = NEW.social_link_id;

  IF FOUND THEN
    IF NEW.type = 'sent' THEN
      -- Update sent message count and timestamp
      UPDATE friends 
      SET 
        messages_sent_count = COALESCE(messages_sent_count, 0) + 1,
        last_message_sent = NEW.timestamp,
        last_contacted = NEW.timestamp,
        updated_at = now()
      WHERE id = friend_record.id;
    ELSIF NEW.type = 'received' THEN
      -- Update received message count and timestamp
      UPDATE friends 
      SET 
        messages_received_count = COALESCE(messages_received_count, 0) + 1,
        last_message_received = NEW.timestamp,
        last_contacted = GREATEST(COALESCE(last_contacted, NEW.timestamp), NEW.timestamp),
        updated_at = now()
      WHERE id = friend_record.id;
    END IF;

    -- Also update the social_links last_contacted
    UPDATE social_links 
    SET last_contacted = NEW.timestamp
    WHERE id = NEW.social_link_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic counter updates
DROP TRIGGER IF EXISTS trigger_update_friend_counters ON message_records;
CREATE TRIGGER trigger_update_friend_counters
  AFTER INSERT ON message_records
  FOR EACH ROW
  EXECUTE FUNCTION update_friend_message_counters();

-- Create function to recalculate existing counters (for data migration)
CREATE OR REPLACE FUNCTION recalculate_friend_message_counters()
RETURNS void AS $$
DECLARE
  friend_rec RECORD;
  sent_count integer;
  received_count integer;
  last_sent timestamptz;
  last_received timestamptz;
  last_contact timestamptz;
BEGIN
  -- Loop through all friends
  FOR friend_rec IN SELECT id FROM friends LOOP
    -- Calculate sent messages count and last sent timestamp
    SELECT 
      COUNT(*) FILTER (WHERE mr.type = 'sent'),
      MAX(mr.timestamp) FILTER (WHERE mr.type = 'sent')
    INTO sent_count, last_sent
    FROM message_records mr
    JOIN social_links sl ON sl.id = mr.social_link_id
    WHERE sl.friend_id = friend_rec.id;

    -- Calculate received messages count and last received timestamp
    SELECT 
      COUNT(*) FILTER (WHERE mr.type = 'received'),
      MAX(mr.timestamp) FILTER (WHERE mr.type = 'received')
    INTO received_count, last_received
    FROM message_records mr
    JOIN social_links sl ON sl.id = mr.social_link_id
    WHERE sl.friend_id = friend_rec.id;

    -- Determine last contact time
    last_contact := GREATEST(COALESCE(last_sent, '1970-01-01'::timestamptz), COALESCE(last_received, '1970-01-01'::timestamptz));
    IF last_contact = '1970-01-01'::timestamptz THEN
      last_contact := NULL;
    END IF;

    -- Update the friend record
    UPDATE friends 
    SET 
      messages_sent_count = COALESCE(sent_count, 0),
      messages_received_count = COALESCE(received_count, 0),
      last_message_sent = last_sent,
      last_message_received = last_received,
      last_contacted = COALESCE(last_contact, last_contacted),
      updated_at = now()
    WHERE id = friend_rec.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the recalculation for existing data
SELECT recalculate_friend_message_counters();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_friends_user_id_last_contacted ON friends(user_id, last_contacted DESC);
CREATE INDEX IF NOT EXISTS idx_friends_messages_sent ON friends(user_id, messages_sent_count DESC);
CREATE INDEX IF NOT EXISTS idx_friends_messages_received ON friends(user_id, messages_received_count DESC);
CREATE INDEX IF NOT EXISTS idx_message_records_timestamp ON message_records(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_social_links_friend_id ON social_links(friend_id);

-- Create a view for easy friend statistics
CREATE OR REPLACE VIEW friend_statistics AS
SELECT 
  f.id,
  f.user_id,
  f.name,
  f.bio,
  f.contact_frequency,
  f.messages_sent_count,
  f.messages_received_count,
  f.messages_sent_count + f.messages_received_count as total_messages,
  f.last_message_sent,
  f.last_message_received,
  f.last_contacted,
  f.created_at,
  f.updated_at,
  COUNT(sl.id) as social_platforms_count,
  CASE 
    WHEN f.last_contacted IS NULL THEN 'never'
    WHEN f.last_contacted > now() - interval '3 days' THEN 'recent'
    WHEN f.last_contacted > now() - interval '2 weeks' THEN 'moderate'
    ELSE 'overdue'
  END as contact_status,
  EXTRACT(days FROM (now() - f.last_contacted)) as days_since_last_contact
FROM friends f
LEFT JOIN social_links sl ON sl.friend_id = f.id
GROUP BY f.id, f.user_id, f.name, f.bio, f.contact_frequency, 
         f.messages_sent_count, f.messages_received_count,
         f.last_message_sent, f.last_message_received, f.last_contacted,
         f.created_at, f.updated_at;

-- Grant access to the view
ALTER VIEW friend_statistics OWNER TO postgres;
GRANT SELECT ON friend_statistics TO authenticated;

-- Add RLS policy for the view
CREATE POLICY "Users can view their own friend statistics"
  ON friend_statistics
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());