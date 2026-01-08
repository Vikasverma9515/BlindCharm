'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useUnreadCount(userId: string | undefined) {
    const [totalUnread, setTotalUnread] = useState(0);

    useEffect(() => {
        if (!userId) return;

        // Fetch initial unread count AND pending requests
        const fetchTotalCount = async () => {
            try {
                // 1. Unread Messages Count
                let messageCount = 0;
                const { data: messageData, error: messageError } = await supabase
                    .rpc('get_unread_count', { user_id_param: userId });

                if (!messageError) {
                    messageCount = messageData?.reduce((sum: number, item: any) => sum + Number(item.unread_count), 0) || 0;
                } else if (messageError.code !== 'PGRST202') {
                    console.error('Unread messages error:', messageError);
                }

                // 2. Pending Requests Count
                const { count: requestCount, error: requestError } = await supabase
                    .from('galaxy_matches')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_b', userId)
                    .eq('status', 'pending');

                if (requestError) console.error('Request count error:', requestError);

                setTotalUnread(messageCount + (requestCount || 0));

            } catch (err) {
                console.error('Failed to fetch total notification count:', err);
            }
        };

        fetchTotalCount();

        // Subscribe to new messages AND matches
        const channel = supabase
            .channel(`unread_updates_${userId}`)
            // Messages events
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'match_messages',
                filter: `sender_id=neq.${userId}`
            }, () => fetchTotalCount())
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'match_messages',
                filter: `read_at=not.is.null`
            }, () => fetchTotalCount())
            // Match Request events (New requests or Status changes)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'galaxy_matches',
                filter: `user_b=eq.${userId}` // Incoming requests
            }, () => fetchTotalCount())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    return totalUnread;
}
