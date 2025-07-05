-- Test if blur_profile column exists in lobby_participants table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'lobby_participants' 
AND column_name = 'blur_profile';

-- Also check current data in the table
SELECT id, user_id, lobby_id, blur_profile 
FROM lobby_participants 
LIMIT 5;