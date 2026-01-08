-- Update Female Profiles with Real Photos (Unsplash)
UPDATE public.galaxy_profiles
SET 
    photos = ARRAY[
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80'
    ]
WHERE gender = 'female';

-- Update Male Profiles with Real Photos (Unsplash)
UPDATE public.galaxy_profiles
SET 
    photos = ARRAY[
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
    ]
WHERE gender = 'male';

-- Update 'users' table profile_picture to match (sync from first photo in array)
UPDATE public.users u
SET profile_picture = gp.photos[1]
FROM public.galaxy_profiles gp
WHERE u.id = gp.user_id
AND gp.photos IS NOT NULL
AND array_length(gp.photos, 1) > 0;
