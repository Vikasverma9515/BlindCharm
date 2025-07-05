// src/components/lobby/LobbyChat.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Send, Loader2, MessageCircle } from 'lucide-react'
import { Message, User, LobbyParticipant } from '@/types/lobby'

interface LobbyChatProps {
  lobbyId: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  currentUser: User | null;
  participants: LobbyParticipant[];
}

export default function LobbyChat({ lobbyId, messages, setMessages, currentUser, participants }: LobbyChatProps) {
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!lobbyId) return;

    const channel = supabase
      .channel(`lobby_messages_${lobbyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lobby_messages',
          filter: `lobby_id=eq.${lobbyId}`
        },
        (payload) => {
          const newMsg = payload.new;
          setMessages(prev => {
            if (prev.some(msg => msg.id === newMsg.id)) return prev;
            const user =
              prev.find(m => m.user_id === newMsg.user_id)?.user || {
                id: newMsg.user_id,
                username: 'Unknown',
                profile_picture: null,
                gender: 'other'
              };
            const message: Message = {
              id: newMsg.id,
              content: newMsg.content,
              user_id: newMsg.user_id,
              lobby_id: newMsg.lobby_id,
              created_at: newMsg.created_at,
              user
            };
            return [...prev, message];
          });
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [lobbyId, setMessages]);

  const verifyLobbyParticipation = async () => {
    const { data } = await supabase
      .from('lobby_participants')
      .select('id')
      .eq('lobby_id', lobbyId)
      .eq('user_id', currentUser?.id)
      .eq('status', 'waiting')
      .single();

    return !!data;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id || !newMessage.trim() || sending) return;

    setSending(true);
    setError(null);

    try {
      const isParticipant = await verifyLobbyParticipation();
      if (!isParticipant) {
        throw new Error('You must be a participant in this lobby to send messages');
      }

      const { data, error: insertError } = await supabase
        .from('lobby_messages')
        .insert({
          lobby_id: lobbyId,
          user_id: currentUser.id,
          content: newMessage.trim()
        })
        .select('id, content, user_id, lobby_id, created_at')
        .single();

      if (insertError) throw insertError;

      if (data) {
        setMessages(prev => [
          ...prev,
          {
            ...data,
            user: {
              id: currentUser.id,
              username: currentUser.username,
              profile_picture: currentUser.profile_picture,
              gender: currentUser.gender
            }
          }
        ]);
      }

      setNewMessage('');
    } catch (err) {
      setError('Failed to send message: ' + (err as Error).message);
    } finally {
      setSending(false);
    }
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
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 transition-colors duration-300">
      {/* Messages Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
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
          messages.map((message) => {
            const isOwnMessage = message.user_id === currentUser?.id
            const messageParticipant = participants.find(p => p.user_id === message.user_id)
            const shouldBlur = messageParticipant?.blur_profile || false
            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {message.user.profile_picture ? (
                    <img 
                      src={message.user.profile_picture}
                      alt={message.user.username}
                      className={`w-8 h-8 rounded-full object-cover ring-2 ring-primary-200 transition-all duration-300 ${
                        shouldBlur 
                          ? 'blur-[1px] opacity-85' 
                          : ''
                      }`}
                    />
                  ) : (
                    <div className={`w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm shadow-soft transition-all duration-300 ${
                      shouldBlur 
                        ? 'blur-[1px] opacity-85' 
                        : ''
                    }`}>
                      {message.user.username[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                
                {/* Message Content */}
                <div className={`max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                  {/* Username and Time */}
                  <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-xs font-medium text-neutral-750 dark:text-gray-300">
                      {isOwnMessage ? 'You' : message.user.username}
                    </span>
                    <span className="text-xs text-neutral-600 dark:text-gray-400">
                      {new Date(message.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  
                  {/* Message Bubble */}
                  <div className={`rounded-2xl px-4 py-3 shadow-soft ${
                    isOwnMessage 
                      ? 'bg-primary-500 text-white rounded-br-md' 
                      : 'bg-gray-100 dark:bg-gray-700 text-neutral-850 dark:text-gray-100 rounded-bl-md border border-gray-200 dark:border-gray-600'
                  }`}>
                    <p className="break-words leading-relaxed text-sm">{message.content}</p>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
        {error && (
          <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        
        <form onSubmit={sendMessage} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full rounded-full border border-gray-300 dark:border-gray-600 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 transition-all duration-200 text-base text-neutral-850 dark:text-gray-100 placeholder-neutral-600 dark:placeholder-gray-400"
              disabled={sending}
              maxLength={500}
              style={{ fontSize: '16px' }}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-neutral-500 dark:text-gray-400">
              {newMessage.length}/500
            </div>
          </div>
          
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="w-12 h-12 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-soft"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        
        <p className="text-xs text-neutral-600 dark:text-gray-400 mt-2 text-center">
          Be respectful and have fun! 💕
        </p>
      </div>
    </div>
  );
}