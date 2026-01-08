
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase-admin';
import ChatList from '@/components/galaxy/ChatList';
import { redirect } from 'next/navigation';

export default async function GalaxyChatListPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).id) {
        redirect('/login');
    }

    const userId = (session.user as any).id;
    let initialMatches: any[] = [];
    let initialRequests: any[] = [];

    try {
        // 1. FETCH MATCHES (Existing Logic)
        const { data: matchesData } = await supabaseAdmin
            .from('galaxy_matches')
            .select(`
                id,
                created_at,
                matched_at,
                user_a,
                user_b,
                status
            `)
            .or(`user_a.eq.${userId},user_b.eq.${userId}`)
            .eq('status', 'matched')
            .order('matched_at', { ascending: false });

        // 2. FETCH REQUESTS (New Logic)
        // Requests are where I am user_b (target), and status is 'pending'
        const { data: requestsData } = await supabaseAdmin
            .from('galaxy_matches')
            .select(`
                id,
                created_at,
                user_a,
                user_b,
                status
            `)
            .eq('user_b', userId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        const allProfileIds = new Set<string>();

        // Collect IDs from Matches
        if (matchesData) {
            matchesData.forEach(m => {
                const otherId = m.user_a === userId ? m.user_b : m.user_a;
                allProfileIds.add(otherId);
            });
        }

        // Collect IDs from Requests
        if (requestsData) {
            requestsData.forEach(r => {
                allProfileIds.add(r.user_a); // I am user_b, so user_a is the requester
            });
        }

        // Fetch Profiles for BOTH (Single Query)
        let profilesMap = new Map();
        if (allProfileIds.size > 0) {
            const { data: profiles } = await supabaseAdmin
                .from('galaxy_profiles')
                .select('user_id, full_name, photos, bio')
                .in('user_id', Array.from(allProfileIds));

            profiles?.forEach(p => profilesMap.set(p.user_id, p));
        }


        // Get unread counts
        const { data: unreadData } = await supabaseAdmin
            .rpc('get_unread_count', { user_id_param: userId });

        // Get last message for each match
        let lastMessages: any[] = [];
        if (matchesData && matchesData.length > 0) {
            const matchIds = matchesData.map(m => m.id);
            const { data: msgs } = await supabaseAdmin
                .from('match_last_messages')
                .select('*')
                .in('match_id', matchIds);
            if (msgs) lastMessages = msgs;
        }

        const lastMessageMap = new Map();
        lastMessages?.forEach(m => lastMessageMap.set(m.match_id, m));

        const unreadMap = new Map();
        unreadData?.forEach((u: any) => unreadMap.set(u.match_id, u.unread_count));

        // Map Matches to UI format
        if (matchesData) {
            initialMatches = matchesData.map(m => {
                const otherId = m.user_a === userId ? m.user_b : m.user_a;
                const profile = profilesMap.get(otherId);
                const lastMsg = lastMessageMap.get(m.id);
                const unreadCount = unreadMap.get(m.id) || 0;

                // Format last message
                let lastMessageText = 'New Match! Say hello.';
                let messageTime = m.matched_at ? new Date(m.matched_at).toLocaleDateString() : 'New';

                if (lastMsg) {
                    const isOwnMessage = lastMsg.sender_id === userId;
                    const prefix = isOwnMessage ? 'You: ' : '';

                    // Format based on message type
                    let messageContent = '';
                    if (lastMsg.type === 'voice') {
                        messageContent = '🎤 Voice message';
                    } else if (lastMsg.type === 'gif') {
                        messageContent = 'GIF';
                    } else {
                        messageContent = lastMsg.content.length > 40
                            ? lastMsg.content.substring(0, 40) + '...'
                            : lastMsg.content;
                    }

                    lastMessageText = prefix + messageContent;

                    // Format time nicely
                    const msgDate = new Date(lastMsg.created_at);
                    const now = new Date();
                    const diffMs = now.getTime() - msgDate.getTime();
                    const diffMins = Math.floor(diffMs / 60000);
                    const diffHours = Math.floor(diffMs / 3600000);
                    const diffDays = Math.floor(diffMs / 86400000);

                    if (diffMins < 1) {
                        messageTime = 'Just now';
                    } else if (diffMins < 60) {
                        messageTime = `${diffMins}m`;
                    } else if (diffHours < 24) {
                        messageTime = `${diffHours}h`;
                    } else if (diffDays < 7) {
                        messageTime = `${diffDays}d`;
                    } else {
                        messageTime = msgDate.toLocaleDateString();
                    }
                }

                return {
                    id: m.id,
                    otherUserId: otherId,
                    name: profile?.full_name?.split(' ')[0] || 'Member',
                    avatar: profile?.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=500&fit=crop',
                    lastMessage: lastMessageText,
                    time: messageTime,
                    unread: Number(unreadCount)
                };
            });

            // Sort by most recent message
            initialMatches.sort((a, b) => {
                const aHasMsg = !a.lastMessage.includes('New Match!');
                const bHasMsg = !b.lastMessage.includes('New Match!');
                if (aHasMsg && !bHasMsg) return -1;
                if (!aHasMsg && bHasMsg) return 1;
                return 0; // Keep matched_at order for same category
            });
        }

        // Map Requests to UI format
        if (requestsData && requestsData.length > 0) {
            initialRequests = requestsData.map(r => {
                const profile = profilesMap.get(r.user_a);
                return {
                    id: r.id, // Match ID
                    requesterId: r.user_a,
                    name: profile?.full_name?.split(' ')[0] || 'Admirer',
                    avatar: profile?.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=500&fit=crop',
                    bio: profile?.bio,
                    time: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recent'
                };
            });
        }

    } catch (error) {
        console.error("Error fetching chats server side:", error);
    }

    return (
        <ChatList
            initialMatches={initialMatches}
            initialRequests={initialRequests}
            userId={userId}
        />
    );
}
