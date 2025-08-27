// // Create components/chat/MatchMessages.tsx
// 'use client';

// import { useState, useRef, useEffect } from 'react';
// import { ChevronUp, Loader2, MessageCircle } from 'lucide-react';
// import VoiceMessage from '@/components/chat/VoiceMessage';
// import { MatchMessage } from '@/hooks/useMatchChat';

// interface MatchMessagesProps {
//   messages: MatchMessage[];
//   loading: boolean;
//   hasMoreMessages: boolean;
//   loadMoreMessages: () => Promise<void>;
//   currentUserId?: string;
//   boyFaces: string[];
//   girlFaces: string[];
//   faceIndex: number;
// }

// export default function MatchMessages({
//   messages,
//   loading,
//   hasMoreMessages,
//   loadMoreMessages,
//   currentUserId,
//   boyFaces,
//   girlFaces,
//   faceIndex
// }: MatchMessagesProps) {
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const [showScrollToBottom, setShowScrollToBottom] = useState(false);
//   const [showLoadMore, setShowLoadMore] = useState(false);
//   const [isInitialLoad, setIsInitialLoad] = useState(true);

//   const scrollToBottom = (force = false) => {
//     const doScroll = () => {
//       if (messagesEndRef.current) {
//         messagesEndRef.current.scrollIntoView({ 
//           behavior: force ? 'auto' : 'smooth',
//           block: 'end'
//         });
//       } else if (containerRef.current) {
//         containerRef.current.scrollTop = containerRef.current.scrollHeight;
//       }
//     };

//     if (force) {
//       requestAnimationFrame(() => {
//         requestAnimationFrame(doScroll);
//       });
//     } else {
//       doScroll();
//     }
//   };

//   const handleScroll = () => {
//     if (!containerRef.current) return;

//     const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
//     const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
//     const isNearTop = scrollTop < 100;

//     setShowScrollToBottom(!isNearBottom && messages.length > 0);
//     setShowLoadMore(isNearTop && hasMoreMessages && !loading);
//   };

//   // Initial load scroll
//   useEffect(() => {
//     if (messages.length > 0 && isInitialLoad && !loading) {
//       const timer = setTimeout(() => {
//         scrollToBottom(true);
//         setIsInitialLoad(false);
//       }, 200);
//       return () => clearTimeout(timer);
//     }
//   }, [messages.length, isInitialLoad, loading]);

//   // Auto-scroll for new messages
//   useEffect(() => {
//     if (!containerRef.current || messages.length === 0) return;
    
//     if (isInitialLoad && !loading) {
//       setTimeout(() => {
//         scrollToBottom();
//         setIsInitialLoad(false);
//       }, 100);
//       return;
//     }
    
//     if (!isInitialLoad) {
//       const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
//       const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
      
//       if (isNearBottom) {
//         scrollToBottom();
//       }
//     }
//   }, [messages, loading, isInitialLoad]);

//   const handleLoadMore = async () => {
//     if (loading || !hasMoreMessages) return;
    
//     const container = containerRef.current;
//     const scrollHeightBefore = container?.scrollHeight || 0;
    
//     await loadMoreMessages();
    
//     setTimeout(() => {
//       if (container) {
//         const scrollHeightAfter = container.scrollHeight;
//         const scrollDiff = scrollHeightAfter - scrollHeightBefore;
//         container.scrollTop += scrollDiff;
//       }
//     }, 100);
//   };

//   useEffect(() => {
//     const container = containerRef.current;
//     if (container) {
//       container.addEventListener('scroll', handleScroll);
//       return () => container.removeEventListener('scroll', handleScroll);
//     }
//   }, [hasMoreMessages, loading, messages.length]);

//   return (
//     <div 
//       ref={containerRef}
//       className="flex-1 min-h-0 overflow-y-auto bg-gray-50 dark:bg-black relative"
//       onScroll={handleScroll}
//     >
//       {/* Load More Button */}
//       {showLoadMore && (
//         <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
//           <button
//             onClick={handleLoadMore}
//             disabled={loading}
//             className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg transition-all duration-200 flex items-center gap-2"
//           >
//             {loading ? (
//               <Loader2 className="w-4 h-4 animate-spin" />
//             ) : (
//               <ChevronUp className="w-4 h-4" />
//             )}
//             {loading ? 'Loading...' : 'Load older messages'}
//           </button>
//         </div>
//       )}

//       {/* Scroll to Bottom Button */}
//       {showScrollToBottom && (
//         <div className="absolute bottom-4 right-4 z-10">
//           <button
//             onClick={() => scrollToBottom()}
//             className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-all duration-200"
//           >
//             <ChevronUp className="w-5 h-5 rotate-180" />
//           </button>
//         </div>
//       )}

//       <div className="px-4 py-2 h-full">
//         {loading && messages.length === 0 ? (
//           <div className="flex flex-col items-center justify-center h-full">
//             <Loader2 className="w-8 h-8 animate-spin text-red-500 mb-4" />
//             <p className="text-gray-600 dark:text-gray-400">Loading messages...</p>
//           </div>
//         ) : messages.length === 0 ? (
//           <div className="flex flex-col items-center justify-center h-full text-center">
//             <div className='inline-flex scale-75 items-center justify-center mb-4 gap-3'>
//               <div className='bg-amber-300 shadow-2xl rounded-2xl w-28 h-20 flex items-center justify-center animate-floaty'>
//                 <span className='text-red-500 text-xl font-semibold transition-all duration-300'>
//                   {boyFaces[faceIndex]}
//                 </span>
//               </div>
//               <div className='bg-amber-300 shadow-2xl rounded-2xl w-28 h-20 flex items-center justify-center animate-floaty'>
//                 <span className='text-red-500 text-xl font-semibold transition-all duration-300'>
//                   {girlFaces[faceIndex]}
//                 </span>
//               </div>
//             </div>
//             <h3 className="text-lg font-blindcharm-tech text-gray-900 dark:text-amber-100 mb-2">No messages yet</h3>
//             <p className="text-red-500 text-sm max-w-xs font-bold italic">
//               Your story hasn't started yet...
//               <br />
//               <span className="font-semibold">Tip: </span>Say hey, share a thought — let the vibe flow ♡
//             </p>
//           </div>
//         ) : (
//           <div className="space-y-3 py-2 min-h-full">
//             {/* Loading indicator for pagination */}
//             {loading && messages.length > 0 && (
//               <div className="flex justify-center py-2">
//                 <Loader2 className="w-5 h-5 animate-spin text-red-500" />
//               </div>
//             )}
            
//             {messages.map((message) => (
//               <div
//                 key={message.id}
//                 className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
//               >
//                 <div className={`max-w-[75%] ${message.sender_id === currentUserId ? 'order-2' : 'order-1'}`}>
//                   <div
//                     className={`px-4 py-2 rounded-2xl ${message.sender_id === currentUserId
//                       ? 'bg-red-500 text-white rounded-br-md'
//                       : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
//                       }`}
//                   >
//                     {message.type === 'voice' && message.metadata?.audio_url ? (
//                       <VoiceMessage
//                         audioUrl={message.metadata.audio_url}
//                         duration={message.metadata.duration}
//                         isOwn={message.sender_id === currentUserId}
//                         isLoading={false}
//                       />
//                     ) : (
//                       <p className="text-sm leading-relaxed">{message.content}</p>
//                     )}
//                   </div>
//                   <div className={`flex items-center mt-1 space-x-1 ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
//                     }`}>
//                     <span className="text-xs text-gray-400">
//                       {new Date(message.created_at).toLocaleTimeString([], {
//                         hour: '2-digit',
//                         minute: '2-digit'
//                       })}
//                     </span>
//                     {message.sender_id === currentUserId && (
//                       <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                       </svg>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//             <div ref={messagesEndRef} />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// Create components/chat/MatchMessages.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronUp, Loader2, MessageCircle } from 'lucide-react';
import VoiceMessage from '@/components/chat/VoiceMessage';
import { MatchMessage } from '@/hooks/useMatchChat';

interface MatchMessagesProps {
  messages: MatchMessage[];
  loading: boolean;
  hasMoreMessages: boolean;
  loadMoreMessages: () => Promise<void>;
  currentUserId?: string;
  boyFaces: string[];
  girlFaces: string[];
  faceIndex: number;
}

export default function MatchMessages({
  messages,
  loading,
  hasMoreMessages,
  loadMoreMessages,
  currentUserId,
  boyFaces,
  girlFaces,
  faceIndex
}: MatchMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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

  // Fixed handleScroll function with better detection
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    
    // More precise bottom detection
    const scrollBottom = scrollHeight - scrollTop - clientHeight;
    const isAtBottom = scrollBottom < 50; // 50px threshold
    const isNearTop = scrollTop < 100;

    // Only show scroll button if not at bottom AND there are messages
    setShowScrollToBottom(!isAtBottom && messages.length > 5); // Only show if more than 5 messages
    setShowLoadMore(isNearTop && hasMoreMessages && !loading);

    console.log('Scroll Debug:', {
      scrollTop,
      scrollHeight,
      clientHeight,
      scrollBottom,
      isAtBottom,
      showScrollToBottom: !isAtBottom && messages.length > 5
    });
  }, [messages.length, hasMoreMessages, loading]);

  // Initial load scroll
  useEffect(() => {
    if (messages.length > 0 && isInitialLoad && !loading) {
      const timer = setTimeout(() => {
        scrollToBottom(true);
        setIsInitialLoad(false);
        // Hide scroll button initially
        setShowScrollToBottom(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [messages.length, isInitialLoad, loading]);

  // Auto-scroll for new messages and hide button when at bottom
  useEffect(() => {
    if (!containerRef.current || messages.length === 0) return;
    
    if (isInitialLoad && !loading) {
      setTimeout(() => {
        scrollToBottom(true);
        setIsInitialLoad(false);
        setShowScrollToBottom(false); // Hide button when at bottom
      }, 100);
      return;
    }
    
    if (!isInitialLoad) {
      const container = containerRef.current;
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
      
      if (isNearBottom) {
        scrollToBottom();
        setShowScrollToBottom(false); // Hide button when scrolling to bottom
      }
    }
  }, [messages, loading, isInitialLoad]);

  // Enhanced scroll to bottom function that hides the button
  const handleScrollToBottomClick = () => {
    scrollToBottom();
    setShowScrollToBottom(false); // Immediately hide button
    
    // Double-check after scroll completes
    setTimeout(() => {
      if (containerRef.current) {
        const container = containerRef.current;
        const { scrollTop, scrollHeight, clientHeight } = container;
        const scrollBottom = scrollHeight - scrollTop - clientHeight;
        if (scrollBottom < 50) {
          setShowScrollToBottom(false);
        }
      }
    }, 500);
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

  // Set up scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      // Add passive listener for better performance
      container.addEventListener('scroll', handleScroll, { passive: true });
      
      // Initial scroll check
      setTimeout(handleScroll, 100);
      
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 min-h-0 overflow-y-auto bg-gray-50 dark:bg-black relative"
    >
      {/* Load More Button */}
      {showLoadMore && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
            {loading ? 'Loading...' : 'Load older messages'}
          </button>
        </div>
      )}

      {/* Fixed Scroll to Bottom Button - Only shows when needed */}
      {/* {showScrollToBottom && (
        <div className="absolute bottom-20 right-4 z-10 animate-in slide-in-from-bottom-4 duration-200">
          <button
            onClick={handleScrollToBottomClick}
            className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 active:scale-95"
            title="Scroll to bottom"
          >
            <ChevronUp className="w-4 h-4 rotate-180" />
          </button>
        </div>
      )} */}

      <div className="px-4 py-2 h-full">
        {loading && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-red-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className='inline-flex scale-75 items-center justify-center mb-4 gap-3'>
              <div className='bg-amber-300 shadow-2xl rounded-2xl w-28 h-20 flex items-center justify-center animate-floaty'>
                <span className='text-red-500 text-xl font-semibold transition-all duration-300'>
                  {boyFaces[faceIndex]}
                </span>
              </div>
              <div className='bg-amber-300 shadow-2xl rounded-2xl w-28 h-20 flex items-center justify-center animate-floaty'>
                <span className='text-red-500 text-xl font-semibold transition-all duration-300'>
                  {girlFaces[faceIndex]}
                </span>
              </div>
            </div>
            <h3 className="text-lg font-blindcharm-tech text-gray-900 dark:text-amber-100 mb-2">No messages yet</h3>
            <p className="text-red-500 text-sm max-w-xs font-bold italic">
              Your story hasn't started yet...
              <br />
              <span className="font-semibold">Tip: </span>Say hey, share a thought — let the vibe flow ♡
            </p>
          </div>
        ) : (
          <div className="space-y-3 py-2 min-h-full">
            {/* Loading indicator for pagination */}
            {loading && messages.length > 0 && (
              <div className="flex justify-center py-2">
                <Loader2 className="w-5 h-5 animate-spin text-red-500" />
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] ${message.sender_id === currentUserId ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`px-4 py-2 rounded-2xl ${message.sender_id === currentUserId
                      ? 'bg-red-500 text-white rounded-br-md'
                      : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
                      }`}
                  >
                    {message.type === 'voice' && message.metadata?.audio_url ? (
                      <VoiceMessage
                        audioUrl={message.metadata.audio_url}
                        duration={message.metadata.duration}
                        isOwn={message.sender_id === currentUserId}
                        isLoading={false}
                      />
                    ) : (
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    )}
                  </div>
                  <div className={`flex items-center mt-1 space-x-1 ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
                    }`}>
                    <span className="text-xs text-gray-400">
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {message.sender_id === currentUserId && (
                      <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}