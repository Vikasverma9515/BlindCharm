// src/components/lobby/LobbyCard.tsx
'use client'

import { motion } from 'framer-motion'
import { Clock, Users } from 'lucide-react'
import { useState } from 'react'

interface LobbyCardProps {
  id: string
  name: string
  icon: string
  color: string
  description: string
  duration: number
  currentParticipants: number
  maxParticipants: number
  onJoin: (lobbyId: string) => void
}

export default function LobbyCard({
  id,
  name,
  icon,
  color,
  description,
  duration,
  currentParticipants,
  maxParticipants,
  onJoin
}: LobbyCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const isFull = currentParticipants >= maxParticipants

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${color} rounded-xl p-6 cursor-pointer relative overflow-hidden`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => !isFull && onJoin(id)} // Prevent joining if the lobby is full
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{currentParticipants}/{maxParticipants}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{duration}m</span>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">{name}</h3>
      <p className="text-gray-600 text-sm">{description}</p>

      {/* Join button overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered && !isFull ? 1 : 0 }}
        className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center"
      >
        <button
          className={`bg-white text-gray-900 px-6 py-2 rounded-full font-medium transition-colors ${
            isFull ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100'
          }`}
          onClick={(e) => {
            e.stopPropagation()
            if (!isFull) onJoin(id)
          }}
          disabled={isFull}
        >
          {isFull ? 'Lobby Full' : 'Join Lobby'}
        </button>
      </motion.div>

      {/* Status indicator */}
      {isFull && (
        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
          Full
        </div>
      )}
    </motion.div>
  )
}