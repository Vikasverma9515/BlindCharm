// components/ai/MessageBubble.tsx
'use client'

import { motion } from 'framer-motion'
import { User } from 'lucide-react'

interface MessageBubbleProps {
  message: string
  isUser: boolean
  avatar?: string
  friendName?: string
  timestamp?: string
  // UI grouping
  showAvatar?: boolean
  showName?: boolean
  compactTop?: boolean
}

export default function MessageBubble({ message, isUser, avatar, friendName, timestamp, showAvatar = true, showName = true, compactTop = false }: MessageBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${compactTop ? 'mb-1 mt-0.5' : 'mb-3 mt-1'} ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-10">
        {showAvatar ? (
          isUser ? (
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center shadow-sm">
              <User size={18} className="text-white" />
            </div>
          ) : (
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xl shadow-sm">
              {avatar || '🤖'}
            </div>
          )
        ) : (
          <div className="w-10" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[78%] sm:max-w-[68%] md:max-w-[60%] lg:max-w-[50%]`}
      >
        {!isUser && friendName && showName && (
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-1">
            {friendName}
          </span>
        )}

        <div
          className={`px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
            isUser
              ? 'bg-primary-500 text-white rounded-br-md'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-md'
          }`}
        >
          <p className="whitespace-pre-wrap">
            {message}
          </p>
        </div>

        {timestamp && (
          <span className={`text-[11px] mt-1 px-1 ${isUser ? 'text-white/70' : 'text-gray-400'}`}>
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </motion.div>
  )
}