
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { redirect } from 'next/navigation';
import GalaxyMatchChat from '@/components/galaxy/GalaxyMatchChat';

interface ChatPageProps {
    params: Promise<{ id: string }>;
}

export default async function GalaxyChatRoomPage({ params }: ChatPageProps) {
    const { id: matchId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).id) {
        redirect('/login');
    }

    const userId = (session.user as any).id;

    // Fetch Match to verify access
    const { data: match } = await supabaseAdmin
        .from('galaxy_matches')
        .select('*')
        .eq('id', matchId)
        .single();

    if (!match) {
        return (
            <div className="h-screen bg-black text-white flex items-center justify-center">
                <p>Match not found.</p>
            </div>
        );
    }

    // Verify ownership
    if (match.user_a !== userId && match.user_b !== userId) {
        return (
            <div className="h-screen bg-black text-white flex items-center justify-center">
                <p>Unauthorized.</p>
            </div>
        );
    }

    const otherUserId = match.user_a === userId ? match.user_b : match.user_a;

    // Outer container: NO redundant back button.
    // The GalaxyMatchChat component handles the whole UI including header.
    return (
        <div className="h-full w-full bg-black">
            <GalaxyMatchChat
                matchId={matchId}
                currentUserId={userId}
                otherUserId={otherUserId}
            />
        </div>
    );
}
