ALTER TABLE match_statistics
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id);

CREATE INDEX IF NOT EXISTS idx_match_stats_team ON match_statistics(team_id);