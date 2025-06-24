// // src/app/(protected)/matches/[id]/page.tsx
// 'use client'

// import { use, useEffect, useState, useRef } from 'react'
// import { useSession } from 'next-auth/react'
// import { useRouter } from 'next/navigation'
// import { supabase } from '@/lib/supabase'

// interface MatchParams {
//   params: { id: string }
// }

// interface Match {
//   id: string
//   user1_id: string
//   user2_id: string
//   status: string
//   created_at: string
//   user1: {
//     id: string
//     username: string
//     profile_picture: string | null
//   }
//   user2: {
//     id: string
//     username: string
//     profile_picture: string | null
//   }
// }

// interface Message {
//   id: string
//   content: string
//   sender_id: string
//   created_at: string
//   sender: {
//     id: string
//     username: string
//     profile_picture: string | null
//   }
// }

// interface UserProfile {
//   id: string
//   username: string
//   profile_picture: string | null
// }


// interface PageProps {
//   params: Promise<{ id: string }>;
// }

// export default function MatchChatPage({ params }: { params: Promise<{ id: string }> }) {
//   const { id: matchId } = use(params);
//   const { data: session } = useSession();
//   const router = useRouter();

//   // All useState hooks at the top
//   const [match, setMatch] = useState<Match | null>(null);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [hasRevealed, setHasRevealed] = useState(false);
//   const [bothRevealed, setBothRevealed] = useState(false);
//   const [myProfile, setMyProfile] = useState<any>(null);
//   const [otherUserProfile, setOtherUserProfile] = useState<any>(null);
//   const [isUser1, setIsUser1] = useState(false);

//   // All useRef hooks
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   // Fetch messages on mount and when matchId changes
//   useEffect(() => {
//     if (!matchId) return;
//     fetchMessages();
//   }, [matchId]);

//   // Real-time subscription for new messages
//   useEffect(() => {
//     if (!matchId) return;

//     const channel = supabase
//       .channel(`match_messages_${matchId}_${Date.now()}`)
//       .on(
//         'postgres_changes',
//         {
//           event: '*',
//           schema: 'public',
//           table: 'match_messages',
//           filter: `match_id=eq.${matchId}`
//         },
//         () => {
//           fetchMessages();
//         }
//       )
//       .subscribe();

//     return () => {
//       channel.unsubscribe();
//     };
//   }, [matchId]);

//   // Fetch match info and poll messages
//   useEffect(() => {
//     if (!session?.user?.id || !matchId) return;

//     fetchMatch();
//     const interval = setInterval(fetchMessages, 3000);

//     return () => clearInterval(interval);
//   }, [session?.user?.id, matchId]);

//   // Poll for reveal status and profiles
//   useEffect(() => {
//     if (!matchId || !session?.user?.id) return;

//     const fetchRevealStatus = async () => {
//       const { data, error } = await supabase
//         .from('matches')
//         .select(`
//           *,
//           user1:user1_id (
//             id, username, profile_picture, bio, interests, age, education
//           ),
//           user2:user2_id (
//             id, username, profile_picture, bio, interests, age, education
//           )
//         `)
//         .eq('id', matchId)
//         .single();

//       if (error || !data) return;

//       const isCurrentUser1 = data.user1_id === session.user.id;
//       setIsUser1(isCurrentUser1);
//       setHasRevealed(isCurrentUser1 ? data.user1_revealed : data.user2_revealed);
//       setBothRevealed(data.user1_revealed && data.user2_revealed);

//       setMyProfile(isCurrentUser1 ? data.user1 : data.user2);
//       setOtherUserProfile(isCurrentUser1 ? data.user2 : data.user1);
//     };

//     fetchRevealStatus();
//     const interval = setInterval(fetchRevealStatus, 2000);
//     return () => clearInterval(interval);
//   }, [matchId, session?.user?.id]);

//   // Helper functions
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const fetchMessages = async () => {
//     const { data, error } = await supabase
//       .from('match_messages')
//       .select('id, content, sender_id, created_at, sender:sender_id(id, username, profile_picture)')
//       .eq('match_id', matchId)
//       .order('created_at', { ascending: true });

//     if (!error) {
//       const transformed = (data || []).map(msg => ({
//         ...msg,
//         sender: Array.isArray(msg.sender) ? msg.sender[0] : msg.sender
//       }));
//       setMessages(transformed);
//       scrollToBottom();
//     }
//   };

//   const fetchMatch = async () => {
//     try {
//       const { data: matchData, error } = await supabase
//         .from('matches')
//         .select(`
//           id,
//           user1_id,
//           user2_id,
//           status,
//           created_at,
//           user1:user1_id(id, username, profile_picture),
//           user2:user2_id(id, username, profile_picture)
//         `)
//         .eq('id', matchId)
//         .single();

//       if (error) throw error;

//       const transformedMatch: Match = {
//         id: matchData.id,
//         user1_id: matchData.user1_id,
//         user2_id: matchData.user2_id,
//         status: matchData.status,
//         created_at: matchData.created_at,
//         user1: Array.isArray(matchData.user1) ? matchData.user1[0] as UserProfile : matchData.user1 as UserProfile,
//         user2: Array.isArray(matchData.user2) ? matchData.user2[0] as UserProfile : matchData.user2 as UserProfile
//       };

//       setMatch(transformedMatch);
//       setLoading(false);
//     } catch (err) {
//       console.error('Error fetching match:', err);
//       router.push('/lobbies');
//     }
//   };

//   const handleReveal = async () => {
//     if (!matchId || !session?.user?.id) return;
//     const updateField = isUser1 ? 'user1_revealed' : 'user2_revealed';

//     const { error } = await supabase
//       .from('matches')
//       .update({ [updateField]: true })
//       .eq('id', matchId);

//     if (!error) {
//       setHasRevealed(true);
//       fetchRevealStatus(); // Refresh status after reveal
//     }
//   };

//   const sendMessage = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newMessage.trim() || !session?.user?.id || !match?.id) return;

//     try {
//       const { error } = await supabase
//         .from('match_messages')
//         .insert({
//           match_id: match.id,
//           sender_id: session.user.id,
//           content: newMessage.trim()
//         });

//       if (error) throw error;
//       setNewMessage('');
//       await fetchMessages();
//     } catch (err) {
//       console.error('Error sending message:', err);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <span className="text-gray-500">Loading...</span>
//       </div>
//     );
//   }

//   if (!match) return null;

//   const otherUser = match.user1_id === session?.user?.id ? match.user2 : match.user1;

//   return (
//     <div className="flex flex-col h-screen bg-gray-100">
//       {/* Reveal Button */}
//       <div className="flex justify-center items-center py-2 bg-white border-b">
//         <button
//           className={`px-4 py-2 rounded-full font-semibold transition ${
//             hasRevealed ? 'bg-green-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
//           }`}
//           disabled={hasRevealed}
//           onClick={handleReveal}
//         >
//           {hasRevealed
//             ? bothRevealed
//               ? 'Both users have revealed!'
//               : 'Waiting for other user...'
//             : 'Reveal My Identity'}
//         </button>
//       </div>

//       {/* Show profiles if both revealed */}
//       {bothRevealed && (
//         <div className="flex flex-col items-center">
//           <button
//             className="mb-2 px-4 py-1 bg-blue-500 text-white rounded"
//             onClick={() => setShowProfile((v) => !v)}
//           >
//             {showProfile ? 'Hide Profile' : 'Show Profile'}
//           </button>
//           {showProfile && (
//             <div className="flex flex-col md:flex-row gap-4 justify-center items-center bg-yellow-50 py-4">
//               <ProfileCard user={myProfile} />
//               <ProfileCard user={otherUserProfile} />
//             </div>
//           )}
//         </div>
//       )}

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
//         <div className="max-w-2xl mx-auto space-y-4">
//           {messages.map((message) => (
//             <div
//               key={message.id}
//               className={`flex ${message.sender_id === session?.user?.id ? 'justify-end' : 'justify-start'}`}
//             >
//               <div className="flex items-end space-x-2">
//                 {message.sender_id !== session?.user?.id && (
//                   <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-xl">
//                     😊
//                   </span>
//                 )}
//                 <div
//                   className={`max-w-[70%] rounded-lg p-3 shadow ${
//                     message.sender_id === session?.user?.id
//                       ? 'bg-blue-500 text-white'
//                       : 'bg-white'
//                   }`}
//                 >
//                   <div className="flex items-center gap-2 mb-1">
//                     <span className="font-semibold text-xs">
//                       {message.sender_id === session?.user?.id ? 'You' : 'Stranger'}
//                     </span>
//                     <span className="text-[10px] text-gray-400">
//                       {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                     </span>
//                   </div>
//                   <p className="break-words">{message.content}</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//           <div ref={messagesEndRef} />
//         </div>
//       </div>

//       {/* Message Input */}
//       <form onSubmit={sendMessage} className="flex space-x-2 p-4 bg-white border-t">
//         <input
//           type="text"
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           placeholder="Type a message..."
//           className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//         <button
//           type="submit"
//           disabled={!newMessage.trim()}
//           className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 disabled:opacity-50 transition"
//         >
//           Send
//         </button>
//       </form>
//     </div>
//   );
// }

// // Add this at the bottom of your file
// function ProfileCard({ user }: { user: UserProfile & { bio?: string; interests?: string[]; age?: number; education?: string } }) {
//   if (!user) return null;
//   return (
//     <div className="flex flex-col items-center bg-white rounded-lg shadow p-4 w-full max-w-xs">
//       <img
//         src={user.profile_picture || '/default-avatar.png'}
//         alt={user.username}
//         className="w-20 h-20 rounded-full object-cover mb-2"
//       />
//       <h3 className="font-bold text-lg">{user.username}</h3>
//       <p className="text-gray-500">{user.bio}</p>
//       <p className="text-gray-400 text-sm">Age: {user.age}</p>
//       <p className="text-gray-400 text-sm">Education: {user.education}</p>
//       <div className="flex flex-wrap gap-1 mt-2">
//         {user.interests?.map((interest: string) => (
//           <span key={interest} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">{interest}</span>
//         ))}
//       </div>
//     </div>
//   );
// }




// src/app/(protected)/matches/[id]/page.tsx
'use client'

import { use, useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface MatchParams {
  params: { id: string }
}

// interface Match {
//   id: string
//   user1_id: string
//   user2_id: string
//   status: string
//   created_at: string
//   user1: {
//     id: string
//     username: string
//     profile_picture: string | null
//   }
//   user2: {
//     id: string
//     username: string
//     profile_picture: string | null
//   }
// }

// export interface User {
//   id: string
//   username: string
//   full_name: string
//   gender: 'male' | 'female' | 'other'
//   dob: string
//   bio: string
//   interests: string[]
//   profile_picture: string | null
//   created_at: string
//   updated_at: string
// }

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  sender: {
    id: string
    username: string
    profile_picture: string | null
  }
}


interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  status: string;
  created_at: string;
  user1_revealed: boolean;
  user2_revealed: boolean;
  user1: UserProfile;
  user2: UserProfile;
}

interface UserProfile {
  id: string;
  username: string;
  profile_picture: string | null;
  bio?: string;
  interests?: string[];
  age?: number;
  education?: string;
}


interface PageProps {
  params: Promise<{ id: string }>};


export default function MatchChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: matchId } = use(params);
  const { data: session } = useSession();
  const router = useRouter();

  // All useState hooks at the top
  const [match, setMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [bothRevealed, setBothRevealed] = useState(false);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [otherUserProfile, setOtherUserProfile] = useState<any>(null);
  const [isUser1, setIsUser1] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  

  // All useRef hooks
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages on mount and when matchId changes
  useEffect(() => {
    if (!matchId) return;
    fetchMessages();
  }, [matchId]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!matchId) return;

    const channel = supabase
      .channel(`match_messages_${matchId}_${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_messages',
          filter: `match_id=eq.${matchId}`
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [matchId]);

  // Fetch match info and poll messages
  useEffect(() => {
    if (!session?.user?.id || !matchId) return;

    fetchMatch();
    const interval = setInterval(fetchMessages, 3000);

    return () => clearInterval(interval);
  }, [session?.user?.id, matchId]);

  // Fetch reveal status and profiles
  const fetchRevealStatus = async () => {
  if (!matchId || !session?.user?.id) return;
  
  try {
    // First, fetch the match reveal status
    const { data: matchData, error: matchError } = await supabase
      .from('matches')
      .select('user1_id, user2_id, user1_revealed, user2_revealed')
      .eq('id', matchId)
      .single();

    if (matchError) {
      console.error('Error fetching match data:', matchError);
      return;
    }
    if (!matchData) return;

    const isCurrentUser1 = matchData.user1_id === session.user.id;
    setIsUser1(isCurrentUser1);
    setHasRevealed(isCurrentUser1 ? matchData.user1_revealed : matchData.user2_revealed);
    setBothRevealed(matchData.user1_revealed && matchData.user2_revealed);

    // Then, fetch user profiles separately
    if (matchData.user1_revealed || matchData.user2_revealed) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, username, profile_picture, bio, interests, age, education, gender')
        .in('id', [matchData.user1_id, matchData.user2_id]);

      if (userError) {
        console.error('Error fetching user data:', userError);
        return;
      }
      if (!userData) return;

      const user1Data = userData.find(u => u.id === matchData.user1_id);
      const user2Data = userData.find(u => u.id === matchData.user2_id);

      setMyProfile(isCurrentUser1 ? user1Data : user2Data);
      setOtherUserProfile(isCurrentUser1 ? user2Data : user1Data);
    }
  } catch (err) {
    console.error('Error in fetchRevealStatus:', err);
  }
};

  // Poll for reveal status and profiles
  useEffect(() => {
    fetchRevealStatus();
    const interval = setInterval(fetchRevealStatus, 2000);
    return () => clearInterval(interval);
  }, [matchId, session?.user?.id]);

  // Helper functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('match_messages')
      .select('id, content, sender_id, created_at, sender:sender_id(id, username, profile_picture)')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });

    if (!error) {
      const transformed = (data || []).map(msg => ({
        ...msg,
        sender: Array.isArray(msg.sender) ? msg.sender[0] : msg.sender
      }));
      setMessages(transformed);
      scrollToBottom();
    }
  };

  const fetchMatch = async () => {
    try {
      const { data: matchData, error } = await supabase
        .from('matches')
        .select(`
          id,
          user1_id,
          user2_id,
          status,
          created_at,
          user1_revealed,
          user2_revealed,
          user1:user1_id(id, username, profile_picture),
          user2:user2_id(id, username, profile_picture)
        `)
        .eq('id', matchId)
        .single();

      if (error) throw error;

      const transformedMatch: Match = {
        id: matchData.id,
        user1_id: matchData.user1_id,
        user2_id: matchData.user2_id,
        status: matchData.status,
        created_at: matchData.created_at,
        user1_revealed: matchData.user1_revealed,
        user2_revealed: matchData.user2_revealed,
        user1: Array.isArray(matchData.user1) ? matchData.user1[0] as UserProfile : matchData.user1 as UserProfile,
        user2: Array.isArray(matchData.user2) ? matchData.user2[0] as UserProfile : matchData.user2 as UserProfile
      };

      setMatch(transformedMatch);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching match:', err);
      router.push('/lobbies');
    }
  };

  const handleReveal = async () => {
  if (!matchId || !session?.user?.id) return;
  const isCurrentUser1 = match?.user1_id === session.user.id;
  const updateField = isCurrentUser1 ? 'user1_revealed' : 'user2_revealed';

  const { error } = await supabase
    .from('matches')
    .update({ [updateField]: true })
    .eq('id', matchId);

  if (!error) {
    setHasRevealed(true);
    fetchRevealStatus(); // Refresh status after reveal
  }
};

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session?.user?.id || !match?.id) return;

    try {
      const { error } = await supabase
        .from('match_messages')
        .insert({
          match_id: match.id,
          sender_id: session.user.id,
          content: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage('');
      await fetchMessages();
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  if (!match) return null;

  const otherUser = match.user1_id === session?.user?.id ? match.user2 : match.user1;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Reveal Button */}
      <div className="flex justify-center items-center py-2 bg-white border-b">
        <button
          className={`px-4 py-2 rounded-full font-semibold transition ${
            hasRevealed ? 'bg-green-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          disabled={hasRevealed}
          onClick={handleReveal}
        >
          {hasRevealed
            ? bothRevealed
              ? 'Both users have revealed!'
              : 'Waiting for other user...'
            : 'Reveal My Identity'}
        </button>
      </div>


      {/* Show profiles if both revealed */}
      {/* Show profiles if both revealed */}
{/* Show profile if both revealed */}
{bothRevealed && (
  <div className="flex flex-col items-center">
    <button
      className="mb-2 px-4 py-1 bg-blue-500 text-white rounded"
      onClick={() => setShowProfile(!showProfile)}
    >
      {showProfile ? 'Hide Profile' : 'View Match Profile'}
    </button>
    {showProfile && (
      <div className="w-full max-w-md p-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col items-center">
            <img
              src={otherUserProfile?.profile_picture || '/default-avatar.png'}
              alt={otherUserProfile?.username}
              className="w-32 h-32 rounded-full object-cover mb-4"
            />
            <h2 className="text-2xl font-bold mb-2">{otherUserProfile?.username}</h2>
            {otherUserProfile?.bio && (
              <p className="text-gray-600 text-center mb-4">{otherUserProfile.bio}</p>
            )}
            <div className="grid grid-cols-2 gap-4 w-full mb-4">
              {otherUserProfile?.age && (
                <div className="text-center">
                  <p className="text-gray-500 text-sm">Age</p>
                  <p className="font-semibold">{otherUserProfile.age}</p>
                </div>
              )}
              {otherUserProfile?.gender && (
                <div className="text-center">
                  <p className="text-gray-500 text-sm">Gender</p>
                  <p className="font-semibold">{otherUserProfile.gender}</p>
                </div>
              )}
              {otherUserProfile?.education && (
                <div className="text-center col-span-2">
                  <p className="text-gray-500 text-sm">Education</p>
                  <p className="font-semibold">{otherUserProfile.education}</p>
                </div>
              )}
            </div>
            {otherUserProfile?.interests && otherUserProfile.interests.length > 0 && (
              <div className="w-full">
                <p className="text-gray-500 text-sm mb-2">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {otherUserProfile.interests.map((interest: string) => (
                    <span
                      key={interest}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
)}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === session?.user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-end space-x-2">
                {message.sender_id !== session?.user?.id && (
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-xl">
                    😊
                  </span>
                )}
                <div
                  className={`max-w-[70%] rounded-lg p-3 shadow ${
                    message.sender_id === session?.user?.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-xs">
                      {message.sender_id === session?.user?.id ? 'You' : 'Stranger'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="break-words">{message.content}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="flex space-x-2 p-4 bg-white border-t">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 disabled:opacity-50 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}

// Add this at the bottom of your file
function ProfileCard({ user, bothRevealed }: { user: UserProfile & { bio?: string; interests?: string[]; age?: number; education?: string }, bothRevealed: boolean }) {
  if (!user) return null;
  return (
    <div className="flex flex-col items-center bg-white rounded-lg shadow p-4 w-full max-w-xs">
      <img
        src={user.profile_picture || '/default-avatar.png'}
        alt={user.username}
        className={`w-20 h-20 rounded-full object-cover mb-2 transition-all duration-300 ${!bothRevealed ? 'blur-sm grayscale' : ''}`}
      />
      <h3 className="font-bold text-lg">{user.username}</h3>
      {bothRevealed && (
        <>
          <p className="text-gray-500">{user.bio}</p>
          <p className="text-gray-400 text-sm">Age: {user.age}</p>
          <p className="text-gray-400 text-sm">Education: {user.education}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {user.interests?.map((interest: string) => (
              <span key={interest} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">{interest}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
