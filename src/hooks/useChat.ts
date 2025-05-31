// // src/hooks/useChat.ts
// 'use client'

// import { useState, useEffect } from 'react'
// import { supabase } from '@/lib/supabase'
// import { Message, ChatState } from '@/types/chat'
// import { useSocket } from '../hooks/useSocket'

// export function useChat(matchId: string) {
//   const [state, setState] = useState<ChatState>({
//     messages: [],
//     isTyping: false,
//     isLoading: true,
//     error: null
//   })

//   const socket = useSocket()

//   useEffect(() => {
//     // Load initial messages
//     const loadMessages = async () => {
//       try {
//         const { data, error } = await supabase
//           .from('messages')
//           .select('*')
//           .eq('match_id', matchId)
//           .order('created_at', { ascending: true })

//         if (error) throw error

//         setState(prev => ({ ...prev, messages: data, isLoading: false }))
//       } catch (error) {
//         setState(prev => ({ 
//           ...prev, 
//           error: 'Failed to load messages',
//           isLoading: false 
//         }))
//       }
//     }

//     loadMessages()

//     // Subscribe to new messages
//     const subscription = supabase
//       .channel(`match:${matchId}`)
//       .on('postgres_changes', {
//         event: 'INSERT',
//         schema: 'public',
//         table: 'messages',
//         filter: `match_id=eq.${matchId}`
//       }, payload => {
//         setState(prev => ({
//           ...prev,
//           messages: [...prev.messages, payload.new as Message]
//         }))
//       })
//       .subscribe()

//     return () => {
//       subscription.unsubscribe()
//     }
//   }, [matchId])

//   const sendMessage = async (content: string) => {
//     try {
//       const { data, error } = await supabase
//         .from('messages')
//         .insert({
//           match_id: matchId,
//           content,
//           sender_id: (await supabase.auth.getUser()).data.user?.id
//         })
//         .single()

//       if (error) throw error

//       socket.emit('message:sent', { matchId, message: data })
//     } catch (error) {
//       setState(prev => ({ ...prev, error: 'Failed to send message' }))
//     }
//   }

//   const setTyping = (isTyping: boolean) => {
//     socket.emit('user:typing', { matchId, isTyping })
//   }

//   return {
//     messages: state.messages,
//     isLoading: state.isLoading,
//     error: state.error,
//     isTyping: state.isTyping,
//     sendMessage,
//     setTyping
//   }
// }

// src/hooks/useChat.ts
import { useState, useEffect } from 'react';
import { ChatService } from '@/lib/chat/ChatService';
import { Message } from '@/types/chat';
import { useAuth } from '@/hooks/useAuth';

export function useChat(matchId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [chatService, setChatService] = useState<ChatService | null>(null);

  useEffect(() => {
    if (user?.id) {
      const service = new ChatService(user.id);
      setChatService(service);

      return () => {
        service.disconnect();
      };
    }
  }, [user?.id]);

  const sendMessage = async (content: string) => {
    try {
      if (!chatService) throw new Error('Chat service not initialized');
      
      const message = await chatService.sendMessage(matchId, content);
      setMessages(prev => [...prev, message]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send message');
    }
  };

  const handleTyping = (isTyping: boolean) => {
    chatService?.emitTyping(matchId, isTyping);
  };

  return {
    messages,
    isTyping,
    error,
    sendMessage,
    handleTyping
  };
}