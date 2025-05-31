// src/components/lobby/LobbySelection.tsx
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Users } from 'lucide-react'
import { LobbyService } from '@/lib/services/LobbyService'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const lobbyThemes = [
  {
    id: 'music-lovers',
    name: 'Music Lovers',
    icon: '🎵',
    color: 'bg-purple-100',
    description: 'Connect through your favorite tunes',
    duration: 5,
  },
  {
    id: 'wanderlust',
    name: 'Wanderlust',
    icon: '✈️',
    color: 'bg-blue-100',
    description: 'Share your travel stories',
    duration: 5,
  },
  // Add other themes here
]

export default function LobbySelection() {
  const { data: session } = useSession()
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState<number>(300)
  const [activeLobbies, setActiveLobbies] = useState<any[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let timer: NodeJS.Timeout

    const updateCycleInfo = async () => {
      try {
        const cycle = await LobbyService.getCurrentCycle()
        if (cycle) {
          const endTime = new Date(cycle.end_time)
          const now = new Date()
          const diff = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000))
          setTimeLeft(diff)
        }
      } catch (err) {
        console.error('Error fetching cycle info:', err)
        setError('Failed to fetch cycle info.')
      }
    }

    const fetchLobbies = async () => {
      try {
        const lobbies = await LobbyService.getActiveLobbies()
        setActiveLobbies(lobbies)
      } catch (err) {
        console.error('Error fetching lobbies:', err)
        setError('Failed to fetch active lobbies.')
      }
    }

    // Initial fetch
    updateCycleInfo()
    fetchLobbies()

    // Set up intervals
    timer = setInterval(() => {
      updateCycleInfo()
      fetchLobbies()
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  const handleJoinLobby = async (themeId: string) => {
    if (!session?.user) {
      router.push('/login')
      return
    }

    setLoading(themeId)

    try {
      const { error } = await LobbyService.joinLobby(session.user.id, themeId)

      if (error) {
        console.error('Error joining lobby:', error)
        setError('Failed to join the lobby.')
        return
      }

      router.push(`/lobby/${themeId}`)
    } catch (err) {
      console.error('Error joining lobby:', err)
      setError('Unexpected error occurred while joining the lobby.')
    } finally {
      setLoading(null)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Choose Your Lobby</h2>
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-gray-600" />
            <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-600" />
            <span className="text-lg">{activeLobbies.length} active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {lobbyThemes.map((theme) => (
          <motion.div
            key={theme.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`${theme.color} rounded-xl p-6 cursor-pointer relative overflow-hidden`}
            onClick={() => handleJoinLobby(theme.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{theme.icon}</span>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{theme.duration}m</span>
                </div>
                {activeLobbies.find((l) => l.theme === theme.id) && (
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>
                      {activeLobbies.find((l) => l.theme === theme.id)?.lobby_participants?.[0]?.count || 0}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">{theme.name}</h3>
            <p className="text-gray-600 text-sm">{theme.description}</p>

            {loading === theme.id && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <div className="animate-spin h-6 w-6 border-2 border-red-500 border-t-transparent rounded-full" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}


// // src/components/lobby/LobbySelection.tsx
// const handleJoinLobby = async (themeId: string) => {
//     if (!session?.user) {
//       router.push('/login')
//       return
//     }
  
//     setLoading(themeId)
//     setError(null)
  
//     try {
//       const { error, lobbyId } = await LobbyService.joinLobby(session.user.id, themeId)
  
//       if (error) {
//         setError(error)
//         return
//       }
  
//       if (lobbyId) {
//         router.push(`/lobby/${lobbyId}`)
//       }
//     } catch (error) {
//       setError('Failed to join lobby')
//       console.error('Error joining lobby:', error)
//     } finally {
//       setLoading(null)
//     }
//   }