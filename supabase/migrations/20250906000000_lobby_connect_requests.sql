-- supabase/migrations/20250906000000_lobby_connect_requests.sql
-- Lobby Connect Requests: allow users in a lobby to request a private chat connection

CREATE TABLE IF NOT EXISTS lobby_connect_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id UUID NOT NULL REFERENCES lobbies(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | accepted | declined | cancelled | expired
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ
);

-- Avoid duplicate active requests between the same pair in the same lobby
CREATE UNIQUE INDEX IF NOT EXISTS uniq_lobby_connect_active_pair
ON lobby_connect_requests (lobby_id, LEAST(from_user_id, to_user_id), GREATEST(from_user_id, to_user_id))
WHERE status = 'pending';

ALTER TABLE lobby_connect_requests ENABLE ROW LEVEL SECURITY;

-- Policies: users can see their own requests (sender or recipient)
CREATE POLICY lobby_connect_requests_select ON lobby_connect_requests
FOR SELECT USING (
  auth.uid() = from_user_id OR auth.uid() = to_user_id
);

-- Sender can insert a new request
CREATE POLICY lobby_connect_requests_insert ON lobby_connect_requests
FOR INSERT WITH CHECK (
  auth.uid() = from_user_id
);

-- Sender or recipient can update (to allow cancel or accept/decline by recipient)
CREATE POLICY lobby_connect_requests_update ON lobby_connect_requests
FOR UPDATE USING (
  auth.uid() = from_user_id OR auth.uid() = to_user_id
) WITH CHECK (
  auth.uid() = from_user_id OR auth.uid() = to_user_id
);

-- No delete for now