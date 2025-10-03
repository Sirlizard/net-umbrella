/*
  # Create journals system

  1. New Tables
    - `journals`
      - `id` (uuid, primary key)
      - `profile_user_id` (uuid, foreign key to users)
      - `title` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `journal_entries`
      - `id` (uuid, primary key)
      - `journal_id` (uuid, foreign key to journals)
      - `content` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `journal_entry_friends`
      - `id` (uuid, primary key)
      - `journal_entry_id` (uuid, foreign key to journal_entries)
      - `friend_id` (uuid, foreign key to friends)
      - `created_at` (timestamp)

  2. Functions
    - `get_current_user_id()` - Returns the current user's profile ID

  3. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own journals and entries
*/

-- Create function to get current user's profile ID
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT id 
    FROM public.users 
    WHERE auth_id = auth.uid()
    LIMIT 1
  );
END;
$$;

-- Create journals table
CREATE TABLE IF NOT EXISTS public.journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id UUID REFERENCES public.journals(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create journal_entry_friends table (for tagging friends in entries)
CREATE TABLE IF NOT EXISTS public.journal_entry_friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES public.friends(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(journal_entry_id, friend_id)
);

-- Enable RLS on journals
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for journals
CREATE POLICY "Users can view their own journals" ON public.journals
  FOR SELECT USING (get_current_user_id() = profile_user_id);

CREATE POLICY "Users can insert their own journals" ON public.journals
  FOR INSERT WITH CHECK (get_current_user_id() = profile_user_id);

CREATE POLICY "Users can update their own journals" ON public.journals
  FOR UPDATE USING (get_current_user_id() = profile_user_id);

CREATE POLICY "Users can delete their own journals" ON public.journals
  FOR DELETE USING (get_current_user_id() = profile_user_id);

-- Enable RLS on journal_entries
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for journal_entries
CREATE POLICY "Users can view entries of their own journals" ON public.journal_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.journals 
      WHERE journals.id = journal_entries.journal_id 
      AND journals.profile_user_id = get_current_user_id()
    )
  );

CREATE POLICY "Users can insert entries to their own journals" ON public.journal_entries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.journals 
      WHERE journals.id = journal_entries.journal_id 
      AND journals.profile_user_id = get_current_user_id()
    )
  );

CREATE POLICY "Users can update entries of their own journals" ON public.journal_entries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.journals 
      WHERE journals.id = journal_entries.journal_id 
      AND journals.profile_user_id = get_current_user_id()
    )
  );

CREATE POLICY "Users can delete entries of their own journals" ON public.journal_entries
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.journals 
      WHERE journals.id = journal_entries.journal_id 
      AND journals.profile_user_id = get_current_user_id()
    )
  );

-- Enable RLS on journal_entry_friends
ALTER TABLE public.journal_entry_friends ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for journal_entry_friends
CREATE POLICY "Users can view friend tags on their journal entries" ON public.journal_entry_friends
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.journal_entries je
      JOIN public.journals j ON j.id = je.journal_id
      WHERE je.id = journal_entry_friends.journal_entry_id 
      AND j.profile_user_id = get_current_user_id()
    )
  );

CREATE POLICY "Users can tag friends in their journal entries" ON public.journal_entry_friends
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.journal_entries je
      JOIN public.journals j ON j.id = je.journal_id
      WHERE je.id = journal_entry_friends.journal_entry_id 
      AND j.profile_user_id = get_current_user_id()
    )
    AND
    EXISTS (
      SELECT 1 FROM public.friends
      WHERE friends.id = journal_entry_friends.friend_id
      AND friends.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update friend tags on their journal entries" ON public.journal_entry_friends
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.journal_entries je
      JOIN public.journals j ON j.id = je.journal_id
      WHERE je.id = journal_entry_friends.journal_entry_id 
      AND j.profile_user_id = get_current_user_id()
    )
  );

CREATE POLICY "Users can delete friend tags from their journal entries" ON public.journal_entry_friends
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.journal_entries je
      JOIN public.journals j ON j.id = je.journal_id
      WHERE je.id = journal_entry_friends.journal_entry_id 
      AND j.profile_user_id = get_current_user_id()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_journals_profile_user_id ON public.journals(profile_user_id);
CREATE INDEX IF NOT EXISTS idx_journals_updated_at ON public.journals(updated_at);
CREATE INDEX IF NOT EXISTS idx_journal_entries_journal_id ON public.journal_entries(journal_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON public.journal_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_journal_entry_friends_entry_id ON public.journal_entry_friends(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_friends_friend_id ON public.journal_entry_friends(friend_id);