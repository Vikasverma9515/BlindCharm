// // src/components/lobby/LobbyChat.tsx
// 'use client'

// import { useState, useRef, useEffect } from 'react'
// import { supabase } from '@/lib/supabase'
// import { Send, Loader2, MessageCircle, RefreshCw, ChevronUp } from 'lucide-react'
// import { User, LobbyParticipant } from '@/types/lobby'
// import { useChat } from '@/hooks/useChat'
// import { CachedMessage } from '@/lib/services/ChatCacheService'

// interface LobbyChatProps {
//   lobbyId: string;
//   currentUser: User | null;
//   participants: LobbyParticipant[];
// }

// export default function LobbyChat({ lobbyId, currentUser, participants }: LobbyChatProps) {
//   const [newMessage, setNewMessage] = useState('')
//   const messagesEndRef = useRef<HTMLDivElement>(null)
//   const containerRef = useRef<HTMLDivElement>(null)
//   const [showScrollToBottom, setShowScrollToBottom] = useState(false)
//   const [showLoadMore, setShowLoadMore] = useState(false)
//   const [isInitialLoad, setIsInitialLoad] = useState(true)

//   const {
//     messages,
//     loading,
//     error,
//     sendMessage: sendChatMessage,
//     loadMoreMessages,
//     hasMoreMessages,
//     refreshMessages,
//     clearError
//   } = useChat({
//     chatId: lobbyId,
//     type: 'lobby',
//     userId: currentUser?.id,
//     enabled: !!lobbyId && !!currentUser?.id,
//     pageSize: 30
//   });

//   // Add this before the main component function
//   const generateRandomName = (userId: string, gender?: string): string => {
//     const maleNames = ['Alex', 'Chris', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Morgan', 'Quinn', 'Avery', 'Parker'];
//     const femaleNames = ['Sam', 'Blake', 'Drew', 'Sage', 'River', 'Phoenix', 'Sky', 'Ocean', 'Luna', 'Nova'];
//     const neutralNames = ['Mystery', 'Enigma', 'Curious', 'Wonder', 'Secret', 'Hidden', 'Unknown', 'Puzzle', 'Riddle', 'Quest'];

//     // Use userId as seed for consistent random name per user
//     const seed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

//     let names = neutralNames;
//     if (gender === 'male') names = maleNames;
//     else if (gender === 'female') names = femaleNames;

//     return names[seed % names.length];
//   };

//   const verifyLobbyParticipation = async () => {
//     const { data } = await supabase
//       .from('lobby_participants')
//       .select('id')
//       .eq('lobby_id', lobbyId)
//       .eq('user_id', currentUser?.id)
//       .eq('status', 'waiting')
//       .single();

//     return !!data;
//   };

//   const scrollToBottom = (force = false) => {
//     const doScroll = () => {
//       if (messagesEndRef.current) {
//         messagesEndRef.current.scrollIntoView({
//           behavior: force ? 'auto' : 'smooth',
//           block: 'end'
//         });
//       } else if (containerRef.current) {
//         // Fallback: scroll container to bottom
//         containerRef.current.scrollTop = containerRef.current.scrollHeight;
//       }
//     };

//     if (force) {
//       // For initial load, use requestAnimationFrame to ensure DOM is ready
//       requestAnimationFrame(() => {
//         requestAnimationFrame(doScroll);
//       });
//     } else {
//       doScroll();
//     }
//   };
//   const handleScrollToBottomClick = () => {
//     scrollToBottom(false);
//   };

//   // Handle scroll events to show/hide scroll to bottom button and load more trigger
//   const handleScroll = () => {
//     if (!containerRef.current) return;

//     const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
//     const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
//     const isNearTop = scrollTop < 100;

//     setShowScrollToBottom(!isNearBottom && messages.length > 0);
//     setShowLoadMore(isNearTop && hasMoreMessages && !loading);
//   };

//   useEffect(() => {
//     const container = containerRef.current;
//     if (container) {
//       container.addEventListener('scroll', handleScroll);
//       return () => container.removeEventListener('scroll', handleScroll);
//     }
//   }, [hasMoreMessages, loading, messages.length]);

//   // Ensure scroll to bottom on component mount with messages
//   useEffect(() => {
//     if (messages.length > 0 && isInitialLoad && !loading) {
//       // Use a longer timeout to ensure DOM is fully rendered
//       const timer = setTimeout(() => {
//         scrollToBottom(true); // Force immediate scroll for initial load
//         setIsInitialLoad(false);
//       }, 200);

//       return () => clearTimeout(timer);
//     }
//   }, [messages.length, isInitialLoad, loading]);

//   // Auto-scroll to bottom when messages change
//   useEffect(() => {
//     if (!containerRef.current || messages.length === 0) return;

//     // Always scroll to bottom on initial load
//     if (isInitialLoad && !loading) {
//       setTimeout(() => {
//         scrollToBottom();
//         setIsInitialLoad(false);
//       }, 100);
//       return;
//     }

//     // For subsequent messages, only scroll if user is near bottom
//     if (!isInitialLoad) {
//       const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
//       const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;

//       if (isNearBottom) {
//         scrollToBottom();
//       }
//     }
//   }, [messages, loading, isInitialLoad]);

//   // Redirect both users when a connect request is accepted
//   useEffect(() => {
//     if (!currentUser?.id || !lobbyId) return;

//     const channelName = `lobby_connect_${lobbyId}_${Date.now()}`;
//     const channel = supabase
//       .channel(channelName)
//       .on(
//         'postgres_changes',
//         {
//           event: 'UPDATE',
//           schema: 'public',
//           table: 'lobby_connect_requests',
//           filter: `lobby_id=eq.${lobbyId}`
//         },
//         async (payload: any) => {
//           try {
//             const req = payload.new;
//             if (req.status !== 'accepted') return;
//             if (req.from_user_id !== currentUser.id && req.to_user_id !== currentUser.id) return;

//             // Find the created match for this pair in this lobby
//             const { data: match } = await supabase
//               .from('matches')
//               .select('id')
//               .or(`and(user1_id.eq.${req.from_user_id},user2_id.eq.${req.to_user_id}),and(user1_id.eq.${req.to_user_id},user2_id.eq.${req.from_user_id}))`)
//               .eq('lobby_id', req.lobby_id)
//               .order('created_at', { ascending: false })
//               .limit(1)
//               .single();

//             if (match?.id) {
//               window.location.href = `/matches/${match.id}`;
//             }
//           } catch (e) {
//             console.error('Connect redirect failed', e);
//           }
//         }
//       )
//       .subscribe();

//     return () => {
//       try { channel.unsubscribe(); } catch { }
//     };
//   }, [currentUser?.id, lobbyId]);

//   const handleSendMessage = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!currentUser?.id || !newMessage.trim()) return;

//     try {
//       const isParticipant = await verifyLobbyParticipation();
//       if (!isParticipant) {
//         throw new Error('You must be a participant in this lobby to send messages');
//       }

//       await sendChatMessage(newMessage.trim());
//       setNewMessage('');

//       // Always scroll to bottom when user sends a message
//       setTimeout(() => {
//         scrollToBottom();
//       }, 100);
//     } catch (err) {
//       console.error('Failed to send message:', err);
//     }
//   };

//   const handleLoadMore = async () => {
//     if (loading || !hasMoreMessages) return;

//     const container = containerRef.current;
//     const scrollHeightBefore = container?.scrollHeight || 0;

//     await loadMoreMessages();

//     // Maintain scroll position after loading more messages
//     setTimeout(() => {
//       if (container) {
//         const scrollHeightAfter = container.scrollHeight;
//         const scrollDiff = scrollHeightAfter - scrollHeightBefore;
//         container.scrollTop += scrollDiff;
//       }
//     }, 100);
//   };

//   if (!currentUser) {
//     return (
//       <div className="flex flex-col h-full bg-white dark:bg-gray-800 items-center justify-center transition-colors duration-300">
//         <div className="text-center">
//           <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
//             <MessageCircle className="w-8 h-8 text-primary-500" />
//           </div>
//           <h3 className="text-lg font-semibold text-neutral-850 dark:text-gray-100 mb-2">Please log in to chat</h3>
//           <p className="text-neutral-750 dark:text-gray-400 text-sm">You need to be logged in to participate in the group chat.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-full bg-white dark:bg-gray-800 transition-colors duration-300 relative">
//       {/* Incoming connect requests */}
//       {currentUser?.id && (
//         // @ts-ignore - client component import
//         <div>
//           {(() => {
//             // Dynamic import wrapper to avoid SSR issues
//             // eslint-disable-next-line react-hooks/rules-of-hooks
//             const [Comp, setComp] = (require('react') as any).useState(null)
//               // eslint-disable-next-line react-hooks/rules-of-hooks
//               ; (require('react') as any).useEffect(() => {
//                 import('./ConnectRequests').then(m => setComp(() => m.default))
//               }, [])
//             return Comp ? <Comp lobbyId={lobbyId} currentUserId={currentUser.id!} /> : null
//           })()}
//         </div>
//       )}
//       {/* Load More Messages Button */}
//       {showLoadMore && (
//         <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
//           <button
//             onClick={handleLoadMore}
//             disabled={loading}
//             className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg transition-all duration-200 flex items-center gap-2"
//           >
//             {loading ? (
//               <Loader2 className="w-4 h-4 animate-spin" />
//             ) : (
//               <ChevronUp className="w-4 h-4" />
//             )}
//             {loading ? 'Loading...' : 'Load More'}
//           </button>
//         </div>
//       )}

//       {/* Scroll to Bottom Button */}
//       {/* {showScrollToBottom && (
//         <div className="absolute bottom-20 right-4 z-10">
//           <button
//             onClick={scrollToBottom}
//             className="bg-primary-500 hover:bg-primary-600 text-white p-3 rounded-full shadow-lg transition-all duration-200"
//           >
//             <ChevronUp className="w-5 h-5 rotate-180" />
//           </button>
//         </div>
//       )} */}
//       {/* Scroll to Bottom Button */}
//       {showScrollToBottom && (
//         <div className="absolute bottom-20 right-4 z-10">
//           <button
//             onClick={handleScrollToBottomClick}
//             className="bg-primary-500 hover:bg-primary-600 text-white p-3 rounded-full shadow-lg transition-all duration-200"
//           >
//             <ChevronUp className="w-5 h-5 rotate-180" />
//           </button>
//         </div>
//       )}

//       {/* Messages Area */}
//       <div
//         ref={containerRef}
//         className="flex-1 overflow-y-auto p-4 space-y-4"
//         onScroll={handleScroll}
//       >
//         {loading && messages.length === 0 ? (
//           <div className="flex flex-col items-center justify-center h-full">
//             <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-4" />
//             <p className="text-neutral-600 dark:text-gray-400">Loading messages...</p>
//           </div>
//         ) : messages.length === 0 ? (
//           <div className="flex flex-col items-center justify-start pt-8 h-full text-center py-12">
//             <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
//               <MessageCircle className="w-8 h-8 text-primary-500" />
//             </div>
//             <h3 className="text-lg font-semibold text-neutral-850 dark:text-gray-100 mb-2">Start the conversation!</h3>
//             <p className="text-neutral-750 dark:text-gray-400 text-sm max-w-sm px-4">
//               Break the ice and get to know each other. The more you chat, the better your matches will be!
//             </p>
//           </div>
//         ) : (
//           <>
//             {/* Loading indicator for pagination */}
//             {loading && messages.length > 0 && (
//               <div className="flex justify-center py-2">
//                 <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
//               </div>
//             )}

//             {messages.map((message) => {
//               const isOwnMessage = message.user_id === currentUser?.id
//               const messageParticipant = participants.find(p => p.user_id === message.user_id)
//               const shouldBlur = messageParticipant?.blur_profile || false
//               return (
//                 <div
//                   key={message.id}
//                   className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
//                 >
//                   {/* Avatar */}
//                   <div className="flex-shrink-0">
//                     {message.user.additional_photo_1 ? (
//                       <img
//                         src={message.user.additional_photo_1}
//                         // alt={message.user.username}
//                         alt={generateRandomName(message.user_id, message.user?.gender)}
//                         className={`w-8 h-8 rounded-full object-cover ring-2 ring-primary-200 transition-all duration-300 ${shouldBlur
//                           ? 'blur-[1px] opacity-85'
//                           : ''
//                           }`}
//                       />
//                     ) : (
//                       <div className={`w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm shadow-soft transition-all duration-300 ${shouldBlur
//                         ? 'blur-[1px] opacity-85'
//                         : ''
//                         }`}>
//                         {/* {message.user.username[0]?.toUpperCase() || 'U'} */}
//                         ☕︎
//                       </div>
//                     )}
//                   </div>

//                   {/* Message Content */}
//                   <div className={`max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
//                     {/* Username and Time */}
//                     <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
//                       <span className="text-xs font-medium text-neutral-750 dark:text-gray-300">
//                         {/* {isOwnMessage ? 'You' : message.user.username} */}
//                         {isOwnMessage ? 'You' : generateRandomName(message.user_id, message.user?.gender)}
//                       </span>
//                       <span className="text-xs text-neutral-600 dark:text-gray-400">
//                         {new Date(message.created_at).toLocaleTimeString([], {
//                           hour: '2-digit',
//                           minute: '2-digit'
//                         })}
//                       </span>
//                     </div>

//                     {/* Message Bubble */}
//                     <div className={`rounded-2xl px-4 py-3 shadow-soft ${isOwnMessage
//                       ? 'bg-primary-500 text-white rounded-br-md'
//                       : 'bg-gray-100 dark:bg-gray-700 text-neutral-850 dark:text-gray-100 rounded-bl-md border border-gray-200 dark:border-gray-600'
//                       }`}>
//                       <p className="break-words leading-relaxed text-sm">{message.content}</p>
//                       {/* Connect CTA for others' messages */}
//                       {!isOwnMessage && currentUser?.id && (
//                         <button
//                           className="mt-2 text-xs bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded-full"
//                           onClick={async () => {
//                             try {
//                               const { ConnectService } = await import('@/lib/services/ConnectService')
//                               const res = await ConnectService.requestConnect(lobbyId, currentUser.id!, message.user_id)
//                               if (res.created) {
//                                 // Optional toast could be plugged here
//                                 alert(`Sent connect request to ${message.user.username}`)
//                               } else {
//                                 // Optional toast: request already pending
//                                 alert(`You already have a pending connect request with ${message.user.username}`)
//                               }
//                             } catch (e) {
//                               console.error(e)
//                               alert('Failed to send connect request')
//                             }
//                           }}
//                         >
//                           Connect privately
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )
//             })}
//           </>
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Message Input */}
//       <div className="p-2 bg-gray-50 dark:bg-gray-900 border-t-0 border-gray-200 dark:border-gray-700 transition-colors duration-300">
//         {error && (
//           <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
//             <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
//             <button
//               onClick={clearError}
//               className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
//             >
//               ×
//             </button>
//           </div>
//         )}

//         {/* <div className="flex items-center gap-2 mb-3">
//           <button
//             onClick={refreshMessages}
//             disabled={loading}
//             className="p-2 text-neutral-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
//             title="Refresh messages"
//           >
//             <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
//           </button>
//           <span className="text-xs text-neutral-500 dark:text-gray-400">
//             {messages.length} message{messages.length !== 1 ? 's' : ''}
//             {hasMoreMessages && ' (more available)'}
//           </span>
//         </div> */}

//         <form onSubmit={handleSendMessage} className="flex gap-3">
//           <div className="flex-1 relative">
//             <input
//               type="text"
//               value={newMessage}
//               onChange={(e) => setNewMessage(e.target.value)}
//               placeholder="Type your message..."
//               className="w-full rounded-full border border-gray-300 dark:border-gray-600 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 transition-all duration-200 text-base text-neutral-850 dark:text-gray-100 placeholder-neutral-600 dark:placeholder-gray-400"
//               disabled={loading}
//               maxLength={500}
//               style={{ fontSize: '16px' }}
//             />
//             <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-neutral-500 dark:text-gray-400">
//               {newMessage.length}/500
//             </div>
//           </div>

//           <button
//             type="submit"
//             disabled={loading || !newMessage.trim()}
//             className="w-12 h-12 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-soft"
//           >
//             {loading ? (
//               <Loader2 className="w-5 h-5 animate-spin" />
//             ) : (
//               <Send className="w-5 h-5" />
//             )}
//           </button>
//         </form>

//         {/* <p className="text-xs text-neutral-600 dark:text-gray-400 mt-2 text-center">
//           Be respectful and have fun! 💕
//         </p> */}
//       </div>

//     </div>
//   );
// }



// src/components/lobby/LobbyChat.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Send, Loader2, MessageCircle, ChevronUp } from 'lucide-react'
import { User, LobbyParticipant } from '@/types/lobby'
import { useChat } from '@/hooks/useChat'

interface LobbyChatProps {
  lobbyId: string;
  currentUser: User | null;
  participants: LobbyParticipant[];
}

export default function LobbyChat({ lobbyId, currentUser, participants }: LobbyChatProps) {
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const [showLoadMore, setShowLoadMore] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const {
    messages,
    loading,
    error,
    sendMessage: sendChatMessage,
    loadMoreMessages,
    hasMoreMessages,
    clearError
  } = useChat({
    chatId: lobbyId,
    type: 'lobby',
    userId: currentUser?.id,
    enabled: !!lobbyId && !!currentUser?.id,
    pageSize: 30
  });

  // FIX: make safe, allow undefined
  const generateRandomName = (userId?: string, gender?: string): string => {
    if (!userId) return "Anonymous";

    const maleNames = ['Alex', 'Chris', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Morgan', 'Quinn', 'Avery', 'Parker'];
    const femaleNames = ['Sam', 'Blake', 'Drew', 'Sage', 'River', 'Phoenix', 'Sky', 'Ocean', 'Luna', 'Nova'];
    const neutralNames = ['Mystery', 'Enigma', 'Curious', 'Wonder', 'Secret', 'Hidden', 'Unknown', 'Puzzle', 'Riddle', 'Quest'];

    const seed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    let names = neutralNames;
    if (gender === 'male') names = maleNames;
    else if (gender === 'female') names = femaleNames;

    return names[seed % names.length];
  };

  const scrollToBottom = (force = false) => {
    const doScroll = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: force ? 'auto' : 'smooth',
          block: 'end'
        });
      } else if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    };

    if (force) {
      requestAnimationFrame(() => {
        requestAnimationFrame(doScroll);
      });
    } else {
      doScroll();
    }
  };
  const handleScrollToBottomClick = () => scrollToBottom(false);

  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    const isNearTop = scrollTop < 100;

    setShowScrollToBottom(!isNearBottom && messages.length > 0);
    setShowLoadMore(isNearTop && hasMoreMessages && !loading);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [hasMoreMessages, loading, messages.length]);

  useEffect(() => {
    if (messages.length > 0 && isInitialLoad && !loading) {
      const timer = setTimeout(() => {
        scrollToBottom(true);
        setIsInitialLoad(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [messages.length, isInitialLoad, loading]);

  useEffect(() => {
    if (!containerRef.current || messages.length === 0) return;

    if (isInitialLoad && !loading) {
      setTimeout(() => {
        scrollToBottom();
        setIsInitialLoad(false);
      }, 100);
      return;
    }

    if (!isInitialLoad) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;

      if (isNearBottom) {
        scrollToBottom();
      }
    }
  }, [messages, loading, isInitialLoad]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id || !newMessage.trim()) return;

    try {
      await sendChatMessage(newMessage.trim());
      setNewMessage('');
      setTimeout(() => scrollToBottom(), 100);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleLoadMore = async () => {
    if (loading || !hasMoreMessages) return;
    const container = containerRef.current;
    const scrollHeightBefore = container?.scrollHeight || 0;

    await loadMoreMessages();

    setTimeout(() => {
      if (container) {
        const scrollHeightAfter = container.scrollHeight;
        const scrollDiff = scrollHeightAfter - scrollHeightBefore;
        container.scrollTop += scrollDiff;
      }
    }, 100);
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-gray-800 items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-primary-500" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-850 dark:text-gray-100 mb-2">Please log in to chat</h3>
          <p className="text-neutral-750 dark:text-gray-400 text-sm">You need to be logged in to participate in the group chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 transition-colors duration-300 relative">
      {/* Load More Messages Button */}
      {showLoadMore && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* Scroll to Bottom Button */}
      {showScrollToBottom && (
        <div className="absolute bottom-20 right-4 z-10">
          <button
            onClick={handleScrollToBottomClick}
            className="bg-primary-500 hover:bg-primary-600 text-white p-3 rounded-full shadow-lg transition-all duration-200"
          >
            <ChevronUp className="w-5 h-5 rotate-180" />
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
        {loading && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-4" />
            <p className="text-neutral-600 dark:text-gray-400">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-start pt-8 h-full text-center py-12">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-primary-500" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-850 dark:text-gray-100 mb-2">Start the conversation!</h3>
            <p className="text-neutral-750 dark:text-gray-400 text-sm max-w-sm px-4">
              Break the ice and get to know each other. The more you chat, the better your matches will be!
            </p>
          </div>
        ) : (
          <>
            {loading && messages.length > 0 && (
              <div className="flex justify-center py-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
              </div>
            )}

            {messages.map((message) => {
              const isOwnMessage = message.user_id === currentUser?.id
              const messageParticipant = participants.find(p => p.user_id === message.user_id)
              const shouldBlur = messageParticipant?.blur_profile || false

              // FIX: Safe access to user
              const displayName = isOwnMessage
                ? 'You'
                : generateRandomName(message.user_id, message.user?.gender)

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {message.user?.additional_photo_1 ? (
                      <img
                        src={message.user.additional_photo_1}
                        alt={displayName}
                        className={`w-8 h-8 rounded-full object-cover ring-2 ring-primary-200 transition-all duration-300 ${
                          shouldBlur ? 'blur-[1px] opacity-85' : ''
                        }`}
                      />
                    ) : (
                      <div
                        className={`w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm shadow-soft transition-all duration-300 ${
                          shouldBlur ? 'blur-[1px] opacity-85' : ''
                        }`}
                      >
                        ☕︎
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="text-xs font-medium text-neutral-750 dark:text-gray-300">
                        {displayName}
                      </span>
                      <span className="text-xs text-neutral-600 dark:text-gray-400">
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className={`rounded-2xl px-4 py-3 shadow-soft ${
                      isOwnMessage
                        ? 'bg-primary-500 text-white rounded-br-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-neutral-850 dark:text-gray-100 rounded-bl-md border border-gray-200 dark:border-gray-600'
                    }`}>
                      <p className="break-words leading-relaxed text-sm">{message.content}</p>

                      {!isOwnMessage && currentUser?.id && (
                        <button
                          className="mt-2 text-xs bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded-full"
                          onClick={async () => {
                            try {
                              const { ConnectService } = await import('@/lib/services/ConnectService')
                              const res = await ConnectService.requestConnect(lobbyId, currentUser.id!, message.user_id)
                              if (res.created) {
                                alert(`Sent connect request to ${message.user?.username || 'Anonymous'}`)
                              } else {
                                alert(`You already have a pending connect request with ${message.user?.username || 'Anonymous'}`)
                              }
                            } catch (e) {
                              console.error(e)
                              alert('Failed to send connect request')
                            }
                          }}
                        >
                          Connect privately
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-2 bg-gray-50 dark:bg-gray-900 border-t-0 border-gray-200 dark:border-gray-700 transition-colors duration-300">
        {error && (
          <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <button onClick={clearError} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200">
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full rounded-full border border-gray-300 dark:border-gray-600 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 transition-all duration-200 text-base text-neutral-850 dark:text-gray-100 placeholder-neutral-600 dark:placeholder-gray-400"
              disabled={loading}
              maxLength={500}
              style={{ fontSize: '16px' }}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-neutral-500 dark:text-gray-400">
              {newMessage.length}/500
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="w-12 h-12 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-soft"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
