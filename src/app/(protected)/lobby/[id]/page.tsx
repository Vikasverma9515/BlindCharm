// // src/app/(protected)/lobby/[id]/page.tsx
// 'use client'

// import { use, useEffect, useState } from 'react'
// import { useSession } from 'next-auth/react'
// import { useRouter } from 'next/navigation'
// import { supabase } from '@/lib/supabase'
// import LobbyChat from '@/components/lobby/LobbyChat'
// import { Loader2, Users } from 'lucide-react'
// import { Message, LobbyParticipant, User } from '@/types/lobby'
// import { MatchingService } from '@/lib/services/MatchingService'


// interface PageProps {
//   params: Promise<{ id: string }>;
// }

// export default function LobbyPage({ params }: PageProps) {
//   const resolvedParams = use(params); // Unwrap the promise
//   const lobbyId = resolvedParams.id;
//   const { data: session, status } = useSession()
//   const router = useRouter()
//   const [participants, setParticipants] = useState<LobbyParticipant[]>([])
//   const [messages, setMessages] = useState<Message[]>([])
//   const [nextMatchTime, setNextMatchTime] = useState<string>('')
//   const [error, setError] = useState<string | null>(null)
//   const [loading, setLoading] = useState(true)

//   const fetchParticipants = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('lobby_participants')
//         .select(`
//           id,
//           lobby_id,
//           user_id,
//           status,
//           joined_at,
//           user:user_id (
//             id,
//             username,
//             gender,
//             profile_picture,
//             bio,
//             interests
//           )
//         `)
//         .eq('lobby_id', lobbyId)
//         .eq('status', 'waiting');

//       if (error) throw error;

//       const transformedParticipants: LobbyParticipant[] = (data || []).map((participant: any) => ({
//         id: participant.id,
//         lobby_id: participant.lobby_id,
//         user_id: participant.user_id,
//         status: participant.status,
//         joined_at: participant.joined_at,
//         user: {
//           id: participant.user?.id || '',
//           username: participant.user?.username || 'Unknown User',
//           gender: participant.user?.gender || 'other',
//           profile_picture: participant.user?.profile_picture || null,
//           bio: participant.user?.bio || null,
//           interests: participant.user?.interests || null,
//         }
//       }));

//       setParticipants(transformedParticipants);
//     } catch (err) {
//       console.error('Error fetching participants:', err);
//       setError('Failed to load participants');
//     }
//   };

//   const fetchMessages = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('lobby_messages')
//         .select(`
//           id,
//           content,
//           user_id,
//           lobby_id,
//           created_at,
//           user:user_id (
//             id,
//             username,
//             gender,
//             profile_picture
//           )
//         `)
//         .eq('lobby_id', lobbyId)
//         .order('created_at', { ascending: true });

//       if (error) throw error;

//       const transformedMessages: Message[] = (data || []).map((msg: any) => ({
//         id: msg.id,
//         content: msg.content,
//         user_id: msg.user_id,
//         lobby_id: msg.lobby_id,
//         created_at: msg.created_at,
//         user: {
//           id: msg.user?.id || '',
//           username: msg.user?.username || 'Unknown User',
//           gender: msg.user?.gender || 'other',
//           profile_picture: msg.user?.profile_picture || null,
//         }
//       }));

//       setMessages(transformedMessages);
//     } catch (err) {
//       console.error('Error fetching messages:', err);
//       setError('Failed to load messages');
//     }
//   };

//   // Verify user is in lobby
//   useEffect(() => {
//     const checkLobbyAccess = async () => {
//       if (!session?.user?.id) return

//       const { data } = await supabase
//         .from('lobby_participants')
//         .select('id')
//         .eq('lobby_id', lobbyId)
//         .eq('user_id', session.user.id)
//         .eq('status', 'waiting')
//         .single()

//       if (!data) {
//         router.push('/lobbies')
//       }
//     }

//     checkLobbyAccess()
//   }, [session, lobbyId, router])

//   useEffect(() => {
//     if (!session?.user?.id || !lobbyId) return

//     // Set up subscriptions with unique channel names
//     const participantsSubscription = supabase
//       .channel(`lobby_participants_${lobbyId}_${Date.now()}`)
//       .on(
//         'postgres_changes',
//         {
//           event: '*',
//           schema: 'public',
//           table: 'lobby_participants',
//           filter: `lobby_id=eq.${lobbyId}`
//         },
//         () => fetchParticipants()
//       )
//       .subscribe()

//     const messagesSubscription = supabase
//       .channel(`lobby_messages_${lobbyId}_${Date.now()}`)
//       .on(
//         'postgres_changes',
//         {
//           event: 'INSERT',
//           schema: 'public',
//           table: 'lobby_messages',
//           filter: `lobby_id=eq.${lobbyId}`
//         },
//         () => fetchMessages()
//       )
//       .subscribe()

//     // Initial fetch
//     Promise.all([
//       fetchParticipants(),
//       fetchMessages()
//     ]).finally(() => setLoading(false))

//     // Update match time
//     const updateMatchTime = () => {
//       const now = new Date()
//       const hours = [11, 12, 15, 18, 21, 22
//       ]
//       const nextHour = hours.find(h => h > now.getHours()) || hours[0]
//       const nextMatch = new Date(now)
//       nextMatch.setHours(nextHour, 0, 0, 0)
//       if (nextHour <= now.getHours()) {
//         nextMatch.setDate(nextMatch.getDate() + 1)
//       }
//       setNextMatchTime(nextMatch.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
//     }
//     updateMatchTime()

//     return () => {
//       participantsSubscription.unsubscribe()
//       messagesSubscription.unsubscribe()
//     }
//   }, [session?.user?.id, lobbyId])

//   // Matching check useEffect
//   useEffect(() => {
//     if (!session?.user?.id || !lobbyId) return;

//     const hours = [11, 12, 15, 18, 21, 22]; // Match with your matching hours

//     const checkMatching = async () => {
//       const now = new Date();
//       const currentHour = now.getHours();
//       const currentMinute = now.getMinutes();

//       // Check if it's matching time
//       if (hours.includes(currentHour) && currentMinute === 0) {
//         const result = await MatchingService.matchParticipants(lobbyId);

//         if (result.success && Array.isArray(result.matches) && result.matches.length > 0) {
//           // Find user's match
//           const userMatch = result.matches.find(
//             m => m.user1_id === session?.user?.id || m.user2_id === session?.user?.id
//           );

//           if (userMatch) {
//             router.push(`/matches/${userMatch.id}`);
//           }
//         }
//       }
//     };

//     // Initial check
//     checkMatching();

//     // Set up interval for checking
//     const timer = setInterval(checkMatching, 60000); // Check every minute

//     return () => clearInterval(timer);
//   }, [session?.user?.id, lobbyId, router]);

//   // Add the test message function
//   const sendTestMessage = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('lobby_messages')
//         .insert({
//           lobby_id: lobbyId,
//           user_id: session?.user?.id,
//           content: 'Test message'
//         })
//         .select(`
//           id,
//           content,
//           user_id,
//           lobby_id,
//           created_at,
//           user:user_id (
//             id,
//             username,
//             profile_picture,
//             gender
//           )
//         `);

//       if (error) throw error;
//       console.log('Test message sent:', data);
//       fetchMessages();
//     } catch (err) {
//       console.error('Error sending test message:', err);
//     }
//   };

//   useEffect(() => {
//     if (session?.user?.id && lobbyId) {
//       // Uncomment to auto-send a test message on mount
//       // sendTestMessage();
//     }
//   }, [session?.user?.id, lobbyId]);

//   const currentUser: User | null = session?.user ? {
//     id: session.user.id,
//     username: session.user.name || session.user.email || 'Unknown',
//     profile_picture: (session.user as any).image || null,
//     gender: (session.user as any).gender || 'other'
//   } : null;

//   if (status === 'loading' || loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
//       </div>
//     )
//   }

//   if (!session) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="bg-red-50 text-red-600 p-4 rounded-lg">
//           Please log in to access the lobby.
//         </div>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="bg-red-50 text-red-600 p-4 rounded-lg">
//           {error}
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="flex h-screen bg-gray-100">
//       <div className="w-1/4 bg-white shadow-lg overflow-hidden">
//         <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-500">
//           <h2 className="text-xl font-bold text-white flex items-center gap-2">
//             <Users className="w-5 h-5" />
//             Participants ({participants.length})
//           </h2>
//         </div>

//         <div className="p-4 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
//           {participants.map(participant => (
//             <div 
//               key={participant.id} 
//               className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
//             >
//               {participant.user.profile_picture ? (
//                 <img 
//                   src={participant.user.profile_picture} 
//                   alt={participant.user.username}
//                   className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
//                 />
//               ) : (
//                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
//                   {participant.user.username[0].toUpperCase()}
//                 </div>
//               )}
//               <div>
//                 <span className="font-medium text-gray-900">{participant.user.username}</span>
//                 <span className="text-sm text-gray-500 block">{participant.user.gender}</span>
//               </div>
//             </div>
//           ))}
//         </div>
        
//         {/* Add test button */}
//         <div className="p-4 border-t">
//           <button
//             onClick={sendTestMessage}
//             className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//           >
//             Send Test Message
//           </button>
//         </div>

//         <div className="p-4 border-t">
//           <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
//             <h3 className="text-lg font-semibold text-gray-900">Next Match</h3>
//             <p className="text-gray-700 mt-1">{nextMatchTime}</p>
//           </div>
//         </div>
//       </div>

//       <div className="flex-1">
//         <LobbyChat 
//           lobbyId={lobbyId} 
//           messages={messages} 
//           setMessages={setMessages}
//           currentUser={currentUser}
//         />
//       </div>

//       {/* Debug info */}
//       {/* <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
//         <p>Lobby ID: {lobbyId}</p>
//         <p>User ID: {session?.user?.id}</p>
//         <p>Messages Count: {messages.length}</p>
//         <p>Participants Count: {participants.length}</p>
//         <button
//           onClick={() => {
//             console.log('Current State:', {
//               messages,
//               participants,
//               session,
//               lobbyId
//             });
//           }}
//           className="mt-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
//         >
//           Log Debug Info
//         </button>
//       </div> */}
//     </div>
//   );
// }
// src/app/(protected)/lobby/[id]/page.tsx
'use client'

import { use, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import LobbyChat from '@/components/lobby/LobbyChat'
import { Loader2, Users } from 'lucide-react'
import { Message, LobbyParticipant, User } from '@/types/lobby'
import { MatchingService } from '@/lib/services/MatchingService'


interface PageProps {
  params: Promise<{ id: string }>;
}

export default function LobbyPage({ params }: PageProps) {
  const resolvedParams = use(params); // Unwrap the promise
  const lobbyId = resolvedParams.id;
  const { data: session, status } = useSession()
  const router = useRouter()
  const [participants, setParticipants] = useState<LobbyParticipant[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [nextMatchTime, setNextMatchTime] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('lobby_participants')
        .select(`
          id,
          lobby_id,
          user_id,
          status,
          joined_at,
          user:user_id (
            id,
            username,
            gender,
            profile_picture,
            bio,
            interests
          )
        `)
        .eq('lobby_id', lobbyId)
        .eq('status', 'waiting');

      if (error) throw error;

      const transformedParticipants: LobbyParticipant[] = (data || []).map((participant: any) => ({
        id: participant.id,
        lobby_id: participant.lobby_id,
        user_id: participant.user_id,
        status: participant.status,
        joined_at: participant.joined_at,
        user: {
          id: participant.user?.id || '',
          username: participant.user?.username || 'Unknown User',
          gender: participant.user?.gender || 'other',
          profile_picture: participant.user?.profile_picture || null,
          bio: participant.user?.bio || null,
          interests: participant.user?.interests || null,
        }
      }));

      setParticipants(transformedParticipants);
    } catch (err) {
      console.error('Error fetching participants:', err);
      setError('Failed to load participants');
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('lobby_messages')
        .select(`
          id,
          content,
          user_id,
          lobby_id,
          created_at,
          user:user_id (
            id,
            username,
            gender,
            profile_picture
          )
        `)
        .eq('lobby_id', lobbyId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const transformedMessages: Message[] = (data || []).map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        user_id: msg.user_id,
        lobby_id: msg.lobby_id,
        created_at: msg.created_at,
        user: {
          id: msg.user?.id || '',
          username: msg.user?.username || 'Unknown User',
          gender: msg.user?.gender || 'other',
          profile_picture: msg.user?.profile_picture || null,
        }
      }));

      setMessages(transformedMessages);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    }
  };

  // Verify user is in lobby
  useEffect(() => {
    const checkLobbyAccess = async () => {
      if (!session?.user?.id) return;

      try {
        // Check if user is matched in this lobby
        const { data: matchData } = await supabase
          .from('matches')
          .select('id')
          .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`)
          .eq('lobby_id', lobbyId)
          .eq('status', 'matched')
          .maybeSingle();

        if (matchData) {
          router.push(`/matches/${matchData.id}`);
          return;
        }

        // Check if user is a waiting participant in this lobby
        const { data: lobbyData } = await supabase
          .from('lobby_participants')
          .select('id')
          .eq('lobby_id', lobbyId)
          .eq('user_id', session.user.id)
          .eq('status', 'waiting')
          .maybeSingle();

        if (!lobbyData) {
          router.push('/lobbies');
        }
      } catch (err) {
        console.error('Error checking access:', err);
        router.push('/lobbies');
      }
    };

    checkLobbyAccess();
  }, [session, lobbyId, router])

  useEffect(() => {
    if (!session?.user?.id || !lobbyId) return

    // Set up subscriptions with unique channel names
    const participantsSubscription = supabase
      .channel(`lobby_participants_${lobbyId}_${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lobby_participants',
          filter: `lobby_id=eq.${lobbyId}`
        },
        () => fetchParticipants()
      )
      .subscribe()

    const messagesSubscription = supabase
      .channel(`lobby_messages_${lobbyId}_${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lobby_messages',
          filter: `lobby_id=eq.${lobbyId}`
        },
        () => fetchMessages()
      )
      .subscribe()

    // Initial fetch
    Promise.all([
      fetchParticipants(),
      fetchMessages()
    ]).finally(() => setLoading(false))

    // Update match time
    const updateMatchTime = () => {
      const now = new Date()
      const hours = [11, 12, 15, 18, 21, 22
      ]
      const nextHour = hours.find(h => h > now.getHours()) || hours[0]
      const nextMatch = new Date(now)
      nextMatch.setHours(nextHour, 0, 0, 0)
      if (nextHour <= now.getHours()) {
        nextMatch.setDate(nextMatch.getDate() + 1)
      }
      setNextMatchTime(nextMatch.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }
    updateMatchTime()

    return () => {
      participantsSubscription.unsubscribe()
      messagesSubscription.unsubscribe()
    }
  }, [session?.user?.id, lobbyId])

  // Matching check useEffect
  useEffect(() => {
    if (!session?.user?.id || !lobbyId) return;

    const hours = [11, 12, 15, 18, 21, 22]; // Match with your matching hours

    const checkMatching = async () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Check if it's matching time
      if (hours.includes(currentHour) && currentMinute === 0) {
        const result = await MatchingService.matchParticipants(lobbyId);

        if (result.success && Array.isArray(result.matches) && result.matches.length > 0) {
          // Find user's match
          const userMatch = result.matches.find(
            m => m.user1_id === session?.user?.id || m.user2_id === session?.user?.id
          );

          if (userMatch) {
            router.push(`/matches/${userMatch.id}`);
          }
        }
      }
    };

    // Initial check
    checkMatching();

    // Set up interval for checking
    const timer = setInterval(checkMatching, 60000); // Check every minute

    return () => clearInterval(timer);
  }, [session?.user?.id, lobbyId, router]);

  // Add the test message function
  const sendTestMessage = async () => {
    try {
      const { data, error } = await supabase
        .from('lobby_messages')
        .insert({
          lobby_id: lobbyId,
          user_id: session?.user?.id,
          content: 'Test message'
        })
        .select(`
          id,
          content,
          user_id,
          lobby_id,
          created_at,
          user:user_id (
            id,
            username,
            profile_picture,
            gender
          )
        `);

      if (error) throw error;
      console.log('Test message sent:', data);
      fetchMessages();
    } catch (err) {
      console.error('Error sending test message:', err);
    }
  };

  useEffect(() => {
    if (session?.user?.id && lobbyId) {
      // Uncomment to auto-send a test message on mount
      // sendTestMessage();
    }
  }, [session?.user?.id, lobbyId]);

  const currentUser: User | null = session?.user ? {
    id: session.user.id,
    username: session.user.name || session.user.email || 'Unknown',
    profile_picture: (session.user as any).image || null,
    gender: (session.user as any).gender || 'other'
  } : null;

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Please log in to access the lobby.
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/4 bg-white shadow-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-500">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Participants ({participants.length})
          </h2>
        </div>

        <div className="p-4 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
          {participants.map(participant => (
            <div 
              key={participant.id} 
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {participant.user.profile_picture ? (
                <img 
                  src={participant.user.profile_picture} 
                  alt={participant.user.username}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                  {participant.user.username[0].toUpperCase()}
                </div>
              )}
              <div>
                <span className="font-medium text-gray-900">{participant.user.username}</span>
                <span className="text-sm text-gray-500 block">{participant.user.gender}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Add test button */}
        <div className="p-4 border-t">
          <button
            onClick={sendTestMessage}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Send Test Message
          </button>
        </div>

        <div className="p-4 border-t">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900">Next Match</h3>
            <p className="text-gray-700 mt-1">{nextMatchTime}</p>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <LobbyChat 
          lobbyId={lobbyId} 
          messages={messages} 
          setMessages={setMessages}
          currentUser={currentUser}
        />
      </div>

      {/* Debug info */}
      {/* <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
        <p>Lobby ID: {lobbyId}</p>
        <p>User ID: {session?.user?.id}</p>
        <p>Messages Count: {messages.length}</p>
        <p>Participants Count: {participants.length}</p>
        <button
          onClick={() => {
            console.log('Current State:', {
              messages,
              participants,
              session,
              lobbyId
            });
          }}
          className="mt-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Log Debug Info
        </button>
      </div> */}
    </div>
  );
}