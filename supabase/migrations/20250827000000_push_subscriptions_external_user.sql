-- Migration: Allow external (non-Supabase) users for push subscriptions
-- 1) Make user_id nullable so we can store device subscriptions without a Supabase auth user
ALTER TABLE push_subscriptions
  ALTER COLUMN user_id DROP NOT NULL;

-- 2) Add external_user_id and auth_provider to store non-Supabase user references
ALTER TABLE push_subscriptions
  ADD COLUMN IF NOT EXISTS external_user_id TEXT,
  ADD COLUMN IF NOT EXISTS auth_provider TEXT CHECK (auth_provider IN ('supabase','nextauth','firebase') OR auth_provider IS NULL);

-- 3) Replace unique constraint on (user_id, endpoint) with a simpler per-endpoint uniqueness
--    This avoids FK issues when user_id is null or when using external_user_id.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'push_subscriptions_user_id_endpoint_key'
  ) THEN
    ALTER TABLE push_subscriptions DROP CONSTRAINT push_subscriptions_user_id_endpoint_key;
  END IF;
END $$;

-- Unique per endpoint (each browser/device subscription endpoint is unique)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'push_subscriptions_unique_endpoint'
  ) THEN
    ALTER TABLE push_subscriptions
      ADD CONSTRAINT push_subscriptions_unique_endpoint UNIQUE (endpoint);
  END IF;
END $$;

-- 4) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_external_user_id ON push_subscriptions(external_user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_auth_provider ON push_subscriptions(auth_provider);

-- Note: The existing FK to auth.users(id) remains, but user_id is now nullable.
-- RLS remains unchanged and is bypassed by service role in server routes.