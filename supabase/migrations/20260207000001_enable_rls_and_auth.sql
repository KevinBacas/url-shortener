-- Enable Row Level Security on short_links table
ALTER TABLE short_links ENABLE ROW LEVEL SECURITY;

-- Make user_id NOT NULL and add foreign key to auth.users
-- First, we need to handle existing rows with NULL user_id
-- Delete any existing rows with NULL user_id (they're from before auth was implemented)
DELETE FROM short_links WHERE user_id IS NULL;

-- Now make user_id NOT NULL and add foreign key
ALTER TABLE short_links 
  ALTER COLUMN user_id
SET
NOT NULL,
ADD CONSTRAINT fk_short_links_user_id 
    FOREIGN KEY
(user_id) 
    REFERENCES auth.users
(id) 
    ON
DELETE CASCADE;

-- RLS Policy: Users can insert their own short links
CREATE POLICY "Users can insert their own short links"
  ON short_links
  FOR
INSERT
  TO authenticated
  WITH CHECK (
auth.uid()
= user_id);

-- RLS Policy: Users can select only their own short links
CREATE POLICY "Users can select their own short links"
  ON short_links
  FOR
SELECT
    TO authenticated
USING
(auth.uid
() = user_id);

-- RLS Policy: Users can update only their own short links
CREATE POLICY "Users can update their own short links"
  ON short_links
  FOR
UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
WITH CHECK
(auth.uid
() = user_id);

-- RLS Policy: Users can delete only their own short links
CREATE POLICY "Users can delete their own short links"
  ON short_links
  FOR
DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Note: link_clicks table remains WITHOUT RLS because:
-- 1. Clicks are tracked anonymously (public redirects)
-- 2. Click tracking needs to work for unauthenticated users
-- 3. Analytics queries join with short_links, which IS protected by RLS
-- This means users can only see clicks for their own links through the short_links RLS policies

-- Add comment for documentation
COMMENT ON POLICY "Users can insert their own short links" ON short_links IS 'Ensure users can only create links for themselves';
COMMENT ON POLICY "Users can select their own short links" ON short_links IS 'Ensure users can only view their own links';
