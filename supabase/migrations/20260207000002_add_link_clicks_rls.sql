-- Enable RLS on link_clicks and add policy to allow users to view clicks for their own links
-- This was missing from the initial RLS setup

-- Enable Row Level Security on link_clicks table
ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow users to select clicks for their own short links
-- This joins through the short_links table to check ownership
CREATE POLICY "Users can view clicks for their own links"
  ON link_clicks
  FOR
SELECT
    TO authenticated
USING
(
    EXISTS
(
      SELECT 1
FROM short_links
WHERE short_links.id = link_clicks.short_link_id
    AND short_links.user_id = auth.uid()
    )
);

-- Note: No INSERT policy needed - only service role (admin client) can insert clicks
-- The admin client bypasses RLS, allowing click tracking from public redirects
-- Regular users (authenticated/anonymous) cannot insert clicks

-- Add comment for documentation
COMMENT ON POLICY "Users can view clicks for their own links" ON link_clicks IS 'Users can only view click statistics for links they own';
