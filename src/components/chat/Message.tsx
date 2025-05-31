// src/components/chat/Message.tsx
'use client'

import { useAuth } from '../../hooks/useAuth'; // Adjust the path as needed

interface MessageProps {
  message: {
    id: string;
    content: string;
    senderId: string;
    senderName?: string; // Optional property for sender's name
    createdAt: string;
  };
  revealStage: 'anonymous' | 'name' | 'photo' | 'full';
}

export function Message({ message, revealStage }: MessageProps) {
  const { user } = useAuth()
  const isOwnMessage = message.senderId === user?.id

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isOwnMessage
            ? 'bg-red-500 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <div className="text-sm mb-1">
          {revealStage === 'anonymous' 
            ? 'Anonymous'
            : message.senderName}
        </div>
        <div>{message.content}</div>
        <div className="text-xs opacity-70 text-right">
          {new Date(message.createdAt).toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}