'use client'

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

interface MatchPreview {
  id: string;
  otherUser: {
    id: string;
    username: string;
    profile_picture: string | null;
  };
  lastMessage?: {
    content: string;
    created_at: string;
  };
  created_at: string;
}

export default function MatchesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [matches, setMatches] = useState<MatchPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetchMatches();
    // eslint-disable-next-line
  }, [session?.user?.id]);

  const fetchMatches = async () => {
    try {
      const { data: matchData, error } = await supabase
        .from('matches')
        .select(`
          id,
          created_at,
          user1_id,
          user2_id,
          user1:user1_id (
            id,
            username,
            profile_picture
          ),
          user2:user2_id (
            id,
            username,
            profile_picture
          )
        `)
        .or(`user1_id.eq.${session?.user?.id},user2_id.eq.${session?.user?.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedMatches = (matchData || []).map(match => {
        const isUser1 = match.user1_id === session?.user?.id;
        const otherUser = isUser1 ? match.user2 : match.user1;

        // If otherUser is an array, take the first element
        const otherUserObj = Array.isArray(otherUser) ? otherUser[0] : otherUser;

        return {
          id: match.id,
          otherUser: {
            id: otherUserObj.id,
            username: otherUserObj.username,
            profile_picture: otherUserObj.profile_picture
          },
          created_at: match.created_at
        };
      });

      setMatches(transformedMatches);
    } catch (err) {
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Your Matches</h1>
      <div className="space-y-2">
        {matches.map(match => (
          <div
            key={match.id}
            onClick={() => router.push(`/matches/${match.id}`)}
            className="flex items-center p-4 bg-white rounded-lg shadow hover:bg-gray-50 cursor-pointer"
          >
            <div className="relative w-12 h-12 mr-4">
              {match.otherUser.profile_picture ? (
                <Image
                  src={match.otherUser.profile_picture}
                  alt={match.otherUser.username}
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xl text-gray-500">
                    {match.otherUser.username[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{match.otherUser.username}</h3>
              {match.lastMessage ? (
                <p className="text-sm text-gray-500 truncate">
                  {match.lastMessage.content}
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  No messages yet
                </p>
              )}
            </div>
            <div className="text-xs text-gray-400">
              {new Date(match.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
        {matches.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No matches yet
          </div>
        )}
      </div>
    </div>
  );
}