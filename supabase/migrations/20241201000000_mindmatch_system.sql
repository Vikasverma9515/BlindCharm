-- MindMatch Arena System Tables
-- This migration creates the database schema for the MindMatch Arena game system

-- 1. MindMatch Prompts Table
-- Stores all the questions/prompts used in the MindMatch Arena
CREATE TABLE mindmatch_prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('rapid_fire', 'situational', 'this_or_that', 'vibe_prompt')),
    question TEXT NOT NULL,
    options JSONB, -- Array of answer options for multiple choice questions
    category VARCHAR(100) NOT NULL, -- e.g., 'romance', 'communication', 'conflict_resolution'
    is_active BOOLEAN DEFAULT true,
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. MindMatch Sessions Table
-- Tracks game sessions in lobbies
CREATE TABLE mindmatch_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lobby_id UUID NOT NULL REFERENCES lobbies(id) ON DELETE CASCADE,
    session_name VARCHAR(255) DEFAULT 'MindMatch Arena',
    status VARCHAR(50) DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed', 'cancelled')),
    max_participants INTEGER DEFAULT 20,
    current_participants INTEGER DEFAULT 0,
    prompts_used JSONB, -- Array of prompt IDs used in this session
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. MindMatch Answers Table
-- Stores user answers to prompts
CREATE TABLE mindmatch_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES mindmatch_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES mindmatch_prompts(id) ON DELETE CASCADE,
    answer_text TEXT, -- For text-based answers
    answer_option_index INTEGER, -- For multiple choice answers (0-based index)
    answer_value JSONB, -- For complex answer structures
    time_taken INTEGER, -- Time taken to answer in seconds
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one answer per user per prompt per session
    UNIQUE(session_id, user_id, prompt_id)
);

-- 4. Vibe Matches Table
-- Stores compatibility matches between users
CREATE TABLE vibe_matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES mindmatch_sessions(id) ON DELETE CASCADE,
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lobby_id UUID NOT NULL REFERENCES lobbies(id) ON DELETE CASCADE,
    compatibility_score DECIMAL(5,2) NOT NULL CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
    shared_answers INTEGER NOT NULL DEFAULT 0,
    total_answers INTEGER NOT NULL DEFAULT 0,
    match_type VARCHAR(50) DEFAULT 'vibe_sync' CHECK (match_type IN ('vibe_sync', 'mind_lock', 'deep_connection')),
    match_strength VARCHAR(20) DEFAULT 'medium' CHECK (match_strength IN ('low', 'medium', 'high', 'perfect')),
    is_mutual BOOLEAN DEFAULT false, -- Both users matched with each other
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'connected', 'dismissed')),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure no duplicate matches (order doesn't matter)
    CONSTRAINT unique_user_match UNIQUE (session_id, LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id))
);

-- 5. Vibe Waves Table
-- Tracks when users send "vibe waves" to their matches
CREATE TABLE vibe_waves (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID NOT NULL REFERENCES vibe_matches(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wave_type VARCHAR(50) DEFAULT 'standard' CHECK (wave_type IN ('standard', 'super', 'charm')),
    message TEXT, -- Optional message with the wave
    status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'received', 'responded', 'expired')),
    responded_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '6 hours'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Match Reactions Table
-- Stores reactions to answers in the Hot Answers Feed
CREATE TABLE match_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    answer_id UUID NOT NULL REFERENCES mindmatch_answers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(50) DEFAULT 'heart' CHECK (reaction_type IN ('heart', 'fire', 'mind', 'laugh', 'wow')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- One reaction per user per answer
    UNIQUE(answer_id, user_id)
);

-- 7. User MindMatch Stats Table
-- Tracks user statistics and achievements
CREATE TABLE user_mindmatch_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    total_sessions_played INTEGER DEFAULT 0,
    total_matches_found INTEGER DEFAULT 0,
    total_vibe_waves_sent INTEGER DEFAULT 0,
    total_vibe_waves_received INTEGER DEFAULT 0,
    highest_compatibility_score DECIMAL(5,2) DEFAULT 0,
    favorite_category VARCHAR(100),
    charm_coins_earned INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0, -- Days played consecutively
    best_streak INTEGER DEFAULT 0,
    last_played_at TIMESTAMP WITH TIME ZONE,
    achievements JSONB DEFAULT '[]', -- Array of achievement IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_mindmatch_prompts_category ON mindmatch_prompts(category);
CREATE INDEX idx_mindmatch_prompts_type ON mindmatch_prompts(type);
CREATE INDEX idx_mindmatch_prompts_active ON mindmatch_prompts(is_active);

CREATE INDEX idx_mindmatch_sessions_lobby ON mindmatch_sessions(lobby_id);
CREATE INDEX idx_mindmatch_sessions_status ON mindmatch_sessions(status);

CREATE INDEX idx_mindmatch_answers_session ON mindmatch_answers(session_id);
CREATE INDEX idx_mindmatch_answers_user ON mindmatch_answers(user_id);
CREATE INDEX idx_mindmatch_answers_prompt ON mindmatch_answers(prompt_id);

CREATE INDEX idx_vibe_matches_session ON vibe_matches(session_id);
CREATE INDEX idx_vibe_matches_users ON vibe_matches(user1_id, user2_id);
CREATE INDEX idx_vibe_matches_lobby ON vibe_matches(lobby_id);
CREATE INDEX idx_vibe_matches_score ON vibe_matches(compatibility_score);
CREATE INDEX idx_vibe_matches_status ON vibe_matches(status);

CREATE INDEX idx_vibe_waves_match ON vibe_waves(match_id);
CREATE INDEX idx_vibe_waves_sender ON vibe_waves(sender_id);
CREATE INDEX idx_vibe_waves_receiver ON vibe_waves(receiver_id);

CREATE INDEX idx_match_reactions_answer ON match_reactions(answer_id);
CREATE INDEX idx_match_reactions_user ON match_reactions(user_id);

-- RLS (Row Level Security) Policies
ALTER TABLE mindmatch_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindmatch_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindmatch_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vibe_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE vibe_waves ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mindmatch_stats ENABLE ROW LEVEL SECURITY;

-- Prompts are readable by all authenticated users
CREATE POLICY "Prompts are viewable by authenticated users" ON mindmatch_prompts
    FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- Sessions are viewable by lobby participants
CREATE POLICY "Sessions viewable by lobby participants" ON mindmatch_sessions
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM lobby_participants lp 
            WHERE lp.lobby_id = mindmatch_sessions.lobby_id 
            AND lp.user_id = auth.uid()
        )
    );

-- Users can insert/update their own answers
CREATE POLICY "Users can manage their own answers" ON mindmatch_answers
    FOR ALL USING (auth.uid() = user_id);

-- Users can view answers in their session
CREATE POLICY "Users can view session answers" ON mindmatch_answers
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM mindmatch_sessions ms
            JOIN lobby_participants lp ON lp.lobby_id = ms.lobby_id
            WHERE ms.id = mindmatch_answers.session_id
            AND lp.user_id = auth.uid()
        )
    );

-- Users can view matches they're part of
CREATE POLICY "Users can view their matches" ON vibe_matches
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        (user1_id = auth.uid() OR user2_id = auth.uid())
    );

-- Users can send vibe waves
CREATE POLICY "Users can send vibe waves" ON vibe_waves
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can view vibe waves sent to them
CREATE POLICY "Users can view their vibe waves" ON vibe_waves
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        (sender_id = auth.uid() OR receiver_id = auth.uid())
    );

-- Users can react to answers in their session
CREATE POLICY "Users can react to session answers" ON match_reactions
    FOR ALL USING (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM mindmatch_answers ma
            JOIN mindmatch_sessions ms ON ms.id = ma.session_id
            JOIN lobby_participants lp ON lp.lobby_id = ms.lobby_id
            WHERE ma.id = match_reactions.answer_id
            AND lp.user_id = auth.uid()
        )
    );

-- Users can view/update their own stats
CREATE POLICY "Users can manage their own stats" ON user_mindmatch_stats
    FOR ALL USING (auth.uid() = user_id);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_mindmatch_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_mindmatch_sessions_timestamp
    BEFORE UPDATE ON mindmatch_sessions
    FOR EACH ROW EXECUTE FUNCTION update_mindmatch_timestamps();

CREATE TRIGGER update_vibe_matches_timestamp
    BEFORE UPDATE ON vibe_matches
    FOR EACH ROW EXECUTE FUNCTION update_mindmatch_timestamps();

CREATE TRIGGER update_user_mindmatch_stats_timestamp
    BEFORE UPDATE ON user_mindmatch_stats
    FOR EACH ROW EXECUTE FUNCTION update_mindmatch_timestamps();

-- Function to calculate compatibility score
CREATE OR REPLACE FUNCTION calculate_compatibility_score(
    user1_answers JSONB,
    user2_answers JSONB
) RETURNS DECIMAL AS $$
DECLARE
    shared_count INTEGER := 0;
    total_count INTEGER := 0;
    key TEXT;
BEGIN
    -- Count matching answers
    FOR key IN SELECT jsonb_object_keys(user1_answers)
    LOOP
        IF user2_answers ? key THEN
            total_count := total_count + 1;
            IF user1_answers->key = user2_answers->key THEN
                shared_count := shared_count + 1;
            END IF;
        END IF;
    END LOOP;
    
    -- Return percentage
    IF total_count = 0 THEN
        RETURN 0;
    ELSE
        RETURN ROUND((shared_count::DECIMAL / total_count::DECIMAL) * 100, 2);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Insert sample prompts
INSERT INTO mindmatch_prompts (type, question, options, category) VALUES
('rapid_fire', 'Love at first sight?', '["Yes, absolutely! ✨", "Nope, need time 🕐"]', 'romance'),
('rapid_fire', 'Texting or calling?', '["Text me always 📱", "Call me maybe ☎️"]', 'communication'),
('rapid_fire', 'Jealousy in love is...', '["Cute & caring 💕", "Red flag 🚩"]', 'relationship'),
('situational', 'Your crush disappears for 2 days with no text. You...', '["Wait & trust 🙏", "Ghost back 👻", "Ask directly 💬", "Block & delete 🚫"]', 'conflict_resolution'),
('this_or_that', 'Perfect date vibes?', '["Friends first 🫶", "Strangers to lovers 🔥"]', 'dating_style'),
('rapid_fire', 'Morning person or night owl?', '["Early bird 🌅", "Night owl 🦉"]', 'lifestyle'),
('situational', 'Your partner wants to check your phone. You...', '["Sure, nothing to hide 📱", "That''s private territory 🚫", "Depends on the reason 🤔", "Red flag, bye 👋"]', 'trust'),
('this_or_that', 'Ideal vacation?', '["Adventure & exploring 🏔️", "Relaxing & peaceful 🏖️"]', 'lifestyle'),
('rapid_fire', 'Social media in relationships?', '["Share everything 📸", "Keep it private 🔒"]', 'social_media'),
('situational', 'You see your ex at a party. You...', '["Say hi casually 👋", "Avoid completely 🙈", "Leave immediately 🚪", "Act like nothing happened 😎"]', 'past_relationships');