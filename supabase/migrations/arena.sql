-- Simplified MindMatch System - No Sessions, Just Questions & Answers
-- Reset every 3 hours (12, 3, 6, 9)

-- Drop existing tables if they exist
DROP TABLE IF EXISTS match_reactions CASCADE;
DROP TABLE IF EXISTS vibe_waves CASCADE;
DROP TABLE IF EXISTS vibe_matches CASCADE;
DROP TABLE IF EXISTS mindmatch_answers CASCADE;
DROP TABLE IF EXISTS mindmatch_sessions CASCADE;
DROP TABLE IF EXISTS user_mindmatch_stats CASCADE;

-- 1. MindMatch Prompts Table (Keep this)
-- Already exists, but let's make sure it's correct
CREATE TABLE IF NOT EXISTS mindmatch_prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('rapid_fire', 'situational', 'this_or_that', 'vibe_prompt')),
    question TEXT NOT NULL,
    options JSONB, -- Array of answer options for multiple choice questions
    category VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Current Active Question (Only one question active at a time)
CREATE TABLE current_active_question (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prompt_id UUID NOT NULL REFERENCES mindmatch_prompts(id) ON DELETE CASCADE,
    lobby_id UUID NOT NULL REFERENCES lobbies(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    question_number INTEGER DEFAULT 1, -- 1-5 for each round
    round_id UUID DEFAULT gen_random_uuid(), -- Groups 5 questions together
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Only one active question per lobby at a time
    UNIQUE(lobby_id)
);

-- 3. Simple Answers Table (No sessions needed)
CREATE TABLE mindmatch_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lobby_id UUID NOT NULL REFERENCES lobbies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES mindmatch_prompts(id) ON DELETE CASCADE,
    round_id UUID NOT NULL, -- Links answers from the same round
    answer_text TEXT,
    answer_option_index INTEGER,
    time_taken INTEGER DEFAULT 30,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- One answer per user per question per round
    UNIQUE(lobby_id, user_id, prompt_id, round_id)
);

-- --4. Simple Vibe Matches (Generated after each round)
-- CREATE TABLE vibe_matches (
--     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--     lobby_id UUID NOT NULL REFERENCES lobbies(id) ON DELETE CASCADE,
--     user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     round_id UUID NOT NULL,
--     compatibility_score DECIMAL(5,2) NOT NULL,
--     shared_answers INTEGER NOT NULL DEFAULT 0,
--     total_answers INTEGER NOT NULL DEFAULT 0,
--     match_type VARCHAR(50) DEFAULT 'vibe_sync' CHECK (match_type IN ('vibe_sync', 'mind_lock', 'deep_connection')),
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--     expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '3 hours'),
    
--     -- No duplicate matches per round
--     UNIQUE(lobby_id, round_id, LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id))
-- );


CREATE TABLE vibe_matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lobby_id UUID NOT NULL REFERENCES lobbies(id) ON DELETE CASCADE,
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    round_id UUID NOT NULL,
    compatibility_score DECIMAL(5,2) NOT NULL,
    shared_answers INTEGER NOT NULL DEFAULT 0,
    total_answers INTEGER NOT NULL DEFAULT 0,
    match_type VARCHAR(50) DEFAULT 'vibe_sync' CHECK (match_type IN ('vibe_sync', 'mind_lock', 'deep_connection')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '3 hours'),
    
    -- Simple unique constraint ensuring no duplicate pairs in a round
    UNIQUE(lobby_id, round_id, user1_id, user2_id)
);

-- Add a check constraint to ensure user1_id is always less than user2_id
ALTER TABLE vibe_matches
ADD CONSTRAINT user_order_check CHECK (user1_id < user2_id);


-- 5. Simple Reactions
CREATE TABLE answer_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    answer_id UUID NOT NULL REFERENCES mindmatch_answers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) DEFAULT 'heart' CHECK (reaction_type IN ('heart', 'fire', 'mind', 'laugh', 'wow')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(answer_id, user_id)
);

-- 6. User Stats (Simple)
CREATE TABLE user_mindmatch_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_rounds_played INTEGER DEFAULT 0,
    total_matches_found INTEGER DEFAULT 0,
    charm_coins_earned INTEGER DEFAULT 0,
    best_compatibility_score DECIMAL(5,2) DEFAULT 0,
    last_played_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_current_active_question_lobby ON current_active_question(lobby_id);
CREATE INDEX idx_mindmatch_answers_lobby_round ON mindmatch_answers(lobby_id, round_id);
CREATE INDEX idx_mindmatch_answers_user ON mindmatch_answers(user_id);
CREATE INDEX idx_vibe_matches_lobby_round ON vibe_matches(lobby_id, round_id);
CREATE INDEX idx_vibe_matches_users ON vibe_matches(user1_id, user2_id);
CREATE INDEX idx_answer_reactions_answer ON answer_reactions(answer_id);

-- RLS Policies
ALTER TABLE current_active_question ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindmatch_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vibe_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mindmatch_stats ENABLE ROW LEVEL SECURITY;

-- Users can view active questions in their lobby
CREATE POLICY "Users can view active questions in their lobby" ON current_active_question
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lobby_participants lp 
            WHERE lp.lobby_id = current_active_question.lobby_id 
            AND lp.user_id = auth.uid()
        )
    );

-- Users can manage their own answers
CREATE POLICY "Users can manage their own answers" ON mindmatch_answers
    FOR ALL USING (auth.uid() = user_id);

-- Users can view answers in their lobby
CREATE POLICY "Users can view lobby answers" ON mindmatch_answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lobby_participants lp 
            WHERE lp.lobby_id = mindmatch_answers.lobby_id 
            AND lp.user_id = auth.uid()
        )
    );

-- Users can view matches they're part of
CREATE POLICY "Users can view their matches" ON vibe_matches
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        (user1_id = auth.uid() OR user2_id = auth.uid())
    );

-- Users can react to answers in their lobby
CREATE POLICY "Users can react to lobby answers" ON answer_reactions
    FOR ALL USING (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM mindmatch_answers ma
            JOIN lobby_participants lp ON lp.lobby_id = ma.lobby_id
            WHERE ma.id = answer_reactions.answer_id
            AND lp.user_id = auth.uid()
        )
    );

-- Users can manage their own stats
CREATE POLICY "Users can manage their own stats" ON user_mindmatch_stats
    FOR ALL USING (auth.uid() = user_id);

-- Function to start a new question in a lobby
CREATE OR REPLACE FUNCTION start_new_question(
    p_lobby_id UUID,
    p_prompt_id UUID,
    p_question_number INTEGER DEFAULT 1,
    p_round_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_round_id UUID;
    v_ends_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Generate round_id if not provided
    IF p_round_id IS NULL THEN
        v_round_id := gen_random_uuid();
    ELSE
        v_round_id := p_round_id;
    END IF;
    
    -- Question lasts 30 seconds
    v_ends_at := NOW() + INTERVAL '30 seconds';
    
    -- Remove any existing active question for this lobby
    DELETE FROM current_active_question WHERE lobby_id = p_lobby_id;
    
    -- Insert new active question
    INSERT INTO current_active_question (
        prompt_id, 
        lobby_id, 
        ends_at, 
        question_number, 
        round_id
    ) VALUES (
        p_prompt_id, 
        p_lobby_id, 
        v_ends_at, 
        p_question_number, 
        v_round_id
    );
    
    RETURN v_round_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate matches after a round
CREATE OR REPLACE FUNCTION calculate_round_matches(
    p_lobby_id UUID,
    p_round_id UUID
) RETURNS INTEGER AS $$
DECLARE
    user_record RECORD;
    other_user_record RECORD;
    shared_count INTEGER;
    total_count INTEGER;
    compatibility_score DECIMAL(5,2);
    match_type VARCHAR(50);
    matches_created INTEGER := 0;
BEGIN
    -- Get all users who answered in this round
    FOR user_record IN 
        SELECT DISTINCT user_id 
        FROM mindmatch_answers 
        WHERE lobby_id = p_lobby_id AND round_id = p_round_id
    LOOP
        -- Compare with other users
        FOR other_user_record IN 
            SELECT DISTINCT user_id 
            FROM mindmatch_answers 
            WHERE lobby_id = p_lobby_id 
            AND round_id = p_round_id 
            AND user_id > user_record.user_id -- Avoid duplicates
        LOOP
            -- Count shared answers
            SELECT COUNT(*) INTO total_count
            FROM mindmatch_answers a1
            JOIN mindmatch_answers a2 ON a1.prompt_id = a2.prompt_id
            WHERE a1.lobby_id = p_lobby_id 
            AND a1.round_id = p_round_id
            AND a1.user_id = user_record.user_id
            AND a2.user_id = other_user_record.user_id;
            
            SELECT COUNT(*) INTO shared_count
            FROM mindmatch_answers a1
            JOIN mindmatch_answers a2 ON a1.prompt_id = a2.prompt_id
            WHERE a1.lobby_id = p_lobby_id 
            AND a1.round_id = p_round_id
            AND a1.user_id = user_record.user_id
            AND a2.user_id = other_user_record.user_id
            AND (
                (a1.answer_text IS NOT NULL AND a1.answer_text = a2.answer_text) OR
                (a1.answer_option_index IS NOT NULL AND a1.answer_option_index = a2.answer_option_index)
            );
            
            -- Calculate compatibility
            IF total_count > 0 THEN
                compatibility_score := (shared_count::DECIMAL / total_count::DECIMAL) * 100;
                
                -- Determine match type
                IF compatibility_score >= 80 THEN
                    match_type := 'deep_connection';
                ELSIF compatibility_score >= 70 THEN
                    match_type := 'mind_lock';
                ELSE
                    match_type := 'vibe_sync';
                END IF;
                
                -- Create match if compatibility >= 60%
                IF compatibility_score >= 60 THEN
                    INSERT INTO vibe_matches (
                        lobby_id,
                        user1_id,
                        user2_id,
                        round_id,
                        compatibility_score,
                        shared_answers,
                        total_answers,
                        match_type
                    ) VALUES (
                        p_lobby_id,
                        user_record.user_id,
                        other_user_record.user_id,
                        p_round_id,
                        compatibility_score,
                        shared_count,
                        total_count,
                        match_type
                    ) ON CONFLICT DO NOTHING;
                    
                    matches_created := matches_created + 1;
                END IF;
            END IF;
        END LOOP;
    END LOOP;
    
    RETURN matches_created;
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
('situational', 'You see your ex at a party. You...', '["Say hi casually 👋", "Avoid completely 🙈", "Leave immediately 🚪", "Act like nothing happened 😎"]', 'past_relationships'),
('rapid_fire', 'First date payment?', '["Split the bill 💰", "I''ll pay 💳"]', 'dating_style'),
('this_or_that', 'Relationship pace?', '["Take it slow 🐌", "Dive in deep 🏊"]', 'romance'),
('situational', 'Your friend doesn''t like your partner. You...', '["Trust my friend 👥", "Trust my heart ❤️", "Need more info 🤔", "Stay neutral 😐"]', 'relationships'),
('rapid_fire', 'PDA comfort level?', '["Love it! 😘", "Keep it private 🤐"]', 'intimacy'),
('this_or_that', 'Conflict style?', '["Talk it out 💬", "Need space first 🌙"]', 'communication')
ON CONFLICT DO NOTHING;





-- Function to start a new round
CREATE OR REPLACE FUNCTION start_new_round(p_lobby_id UUID)
RETURNS UUID AS $$
DECLARE
    v_round_id UUID;
    v_prompt_id UUID;
    v_ends_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Generate new round ID
    v_round_id := gen_random_uuid();
    
    -- Get a random prompt
    SELECT id INTO v_prompt_id
    FROM mindmatch_prompts
    WHERE is_active = true
    ORDER BY RANDOM()
    LIMIT 1;
    
    IF v_prompt_id IS NULL THEN
        RAISE EXCEPTION 'No active prompts found';
    END IF;
    
    -- Set end time (30 seconds from now)
    v_ends_at := NOW() + INTERVAL '30 seconds';
    
    -- Remove any existing active question for this lobby
    DELETE FROM current_active_question 
    WHERE lobby_id = p_lobby_id;
    
    -- Create new active question
    INSERT INTO current_active_question (
        prompt_id,
        lobby_id,
        question_number,
        round_id,
        ends_at
    ) VALUES (
        v_prompt_id,
        p_lobby_id,
        1,
        v_round_id,
        v_ends_at
    );
    
    -- Return the round ID
    RETURN v_round_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;






-- Add this policy to allow users to start new rounds in their lobby
CREATE POLICY "Allow lobby participants to start rounds" ON current_active_question
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM lobby_participants
            WHERE lobby_participants.lobby_id = current_active_question.lobby_id
            AND lobby_participants.user_id = auth.uid()
        )
    );
-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION start_new_round(UUID) TO authenticated;





-- Function to handle question progression
CREATE OR REPLACE FUNCTION handle_question_progression()
RETURNS TRIGGER AS $$
DECLARE
    v_next_number INTEGER;
    v_next_prompt_id UUID;
BEGIN
    -- Get the next question number
    v_next_number := NEW.question_number + 1;
    
    -- If we've reached 5 questions, calculate matches
    IF v_next_number > 5 THEN
        PERFORM calculate_round_matches(NEW.lobby_id, NEW.round_id);
        RETURN NEW;
    END IF;
    
    -- Get next prompt
    SELECT id INTO v_next_prompt_id
    FROM mindmatch_prompts
    WHERE is_active = true
    AND id NOT IN (
        SELECT prompt_id 
        FROM mindmatch_answers 
        WHERE round_id = NEW.round_id
    )
    ORDER BY RANDOM()
    LIMIT 1;
    
    -- Update current question
    UPDATE current_active_question
    SET prompt_id = v_next_prompt_id,
        question_number = v_next_number,
        ends_at = NOW() + INTERVAL '30 seconds'
    WHERE lobby_id = NEW.lobby_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for answer submissions
CREATE TRIGGER progress_question_after_answer
    AFTER INSERT ON mindmatch_answers
    FOR EACH ROW
    EXECUTE FUNCTION handle_question_progression();




    -- Update the start_new_round function
CREATE OR REPLACE FUNCTION start_new_round(p_lobby_id UUID)
RETURNS UUID AS $$
DECLARE
    v_round_id UUID;
    v_prompt_id UUID;
    v_ends_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Add debug logging
    RAISE NOTICE 'Starting new round for lobby: %', p_lobby_id;
    
    -- Generate new round ID
    v_round_id := gen_random_uuid();
    
    -- Get a random prompt
    SELECT id INTO v_prompt_id
    FROM mindmatch_prompts
    WHERE is_active = true
    ORDER BY RANDOM()
    LIMIT 1;
    
    IF v_prompt_id IS NULL THEN
        RAISE EXCEPTION 'No active prompts found';
    END IF;
    
    RAISE NOTICE 'Selected prompt ID: %', v_prompt_id;
    
    -- Set end time (30 seconds from now)
    v_ends_at := NOW() + INTERVAL '30 seconds';
    
    -- Remove any existing active question for this lobby
    DELETE FROM current_active_question 
    WHERE lobby_id = p_lobby_id;
    
    -- Create new active question
    INSERT INTO current_active_question (
        prompt_id,
        lobby_id,
        question_number,
        round_id,
        ends_at
    ) VALUES (
        v_prompt_id,
        p_lobby_id,
        1,
        v_round_id,
        v_ends_at
    );
    
    RAISE NOTICE 'Round started successfully with ID: %', v_round_id;
    
    -- Return the round ID
    RETURN v_round_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;