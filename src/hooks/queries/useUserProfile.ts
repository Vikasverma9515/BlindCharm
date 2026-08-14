import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { DEMO_MODE, DEMO_CURRENT_USER_PROFILE } from '@/lib/demoData';

export const useUserProfile = (userId: string | undefined) => {
    return useQuery({
        queryKey: ['userProfile', userId],
        queryFn: async () => {
            if (!userId) return null;
            if (DEMO_MODE) return DEMO_CURRENT_USER_PROFILE;

            const { data, error } = await supabase
                .from('galaxy_profiles')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 10, // 10 minutes (Profile data doesn't change often)
    });
};
