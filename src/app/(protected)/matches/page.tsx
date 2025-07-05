'use client'

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import SimpleTopNav from '@/components/shared/SimpleTopNav';
import SimpleBottomNav from '@/components/shared/SimpleBottomNav';

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
  bothRevealed: boolean;
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
          user1_revealed,
          user2_revealed,
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

      const transformedMatches = await Promise.all((matchData || []).map(async (match) => {
        const isUser1 = match.user1_id === session?.user?.id;
        const otherUser = isUser1 ? match.user2 : match.user1;
        const otherUserObj = Array.isArray(otherUser) ? otherUser[0] : otherUser;
        const bothRevealed = match.user1_revealed && match.user2_revealed;

        // Fetch last message for this match
        const { data: lastMessageData } = await supabase
          .from('match_messages')
          .select('content, created_at')
          .eq('match_id', match.id)
          .order('created_at', { ascending: false })
          .limit(1);

        return {
          id: match.id,
          otherUser: {
            id: otherUserObj.id,
            username: otherUserObj.username,
            profile_picture: otherUserObj.profile_picture
          },
          lastMessage: lastMessageData && lastMessageData.length > 0 ? {
            content: lastMessageData[0].content,
            created_at: lastMessageData[0].created_at
          } : undefined,
          created_at: match.created_at,
          bothRevealed: bothRevealed
        };
      }));

      setMatches(transformedMatches);
    } catch (err) {
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mb-4 mx-auto animate-spin">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading matches...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SimpleTopNav pageName="Matches" />
      
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Header - Desktop only */}
        <div className="hidden md:block bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Messages</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Your conversations</p>
          </div>
        </div>

        {/* Matches List */}
        <div className="max-w-4xl mx-auto">
          {matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 px-4">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No conversations yet</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-sm">
                Start chatting in lobbies to make connections and find your matches!
              </p>
              <button
                onClick={() => router.push('/lobby')}
                className="bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Explore Lobbies
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 md:rounded-lg md:shadow-sm md:mx-4 md:mt-4 transition-colors duration-300">
            {/* // <div className="hover:shadow-float bg-indigo-300 border-l-15 hover:shadow-lg transition-shadow duration-200"> */}
              {matches.map((match, index) => (
                <div
                  key={match.id}
                  onClick={() => router.push(`/matches/${match.id}`)}
                  className={`flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                    index !== matches.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0 mr-3">
                    {match.bothRevealed && match.otherUser.profile_picture ? (
                      <Image
                        src={match.otherUser.profile_picture}
                        alt={match.otherUser.username}
                        width={48}
                        height={48}
                        className="rounded-full object-cover w-12 h-12"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {match.bothRevealed && match.otherUser.username 
                            ? match.otherUser.username[0].toUpperCase() 
                            : '?'}
                        </span>
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {match.bothRevealed ? match.otherUser.username : 'Anonymous Match'}
                      </h3>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {new Date(match.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      {match.lastMessage ? (
                        <p className="text-sm text-gray-600 truncate">
                          {match.lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">
                          Tap to start chatting
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <SimpleBottomNav />
    </>
  );
}