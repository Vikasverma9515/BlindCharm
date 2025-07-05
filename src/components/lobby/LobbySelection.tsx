'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Users, Heart, Coffee, Music, Book, Gamepad2, Camera, Palette, Dumbbell, Plus, ArrowRight, LogOut } from 'lucide-react'
import { LobbyService } from '@/lib/services/LobbyService'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Lobby {
  id: string
  theme: string
  name: string
  participant_count: number
  status: string
  created_at: string
  ends_at: string
  description?: string
  lobby_participants?: any[]
}

interface LobbyParticipant {
  id: string
  lobby_id: string
  user_id: string
  status: string
}

// Theme configuration for lobby cards - Ultra minimal design
const getThemeConfig = (theme: string) => {
  const themeMap: Record<string, { icon: any; background: string; accent: string }> = {
    'Dating': { 
      icon: Heart, 
      background: 'bg-gray-100 dark:bg-gray-700',
      accent: 'gray'
    },
    'Coffee Chat': { 
      icon: Coffee, 
      background: 'bg-gray-100 dark:bg-gray-700',
      accent: 'gray'
    },
    'Music Lovers': { 
      icon: Music, 
      background: 'bg-gray-100 dark:bg-gray-700',
      accent: 'gray'
    },
    'Book Club': { 
      icon: Book, 
      background: 'bg-gray-100 dark:bg-gray-700',
      accent: 'gray'
    },
    'Gaming': { 
      icon: Gamepad2, 
      background: 'bg-gray-100 dark:bg-gray-700',
      accent: 'gray'
    },
    'Photography': { 
      icon: Camera, 
      background: 'bg-gray-100 dark:bg-gray-700',
      accent: 'gray'
    },
    'Art & Design': { 
      icon: Palette, 
      background: 'bg-gray-100 dark:bg-gray-700',
      accent: 'gray'
    },
    'Fitness': { 
      icon: Dumbbell, 
      background: 'bg-gray-100 dark:bg-gray-700',
      accent: 'gray'
    }
  }
  
  return themeMap[theme] || { 
    icon: Users, 
    background: 'bg-gray-100 dark:bg-gray-700',
    accent: 'gray'
  }
}



export default function LobbySelection() {
  const { data: session } = useSession()
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState<number>(300)
  const [activeLobbies, setActiveLobbies] = useState<Lobby[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [userJoinedLobbyId, setUserJoinedLobbyId] = useState<string | null>(null)

  // Subscribe to lobby changes
  useEffect(() => {
    const channel = supabase
      .channel('lobby_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'lobbies' 
        }, 
        () => {
          fetchLobbies()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const fetchLobbies = async () => {
    try {
      const { data, error } = await supabase
        .from('lobbies')
        .select(`
          *,
          lobby_participants (
            id,
            user_id,
            status
          )
        `)
        .eq('status', 'waiting')

      if (error) throw error

      const lobbiesWithCount = data.map(lobby => ({
        ...lobby,
        participant_count: lobby.lobby_participants?.length || 0
      }))

      setActiveLobbies(lobbiesWithCount)
    } catch (err) {
      console.error('Error fetching lobbies:', err)
      setError('Failed to fetch active lobbies.')
    }
  }

  const checkUserLobbyStatus = async () => {
    if (!session?.user?.id) return

    try {
      const { data, error } = await supabase
        .from('lobby_participants')
        .select('lobby_id')
        .eq('user_id', session.user.id)
        .eq('status', 'waiting')
        .maybeSingle() // <-- fix here

      if (error && error.code !== 'PGRST116') throw error
      setUserJoinedLobbyId(data?.lobby_id || null)
    } catch (err) {
      console.error('Error checking user lobby status:', err)
    }
  }

  useEffect(() => {
    let timer: NodeJS.Timeout

    const updateInfo = async () => {
      await Promise.all([
        checkUserLobbyStatus(),
        fetchLobbies()
      ])
    }

    updateInfo()
    timer = setInterval(updateInfo, 3000)

    return () => clearInterval(timer)
  }, [session])

  const handleJoinLobby = async (lobbyId: string) => {
    if (!session?.user) {
      router.push('/login')
      return
    }

    setLoading(lobbyId)

    try {
      const { error } = await supabase
        .from('lobby_participants')
        .insert({
          user_id: session.user.id,
          lobby_id: lobbyId,
          status: 'waiting'
        })

      if (error) throw error

      setUserJoinedLobbyId(lobbyId)
      await fetchLobbies()
    } catch (err) {
      console.error('Error joining lobby:', err)
      setError('Failed to join the lobby.')
    } finally {
      setLoading(null)
    }
  }

  const handleLeaveLobby = async (lobbyId: string) => {
    if (!session?.user) return

    setLoading(lobbyId)

    try {
      const { error } = await supabase
        .from('lobby_participants')
        .delete()
        .match({ 
          user_id: session.user.id, 
          lobby_id: lobbyId 
        })

      if (error) throw error

      setUserJoinedLobbyId(null)
      await fetchLobbies()
    } catch (err) {
      console.error('Error leaving lobby:', err)
      setError('Failed to leave the lobby.')
    } finally {
      setLoading(null)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  console.log('session.user.id', session?.user?.id);
  useEffect(() => {
    const fetchAuthUser = async () => {
      const { data: authUser } = await supabase.auth.getUser();
      console.log('supabase.auth.getUser()', authUser);
    };
    fetchAuthUser();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6"
        >
          {error}
        </motion.div>
      )}



      {/* Lobbies Grid - Modern Dating App Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {activeLobbies.map((lobby, index) => {
          const themeConfig = getThemeConfig(lobby.theme)
          const IconComponent = themeConfig.icon
          
          return (
            <motion.div
              key={lobby.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2, scale: 1.02 }}
              className="w-full max-w-sm mx-auto"
            >
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
                
                {/* Header with solid background */}
                <div className={`${themeConfig.background} p-6 relative`}>
                  {/* Status indicator */}
                  {userJoinedLobbyId === lobby.id && (
                    <div className="absolute top-4 right-4">
                      <div className="w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                    </div>
                  )}
                  
                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
                      <IconComponent 
                        size={28} 
                        className="text-gray-600"
                      />
                    </div>
                  </div>
                  
                  {/* Theme name */}
                  <div className="text-center">
                    <h3 className="text-sm font-medium text-gray-700 mb-1">
                      {lobby.theme}
                    </h3>
                    <div className="flex items-center justify-center space-x-1 text-gray-500">
                      <Users size={14} />
                      <span className="text-sm">{lobby.participant_count}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h4 className="font-semibold text-gray-900 text-lg mb-2 leading-tight">
                    {lobby.name}
                  </h4>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-2">
                    {lobby.description || 'Connect with Crazy People!'}
                  </p>

                  {/* Action button */}
                  {userJoinedLobbyId === lobby.id ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/lobby/${lobby.id}`)}
                        disabled={loading === lobby.id}
                        className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-2xl transition-colors duration-200 disabled:opacity-50 text-sm"
                      >
                        {loading === lobby.id ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          </div>
                        ) : (
                          'Enter'
                        )}
                      </button>
                      <button
                        onClick={() => handleLeaveLobby(lobby.id)}
                        disabled={loading === lobby.id}
                        className="w-12 h-12 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
                      >
                        <LogOut size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleJoinLobby(lobby.id)}
                      disabled={loading === lobby.id || userJoinedLobbyId !== null}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-2xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {loading === lobby.id ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Joining...
                        </div>
                      ) : (
                        'Join Lobby'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Empty State - Modern Minimal */}
      {activeLobbies.length === 0 && !error && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Users className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No lobbies yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
            Be the first to start a conversation. New lobbies are created regularly.
          </p>
        </motion.div>
      )}
    </div>
  )
}