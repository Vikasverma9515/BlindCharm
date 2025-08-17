-- Girl Question System Tables
-- This creates the database structure for the girl-creates-questions matchmaking system

-- Table for questions created by girls
CREATE TABLE IF NOT EXISTS girl_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    girl_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lobby_id UUID NOT NULL REFERENCES lobbies(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(10) NOT NULL CHECK (question_type IN ('mcq', 'written')),
    options JSONB, -- Array of options for MCQ questions
    correct_answer TEXT, -- Correct answer for MCQ questions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT girl_questions_valid_mcq CHECK (
        (question_type = 'mcq' AND options IS NOT NULL AND correct_answer IS NOT NULL) OR
        (question_type = 'written' AND options IS NULL AND correct_answer IS NULL)
    )
);

-- Table for answers submitted by boys
CREATE TABLE IF NOT EXISTS question_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID NOT NULL REFERENCES girl_questions(id) ON DELETE CASCADE,
    boy_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lobby_id UUID NOT NULL REFERENCES lobbies(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    option_index INTEGER, -- For MCQ answers, which option was selected
    points_awarded INTEGER DEFAULT 0 CHECK (points_awarded >= 0 AND points_awarded <= 10),
    is_reviewed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate answers
    UNIQUE(question_id, boy_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_girl_questions_lobby_id ON girl_questions(lobby_id);
CREATE INDEX IF NOT EXISTS idx_girl_questions_girl_id ON girl_questions(girl_id);
CREATE INDEX IF NOT EXISTS idx_question_answers_question_id ON question_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_question_answers_boy_id ON question_answers(boy_id);
CREATE INDEX IF NOT EXISTS idx_question_answers_lobby_id ON question_answers(lobby_id);
CREATE INDEX IF NOT EXISTS idx_question_answers_is_reviewed ON question_answers(is_reviewed);

-- RLS (Row Level Security) Policies
ALTER TABLE girl_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_answers ENABLE ROW LEVEL SECURITY;

-- Girls can create, read, update, and delete their own questions
CREATE POLICY "Girls can manage their own questions" ON girl_questions
    FOR ALL USING (
        auth.uid() = girl_id OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Everyone in the lobby can read questions
CREATE POLICY "Lobby participants can read questions" ON girl_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lobby_participants 
            WHERE lobby_id = girl_questions.lobby_id 
            AND user_id = auth.uid()
        )
    );

-- Boys can create answers to questions
CREATE POLICY "Boys can create answers" ON question_answers
    FOR INSERT WITH CHECK (
        auth.uid() = boy_id AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND gender = 'male'
        ) AND
        EXISTS (
            SELECT 1 FROM lobby_participants 
            WHERE lobby_id = question_answers.lobby_id 
            AND user_id = auth.uid()
        )
    );

-- Boys can read their own answers
CREATE POLICY "Boys can read their own answers" ON question_answers
    FOR SELECT USING (
        auth.uid() = boy_id OR
        EXISTS (
            SELECT 1 FROM girl_questions 
            WHERE id = question_answers.question_id 
            AND girl_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Girls can update answers to their questions (for reviewing)
CREATE POLICY "Girls can review answers to their questions" ON question_answers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM girl_questions 
            WHERE id = question_answers.question_id 
            AND girl_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Everyone in lobby can read answers for leaderboard
CREATE POLICY "Lobby participants can read answers for leaderboard" ON question_answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lobby_participants 
            WHERE lobby_id = question_answers.lobby_id 
            AND user_id = auth.uid()
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_girl_questions_updated_at 
    BEFORE UPDATE ON girl_questions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_question_answers_updated_at 
    BEFORE UPDATE ON question_answers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to limit girls to 5 questions per lobby
CREATE OR REPLACE FUNCTION check_question_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (
        SELECT COUNT(*) 
        FROM girl_questions 
        WHERE girl_id = NEW.girl_id AND lobby_id = NEW.lobby_id
    ) >= 5 THEN
        RAISE EXCEPTION 'Girls can only create up to 5 questions per lobby';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to enforce question limit
CREATE TRIGGER enforce_question_limit 
    BEFORE INSERT ON girl_questions 
    FOR EACH ROW EXECUTE FUNCTION check_question_limit();

-- Function to auto-score MCQ answers
CREATE OR REPLACE FUNCTION auto_score_mcq()
RETURNS TRIGGER AS $$
DECLARE
    question_record girl_questions%ROWTYPE;
    correct_option_index INTEGER;
BEGIN
    -- Get the question details
    SELECT * INTO question_record 
    FROM girl_questions 
    WHERE id = NEW.question_id;
    
    -- If it's an MCQ question, auto-score it
    IF question_record.question_type = 'mcq' AND NEW.option_index IS NOT NULL THEN
        -- Find the index of the correct answer
        SELECT idx - 1 INTO correct_option_index
        FROM jsonb_array_elements_text(question_record.options) WITH ORDINALITY AS t(option, idx)
        WHERE option = question_record.correct_answer;
        
        -- Award points if correct
        IF correct_option_index = NEW.option_index THEN
            NEW.points_awarded = 10;
        ELSE
            NEW.points_awarded = 0;
        END IF;
        
        -- Mark as reviewed since it's auto-scored
        NEW.is_reviewed = TRUE;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-score MCQ answers
CREATE TRIGGER auto_score_mcq_answers 
    BEFORE INSERT ON question_answers 
    FOR EACH ROW EXECUTE FUNCTION auto_score_mcq();

-- View for leaderboard data
CREATE OR REPLACE VIEW question_leaderboard AS
SELECT 
    qa.lobby_id,
    qa.boy_id,
    u.username,
    u.profile_picture,
    COUNT(qa.id) as questions_answered,
    SUM(qa.points_awarded) as total_points,
    AVG(qa.points_awarded) as average_points
FROM question_answers qa
JOIN users u ON u.id = qa.boy_id
WHERE qa.is_reviewed = true
GROUP BY qa.lobby_id, qa.boy_id, u.username, u.profile_picture
ORDER BY total_points DESC, questions_answered DESC;

-- Grant necessary permissions
GRANT ALL ON girl_questions TO authenticated;
GRANT ALL ON question_answers TO authenticated;
GRANT SELECT ON question_leaderboard TO authenticated;