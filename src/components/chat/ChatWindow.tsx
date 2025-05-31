// src/components/chat/ChatWindow.tsx
'use client'

import { useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import MessageBubble from './MessageBubble';
import { MessageInput } from './MessageInput';
import type { Match, Message } from '@/types/chat';

interface ChatWindowProps {
  matchId: string;
  match: Match;
}

export function ChatWindow({ matchId, match }: ChatWindowProps) {
  const { messages, isTyping, error, sendMessage, handleTyping } = useChat(matchId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="p-4 border-b">
        <h2 className="font-semibold">
          Chat with {match.revealStage === 'anonymous' ? 'Anonymous' : 'Match'}
        </h2>
      </div>

      {error && (
        <div className="bg-red-100 text-red-600 p-2 text-sm">
          {error}
        </div>
      )}
      
      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message: Message) => (
          <MessageBubble 
            key={message.id} 
            message={message} 
            revealStage={match.revealStage}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {isTyping && (
        <div className="text-sm text-gray-500 p-2 italic">
          Someone is typing...
        </div>
      )}

      {/* Message input */}
      <MessageInput 
        onSend={sendMessage}
        onTyping={handleTyping}
      />
    </div>
  );
}