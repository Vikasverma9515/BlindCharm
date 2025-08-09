// src/components/match/MatchChat.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Send, Eye, EyeOff, Loader2, RefreshCw, ChevronUp } from 'lucide-react'
import { useChat } from '@/hooks/useChat'

interface MatchChatProps {
  matchId: string;
  currentUserId: string;
  otherUserId: string;
}

export default function MatchChat({ matchId, currentUserId, otherUserId }: MatchChatProps) {
  const [newMessage, setNewMessage] = useState('')
  const [revealRequested, setRevealRequested] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [otherUser, setOtherUser] = useState<any>(null)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const [showLoadMore, setShowLoadMore] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    loading,
    error,
    sendMessage: sendChatMessage,
    loadMoreMessages,
    hasMoreMessages,
    refreshMessages,
    clearError
  } = useChat({
    chatId: matchId,
    type: 'match',
    userId: currentUserId,
    enabled: !!matchId && !!currentUserId,
    pageSize: 30
  });

  useEffect(() => {
    // Fetch match details
    const fetchMatchData = async () => {
      const matchRes = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (matchRes.data) {
        setRevealRequested(matchRes.data.reveal_status.user1 || matchRes.data.reveal_status.user2);
        setRevealed(matchRes.data.reveal_status.user1 && matchRes.data.reveal_status.user2);
      }

      // Fetch other user data if revealed
      if (matchRes.data?.reveal_status.user1 && matchRes.data?.reveal_status.user2) {
        const { data: userData } = await supabase
          .from('users')
          .select('id, username, profile_picture')
          .eq('id', otherUserId)
          .single();
        
        setOtherUser(userData);
      }
    };

    fetchMatchData();
  }, [matchId, otherUserId]);

  // Handle scroll events to show/hide scroll to bottom button and load more trigger
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

  // Auto-scroll to bottom when new messages arrive (only if user is near bottom)
  useEffect(() => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
    
    if (isNearBottom) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLoadMore = async () => {
    if (loading || !hasMoreMessages) return;
    
    const container = containerRef.current;
    const scrollHeightBefore = container?.scrollHeight || 0;
    
    await loadMoreMessages();
    
    // Maintain scroll position after loading more messages
    setTimeout(() => {
      if (container) {
        const scrollHeightAfter = container.scrollHeight;
        const scrollDiff = scrollHeightAfter - scrollHeightBefore;
        container.scrollTop += scrollDiff;
      }
    }, 100);
  };

  const handleRevealRequest = async () => {
    const { data: match } = await supabase
      .from('matches')
      .select('reveal_status, user1_id')
      .eq('id', matchId)
      .single();

    if (!match) return;

    const isUser1 = match.user1_id === currentUserId;
    const newRevealStatus = {
      ...match.reveal_status,
      [isUser1 ? 'user1' : 'user2']: true
    };

    await supabase
      .from('matches')
      .update({
        reveal_status: newRevealStatus,
        ...(newRevealStatus.user1 && newRevealStatus.user2 ? {
          revealed_at: new Date().toISOString()
        } : {})
      })
      .eq('id', matchId);

    setRevealRequested(true);
    if (newRevealStatus.user1 && newRevealStatus.user2) {
      setRevealed(true);
      
      // Fetch other user data now that it's revealed
      const { data: userData } = await supabase
        .from('users')
        .select('id, username, profile_picture')
        .eq('id', otherUserId)
        .single();
      
      setOtherUser(userData);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendChatMessage(newMessage.trim());
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Chat header */}
      <div className="p-4 bg-purple-600 text-white">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {revealed ? otherUser?.username || 'Anonymous Match' : 'Anonymous Match'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshMessages}
              disabled={loading}
              className="p-2 text-white hover:text-purple-200 transition-colors"
              title="Refresh messages"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleRevealRequest}
              className={`p-2 rounded-full ${
                revealRequested ? 'bg-pink-600' : 'bg-purple-700'
              } hover:opacity-80 transition-opacity`}
              title={revealRequested ? 'Reveal requested' : 'Request reveal'}
            >
              {revealRequested ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div className="text-sm text-purple-200 mt-1">
          {messages.length} message{messages.length !== 1 ? 's' : ''}
          {hasMoreMessages && ' (more available)'}
        </div>
      </div>

      {/* Load More Messages Button */}
      {showLoadMore && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg transition-all duration-200 flex items-center gap-2"
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
            onClick={scrollToBottom}
            className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-full shadow-lg transition-all duration-200"
          >
            <ChevronUp className="w-5 h-5 rotate-180" />
          </button>
        </div>
      )}

      {/* Messages */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
        {loading && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-4" />
            <p className="text-gray-600">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Send className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Start your conversation!</h3>
            <p className="text-gray-600 text-sm max-w-sm">
              Send your first message to break the ice with your match.
            </p>
          </div>
        ) : (
          <>
            {/* Loading indicator for pagination */}
            {loading && messages.length > 0 && (
              <div className="flex justify-center py-2">
                <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
              </div>
            )}
            
            {messages.map((message) => {
              const isOwnMessage = message.user_id === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-[75%] flex flex-col">
                    {/* Message info */}
                    <div className={`flex items-center gap-2 mb-1 text-xs text-gray-500 ${
                      isOwnMessage ? 'flex-row-reverse' : 'flex-row'
                    }`}>
                      <span>
                        {isOwnMessage ? 'You' : (revealed ? otherUser?.username || 'Anonymous' : 'Anonymous')}
                      </span>
                      <span>
                        {new Date(message.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    
                    {/* Message bubble */}
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        isOwnMessage
                          ? 'bg-purple-500 text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-800 rounded-bl-md'
                      }`}
                    >
                      <p className="break-words leading-relaxed text-sm">{message.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="p-4 border-t bg-white">
        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
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
              placeholder="Type a message..."
              className="w-full rounded-full border border-gray-300 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-base"
              disabled={loading}
              maxLength={500}
              style={{ fontSize: '16px' }}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
              {newMessage.length}/500
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="w-12 h-12 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}