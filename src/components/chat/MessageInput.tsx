// src/components/chat/MessageInput.tsx
'use client'

import { useState, useEffect } from 'react';

interface MessageInputProps {
  onSend: (message: string) => void;
  onTyping: (isTyping: boolean) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, onTyping }) => {
  const [message, setMessage] = useState('');
  const [isTypingDebounce, setIsTypingDebounce] = useState(false);

  useEffect(() => {
    if (isTypingDebounce) {
      const timer = setTimeout(() => {
        onTyping(false);
        setIsTypingDebounce(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isTypingDebounce, onTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    onSend(message.trim());
    setMessage('');
    onTyping(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (!isTypingDebounce) {
      onTyping(true);
      setIsTypingDebounce(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4 bg-white">
      <div className="flex space-x-2">
        <input
          type="text"
          value={message}
          onChange={handleChange}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>
    </form>
  );
};