-- Add image field to lobbies table
ALTER TABLE lobbies ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add admin role to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create storage bucket for lobby images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('lobby-images', 'lobby-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for lobby images bucket
CREATE POLICY "Anyone can view lobby images" ON storage.objects
FOR SELECT USING (bucket_id = 'lobby-images');

CREATE POLICY "Authenticated users can upload lobby images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'lobby-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own lobby images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'lobby-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own lobby images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'lobby-images' 
  AND auth.role() = 'authenticated'
);

-- Update lobbies table RLS to allow admins to create lobbies
CREATE POLICY "Admins can create lobbies" ON lobbies
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.is_admin = true
  )
);

-- Allow admins to update lobbies
CREATE POLICY "Admins can update lobbies" ON lobbies
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.is_admin = true
  )
);

-- Allow admins to delete lobbies
CREATE POLICY "Admins can delete lobbies" ON lobbies
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.is_admin = true
  )
);