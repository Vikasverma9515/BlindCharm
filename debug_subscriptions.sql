-- Debug push subscriptions
SELECT 
  id,
  user_id,
  endpoint,
  created_at,
  CASE 
    WHEN p256dh IS NOT NULL THEN 'Has p256dh'
    ELSE 'Missing p256dh'
  END as p256dh_status,
  CASE 
    WHEN auth IS NOT NULL THEN 'Has auth'
    ELSE 'Missing auth'
  END as auth_status
FROM push_subscriptions 
ORDER BY created_at DESC
LIMIT 10;

-- Count total subscriptions
SELECT COUNT(*) as total_subscriptions FROM push_subscriptions;

-- Count subscriptions by user
SELECT user_id, COUNT(*) as subscription_count 
FROM push_subscriptions 
GROUP BY user_id 
ORDER BY subscription_count DESC;

-- Check for any invalid subscriptions
SELECT COUNT(*) as invalid_subscriptions 
FROM push_subscriptions 
WHERE endpoint IS NULL OR p256dh IS NULL OR auth IS NULL;