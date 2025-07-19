-- Add face verification fields to users table
-- This migration adds fields for face verification and liveness detection

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_data JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_verification_attempt TIMESTAMP WITH TIME ZONE;

-- Create index for verification status
CREATE INDEX IF NOT EXISTS idx_users_verification_status ON users(verification_status);
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified);

-- Add RLS policies for verification data
-- Users can view their own verification status
CREATE POLICY IF NOT EXISTS "Users can view own verification status" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own verification data
CREATE POLICY IF NOT EXISTS "Users can update own verification data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Function to update verification status
CREATE OR REPLACE FUNCTION update_verification_status(
    user_id UUID,
    new_status VARCHAR(50),
    verification_info JSONB DEFAULT '{}'
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE users 
    SET 
        verification_status = new_status,
        verification_data = verification_info,
        is_verified = CASE WHEN new_status = 'verified' THEN TRUE ELSE FALSE END,
        verified_at = CASE WHEN new_status = 'verified' THEN NOW() ELSE NULL END,
        updated_at = NOW()
    WHERE id = user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_verification_status TO authenticated;