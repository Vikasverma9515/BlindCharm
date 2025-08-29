-- Unverify face verification when main profile photo changes
-- This ensures users must re-verify after changing their primary photo.

-- Create or replace trigger function
CREATE OR REPLACE FUNCTION public.unverify_face_on_profile_picture_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only act when profile_picture actually changes
  IF TG_OP = 'UPDATE' AND (NEW.profile_picture IS DISTINCT FROM OLD.profile_picture) THEN
    NEW.face_verified := false;
    NEW.face_verified_at := NULL;
    NEW.face_verification_score := NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if present to avoid duplicates (safe re-run)
DROP TRIGGER IF EXISTS trg_unverify_on_profile_picture_change ON public.users;

-- Create trigger to run before updates to profile_picture
CREATE TRIGGER trg_unverify_on_profile_picture_change
BEFORE UPDATE OF profile_picture ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.unverify_face_on_profile_picture_change();