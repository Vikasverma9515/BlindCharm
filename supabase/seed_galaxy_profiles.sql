-- Seed 20 dummy profiles for Galaxy Mode
-- Run this in your Supabase SQL Editor

INSERT INTO public.galaxy_profiles (user_id, full_name, avatar_url, voice_url, energy_level, intent_history)
VALUES
    ('user_01', 'Aria', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'calm', '[{"connection_type": "friendship", "energy_level": "calm"}]'),
    ('user_02', 'Liam', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80', NULL, 'high', '[{"connection_type": "collaboration", "energy_level": "high"}]'),
    ('user_03', 'Sofia', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80', NULL, 'focused', '[{"connection_type": "emotional", "energy_level": "focused"}]'),
    ('user_04', 'Noah', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'playful', '[{"connection_type": "casual", "energy_level": "playful"}]'),
    ('user_05', 'Emma', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80', NULL, 'deep', '[{"connection_type": "romantic", "energy_level": "deep"}]'),
    ('user_06', 'James', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', NULL, 'calm', '[{"connection_type": "friendship", "energy_level": "calm"}]'),
    ('user_07', 'Olivia', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 'high', '[{"connection_type": "collaboration", "energy_level": "high"}]'),
    ('user_08', 'William', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&q=80', NULL, 'focused', '[{"connection_type": "emotional", "energy_level": "focused"}]'),
    ('user_09', 'Ava', 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80', NULL, 'playful', '[{"connection_type": "casual", "energy_level": "playful"}]'),
    ('user_10', 'Benjamin', 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=800&q=80', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 'deep', '[{"connection_type": "romantic", "energy_level": "deep"}]'),
    ('user_11', 'Mia', 'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?w=800&q=80', NULL, 'calm', '[{"connection_type": "friendship", "energy_level": "calm"}]'),
    ('user_12', 'Elijah', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80', NULL, 'high', '[{"connection_type": "collaboration", "energy_level": "high"}]'),
    ('user_13', 'Charlotte', 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=800&q=80', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', 'focused', '[{"connection_type": "emotional", "energy_level": "focused"}]'),
    ('user_14', 'Lucas', 'https://images.unsplash.com/photo-1488161628813-99c974fc5b76?w=800&q=80', NULL, 'playful', '[{"connection_type": "casual", "energy_level": "playful"}]'),
    ('user_15', 'Amelia', 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=800&q=80', NULL, 'deep', '[{"connection_type": "romantic", "energy_level": "deep"}]'),
    ('user_16', 'Mason', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 'calm', '[{"connection_type": "friendship", "energy_level": "calm"}]'),
    ('user_17', 'Harper', 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&q=80', NULL, 'high', '[{"connection_type": "collaboration", "energy_level": "high"}]'),
    ('user_18', 'Ethan', 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=800&q=80', NULL, 'focused', '[{"connection_type": "emotional", "energy_level": "focused"}]'),
    ('user_19', 'Evelyn', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', 'playful', '[{"connection_type": "casual", "energy_level": "playful"}]'),
    ('user_20', 'Logan', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80', NULL, 'deep', '[{"connection_type": "romantic", "energy_level": "deep"}]');
