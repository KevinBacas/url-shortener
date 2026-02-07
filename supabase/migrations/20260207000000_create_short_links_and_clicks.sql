-- Create short_links table
CREATE TABLE IF NOT EXISTS short_links (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  slug TEXT UNIQUE NOT NULL,
  target_url TEXT NOT NULL,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create link_clicks table
CREATE TABLE IF NOT EXISTS link_clicks (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  short_link_id BIGINT NOT NULL REFERENCES short_links(id) ON DELETE CASCADE,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_short_links_slug ON short_links(slug);
CREATE INDEX IF NOT EXISTS idx_short_links_user_id ON short_links(user_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_short_link_id ON link_clicks(short_link_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_clicked_at ON link_clicks(clicked_at);

-- Add comments for documentation
COMMENT ON TABLE short_links IS 'Stores shortened URL mappings';
COMMENT ON TABLE link_clicks IS 'Tracks clicks on shortened links with metadata';
COMMENT ON COLUMN short_links.slug IS 'Unique short identifier for the URL';
COMMENT ON COLUMN short_links.target_url IS 'Original long URL to redirect to';
COMMENT ON COLUMN link_clicks.user_agent IS 'Browser user agent string from the request';
COMMENT ON COLUMN link_clicks.referrer IS 'HTTP referrer header from the request';
