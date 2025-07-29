-- Voice Cards System Migration
-- Creates tables for voice-based matching system

-- 1. Voice Prompts Table
CREATE TABLE IF NOT EXISTS voice_prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prompt_text TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Voice Cards Table
CREATE TABLE IF NOT EXISTS voice_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES voice_prompts(id) ON DELETE CASCADE,
    audio_url TEXT NOT NULL, -- Supabase storage URL
    audio_duration INTEGER NOT NULL, -- Duration in seconds
    mood_tags TEXT[] DEFAULT '{}', -- Array of mood tags
    quote TEXT, -- Optional quote/caption
    vibe_description TEXT, -- User's vibe description
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- One active voice card per user per prompt
    UNIQUE(user_id, prompt_id, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- 3. Voice Card Interactions (Swipes)
CREATE TABLE IF NOT EXISTS voice_card_swipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    swiper_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    voice_card_id UUID NOT NULL REFERENCES voice_cards(id) ON DELETE CASCADE,
    swipe_direction VARCHAR(10) NOT NULL CHECK (swipe_direction IN ('left', 'right', 'up')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- One swipe per user per voice card
    UNIQUE(swiper_id, voice_card_id)
);

-- 4. Voice Matches (When both users swipe right)
CREATE TABLE IF NOT EXISTS voice_matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    voice_card1_id UUID NOT NULL REFERENCES voice_cards(id) ON DELETE CASCADE,
    voice_card2_id UUID NOT NULL REFERENCES voice_cards(id) ON DELETE CASCADE,
    match_type VARCHAR(50) DEFAULT 'voice_connection' CHECK (match_type IN ('voice_connection', 'vibe_sync', 'deep_resonance')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure no duplicate matches
    UNIQUE(LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id))
);

-- 5. Voice Activities (Collaborative activities after matching)
CREATE TABLE IF NOT EXISTS voice_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID NOT NULL REFERENCES voice_matches(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('voice_game', 'story_building', 'question_exchange', 'music_share')),
    activity_data JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Voice Card Reports (For moderation)
CREATE TABLE IF NOT EXISTS voice_card_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    voice_card_id UUID NOT NULL REFERENCES voice_cards(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- One report per user per voice card
    UNIQUE(reporter_id, voice_card_id)
);

-- Indexes for performance
CREATE INDEX idx_voice_cards_user_active ON voice_cards(user_id, is_active);
CREATE INDEX idx_voice_cards_prompt ON voice_cards(prompt_id);
CREATE INDEX idx_voice_card_swipes_swiper ON voice_card_swipes(swiper_id);
CREATE INDEX idx_voice_card_swipes_card ON voice_card_swipes(voice_card_id);
CREATE INDEX idx_voice_matches_users ON voice_matches(user1_id, user2_id);
CREATE INDEX idx_voice_activities_match ON voice_activities(match_id);

-- Insert some sample voice prompts
INSERT INTO voice_prompts (prompt_text, category) VALUES
('Tell me about a moment that changed your perspective on life', 'deep'),
('What''s your go-to karaoke song and why?', 'fun'),
('Describe your perfect lazy Sunday in 30 seconds', 'lifestyle'),
('What''s something you''re passionate about that others might find weird?', 'quirky'),
('If you could have dinner with anyone, dead or alive, who would it be?', 'hypothetical'),
('What''s your biggest fear and how do you deal with it?', 'vulnerable'),
('Describe the last thing that made you laugh until you cried', 'humor'),
('What''s a skill you wish you had and why?', 'aspirational'),
('Tell me about your favorite childhood memory', 'nostalgic'),
('What''s your unpopular opinion that you''ll defend to the death?', 'controversial');

-- RLS Policies
ALTER TABLE voice_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_card_swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_card_reports ENABLE ROW LEVEL SECURITY;

-- Voice Prompts - Public read access
CREATE POLICY "Anyone can view active voice prompts" ON voice_prompts
    FOR SELECT USING (is_active = true);

-- Voice Cards - Users can view others' cards but only manage their own
CREATE POLICY "Users can view active voice cards" ON voice_cards
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can insert their own voice cards" ON voice_cards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice cards" ON voice_cards
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice cards" ON voice_cards
    FOR DELETE USING (auth.uid() = user_id);

-- Voice Card Swipes - Users can only manage their own swipes
CREATE POLICY "Users can view their own swipes" ON voice_card_swipes
    FOR SELECT USING (auth.uid() = swiper_id);

CREATE POLICY "Users can insert their own swipes" ON voice_card_swipes
    FOR INSERT WITH CHECK (auth.uid() = swiper_id);

-- Voice Matches - Users can view matches they're part of
CREATE POLICY "Users can view their own matches" ON voice_matches
    FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Voice Activities - Users can view activities for their matches
CREATE POLICY "Users can view activities for their matches" ON voice_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM voice_matches 
            WHERE voice_matches.id = voice_activities.match_id 
            AND (voice_matches.user1_id = auth.uid() OR voice_matches.user2_id = auth.uid())
        )
    );

CREATE POLICY "Users can update activities for their matches" ON voice_activities
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM voice_matches 
            WHERE voice_matches.id = voice_activities.match_id 
            AND (voice_matches.user1_id = auth.uid() OR voice_matches.user2_id = auth.uid())
        )
    );

-- Voice Card Reports - Users can report cards and view their own reports
CREATE POLICY "Users can view their own reports" ON voice_card_reports
    FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Users can insert reports" ON voice_card_reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Storage bucket for voice recordings
INSERT INTO storage.buckets (id, name, public) VALUES ('voice-recordings', 'voice-recordings', false);

-- Storage policies for voice recordings
CREATE POLICY "Users can upload their own voice recordings" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'voice-recordings' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view voice recordings" ON storage.objects
    FOR SELECT USING (bucket_id = 'voice-recordings');

CREATE POLICY "Users can update their own voice recordings" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'voice-recordings' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own voice recordings" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'voice-recordings' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );