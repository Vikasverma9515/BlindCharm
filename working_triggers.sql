-- Working SQL triggers for real-time count updates
-- Run this in Supabase SQL editor

-- First, ensure the whispers table has the correct structure
ALTER TABLE whispers 
ALTER COLUMN likes_count TYPE integer USING COALESCE(likes_count::integer, 0),
ALTER COLUMN comments_count TYPE integer USING COALESCE(comments_count::integer, 0);

ALTER TABLE whispers 
ALTER COLUMN likes_count SET DEFAULT 0,
ALTER COLUMN comments_count SET DEFAULT 0;

UPDATE whispers SET 
  likes_count = COALESCE(likes_count, 0),
  comments_count = COALESCE(comments_count, 0);

ALTER TABLE whispers 
ALTER COLUMN likes_count SET NOT NULL,
ALTER COLUMN comments_count SET NOT NULL;

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS update_whisper_likes_count ON whisper_reactions;
DROP TRIGGER IF EXISTS update_whisper_comments_count ON whisper_comments;
DROP FUNCTION IF EXISTS update_whisper_likes_count();
DROP FUNCTION IF EXISTS update_whisper_comments_count();

-- Function to update likes count
CREATE OR REPLACE FUNCTION update_whisper_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE whispers 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.whisper_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE whispers 
    SET likes_count = GREATEST(likes_count - 1, 0) 
    WHERE id = OLD.whisper_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update comments count
CREATE OR REPLACE FUNCTION update_whisper_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE whispers 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.whisper_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE whispers 
    SET comments_count = GREATEST(comments_count - 1, 0) 
    WHERE id = OLD.whisper_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_whisper_likes_count
  AFTER INSERT OR DELETE ON whisper_reactions
  FOR EACH ROW EXECUTE FUNCTION update_whisper_likes_count();

CREATE TRIGGER update_whisper_comments_count
  AFTER INSERT OR DELETE ON whisper_comments
  FOR EACH ROW EXECUTE FUNCTION update_whisper_comments_count();

-- Initialize counts for existing whispers
UPDATE whispers SET 
  likes_count = (
    SELECT COUNT(*) 
    FROM whisper_reactions 
    WHERE whisper_id = whispers.id
  ),
  comments_count = (
    SELECT COUNT(*) 
    FROM whisper_comments 
    WHERE whisper_id = whispers.id
  );

-- Enable realtime for the whispers table
ALTER PUBLICATION supabase_realtime ADD TABLE whispers;
ALTER PUBLICATION supabase_realtime ADD TABLE whisper_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE whisper_comments;