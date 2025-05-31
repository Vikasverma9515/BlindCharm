// src/components/chat/ChatInput.tsx
'use client'

import { useState, FormEvent } from 'react'
import { useChat } from '@/hooks/useChat'

interface ChatInputProps {
  onSend: (message: string) => void;
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const matchId = 'some-match-id'; // Replace with the actual matchId
  const { handleTyping } = useChat(matchId)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    onSend(message)
    setMessage('')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
    handleTyping(true)
    
    // Debounce typing indicator
    const timeout = setTimeout(() => {
      handleTyping(false)
    }, 2000)

    return () => clearTimeout(timeout)
  }

  return (
    <form onSubmit={handleSubmit} className="border-t p-4">
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
          className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </form>
  )
}