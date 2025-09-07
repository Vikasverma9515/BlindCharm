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

-- RLS policies intentionally omitted because app uses Firebase Auth.
-- Access should be performed via server-side (service key) through RPC functions.
-- If needed later, implement custom policies that don't rely on auth.uid().

-- Function to update verification status
CREATE OR REPLACE FUNCTION update_verification_status(
    user_id UUID,
    new_status VARCHAR(50),
    verification_info JSONB DEFAULT '{}'
) RETURNS BOOLEAN AS $$
BEGIN
    -- Ensure the user exists (Firebase Auth is used, no auth.uid())
    IF NOT EXISTS (SELECT 1 FROM users u WHERE u.id = user_id) THEN
        RETURN FALSE;
    END IF;

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

-- Restrict execute permission to service role (server-side only)
REVOKE ALL ON FUNCTION update_verification_status(UUID, VARCHAR, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION update_verification_status(UUID, VARCHAR, JSONB) TO service_role;