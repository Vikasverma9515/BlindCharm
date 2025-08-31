// 'use client'

// import { useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import { supabase } from '@/lib/supabase';
// import { Loader2 } from 'lucide-react';
// import Image from 'next/image';
// import SimpleTopNav from '@/components/shared/SimpleTopNav';
// import SimpleBottomNav from '@/components/shared/SimpleBottomNav';

// interface MatchPreview {
//   id: string;
//   otherUser: {
//     id: string;
//     username: string;
//     profile_picture: string | null;
//   };
//   lastMessage?: {
//     content: string;
//     created_at: string;
//   };
//   created_at: string;
//   bothRevealed: boolean;
// }

// export default function MatchesPage() {
//   const { data: session } = useSession();
//   const router = useRouter();
//   const [matches, setMatches] = useState<MatchPreview[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!session?.user?.id) return;
//     fetchMatches();
//     // eslint-disable-next-line
//   }, [session?.user?.id]);

//   const fetchMatches = async () => {
//     try {
//       const { data: matchData, error } = await supabase
//         .from('matches')
//         .select(`
//           id,
//           created_at,
//           user1_id,
//           user2_id,
//           user1_revealed,
//           user2_revealed,
//           user1:user1_id (
//             id,
//             username,
//             profile_picture
//           ),
//           user2:user2_id (
//             id,
//             username,
//             profile_picture
//           )
//         `)
//         .or(`user1_id.eq.${session?.user?.id},user2_id.eq.${session?.user?.id}`)
//         .order('created_at', { ascending: false });

//       if (error) throw error;

//       const transformedMatches = await Promise.all((matchData || []).map(async (match) => {
//         const isUser1 = match.user1_id === session?.user?.id;
//         const otherUser = isUser1 ? match.user2 : match.user1;
//         const otherUserObj = Array.isArray(otherUser) ? otherUser[0] : otherUser;
//         const bothRevealed = match.user1_revealed && match.user2_revealed;

//         // Fetch last message for this match
//         const { data: lastMessageData } = await supabase
//           .from('match_messages')
//           .select('content, created_at')
//           .eq('match_id', match.id)
//           .order('created_at', { ascending: false })
//           .limit(1);

//         return {
//           id: match.id,
//           otherUser: {
//             id: otherUserObj.id,
//             username: otherUserObj.username,
//             profile_picture: otherUserObj.profile_picture
//           },
//           lastMessage: lastMessageData && lastMessageData.length > 0 ? {
//             content: lastMessageData[0].content,
//             created_at: lastMessageData[0].created_at
//           } : undefined,
//           created_at: match.created_at,
//           bothRevealed: bothRevealed
//         };
//       }));

//       setMatches(transformedMatches);
//     } catch (err) {
//       console.error('Error fetching matches:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
//         <div className="text-center">
//           <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mb-4 mx-auto animate-spin">
//             <div className="w-3 h-3 bg-white rounded-full"></div>
//           </div>
//           <p className="text-gray-600 dark:text-gray-400">Loading matches...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <SimpleTopNav pageName="Matches" />
      
//       <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
//         {/* Header - Desktop only */}
//         <div className="hidden md:block bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
//           <div className="max-w-4xl mx-auto">
//             <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Messages</h1>
//             <p className="text-gray-600 dark:text-gray-400 text-sm">Your conversations</p>
//           </div>
//         </div>

//         {/* Matches List */}
//         <div className="max-w-4xl mx-auto">
//           {matches.length === 0 ? (
//             <div className="flex flex-col items-center justify-center h-96 px-4">
//               <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
//                 <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//                 </svg>
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No conversations yet</h3>
//               <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-sm">
//                 Start chatting in lobbies to make connections and find your matches!
//               </p>
//               <button
//                 onClick={() => router.push('/lobby')}
//                 className="bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
//               >
//                 Explore Lobbies
//               </button>
//             </div>
//           ) : (
//             <div className="">
//              <div className=" p-5 ">
//               {matches.map((match, index) => (
//                 <div
//                   key={match.id}
//                   onClick={() => router.push(`/matches/${match.id}`)}
//                   className={`flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors bg-white dark:bg-indigo-700 rounded-2xl border-b-8 border-b-indigo-500  ${
//                     index !== matches.length - 1 ? 'border-b border-gray-100' : 'border-b border-gray-100'
//                   }`}
//                 >
//                   <div className="relative flex-shrink-0 mr-3 ">
//                     {match.bothRevealed && match.otherUser.profile_picture ? (
//                       <Image
//                         src={match.otherUser.profile_picture}
//                         alt={match.otherUser.username}
//                         width={48}
//                         height={48}
//                         className="rounded-full object-cover w-12 h-12"
//                       />
//                     ) : (
//                       <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center">
//                         <span className="text-white font-semibold text-lg">
//                           {match.bothRevealed && match.otherUser.username 
//                             ? match.otherUser.username[0].toUpperCase() 
//                             : '?'}
//                         </span>
//                       </div>
//                     )}
//                     <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
//                   </div>
                  
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-baseline justify-between mb-1">
//                       <h3 className="font-semibold text-gray-900 dark:text-lime-200 truncate">
//                         {match.bothRevealed ? match.otherUser.username : 'Anonymous Match'}
//                       </h3>
//                       <span className="text-xs text-gray-500 dark:text-gray-200 ml-2 flex-shrink-0">
//                         {new Date(match.created_at).toLocaleDateString('en-US', { 
//                           month: 'short', 
//                           day: 'numeric' 
//                         })}
//                       </span>
//                     </div>
                    
//                     <div className="flex items-center justify-between">
//                       {match.lastMessage ? (
//                         <p className="text-sm text-gray-600 dark:text-gray-200 truncate">
//                           {match.lastMessage.content}
//                         </p>
//                       ) : (
//                         <p className="text-sm text-gray-600 italic">
//                           Tap to start chatting
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )
//               )}
//               </div>  
//             </div>
//           )}
//         </div>
//       </main>
      
//       <SimpleBottomNav />
//     </>
//   );
// }


'use client'

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, Heart, Volume2, Play, Pause, Plus } from 'lucide-react';
import Image from 'next/image';
import SimpleTopNav from '@/components/shared/SimpleTopNav';
import SimpleBottomNav from '@/components/shared/SimpleBottomNav';
import { VoiceService } from '@/lib/services/VoiceService';
import toast from 'react-hot-toast';

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
  status: string; // Add status to track match state
}

interface IncomingLike {
  likeId: string;
  created_at: string;
  liker_id: string;
  liker: { id: string; username?: string; full_name?: string };
  their_card_id: string;
  their_card: {
    id: string;
    audio_url: string;
    audio_duration: number;
    mood_tags: string[];
    prompt?: { id: string; prompt_text: string };
  };
}

export default function MatchesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [matches, setMatches] = useState<MatchPreview[]>([]);
  const [incomingLikes, setIncomingLikes] = useState<IncomingLike[]>([]);
  const [playingLikeId, setPlayingLikeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetchMatches();
    // fetchIncomingLikes();
    
    // Set up real-time subscription for match updates
    const channel = supabase
      .channel('matches_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `user1_id=eq.${session.user.id}`
        },
        () => {
          fetchMatches();
          // fetchIncomingLikes();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `user2_id=eq.${session.user.id}`
        },
        () => {
          fetchMatches();
          // fetchIncomingLikes();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
    // eslint-disable-next-line
  }, [session?.user?.id]);

  // const fetchIncomingLikes = async () => {
  //   try {
  //     const data = await VoiceService.getIncomingLikes(session!.user!.id);
  //     setIncomingLikes(data);
  //   } catch (e) {
  //     console.error('Failed to load incoming likes', e);
  //   }
  // };

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
          status,
          blocked_by,
          blocked_at,
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
        .neq('status', 'blocked')
        .is('blocked_by', null)
        .in('status', ['active', 'matched'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const filteredMatches = (matchData || []).filter(match => 
        match.status !== 'blocked' && !match.blocked_by && !match.blocked_at
      );

      const transformedMatches = await Promise.all(filteredMatches.map(async (match) => {
        const isUser1 = match.user1_id === session?.user?.id;
        const otherUser = isUser1 ? match.user2 : match.user1;
        const otherUserObj = Array.isArray(otherUser) ? otherUser[0] : otherUser;
        const bothRevealed = match.user1_revealed && match.user2_revealed;

        const { data: lastMessageData } = await supabase
          .from('match_messages')
          .select('content, created_at, type')
          .eq('match_id', match.id)
          .order('created_at', { ascending: false })
          .limit(1);

        let lastMessageContent = '';
        if (lastMessageData && lastMessageData.length > 0) {
          const message = lastMessageData[0];
          if (message.type === 'voice') {
            lastMessageContent = '🎤 Voice message';
          } else {
            lastMessageContent = message.content;
          }
        }

        return {
          id: match.id,
          otherUser: {
            id: otherUserObj.id,
            username: otherUserObj.username,
            profile_picture: otherUserObj.profile_picture
          },
          lastMessage: lastMessageData && lastMessageData.length > 0 ? {
            content: lastMessageContent,
            created_at: lastMessageData[0].created_at
          } : undefined,
          created_at: match.created_at,
          bothRevealed: bothRevealed,
          status: match.status
        };
      }));

      setMatches(transformedMatches);
    } catch (err) {
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle match click with additional safety check
  const handleMatchClick = async (matchId: string) => {
    try {
      // Double-check match status before navigating
      const { data: matchCheck, error } = await supabase
        .from('matches')
        .select('status, blocked_by, blocked_at')
        .eq('id', matchId)
        .single();

      if (error) {
        console.error('Error checking match status:', error);
        return;
      }

      if (matchCheck.status === 'blocked' || matchCheck.blocked_by) {
        console.log('Match is blocked, refreshing matches list');
        fetchMatches(); // Refresh the list to remove this match
        return;
      }

      router.push(`/matches/${matchId}`);
    } catch (error) {
      console.error('Error navigating to match:', error);
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

        {/* Matches List + Likes You */}
        <div className="max-w-4xl mx-auto">
          {/* Likes You section - visible always for testing */}
          {/* <div className="px-5 mt-5">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-red-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Likes You</h3>
                </div>
                <button
                  onClick={() => router.push('/voice-profile')}
                  className="text-xs px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg inline-flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Create Voice Card</span>
                </button>
              </div>

              {incomingLikes.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">No one has liked your voice yet. Create a voice card to get started!</p>
              ) : (
                <div className="space-y-3">
                  {incomingLikes.map(like => (
                    <div key={like.likeId} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <Volume2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{like.liker?.username || 'Anonymous'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{like.their_card?.prompt?.prompt_text || 'Voice prompt'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            if (playingLikeId === like.likeId) { setPlayingLikeId(null); return; }
                            setPlayingLikeId(like.likeId);
                            const audio = new Audio(like.their_card.audio_url);
                            audio.play();
                            audio.addEventListener('ended', () => setPlayingLikeId(null));
                          }}
                          className="w-9 h-9 rounded-full bg-purple-500 hover:bg-purple-600 text-white flex items-center justify-center"
                          aria-label="Play"
                        >
                          {playingLikeId === like.likeId ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const result = await VoiceService.likeBack(like.liker_id, session!.user!.id);
                              if (result) {
                                toast.success("It's a match! Opening chat...", { icon: '💫' });
                                router.push(`/chat/${result.chatMatchId}`);
                              } else {
                                toast.success('Liked back!');
                                // fetchIncomingLikes();
                              }
                            } catch (e) {
                              console.error('Failed to like back', e);
                              toast.error('Could not like back');
                            }
                          }}
                          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
                        >
                          Like back
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div> */}

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
            <div className="">
              <div className="p-5">
                {matches.map((match, index) => (
                  <div
                    key={match.id}
                    onClick={() => handleMatchClick(match.id)}
                    className={`flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-indigo-600 cursor-pointer transition-colors bg-white dark:bg-indigo-700 rounded-2xl border-b-8 border-b-indigo-500 mb-4 ${
                      index !== matches.length - 1 ? 'border-b border-gray-100' : 'border-b border-gray-100'
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
                        <h3 className="font-semibold text-gray-900 dark:text-lime-200 truncate">
                          {match.bothRevealed ? match.otherUser.username : 'Anonymous Match'}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-200 ml-2 flex-shrink-0">
                          {match.lastMessage ? (
                            new Date(match.lastMessage.created_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })
                          ) : (
                            new Date(match.created_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })
                          )}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        {match.lastMessage ? (
                          <p className="text-sm text-gray-600 dark:text-gray-200 truncate">
                            {match.lastMessage.content}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                            Tap to start chatting
                          </p>
                        )}
                        
                        {/* Match status indicator (optional - you can remove this if not needed) */}
                        {match.status === 'matched' && (
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 ml-2"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>  
            </div>
          )}
        </div>
      </main>
      
      <SimpleBottomNav />
    </>
  );
}