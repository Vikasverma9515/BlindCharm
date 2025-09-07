'use client'

import { motion } from 'framer-motion'
import { User } from 'lucide-react'

interface ChatMessageProps {
  message: string
  isUser: boolean
  friendName?: string
  friendAvatar?: string
  timestamp?: string
  emotion?: string
}

export default function ChatMessage({ 
  message, 
  isUser, 
  friendName = 'Friend',
  friendAvatar = '😊',
  timestamp,
  emotion
}: ChatMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
        isUser 
          ? 'bg-primary-500 text-white' 
          : 'bg-gray-100 dark:bg-gray-700'
      }`}>
        {isUser ? (
          <User size={20} />
        ) : (
          <span className="text-xl">{friendAvatar}</span>
        )}
      </div>

      {/* Message bubble */}
      <div className={`max-w-[75%] ${isUser ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
        {/* Name */}
        {!isUser && (
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-1">
            {friendName}
          </span>
        )}
        
        {/* Message */}
        <div className={`px-4 py-2 rounded-2xl break-words ${
          isUser
            ? 'bg-primary-500 text-white rounded-br-md'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
          
          {/* Emotion indicator for AI messages */}
          {!isUser && emotion && emotion !== 'neutral' && (
            <div className="flex items-center mt-1 opacity-60">
              <div className={`w-2 h-2 rounded-full mr-2 ${getEmotionColor(emotion)}`} />
              <span className="text-xs">{emotion}</span>
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        {timestamp && (
          <span className="text-xs text-gray-400 mt-1 px-1">
            {new Date(timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        )}
      </div>
    </motion.div>
  )
}

function getEmotionColor(emotion: string): string {
  const colors: { [key: string]: string } = {
    sad: 'bg-blue-400',
    excited: 'bg-yellow-400',
    anxious: 'bg-orange-400',
    frustrated: 'bg-red-400',
    romantic: 'bg-pink-400',
    happy: 'bg-green-400'
  }
  return colors[emotion] || 'bg-gray-400'
}