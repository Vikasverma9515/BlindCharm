'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { LobbyManager } from '../../lib/lobby/LobbyManager'
import { Clock, Users } from 'lucide-react'

export default function ActiveLobby({ lobbyId }: { lobbyId: string }) {
  const [participants, setParticipants] = useState<any[]>([])
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [cycleInfo, setCycleInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const lobbyManager = LobbyManager.getInstance()

    // Subscribe to participant changes
    const subscription = supabase
      .channel(`lobby:${lobbyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lobby_participants',
          filter: `lobby_id=eq.${lobbyId}`,
        },
        () => {
          fetchParticipants()
        }
      )
      .subscribe()

    // Update timer and fetch participants
    const updateTimer = async () => {
      try {
        const info = await lobbyManager.getCurrentCycleInfo()
        if (info) {
          setCycleInfo(info)
          setTimeLeft(info.timeLeft)
        }
      } catch (err) {
        console.error('Error fetching cycle info:', err)
        setError('Failed to fetch cycle info.')
      }
    }

    const timer = setInterval(updateTimer, 1000)
    fetchParticipants()
    updateTimer()

    return () => {
      clearInterval(timer)
      subscription.unsubscribe()
    }
  }, [lobbyId])

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('lobby_participants')
        .select(`
          *,
          users (
            id,
            full_name,
            email,
            profile_picture
          )
        `)
        .eq('lobby_id', lobbyId)
        .eq('status', 'waiting')

      if (error) {
        console.error('Error fetching participants:', error)
        setError('Failed to fetch participants.')
        return
      }

      if (data) {
        setParticipants(data)
      }
    } catch (err) {
      console.error('Error fetching participants:', err)
      setError('Failed to fetch participants.')
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        {error && <div className="text-red-500 mb-4">{error}</div>}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Active Lobby</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-gray-600" />
              <span className="text-gray-600">{participants.length} participants</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gray-600" />
              <span className="text-gray-600">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Participants */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <AnimatePresence>
            {participants.map((participant) => (
              <motion.div
                key={participant.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gray-50 rounded-lg p-4"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="h-10 w-10 rounded-full bg-gray-200"
                    style={{
                      backgroundImage: `url(${participant.users?.profile_picture || ''})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {participant.users?.full_name || 'Anonymous'}
                    </p>
                    <p className="text-sm text-gray-500">Joined</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Status Message */}
        <div className="text-center">
          {cycleInfo?.status === 'waiting' && (
            <p className="text-gray-600">
              Waiting for more participants... Matchmaking will begin when the timer ends.
            </p>
          )}
          {cycleInfo?.status === 'matching' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-green-600 font-medium"
            >
              Finding your perfect match...
            </motion.p>
          )}
          {cycleInfo?.status === 'completed' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-blue-600 font-medium"
            >
              Matches found! Redirecting to chat...
            </motion.p>
          )}
        </div>
      </div>
    </div>
  )
}