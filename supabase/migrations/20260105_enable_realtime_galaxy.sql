-- Enable Realtime for Galaxy Tables
-- This allows the client to subscribe to changes in these tables using supabase.channel()

begin;

  -- Add galaxy_matches to the realtime publication
  -- This enables listening to new matches (INSERT) and status changes (UPDATE)
  alter publication supabase_realtime add table galaxy_matches;

  -- Add match_messages to the realtime publication
  -- This enables listening to new incoming messages (INSERT)
  alter publication supabase_realtime add table match_messages;

  -- Ensure Replica Identity is set to FULL for galaxy_matches to receive full old/new record on UPDATE
  -- (Optional but recommended if we need full 'old' record context, though usually DEFAULT is enough for IDs)
  alter table galaxy_matches replica identity full;

commit;
