-- Add is_banned column to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

-- Update RLS to prevent banned users from doing things (optional but good practice)
-- for now we rely on the app logic, but ideally we add policies later.
