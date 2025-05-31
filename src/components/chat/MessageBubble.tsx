// src/components/chat/MessageBubble.tsx
'use client'

import { useAuth } from '@/hooks/useAuth';
import type { Message } from '@/types/chat';

interface MessageBubbleProps {
  message: Message;
  revealStage: 'anonymous' | 'name' | 'photo' | 'full';
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, revealStage }) => {
  const { user } = useAuth();
  const isOwnMessage = message.sender_id === user?.id;

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isOwnMessage
            ? 'bg-red-500 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <div className="text-sm mb-1 opacity-75">
          {isOwnMessage ? 'You' : revealStage === 'anonymous' ? 'Anonymous' : 'Match'}
        </div>
        <p className="break-words">{message.content}</p>
        <div className="text-xs mt-1 opacity-50">
          {new Date(message.created_at).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;