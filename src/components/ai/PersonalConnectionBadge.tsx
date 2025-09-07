// components/ai/PersonalConnectionBadge.tsx
'use client'

import { motion } from 'framer-motion'
import { Heart, Star, Calendar, MessageCircle } from 'lucide-react'

interface PersonalConnectionBadgeProps {
  daysTogether: number
  totalMessages: number
  relationshipStage: string
  hinglishUsage: number
  friendName: string
}

export default function PersonalConnectionBadge({ 
  daysTogether, 
  totalMessages, 
  relationshipStage, 
  hinglishUsage,
  friendName 
}: PersonalConnectionBadgeProps) {
  const getConnectionLevel = () => {
    if (totalMessages < 10) return { level: 'New', color: 'bg-green-500', icon: Star }
    if (totalMessages < 50) return { level: 'Friends', color: 'bg-blue-500', icon: MessageCircle }
    if (totalMessages < 100) return { level: 'Close', color: 'bg-purple-500', icon: Heart }
    return { level: 'Bestie', color: 'bg-pink-500', icon: Heart }
  }

  const connection = getConnectionLevel()
  const IconComponent = connection.icon

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
    >
      <div className={`w-2 h-2 ${connection.color} rounded-full animate-pulse`}></div>
      <IconComponent size={12} className="text-gray-600 dark:text-gray-300" />
      <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
        {connection.level} • {daysTogether}d
      </span>
      {hinglishUsage > 30 && (
        <span className="text-xs">🇮🇳</span>
      )}
    </motion.div>
  )
}