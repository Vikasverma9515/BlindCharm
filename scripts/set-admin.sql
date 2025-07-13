-- Script to set a user as admin
-- Replace 'user_email@example.com' with the actual email of the user you want to make admin

UPDATE users 
SET is_admin = true 
WHERE email = 'user_email@example.com';

-- To check if the update worked:
SELECT id, email, full_name, is_admin 
FROM users 
WHERE is_admin = true;