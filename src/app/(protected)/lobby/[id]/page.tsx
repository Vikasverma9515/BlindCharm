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
// import ErrorBoundary from '@/components/ErrorBoundary'
// import { MatchSuccessModal } from '@/components/lobby/MatchSuccessModal'


// interface PageProps {
//   params: Promise<{ id: string }>;
//     }

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
//   const [matchSuccess, setMatchSuccess] = useState<{ show: boolean; otherUser: string }>({
//     show: false,
//     otherUser: ''
//   });

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
//         .eq('status', 'waiting'); // Only get waiting participants

//       if (error) throw error;

//       const transformedParticipants = (data || []).map(p => {
//         // Handle if p.user is an array (Supabase join can return array)
//         const userObj = Array.isArray(p.user) ? p.user[0] : p.user;
//         return {
//           id: p.id,
//           lobby_id: p.lobby_id,
//           user_id: p.user_id,
//           status: p.status,
//           joined_at: p.joined_at,
//           user: {
//             id: userObj?.id,
//             username: userObj?.username,
//             gender: userObj?.gender,
//             profile_picture: userObj?.profile_picture,
//             bio: userObj?.bio,
//             interests: userObj?.interests
//           }
//         }
//       });
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
//       if (!session?.user?.id) return;

//       try {
//         // Check if user is already matched
//         const { data: participantData } = await supabase
//           .from('lobby_participants')
//           .select('status')
//           .eq('lobby_id', lobbyId)
//           .eq('user_id', session.user.id)
//           .single();

//         if (participantData?.status === 'matched') {
//           // Find their match and redirect
//           const { data: matchData } = await supabase
//             .from('matches')
//             .select('id')
//             .eq('lobby_id', lobbyId)
//             .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`)
//             .maybeSingle();

//           if (matchData) {
//             router.push(`/matches/${matchData.id}`);
//             return;
//           }
//         }

//         // If not matched but trying to join
//         if (!participantData || participantData.status !== 'waiting') {
//           router.push('/lobbies');
//         }
//       } catch (err) {
//         console.error('Error checking lobby access:', err);
//         router.push('/lobbies');
//       }
//     };

//     checkLobbyAccess();
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

//       console.log('Checking matching:', {
//         currentHour,
//         currentMinute,
//         isMatchingTime: hours.includes(currentHour) && currentMinute === 0,
//         participants: participants.length
//       });

//       // For production, use the time check below.
//       // For testing, use "if (true)" to always run matching.
//       if (hours.includes(currentHour) && currentMinute === 0) {
//         console.log('Starting matching process...');

//         const result = await MatchingService.matchParticipants(lobbyId);
//         console.log('Matching result:', result);

//         if (result.success && result.matches && result.matches.length > 0) {
//           const userMatch = result.matches.find(
//             m => m.user1_id === session?.user?.id || m.user2_id === session?.user?.id
//           );

//           if (userMatch) {
//             console.log('Match found:', userMatch);
//             router.push(`/matches/${userMatch.id}`);
//           }
//         }
//       }
//     };

//     // Check every minute (60000 ms) in production
//     const timer = setInterval(checkMatching, 60000);

//     // Run initial check
//     checkMatching();

//     return () => clearInterval(timer);
//   }, [session?.user?.id, lobbyId, participants]);

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

//   // Desired match hours (24-hour format)
// const matchHours = [0, 3, 6, 9, 12, 15, 18, 21]; // 0 for midnight, 12 for noon, etc.

// useEffect(() => {
//   if (!session?.user?.id || !lobbyId) return;

//   const checkAndMatch = async () => {
//     const now = new Date();
//     const hour = now.getHours();
//     const minute = now.getMinutes();

//     if (matchHours.includes(hour) && minute === 0) {
//       // Call your matchmaking function here
//       try {
//         const result = await MatchingService.matchParticipants(lobbyId);
//         if (result.success && result.matches && result.matches.length > 0) {
//           const userMatch = result.matches.find(
//             m => m.user1_id === session.user.id || m.user2_id === session.user.id
//           );
//           if (userMatch) {
//             router.push(`/matches/${userMatch.id}`);
//           }
//         }
//       } catch (err) {
//         console.error('Error during automatic matching:', err);
//       }
//     }
//   };

//   // Check every minute
//   const interval = setInterval(checkAndMatch, 60000);
//   // Run once on mount
//   checkAndMatch();

//   return () => clearInterval(interval);
// }, [session?.user?.id, lobbyId]);

//   // Update your match trigger function
//   const handleMatch = async () => {
//     try {
//       console.log('Starting manual match...');
//       const result = await MatchingService.matchParticipants(lobbyId);

//       if (result.success && result.matches && result.matches.length > 0) {
//         const userMatch = result.matches.find(
//           m => m.user1_id === session?.user?.id || m.user2_id === session?.user?.id
//         );

//         if (userMatch) {
//           // Get the other user's name
//           const getUsername = (user: any) =>
//             Array.isArray(user) ? user[0]?.username : user?.username;

//           const otherUser = userMatch.user1_id === session?.user?.id
//             ? getUsername(userMatch.user2)
//             : getUsername(userMatch.user1);

//           // Show success modal
//           setMatchSuccess({
//             show: true,
//             otherUser
//           });

//           // Redirect after modal is closed
//           setTimeout(() => {
//             router.push(`/matches/${userMatch.id}`);
//           }, 3000);
//         }
//       } else {
//         alert('No matches were created. Try again later.');
//       }
//     } catch (err) {
//       console.error('Error in matching:', err);
//       alert('Error during matching process. Please try again.');
//     }
//   };

//   // In your LobbyPage useEffect, after fetching participants:
//   useEffect(() => {
//     if (!session?.user?.id || !lobbyId) return;

//     const checkIfMatched = async () => {
//       const { data: matchData } = await supabase
//         .from('matches')
//         .select('id, user1_id, user2_id, user1:user1_id(username), user2:user2_id(username)')
//         .eq('lobby_id', lobbyId)
//         .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`)
//         .maybeSingle();

//       if (matchData) {
//         const getUsername = (user: any) =>
//           Array.isArray(user) ? user[0]?.username : user?.username;
//         const otherUser =
//           matchData.user1_id === session.user.id
//             ? getUsername(matchData.user2)
//             : getUsername(matchData.user1);

//         setMatchSuccess({ show: true, otherUser });
//         setTimeout(() => {
//           router.push(`/matches/${matchData.id}`);
//         }, 3000);
//       }
//     };

//     // Subscribe to lobby_participants or matches changes and call checkIfMatched
//     // Or call checkIfMatched after every participant update
//   }, [participants, session?.user?.id, lobbyId]);

//   // New useEffect for participant status changes
// useEffect(() => {
//   if (!session?.user?.id || !lobbyId) return;

//   // Subscribe to participant status changes
//   const participantChannel = supabase
//     .channel(`participant_status_${lobbyId}_${session.user.id}`)
//     .on(
//       'postgres_changes',
//       {
//         event: 'UPDATE',
//         schema: 'public',
//         table: 'lobby_participants',
//         filter: `user_id=eq.${session.user.id}`,
//       },
//       async (payload) => {
//         if (payload.new.status === 'matched') {
//           // Fetch match details
//           const { data: matchData, error } = await supabase
//             .from('matches')
//             .select(`
//               id,
//               user1_id,
//               user2_id,
//               user1:user1_id(username),
//               user2:user2_id(username)
//             `)
//             .eq('lobby_id', lobbyId)
//             .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`)
//             .order('created_at', { ascending: false })
//             .limit(1)
//             .single();

//           if (error) {
//             console.error('Error fetching match after status update:', error);
//             return;
//           }

//           if (matchData) {
//             const getUsername = (user: any) =>
//               Array.isArray(user) ? user[0]?.username : user?.username;

//             const otherUser = matchData.user1_id === session.user.id
//               ? getUsername(matchData.user2)
//               : getUsername(matchData.user1);

//             setMatchSuccess({
//               show: true,
//               otherUser
//             });

//             // Delay redirect to allow modal to be seen
//             setTimeout(() => {
//               router.push(`/matches/${matchData.id}`);
//             }, 3000);
//           }
//         }
//       }
//     )
//     .subscribe();

//   return () => {
//     participantChannel.unsubscribe();
//   };
// }, [session?.user?.id, lobbyId]);

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
//     <ErrorBoundary>
//       <div className="flex h-screen bg-gray-100">
//         <div className="w-1/4 bg-white shadow-lg overflow-hidden">
//           <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-500">
//             <h2 className="text-xl font-bold text-white flex items-center gap-2">
//               <Users className="w-5 h-5" />
//               Participants ({participants.length})
//             </h2>
//           </div>

//           <div className="p-4 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
//             {participants.map(participant => (
//               <div
//                 key={participant.id}
//                 className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
//               >
//                 {participant.user.profile_picture ? (
//                   <img
//                     src={participant.user.profile_picture}
//                     alt={participant.user.username}
//                     className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
//                   />
//                 ) : (
//                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
//                     {participant.user.username[0].toUpperCase()}
//                   </div>
//                 )}
//                 <div>
//                   <span className="font-medium text-gray-900">{participant.user.username}</span>
//                   <span className="text-sm text-gray-500 block">{participant.user.gender}</span>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Add test button */}
//           <div className="p-4 border-t">
//             <button
//               onClick={sendTestMessage}
//               className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//             >
//               Send Test Message
//             </button>
//           </div>

//           <div className="p-4 border-t">
//             <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
//               <h3 className="text-lg font-semibold text-gray-900">Next Match</h3>
//               <p className="text-gray-700 mt-1">{nextMatchTime}</p>
//             </div>
//           </div>

//           {/* Manual match trigger button (for debugging) */}
//           <div className="p-4 border-t">
//             <button
//   onClick={handleMatch}
//   className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
// >
//   Trigger Match (Debug)
// </button>
//           </div>
//         </div>

//         <div className="flex-1">
//           <LobbyChat
//             lobbyId={lobbyId}
//             messages={messages}
//             setMessages={setMessages}
//             currentUser={currentUser}
//           />
//         </div>

//         {/* Debug info */}
//         {/* <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
//           <p>Lobby ID: {lobbyId}</p>
//           <p>User ID: {session?.user?.id}</p>
//           <p>Messages Count: {messages.length}</p>
//           <p>Participants Count: {participants.length}</p>
//           <button
//             onClick={() => {
//               console.log('Current State:', {
//                 messages,
//                 participants,
//                 session,
//                 lobbyId
//               });
//             }}
//             className="mt-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
//           >
//             Log Debug Info
//           </button>
//         </div> */}

//         {/* Add the modal */}
//         {matchSuccess.show && (
//           <MatchSuccessModal
//             otherUser={matchSuccess.otherUser}
//             onClose={() => {
//               setMatchSuccess({ show: false, otherUser: '' });
//             }}
//           />
//         )}
//       </div>
//     </ErrorBoundary>
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
import ErrorBoundary from '@/components/ErrorBoundary'
import { MatchSuccessModal } from '@/components/lobby/MatchSuccessModal'


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
  const [matchSuccess, setMatchSuccess] = useState<{ show: boolean; otherUser: string }>({
    show: false,
    otherUser: ''
  });
  const [isRedirecting, setIsRedirecting] = useState(false);

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
        .eq('status', 'waiting'); // Only get waiting participants

      if (error) throw error;

      const transformedParticipants = (data || []).map(p => {
        // Handle if p.user is an array (Supabase join can return array)
        const userObj = Array.isArray(p.user) ? p.user[0] : p.user;
        return {
          id: p.id,
          lobby_id: p.lobby_id,
          user_id: p.user_id,
          status: p.status,
          joined_at: p.joined_at,
          user: {
            id: userObj?.id,
            username: userObj?.username,
            gender: userObj?.gender,
            profile_picture: userObj?.profile_picture,
            bio: userObj?.bio,
            interests: userObj?.interests
          }
        }
      });
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
        // Check if user is already matched
        const { data: participantData } = await supabase
          .from('lobby_participants')
          .select('status')
          .eq('lobby_id', lobbyId)
          .eq('user_id', session.user.id)
          .single();

        if (participantData?.status === 'matched') {
          // Find their match and redirect
          const { data: matchData } = await supabase
            .from('matches')
            .select('id')
            .eq('lobby_id', lobbyId)
            .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`)
            .maybeSingle();

          if (matchData) {
            router.push(`/matches/${matchData.id}`);
            return;
          }
        }

        // If not matched but trying to join
        if (!participantData || participantData.status !== 'waiting') {
          router.push('/lobbies');
        }
      } catch (err) {
        console.error('Error checking lobby access:', err);
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
      const now = new Date();
      const hours = [11, 12, 15, 18, 21, 22];
      const nextHour = hours.find(h => h > now.getHours()) || hours[0];
      const nextMatch = new Date(now);
      nextMatch.setHours(nextHour, 0, 0, 0);
      if (nextHour <= now.getHours()) {
        nextMatch.setDate(nextMatch.getDate() + 1);
      }
      const formattedTime = nextMatch.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      setNextMatchTime(formattedTime);
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

      console.log('Checking matching:', {
        currentHour,
        currentMinute,
        isMatchingTime: hours.includes(currentHour) && currentMinute === 0,
        participants: participants.length
      });

      // For production, use the time check below.
      // For testing, use "if (true)" to always run matching.
      if (hours.includes(currentHour) && currentMinute === 0) {
        console.log('Starting matching process...');

        const result = await MatchingService.matchParticipants(lobbyId);
        console.log('Matching result:', result);

        if (result.success && result.matches && result.matches.length > 0) {
          const userMatch = result.matches.find(
            m => m.user1_id === session?.user?.id || m.user2_id === session?.user?.id
          );

          if (userMatch) {
            console.log('Match found:', userMatch);
            router.push(`/matches/${userMatch.id}`);
          }
        }
      }
    };

    // Check every minute (60000 ms) in production
    const timer = setInterval(checkMatching, 60000);

    // Run initial check
    checkMatching();

    return () => clearInterval(timer);
  }, [session?.user?.id, lobbyId, participants]);

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

  // Desired match hours (24-hour format)
const matchHours = [0, 3, 6,7,8, 9, 12, 15, 18, 21, 24]; // 0 for midnight, 12 for noon, etc.

useEffect(() => {
  if (!session?.user?.id || !lobbyId) return;

  const checkAndMatch = async () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    if (matchHours.includes(hour) && minute === 0) {
      // Call your matchmaking function here
      try {
        const result = await MatchingService.matchParticipants(lobbyId);
        if (result.success && result.matches && result.matches.length > 0) {
          const userMatch = result.matches.find(
            m => m.user1_id === session.user.id || m.user2_id === session.user.id
          );
          if (userMatch) {
            router.push(`/matches/${userMatch.id}`);
          }
        }
      } catch (err) {
        console.error('Error during automatic matching:', err);
      }
    }
  };

  // Check every minute
  const interval = setInterval(checkAndMatch, 60000);
  // Run once on mount
  checkAndMatch();

  return () => clearInterval(interval);
}, [session?.user?.id, lobbyId]);

  // Update your match trigger function
  // const handleMatch = async () => {
  //   try {
  //     console.log('Starting manual match...');
  //     const result = await MatchingService.matchParticipants(lobbyId);

  //     if (result.success && result.matches && result.matches.length > 0) {
  //       const userMatch = result.matches.find(
  //         m => m.user1_id === session?.user?.id && m.user2_id === session?.user?.id
  //       );

  //       if (userMatch) {
  //         const otherUserId = userMatch.user1_id === session?.user?.id 
  //           ? userMatch.user2_id 
  //           : userMatch.user1_id;

  //         // Remove both matched users from lobby_participants table
  //         await supabase
  //           .from('lobby_participants')
  //           .delete()
  //           .eq('lobby_id', lobbyId)
  //           .in('user_id', [userMatch.user1_id, userMatch.user2_id]);

  //         await handleMatchSuccess(userMatch.id, otherUserId);
  //       }
  //     } else {
  //       alert('No matches were created. Try again later.');
  //     }
  //   } catch (err) {
  //     console.error('Error in matching:', err);
  //     alert('Error during matching process. Please try again.');
  //   }
  // };
  // Update handleMatch function with time restrictions
  const handleMatch = async () => {
    try {
      // Check if it's a valid matching time (DISABLED FOR DEBUGGING)
      // const now = new Date();
      // const currentHour = now.getHours();
      // const matchingHours = [11, 12, 15, 18, 21, 22]; // Valid matching hours
      
      // if (!matchingHours.includes(currentHour)) {
      //   alert(`Matching is only available at: ${matchingHours.join(', ')}:00. Current time: ${currentHour}:${now.getMinutes().toString().padStart(2, '0')}`);
      //   return;
      // }
      
      console.log('Starting manual match...');
      console.log('Current participants:', participants.length);
      
      const result = await MatchingService.matchParticipants(lobbyId);
      console.log('Matching result:', result);
      
      if (result.success) {
        if (result.matches && result.matches.length > 0) {
          console.log('✅ Matches created successfully! Checking if notifications were created...');
          
          // Check if notifications were created by the trigger and process them
          setTimeout(async () => {
            if (!session?.user?.id) return;
            
            const { data: notifications, error } = await supabase
              .from('match_notifications')
              .select('*')
              .eq('user_id', session.user.id)
              .order('created_at', { ascending: false })
              .limit(1);
            
            console.log('📋 Most recent notification for current user:', notifications, 'Error:', error);
            
            if (notifications && notifications.length > 0) {
              const notification = notifications[0];
              console.log('🔔 Processing notification:', notification);
              
              // Check if this notification was created recently (within last 10 seconds)
              const notificationTime = new Date(notification.created_at);
              const now = new Date();
              const timeDiff = (now.getTime() - notificationTime.getTime()) / 1000;
              
              console.log('⏰ Notification age in seconds:', timeDiff);
              
              if (timeDiff > 10) {
                console.log('⚠️ Notification is too old, skipping processing');
                return;
              }
              
              // Fetch match details
              const { data: matchData, error: matchError } = await supabase
                .from('matches')
                .select('id, user1_id, user2_id')
                .eq('id', notification.match_id)
                .single();

              console.log('🎯 Match data fetched:', matchData, 'Error:', matchError);

              if (matchData) {
                const isUser1 = matchData.user1_id === session.user.id;
                const otherUserId = isUser1 ? matchData.user2_id : matchData.user1_id;
                
                console.log('👤 Other user ID:', otherUserId);

                // Fetch the other user's details
                const { data: otherUserData, error: userError } = await supabase
                  .from('users')
                  .select('username')
                  .eq('id', otherUserId)
                  .single();

                console.log('👤 Other user data fetched:', otherUserData, 'Error:', userError);

                // Show match success modal
                setMatchSuccess({
                  show: true,
                  otherUser: otherUserData?.username || 'Unknown User'
                });

                // Mark notification as read
                await supabase
                  .from('match_notifications')
                  .update({ notified: true })
                  .eq('id', notification.id);

                // Delay redirect
                setTimeout(() => {
                  router.push(`/matches/${matchData.id}`);
                }, 3000);
              }
            }
          }, 1000);
          
        } else {
          alert('No matches were created. Need at least 2 participants (1 male, 1 female).');
        }
      } else {
        alert('Matching failed. Please try again.');
      }
    } catch (err) {
      console.error('Error in matching:', err);
      alert('Error during matching process. Please try again.');
    }
  };
useEffect(() => {
  if (!session?.user?.id || !lobbyId) return;

  const participantChannel = supabase
    .channel(`lobby_participants_${lobbyId}`)
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'lobby_participants',
        filter: `lobby_id=eq.${lobbyId}`
      },
      () => {
        // Refresh participants list when anyone is removed
        fetchParticipants();
      }
    )
    .subscribe();

  return () => {
    participantChannel.unsubscribe();
  };
}, [session?.user?.id, lobbyId]);

// Add this subscription for match notifications
// In your LobbyPage component
// Update the match notification handler
const handleMatchNotification = (payload: any) => {
  const matchData = payload.payload;
  
  const isUser1 = matchData.user1Id === session?.user?.id;
  const otherUsername = isUser1
    ? matchData.user2Username
    : matchData.user1Username;

  setMatchSuccess({
    show: true,
    otherUser: otherUsername
  });
  
  setIsRedirecting(true);

  // Remove from participants list locally
  setParticipants(prev => 
    prev.filter(p => 
      p.user_id !== matchData.user1Id && 
      p.user_id !== matchData.user2Id
    )
  );

  // Delay redirect
  setTimeout(() => {
    router.push(`/matches/${matchData.matchId}`);
  }, 3000);
};

// Use this in your JSX
{isRedirecting && (
  <div className="fixed inset-0 bg-black bg-opacity-30 z-40" />
)}

{matchSuccess.show && (
  <MatchSuccessModal
    otherUser={matchSuccess.otherUser}
    onClose={() => {
      setMatchSuccess({ show: false, otherUser: '' });
      setIsRedirecting(false);
    }}
  />
)}


// Add broadcast listener for match notifications
// Add this useEffect to listen for notifications
useEffect(() => {
  if (!session?.user?.id || !lobbyId) return;

  const notificationChannel = supabase
    .channel('match_notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'match_notifications',
        filter: `user_id=eq.${session?.user?.id}`
      },
      async (payload) => {
        console.log('🔔 Match notification received:', payload);
        const notification = payload.new;
        console.log('📋 Notification data:', notification);
        
        // Fetch match details first
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .select('id, user1_id, user2_id')
          .eq('id', notification.match_id)
          .single();

        console.log('🎯 Match data fetched:', matchData, 'Error:', matchError);

        if (matchData && session?.user?.id) {
          const isUser1 = matchData.user1_id === session.user.id;
          const otherUserId = isUser1 ? matchData.user2_id : matchData.user1_id;
          
          console.log('👤 Other user ID:', otherUserId);

          // Fetch the other user's details separately
          const { data: otherUserData, error: userError } = await supabase
            .from('users')
            .select('username')
            .eq('id', otherUserId)
            .single();

          console.log('👤 Other user data fetched:', otherUserData, 'Error:', userError);

          const otherUserObj = otherUserData;

          // Show match success modal
          setMatchSuccess({
            show: true,
            otherUser: otherUserObj?.username || 'Unknown User'
          });

          // Mark notification as read
          await supabase
            .from('match_notifications')
            .update({ notified: true })
            .eq('id', notification.id);

          // Delay redirect
          setTimeout(() => {
            router.push(`/matches/${matchData.id}`);
          }, 3000);
        }
      }
    )
    .subscribe((status) => {
      console.log('🔗 Match notification subscription status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('✅ Successfully subscribed to match notifications for user:', session?.user?.id);
      }
    });

  return () => {
    console.log('🔌 Unsubscribing from match notifications');
    notificationChannel.unsubscribe();
  };
}, [session?.user?.id, lobbyId]);

// Fallback: Periodic check for new notifications (in case real-time doesn't work)
useEffect(() => {
  if (!session?.user?.id || !lobbyId) return;

  const checkForNewNotifications = async () => {
    try {
      const { data: notifications, error } = await supabase
        .from('match_notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('notified', false)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error checking for notifications:', error);
        return;
      }

      if (notifications && notifications.length > 0) {
        const notification = notifications[0];
        console.log('🔔 Found unprocessed notification via periodic check:', notification);
        
        // Check if this notification is recent (within last 10 seconds)
        const notificationTime = new Date(notification.created_at);
        const now = new Date();
        const timeDiff = (now.getTime() - notificationTime.getTime()) / 1000;
        
        if (timeDiff <= 10) {
          console.log('⏰ Processing recent notification via fallback mechanism');
          
          // Fetch match details
          const { data: matchData, error: matchError } = await supabase
            .from('matches')
            .select('id, user1_id, user2_id')
            .eq('id', notification.match_id)
            .single();

          if (matchData) {
            const isUser1 = matchData.user1_id === session.user.id;
            const otherUserId = isUser1 ? matchData.user2_id : matchData.user1_id;
            
            // Fetch the other user's details
            const { data: otherUserData, error: userError } = await supabase
              .from('users')
              .select('username')
              .eq('id', otherUserId)
              .single();

            // Show match success modal
            setMatchSuccess({
              show: true,
              otherUser: otherUserData?.username || 'Unknown User'
            });

            // Mark notification as read
            await supabase
              .from('match_notifications')
              .update({ notified: true })
              .eq('id', notification.id);

            // Delay redirect
            setTimeout(() => {
              router.push(`/matches/${matchData.id}`);
            }, 3000);
          }
        }
      }
    } catch (error) {
      console.error('Error in periodic notification check:', error);
    }
  };

  // Check immediately and then every 5 seconds
  checkForNewNotifications();
  const interval = setInterval(checkForNewNotifications, 5000);

  return () => clearInterval(interval);
}, [session?.user?.id, lobbyId, router]);

// Automatic matching at specific times
useEffect(() => {
  if (!session?.user?.id || !lobbyId) return;

  // const matchingHours = [11, 12, 15, 18, 21, 22]; // Match with your matching hours
  const matchingHours = [0, 3, 6,7,8, 9, 12, 15, 18, 21, 24]; // Match with your matching hours
  

  const checkAndMatch = async () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    console.log('Checking automatic matching:', {
      currentHour: hour,
      currentMinute: minute,
      isMatchingTime: matchingHours.includes(hour) && minute === 0,
      participants: participants.length
    });

    // Only match at the exact hour (minute 0) of matching hours
    if (matchingHours.includes(hour) && minute === 0) {
      console.log('Starting automatic matching process...');
      
      try {
        const result = await MatchingService.matchParticipants(lobbyId);
        console.log('Automatic matching result:', result);
      } catch (error) {
        console.error('Error in automatic matching:', error);
      }
    }
  };

  // Check every minute (60000 ms)
  const timer = setInterval(checkAndMatch, 60000);

  // Run initial check
  checkAndMatch();

  return () => clearInterval(timer);
}, [session?.user?.id, lobbyId, participants.length]);



//   useEffect(() => {
//     if (!session?.user?.id || !lobbyId) return;

//     const cleanupChannel = supabase
//       .channel(`lobby_cleanup_${lobbyId}`)
//       .on(
//         'postgres_changes',
//         {
//           event: 'DELETE',
//           schema: 'public',
//           table: 'lobby_participants'
//         },
//         () => {
//           fetchParticipants(); // Refresh participants list
//         }
//       )
//       .subscribe();

//     return () => {
//       cleanupChannel.unsubscribe();
//     };
//   }, [session?.user?.id, lobbyId]);

//   const handleMatchSuccess = async (matchId: string, otherUserId: string) => {
//     try {
//       // Fetch other user's details
//       const { data: userData, error } = await supabase
//         .from('users')
//         .select('username')
//         .eq('id', otherUserId)
//         .single();

//       if (error) {
//         console.error('Error fetching other user:', error);
//         return;
//       }

//       if (userData) {
//         setMatchSuccess({
//           show: true,
//           otherUser: userData.username
//         });

//         // Remove from participants list locally
//         setParticipants(prev => 
//           prev.filter(p => p.user_id !== session?.user?.id)
//         );

//         // Delay redirect
//         setTimeout(() => {
//           router.push(`/matches/${matchId}`);
//         }, 3000);
//       }
//     } catch (error) {
//       console.error('Error handling match success:', error);
//     }
//   };

  // New useEffect for match notifications
// useEffect(() => {
//   if (!session?.user?.id || !lobbyId) return;

//   const matchChannel = supabase
//     .channel(`match_notifications_${session.user.id}`)
//     .on(
//       'broadcast',
//       { event: 'match_success' },
//       async (payload) => {
//         const matchData = payload.payload;
        
//         // Determine if current user is user1 or user2
//         const isUser1 = matchData.user1Id === session.user.id;
//         const otherUsername = isUser1 ? matchData.user2Username : matchData.user1Username;

//         // Show match success modal
//         setMatchSuccess({
//           show: true,
//           otherUser: otherUsername
//         });

//         // Remove both users from participants locally
//         setParticipants(prev => 
//           prev.filter(p => 
//             p.user_id !== matchData.user1Id && 
//             p.user_id !== matchData.user2Id
//           )
//         );

//         // Delay redirect
//         setTimeout(() => {
//           router.push(`/matches/${matchData.matchId}`);
//         }, 3000);
//       }
//     )
//     .subscribe();

//   return () => {
//     matchChannel.unsubscribe();
//   };
// }, [session?.user?.id, lobbyId]);

// Change the match notification channel to use a persistent, per-user global channel name
useEffect(() => {
  if (!session?.user?.id || !lobbyId) return;

  const channelName = `match_notifications_${session.user.id}`;
  const matchChannel = supabase
    .channel(channelName)
    .on(
      'broadcast',
      { event: 'match_success' },
      handleMatchNotification
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to ${channelName}`);
      }
    });

  return () => {
    matchChannel.unsubscribe();
  };
}, [session?.user?.id, lobbyId]);


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
    <ErrorBoundary>
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

          {/* Manual match trigger button (for debugging) */}
          <div className="p-4 border-t">
            <button
  onClick={handleMatch}
  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
>
  Trigger Match (Debug)
</button>
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

        {/* Redirecting overlay */}
        {isRedirecting && (
          <div className="fixed inset-0 bg-black bg-opacity-30 z-40" />
        )}

        {/* Add the modal */}
        {matchSuccess.show && (
          <MatchSuccessModal
            otherUser={matchSuccess.otherUser}
            onClose={() => {
              setMatchSuccess({ show: false, otherUser: '' });
              setIsRedirecting(false);
            }}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}