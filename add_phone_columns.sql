-- Add phone authentication columns to users table if they don't exist

-- Add phone_number column
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='phone_number') THEN
        ALTER TABLE users ADD COLUMN phone_number TEXT UNIQUE;
    END IF;
END $$;

-- Add firebase_uid column
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='firebase_uid') THEN
        ALTER TABLE users ADD COLUMN firebase_uid TEXT UNIQUE;
    END IF;
END $$;

-- Add is_phone_verified column
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_phone_verified') THEN
        ALTER TABLE users ADD COLUMN is_phone_verified BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add phone_verified_at column
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='phone_verified_at') THEN
        ALTER TABLE users ADD COLUMN phone_verified_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);