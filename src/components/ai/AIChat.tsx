'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, Settings, Trash2 } from 'lucide-react'
import ChatMessage from './ChatMessage'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: string
  emotion?: string
}

interface AIFriend {
  name: string
  avatar: string
  personality: string
}

interface AIChatProps {
  friend: AIFriend
}

export default function AIChat({ friend }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    loadConversationHistory()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadConversationHistory = async () => {
    try {
      // In a real app, you'd load from your API
      // For now, start with a welcome message
      const welcomeMessage: Message = {
        id: '1',
        content: `Hey! It's ${friend.name} 😊 How are you doing today?`,
        isUser: false,
        timestamp: new Date().toISOString(),
        emotion: 'excited'
      }
      setMessages([welcomeMessage])
    } catch (error) {
      console.error('Error loading conversation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      isUser: true,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        isUser: false,
        timestamp: new Date().toISOString(),
        emotion: data.emotion
      }

      setMessages(prev => [...prev, aiMessage])
      
    } catch (error) {
      console.error('Error sending message:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having a tiny technical issue! Try again in a moment? 😊",
        isUser: false,
        timestamp: new Date().toISOString(),
        emotion: 'neutral'
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearConversation = async () => {
    if (confirm('Are you sure you want to clear this conversation?')) {
      setMessages([])
      // Optionally call API to clear from database
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value)
    
    // Auto-resize textarea
    const target = e.target
    target.style.height = 'auto'
    target.style.height = Math.min(target.scrollHeight, 128) + 'px'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
          <p className="text-gray-600 dark:text-gray-400">Loading your conversation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{friend.avatar}</span>
          <div>
            <h3 className="font-semibold">{friend.name}</h3>
                       <p className="text-primary-100 text-sm opacity-90">
              {isTyping ? 'typing...' : 'your AI best friend'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-4 space-y-3">
              <button
                onClick={clearConversation}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
              >
                <Trash2 size={16} />
                Clear Conversation
              </button>
              <div className="text-xs text-gray-500">
                <p><strong>Personality:</strong> {friend.personality}</p>
                <p><strong>Messages:</strong> {messages.length}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        <AnimatePresence>
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.content}
              isUser={message.isUser}
              friendName={friend.name}
              friendAvatar={friend.avatar}
              timestamp={message.timestamp}
              emotion={message.emotion}
            />
          ))}
        </AnimatePresence>
        
        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-xl">{friend.avatar}</span>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2 rounded-bl-md">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${friend.name}...`}
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-2xl resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 max-h-32"
              rows={1}
              style={{ height: 'auto', minHeight: '44px' }}
            />
          </div>
          
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="p-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-2xl transition-all transform hover:scale-105 disabled:transform-none flex items-center justify-center"
          >
            {isTyping ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          {friend.name} remembers what you share and cares about you ❤️
        </p>
      </div>
    </div>
  )
}