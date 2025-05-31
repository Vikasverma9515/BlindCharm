// src/app/(protected)/chat/[matchId]/page.tsx
'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ChatWindow } from '@/components/chat/ChatWindow';
import type { Match } from '@/types/chat';

export default function ChatPage({ params }: { params: { matchId: string } }) {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatch = async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('id', params.matchId)
        .single();

      if (!error && data) {
        setMatch(data);
      }
      setLoading(false);
    };

    fetchMatch();
  }, [params.matchId]);

  if (loading) return <div>Loading...</div>;
  if (!match) return <div>Match not found</div>;

  return (
    <div className="h-screen p-4">
      {/* Pass matchId and match to ChatWindow */}
      <ChatWindow matchId={params.matchId} match={match} />
    </div>
  );
}