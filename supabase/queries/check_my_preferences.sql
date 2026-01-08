-- Check your own saved preferences
SELECT 
    full_name,
    interested_in, 
    discovery_min_age, 
    discovery_max_age, 
    discovery_max_distance, 
    discovery_verified_only,
    discovery_min_height, 
    discovery_max_height
FROM galaxy_profiles
WHERE user_id = auth.uid();
