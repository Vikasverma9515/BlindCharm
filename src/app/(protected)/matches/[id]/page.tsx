// src/app/(protected)/matches/[id]/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Send, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  user: {
    username: string;
    profile_picture: string | null;
  };
}

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  status: string;
  created_at: string;
  user1: {
    username: string;
    profile_picture: string | null;
  };
  user2: {
    username: string;
    profile_picture: string | null;
  };
}

interface MatchParams {
  params: {
    id: string;
  };
}

export default function MatchChatPage({ params }: MatchParams) {
  const { data: session } = useSession()
  const router = useRouter()
  const [match, setMatch] = useState<Match | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!session?.user?.id) return
    fetchMatch()
    fetchMessages()
    setupSubscription()
  }, [session, params.id])

  const fetchMatch = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
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
        .eq('id', params.id)
        .single();

      if (error) throw error;
      
      // Verify that the current user is part of this match
      if (data.user1_id !== session?.user?.id && data.user2_id !== session?.user?.id) {
        throw new Error('Unauthorized');
      }

      setMatch(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching match:', err);
      router.push('/lobbies');
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('match_messages')
        .select(`
          *,
          sender:sender_id (
            id,
            username,
            profile_picture
          )
        `)
        .eq('match_id', params.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      scrollToBottom();
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const setupSubscription = () => {
    const channel = supabase
      .channel(`match_${params.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'match_messages',
          filter: `match_id=eq.${params.id}`
        },
        () => {
          fetchMessages()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !session?.user?.id) return

    try {
      const { error } = await supabase
        .from('match_messages')
        .insert({
          match_id: params.id,
          sender_id: session.user.id,
          content: newMessage.trim()
        })

      if (error) throw error
      setNewMessage('')
    } catch (err) {
      console.error('Error sending message:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (!match) return null

  const otherUser = match.user1_id === session?.user?.id ? match.user2 : match.user1

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Chat Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            {otherUser.profile_picture ? (
              <img
                src={otherUser.profile_picture}
                alt={otherUser.username}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xl text-gray-500">
                  {otherUser.username[0].toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold">{otherUser.username}</h2>
              <p className="text-sm text-gray-500">
                Matched on {new Date(match.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_id === session?.user?.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender_id === session?.user?.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white'
                }`}
              >
                <p>{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t">
        <div className="max-w-4xl mx-auto p-4">
          <form onSubmit={sendMessage} className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}