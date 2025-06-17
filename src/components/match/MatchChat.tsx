// src/components/match/MatchChat.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Send, Eye, EyeOff, Loader2 } from 'lucide-react'

interface MatchChatProps {
  matchId: string;
  currentUserId: string;
  otherUserId: string;
}

export default function MatchChat({ matchId, currentUserId, otherUserId }: MatchChatProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [revealRequested, setRevealRequested] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [otherUser, setOtherUser] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fetch match details and messages
    const fetchMatchData = async () => {
      const [matchRes, messagesRes] = await Promise.all([
        supabase
          .from('matches')
          .select('*')
          .eq('id', matchId)
          .single(),
        supabase
          .from('private_messages')
          .select(`
            *,
            sender:sender_id (
              username,
              profile_picture
            )
          `)
          .eq('chat_id', matchId)
          .order('created_at', { ascending: true })
      ]);

      if (matchRes.data) {
        setRevealRequested(matchRes.data.reveal_status.user1 || matchRes.data.reveal_status.user2);
        setRevealed(matchRes.data.reveal_status.user1 && matchRes.data.reveal_status.user2);
      }

      if (messagesRes.data) {
        setMessages(messagesRes.data);
      }
    };

    fetchMatchData();

    // Subscribe to new messages
    const subscription = supabase
      .channel(`match_${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_messages',
          filter: `chat_id=eq.${matchId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [matchId]);

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
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await supabase
      .from('private_messages')
      .insert({
        chat_id: matchId,
        sender_id: currentUserId,
        content: newMessage.trim()
      });

    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {revealed ? otherUser?.username : 'Anonymous Match'}
          </h2>
          <button
            onClick={handleRevealRequest}
            className={`p-2 rounded-full ${
              revealRequested ? 'bg-pink-600' : 'bg-purple-600'
            } hover:opacity-80`}
          >
            {revealRequested ? <EyeOff /> : <Eye />}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender_id === currentUserId
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border p-2"
          />
          <button
            type="submit"
            className="bg-purple-500 text-white px-4 py-2 rounded-lg"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}