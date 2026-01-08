
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { redirect, notFound } from 'next/navigation';
import RequestDetailClient from '@/components/galaxy/RequestDetailClient';

interface RequestParams {
    params: {
        id: string;
    };
}

export default async function RequestPage({ params }: RequestParams) {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/login');

    const userId = (session.user as any).id;
    const matchId = params.id;

    // 1. Fetch the Match Request
    // Ensure it's a valid pending request directed at "Me" (user_b)
    const { data: match } = await supabaseAdmin
        .from('galaxy_matches')
        .select('*')
        .eq('id', matchId)
        .eq('user_b', userId)
        .eq('status', 'pending')
        .single();

    if (!match) {
        notFound(); // Request doesn't exist or isn't for me or isn't pending
    }

    // 2. Fetch the Requester's Profile (user_a)
    const { data: profile } = await supabaseAdmin
        .from('galaxy_profiles')
        .select('*')
        .eq('user_id', match.user_a)
        .single();

    if (!profile) {
        return (
            <div className="flex h-screen items-center justify-center text-white/50">
                Data unavailable
            </div>
        );
    }

    // 3. Render Client Component
    return (
        <RequestDetailClient
            profile={profile}
            matchId={matchId}
        />
    );
}
