/*
  # Add title field to journal entries

  1. Schema Changes
    - Add `title` column to `journal_entries` table
    - Set default value to empty string for existing entries
    - Make title required for new entries

  2. Notes
    - Existing entries will have empty titles
    - New entries can have custom titles
*/

-- Add title column to journal_entries table
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '';

-- Update the column to remove default for future inserts
ALTER TABLE journal_entries 
ALTER COLUMN title DROP DEFAULT;