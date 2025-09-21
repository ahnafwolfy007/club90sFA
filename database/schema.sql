-- ==================================================
-- Club 90s Football Academy - Database Schema
-- ==================================================

-- Create database
CREATE DATABASE "Club90sFA";

-- Connect to the database
\c "Club90sFA";

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================================================
-- ENUMS
-- ==================================================

CREATE TYPE user_role AS ENUM (
    'visitor',
    'member', 
    'mod',
    'admin',
    'head_of_operations',
    'board_member',
    'player_development'
);

CREATE TYPE membership_type AS ENUM (
    'senior',
    'junior'
);

CREATE TYPE payment_status AS ENUM (
    'paid',
    'pending',
    'overdue'
);

CREATE TYPE match_result AS ENUM (
    'win',
    'loss',
    'draw'
);

CREATE TYPE tournament_status AS ENUM (
    'upcoming',
    'ongoing',
    'completed',
    'cancelled'
);

CREATE TYPE vote_type AS ENUM (
    'in',
    'out'
);

-- ==================================================
-- USERS TABLE
-- ==================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    referral_name VARCHAR(255),
    role user_role DEFAULT 'visitor',
    membership_type membership_type DEFAULT 'junior',
    is_verified BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    profile_image VARCHAR(500),
    date_of_birth DATE,
    address TEXT,
    emergency_contact VARCHAR(255),
    emergency_phone VARCHAR(20),
    joined_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================================================
-- PLAYER POSITIONS TABLE
-- ==================================================

CREATE TABLE player_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    abbreviation VARCHAR(5) NOT NULL,
    is_goalkeeper BOOLEAN DEFAULT FALSE,
    is_defender BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================================================
-- USER POSITIONS TABLE (Many-to-Many)
-- ==================================================

CREATE TABLE user_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    position_id UUID REFERENCES player_positions(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, position_id)
);

-- ==================================================
-- TOURNAMENTS TABLE
-- ==================================================

CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    location VARCHAR(255),
    registration_fee DECIMAL(10,2) DEFAULT 0.00,
    max_teams INTEGER,
    status tournament_status DEFAULT 'upcoming',
    winner_team_id UUID,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================================================
-- MATCHES TABLE
-- ==================================================

CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE SET NULL,
    opponent_team VARCHAR(255) NOT NULL,
    venue VARCHAR(255) NOT NULL,
    match_date TIMESTAMP NOT NULL,
    our_score INTEGER DEFAULT 0,
    opponent_score INTEGER DEFAULT 0,
    result match_result,
    match_notes TEXT,
    mvp_player_id UUID REFERENCES users(id),
    is_completed BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================================================
-- MATCH STATISTICS TABLE
-- ==================================================

CREATE TABLE match_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    player_id UUID REFERENCES users(id) ON DELETE CASCADE,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    clean_sheet BOOLEAN DEFAULT FALSE,
    minutes_played INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0, -- For goalkeepers
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(match_id, player_id)
);

-- ==================================================
-- MATCH VOTES TABLE
-- ==================================================

CREATE TABLE match_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    voter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    player_id UUID REFERENCES users(id) ON DELETE CASCADE,
    vote vote_type NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(match_id, voter_id, player_id)
);

-- ==================================================
-- TOURNAMENT VOTES TABLE
-- ==================================================

CREATE TABLE tournament_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    voter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    player_id UUID REFERENCES users(id) ON DELETE CASCADE,
    vote vote_type NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tournament_id, voter_id, player_id)
);

-- ==================================================
-- SUBSCRIPTIONS TABLE
-- ==================================================

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2020),
    amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status payment_status DEFAULT 'pending',
    payment_date TIMESTAMP,
    payment_method VARCHAR(100),
    transaction_id VARCHAR(255),
    notes TEXT,
    marked_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, month, year)
);

-- ==================================================
-- NOTICES TABLE
-- ==================================================

CREATE TABLE notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    tournament_id UUID REFERENCES tournaments(id) ON DELETE SET NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================================================
-- PLAYER ACHIEVEMENTS TABLE
-- ==================================================

CREATE TABLE player_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(100) NOT NULL, -- 'mvp', 'top_scorer', 'clean_sheet_record', etc.
    achievement_value INTEGER DEFAULT 1,
    description TEXT,
    match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
    tournament_id UUID REFERENCES tournaments(id) ON DELETE SET NULL,
    achieved_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================================================
-- AUDIT LOG TABLE
-- ==================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================================================
-- INDEXES FOR PERFORMANCE
-- ==================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_membership_type ON users(membership_type);
CREATE INDEX idx_users_is_approved ON users(is_approved);
CREATE INDEX idx_users_joined_date ON users(joined_date);

-- Match indexes
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_result ON matches(result);
CREATE INDEX idx_matches_is_completed ON matches(is_completed);

-- Match statistics indexes
CREATE INDEX idx_match_stats_match ON match_statistics(match_id);
CREATE INDEX idx_match_stats_player ON match_statistics(player_id);
CREATE INDEX idx_match_stats_goals ON match_statistics(goals);
CREATE INDEX idx_match_stats_assists ON match_statistics(assists);

-- Vote indexes
CREATE INDEX idx_match_votes_match ON match_votes(match_id);
CREATE INDEX idx_match_votes_player ON match_votes(player_id);
CREATE INDEX idx_tournament_votes_tournament ON tournament_votes(tournament_id);

-- Subscription indexes
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_month_year ON subscriptions(month, year);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Notice indexes
CREATE INDEX idx_notices_created_at ON notices(created_at);
CREATE INDEX idx_notices_is_active ON notices(is_active);
CREATE INDEX idx_notices_is_pinned ON notices(is_pinned);

-- Tournament indexes
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_start_date ON tournaments(start_date);

-- Audit log indexes
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ==================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ==================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_match_statistics_updated_at BEFORE UPDATE ON match_statistics FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_notices_updated_at BEFORE UPDATE ON notices FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==================================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- ==================================================

-- Function to calculate clean sheets
CREATE OR REPLACE FUNCTION update_clean_sheets()
RETURNS TRIGGER AS $$
BEGIN
    -- If match is completed and opponent score is 0
    IF NEW.is_completed = TRUE AND NEW.opponent_score = 0 THEN
        -- Update clean sheets for goalkeepers and defenders in this match
        UPDATE match_statistics 
        SET clean_sheet = TRUE 
        WHERE match_id = NEW.id 
        AND player_id IN (
            SELECT DISTINCT up.user_id 
            FROM user_positions up 
            JOIN player_positions pp ON up.position_id = pp.id 
            WHERE pp.is_goalkeeper = TRUE OR pp.is_defender = TRUE
        );
    ELSE
        -- Reset clean sheets if opponent scored
        UPDATE match_statistics 
        SET clean_sheet = FALSE 
        WHERE match_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for clean sheet updates
CREATE TRIGGER trigger_update_clean_sheets 
    AFTER UPDATE ON matches 
    FOR EACH ROW 
    EXECUTE FUNCTION update_clean_sheets();

-- Function to calculate match result
CREATE OR REPLACE FUNCTION calculate_match_result()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_completed = TRUE THEN
        IF NEW.our_score > NEW.opponent_score THEN
            NEW.result = 'win';
        ELSIF NEW.our_score < NEW.opponent_score THEN
            NEW.result = 'loss';
        ELSE
            NEW.result = 'draw';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic result calculation
CREATE TRIGGER trigger_calculate_match_result 
    BEFORE UPDATE ON matches 
    FOR EACH ROW 
    EXECUTE FUNCTION calculate_match_result();

-- ==================================================
-- VIEWS FOR COMMON QUERIES
-- ==================================================

-- Player statistics summary view
CREATE VIEW player_stats_summary AS
SELECT 
    u.id,
    u.full_name,
    u.email,
    COUNT(ms.match_id) as matches_played,
    SUM(ms.goals) as total_goals,
    SUM(ms.assists) as total_assists,
    SUM(CASE WHEN ms.clean_sheet = TRUE THEN 1 ELSE 0 END) as clean_sheets,
    SUM(ms.minutes_played) as total_minutes,
    SUM(ms.yellow_cards) as yellow_cards,
    SUM(ms.red_cards) as red_cards,
    SUM(ms.saves) as total_saves
FROM users u
LEFT JOIN match_statistics ms ON u.id = ms.player_id
WHERE u.role IN ('member', 'mod', 'admin', 'head_of_operations', 'board_member', 'player_development')
GROUP BY u.id, u.full_name, u.email;

-- Monthly payment status view
CREATE VIEW monthly_payment_status AS
SELECT 
    u.id as user_id,
    u.full_name,
    u.membership_type,
    s.month,
    s.year,
    COALESCE(s.status, 'pending') as payment_status,
    s.payment_date,
    s.amount
FROM users u
CROSS JOIN (
    SELECT DISTINCT month, year 
    FROM subscriptions 
    WHERE year >= EXTRACT(YEAR FROM CURRENT_DATE) - 1
) dates
LEFT JOIN subscriptions s ON u.id = s.user_id AND s.month = dates.month AND s.year = dates.year
WHERE u.membership_type = 'senior' AND u.is_approved = TRUE;

-- Match participation view
CREATE VIEW match_participation AS
SELECT 
    m.id as match_id,
    m.opponent_team,
    m.match_date,
    u.id as player_id,
    u.full_name,
    COALESCE(mv.vote, 'out') as vote_status,
    ms.goals,
    ms.assists,
    ms.clean_sheet,
    mps.payment_status
FROM matches m
CROSS JOIN users u
LEFT JOIN match_votes mv ON m.id = mv.match_id AND u.id = mv.player_id
LEFT JOIN match_statistics ms ON m.id = ms.match_id AND u.id = ms.player_id
LEFT JOIN monthly_payment_status mps ON u.id = mps.user_id 
    AND mps.month = EXTRACT(MONTH FROM m.match_date)
    AND mps.year = EXTRACT(YEAR FROM m.match_date)
WHERE u.role IN ('member', 'mod', 'admin', 'head_of_operations', 'board_member', 'player_development')
    AND u.is_approved = TRUE;

-- ==================================================
-- INITIAL DATA
-- ==================================================

-- Insert default player positions
INSERT INTO player_positions (name, abbreviation, is_goalkeeper, is_defender) VALUES
('Goalkeeper', 'GK', TRUE, FALSE),
('Centre-Back', 'CB', FALSE, TRUE),
('Left-Back', 'LB', FALSE, TRUE),
('Right-Back', 'RB', FALSE, TRUE),
('Defensive Midfielder', 'DM', FALSE, FALSE),
('Central Midfielder', 'CM', FALSE, FALSE),
('Attacking Midfielder', 'AM', FALSE, FALSE),
('Left Midfielder', 'LM', FALSE, FALSE),
('Right Midfielder', 'RM', FALSE, FALSE),
('Left Winger', 'LW', FALSE, FALSE),
('Right Winger', 'RW', FALSE, FALSE),
('Centre Forward', 'CF', FALSE, FALSE),
('Striker', 'ST', FALSE, FALSE);

-- Insert default admin user (password: admin123!)
-- Note: In production, this should be changed immediately
INSERT INTO users (
    full_name, 
    email, 
    password_hash, 
    role, 
    membership_type, 
    is_verified, 
    is_approved
) VALUES (
    'System Administrator',
    'admin@club90s.com',
    '$2b$12$LQv3c1yqBw1Q9L6QZ1QZ1.QZ1QZ1QZ1QZ1QZ1QZ1QZ1QZ1QZ1QZ1Q', -- admin123!
    'admin',
    'senior',
    TRUE,
    TRUE
);

-- ==================================================
-- SECURITY POLICIES (Row Level Security)
-- ==================================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy for users to see their own data
CREATE POLICY user_own_data ON users
    FOR ALL
    TO authenticated_user
    USING (id = current_setting('app.current_user_id')::UUID);

-- Policy for admins to see all user data
CREATE POLICY admin_all_users ON users
    FOR ALL
    TO authenticated_user
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = current_setting('app.current_user_id')::UUID 
            AND role IN ('admin', 'head_of_operations')
        )
    );

-- Policy for subscriptions - users can see their own, admins can see all
CREATE POLICY subscription_access ON subscriptions
    FOR ALL
    TO authenticated_user
    USING (
        user_id = current_setting('app.current_user_id')::UUID 
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE id = current_setting('app.current_user_id')::UUID 
            AND role IN ('admin', 'head_of_operations')
        )
    );

-- ==================================================
-- PERFORMANCE OPTIMIZATIONS
-- ==================================================

-- Partial indexes for better performance
CREATE INDEX idx_users_active_members ON users(id) WHERE is_approved = TRUE AND role != 'visitor';
CREATE INDEX idx_matches_recent ON matches(match_date) WHERE match_date >= CURRENT_DATE - INTERVAL '1 year';
CREATE INDEX idx_subscriptions_pending ON subscriptions(user_id, month, year) WHERE status = 'pending';

-- ==================================================
-- BACKUP AND MAINTENANCE
-- ==================================================

-- Function to clean old audit logs (older than 1 year)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audit_logs 
    WHERE created_at < CURRENT_DATE - INTERVAL '1 year';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated_user;

-- Create a role for the application
CREATE ROLE club90s_app;
GRANT USAGE ON SCHEMA public TO club90s_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO club90s_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO club90s_app;

COMMIT;