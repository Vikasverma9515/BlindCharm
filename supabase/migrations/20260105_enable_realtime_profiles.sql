-- Enable Realtime for galaxy_profiles table
-- This allows the client to listen for changes to "interested_in" and auto-refresh the feed

begin;

-- build the publication if it doesn't exist (standard supabase setup usually has 'supabase_realtime')
-- We just add the table to it.

alter publication supabase_realtime add table galaxy_profiles;

commit;
