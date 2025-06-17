// src/components/lobby/LobbyChat.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Send, Loader2 } from 'lucide-react'
import { Message, User } from '@/types/lobby'

interface LobbyChatProps {
  lobbyId: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  currentUser: User | null;
}

export default function LobbyChat({ lobbyId, messages, setMessages, currentUser }: LobbyChatProps) {
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
      <div className="flex flex-col h-full bg-white items-center justify-center">
        <p className="text-gray-500">Please log in to chat</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-500">
        <h2 className="text-xl font-bold text-white">Lobby Chat</h2>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.user_id === currentUser?.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div className={`max-w-[70%] flex ${
              message.user_id === currentUser?.id ? 'flex-row-reverse' : 'flex-row'
            } items-end gap-2`}>
              {message.user.profile_picture ? (
                <img 
                  src={message.user.profile_picture}
                  alt={message.user.username}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  {message.user.username[0].toUpperCase()}
                </div>
              )}
              
              <div className={`rounded-lg p-3 ${
                message.user_id === currentUser?.id 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm ${
                    message.user_id === currentUser?.id 
                      ? 'text-blue-100' 
                      : 'text-gray-500'
                  }`}>
                    {message.user.username}
                  </span>
                  <span className={`text-xs ${
                    message.user_id === currentUser?.id 
                      ? 'text-blue-200' 
                      : 'text-gray-400'
                  }`}>
                    {new Date(message.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <p className="break-words">{message.content}</p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t bg-gray-50">
        {error && (
          <div className="mb-2 text-sm text-red-600">{error}</div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}