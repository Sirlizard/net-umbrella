/*
  # Connect User Authentication to User Profiles

  1. Database Functions
    - `handle_new_user()` - Automatically creates user profile on signup
    - `get_current_user_id()` - Helper function to get current user's profile ID

  2. Triggers
    - Auto-create user profile when new auth user signs up
    - Link all user data through profile ID instead of auth ID

  3. Security Updates
    - Update RLS policies to use profile-based access
    - Ensure data isolation between users

  4. Data Migration
    - Link existing friends to user profiles
    - Update foreign key relationships
*/

-- Create function to get current user's profile ID
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM users WHERE auth_id = auth.uid();
$$;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update friends table to use profile ID instead of auth ID
DO $$
BEGIN
  -- Add new column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'friends' AND column_name = 'profile_user_id'
  ) THEN
    ALTER TABLE friends ADD COLUMN profile_user_id uuid REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Migrate existing friends data to use profile IDs
UPDATE friends 
SET profile_user_id = users.id
FROM users 
WHERE friends.user_id = users.auth_id 
AND friends.profile_user_id IS NULL;

-- Update friends table constraints and indexes
ALTER TABLE friends DROP CONSTRAINT IF EXISTS friends_user_id_fkey;
DROP INDEX IF EXISTS idx_friends_user_id;

-- Make profile_user_id the primary foreign key
ALTER TABLE friends 
  ALTER COLUMN profile_user_id SET NOT NULL,
  ADD CONSTRAINT friends_profile_user_id_fkey 
    FOREIGN KEY (profile_user_id) REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX idx_friends_profile_user_id ON friends(profile_user_id);

-- Update RLS policies for friends table
DROP POLICY IF EXISTS "Users can view their own friends" ON friends;
DROP POLICY IF EXISTS "Users can insert their own friends" ON friends;
DROP POLICY IF EXISTS "Users can update their own friends" ON friends;
DROP POLICY IF EXISTS "Users can delete their own friends" ON friends;

CREATE POLICY "Users can view their own friends"
  ON friends
  FOR SELECT
  TO authenticated
  USING (profile_user_id = get_current_user_id());

CREATE POLICY "Users can insert their own friends"
  ON friends
  FOR INSERT
  TO authenticated
  WITH CHECK (profile_user_id = get_current_user_id());

CREATE POLICY "Users can update their own friends"
  ON friends
  FOR UPDATE
  TO authenticated
  USING (profile_user_id = get_current_user_id())
  WITH CHECK (profile_user_id = get_current_user_id());

CREATE POLICY "Users can delete their own friends"
  ON friends
  FOR DELETE
  TO authenticated
  USING (profile_user_id = get_current_user_id());

-- Update social_links RLS policies to use profile-based access
DROP POLICY IF EXISTS "Users can manage social links of their friends" ON social_links;
DROP POLICY IF EXISTS "Users can view social links of their friends" ON social_links;

CREATE POLICY "Users can manage social links of their friends"
  ON social_links
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM friends 
      WHERE friends.id = social_links.friend_id 
      AND friends.profile_user_id = get_current_user_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM friends 
      WHERE friends.id = social_links.friend_id 
      AND friends.profile_user_id = get_current_user_id()
    )
  );

-- Update friend_interactions RLS policies
DROP POLICY IF EXISTS "Users can manage interactions of their friends" ON friend_interactions;

CREATE POLICY "Users can manage interactions of their friends"
  ON friend_interactions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM friends 
      WHERE friends.id = friend_interactions.friend_id 
      AND friends.profile_user_id = get_current_user_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM friends 
      WHERE friends.id = friend_interactions.friend_id 
      AND friends.profile_user_id = get_current_user_id()
    )
  );

-- Update message_records RLS policies
DROP POLICY IF EXISTS "Users can manage message records of their social links" ON message_records;
DROP POLICY IF EXISTS "Users can view message records of their social links" ON message_records;

CREATE POLICY "Users can manage message records of their social links"
  ON message_records
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM social_links
      JOIN friends ON friends.id = social_links.friend_id
      WHERE social_links.id = message_records.social_link_id 
      AND friends.profile_user_id = get_current_user_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM social_links
      JOIN friends ON friends.id = social_links.friend_id
      WHERE social_links.id = message_records.social_link_id 
      AND friends.profile_user_id = get_current_user_id()
    )
  );

-- Update friend_stats view to use profile-based access
DROP VIEW IF EXISTS friend_stats;
CREATE VIEW friend_stats AS
SELECT 
  f.id,
  f.profile_user_id as user_id,
  f.name,
  f.bio,
  f.last_contacted,
  f.contact_frequency,
  f.created_at,
  f.updated_at,
  f.messages_sent_count,
  f.messages_received_count,
  f.last_message_sent,
  f.last_message_received,
  f.total_interactions,
  CASE 
    WHEN f.last_contacted >= CURRENT_DATE - INTERVAL '3 days' THEN 'recent'
    WHEN f.last_contacted >= CURRENT_DATE - INTERVAL '14 days' THEN 'moderate'
    WHEN f.last_contacted >= CURRENT_DATE - INTERVAL '30 days' THEN 'overdue'
    ELSE 'very_overdue'
  END as contact_status,
  EXTRACT(DAY FROM (CURRENT_DATE - f.last_contacted::date))::integer as days_since_contact,
  COALESCE(social_count.platform_count, 0) as social_platforms_count,
  COALESCE(interaction_count.total_logged_interactions, 0) as total_logged_interactions
FROM friends f
LEFT JOIN (
  SELECT 
    friend_id, 
    COUNT(DISTINCT platform) as platform_count
  FROM social_links 
  GROUP BY friend_id
) social_count ON f.id = social_count.friend_id
LEFT JOIN (
  SELECT 
    friend_id,
    COUNT(*) as total_logged_interactions
  FROM friend_interactions
  GROUP BY friend_id
) interaction_count ON f.id = interaction_count.friend_id;

-- Add RLS to friend_stats view
ALTER VIEW friend_stats SET (security_invoker = true);

-- Create helper function for frontend to get user profile
CREATE OR REPLACE FUNCTION get_user_profile()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id, email, full_name, avatar_url, created_at, updated_at
  FROM users 
  WHERE auth_id = auth.uid();
$$;