/*
  Complete Journals Migration with Many-to-Many Friend Relationships
  
  Creates:
  - journals table (owned by user profiles)
  - journal_entries table (pages within journals)
  - journal_entry_friends table (M2M mapping entries to friends)
  
  All tables have proper RLS policies using get_current_user_id()
*/

-- Journals table
CREATE TABLE IF NOT EXISTS journals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on journals table
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;

-- Create policy for journals
CREATE POLICY "Users manage own journals"
  ON journals FOR ALL TO authenticated
  USING (profile_user_id = get_current_user_id())
  WITH CHECK (profile_user_id = get_current_user_id());

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_journals_profile_user_id ON journals(profile_user_id);

-- Journal entries (pages within journals)
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id uuid NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on journal_entries
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Create policy for journal_entries
CREATE POLICY "Users manage entries in own journals"
  ON journal_entries FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM journals j
      WHERE j.id = journal_entries.journal_id
      AND j.profile_user_id = get_current_user_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM journals j
      WHERE j.id = journal_entries.journal_id
      AND j.profile_user_id = get_current_user_id()
    )
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_journal_id ON journal_entries(journal_id);

-- Many-to-many: journal entries ↔ friends
CREATE TABLE IF NOT EXISTS journal_entry_friends (
  journal_entry_id uuid NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  friend_id uuid NOT NULL REFERENCES friends(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (journal_entry_id, friend_id)
);

-- Enable RLS on journal_entry_friends
ALTER TABLE journal_entry_friends ENABLE ROW LEVEL SECURITY;

-- Create policy for journal_entry_friends
CREATE POLICY "Users manage mapping for own entries and friends"
  ON journal_entry_friends FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM journal_entries je
      JOIN journals j ON j.id = je.journal_id
      WHERE je.id = journal_entry_friends.journal_entry_id
      AND j.profile_user_id = get_current_user_id()
    )
    AND EXISTS (
      SELECT 1 FROM friends f
      WHERE f.id = journal_entry_friends.friend_id
      AND f.profile_user_id = get_current_user_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM journal_entries je
      JOIN journals j ON j.id = je.journal_id
      WHERE je.id = journal_entry_friends.journal_entry_id
      AND j.profile_user_id = get_current_user_id()
    )
    AND EXISTS (
      SELECT 1 FROM friends f
      WHERE f.id = journal_entry_friends.friend_id
      AND f.profile_user_id = get_current_user_id()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_jef_entry ON journal_entry_friends(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_jef_friend ON journal_entry_friends(friend_id);

-- Grant necessary permissions
GRANT ALL ON journals TO authenticated;
GRANT ALL ON journal_entries TO authenticated;
GRANT ALL ON journal_entry_friends TO authenticated;

