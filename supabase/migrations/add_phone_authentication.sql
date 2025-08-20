-- Add phone authentication support to users table

-- Add phone-related columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS firebase_uid TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMP WITH TIME ZONE;

-- Create index for phone number lookups
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);

-- Update RLS policies to allow phone authentication
CREATE POLICY "Users can read their own phone data" ON users
  FOR SELECT USING (auth.uid()::text = id OR phone_number IS NOT NULL);

CREATE POLICY "Users can update their own phone data" ON users
  FOR UPDATE USING (auth.uid()::text = id OR firebase_uid IS NOT NULL);

-- Allow phone-verified users to insert their profile
CREATE POLICY "Phone verified users can insert" ON users
  FOR INSERT WITH CHECK (firebase_uid IS NOT NULL AND is_phone_verified = TRUE);

-- Create a function to handle phone user creation
CREATE OR REPLACE FUNCTION create_phone_user(
  p_phone_number TEXT,
  p_firebase_uid TEXT,
  p_username TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL
)
RETURNS users AS $$
DECLARE
  new_user users;
  generated_username TEXT;
  generated_email TEXT;
BEGIN
  -- Generate username if not provided
  IF p_username IS NULL THEN
    generated_username := 'user_' || RIGHT(p_phone_number, 4);
  ELSE
    generated_username := p_username;
  END IF;
  
  -- Generate email if not provided
  IF p_email IS NULL THEN
    generated_email := p_firebase_uid || '@phone.blindcharm.com';
  ELSE
    generated_email := p_email;
  END IF;
  
  -- Insert new user
  INSERT INTO users (
    phone_number,
    firebase_uid,
    username,
    email,
    is_phone_verified,
    phone_verified_at,
    created_at
  ) VALUES (
    p_phone_number,
    p_firebase_uid,
    generated_username,
    generated_email,
    TRUE,
    NOW(),
    NOW()
  ) RETURNING * INTO new_user;
  
  RETURN new_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION create_phone_user TO anon, authenticated;

-- Create a trigger to set phone_verified_at when is_phone_verified is set to true
CREATE OR REPLACE FUNCTION set_phone_verified_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_phone_verified = TRUE AND OLD.is_phone_verified = FALSE THEN
    NEW.phone_verified_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_phone_verified_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_phone_verified_at();

-- Add comments for documentation
COMMENT ON COLUMN users.phone_number IS 'User phone number with country code (e.g., +919876543210)';
COMMENT ON COLUMN users.firebase_uid IS 'Firebase Authentication UID for phone verification';
COMMENT ON COLUMN users.is_phone_verified IS 'Whether the phone number has been verified';
COMMENT ON COLUMN users.phone_verified_at IS 'Timestamp when phone was verified';
COMMENT ON FUNCTION create_phone_user IS 'Creates a new user with phone authentication';