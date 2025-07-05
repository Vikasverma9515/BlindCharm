'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import ScrollVelocity from '@/components/ui/ScrollVelocity'
import { Clock, Users, Heart, Coffee, Music, Book, Gamepad2, Camera, Palette, Dumbbell, Plus, ArrowRight, LogOut } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

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

// Modern Card Component
const ModernCard = ({ children, className = '', hover = true }: { 
  children: React.ReactNode; 
  className?: string; 
  hover?: boolean; 
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -5 } : {}}
      className={`
        bg-amber-400 dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100/50 dark:border-gray-700/50 backdrop-blur-sm 
        p-6 md:p-8 transition-all duration-300
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

// Modern Button Component
const ModernButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  onClick,
  disabled = false
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-full font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 shadow-soft',
    secondary: 'bg-secondary-100 text-primary-500 hover:bg-secondary-200',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
};

// Theme configuration for modern rose app design
const getThemeConfig = (theme: string) => {
  const themeMap: Record<string, { icon: any; bgColor: string; iconColor: string }> = {
    'Dating': { 
      icon: Heart, 
      bgColor: 'bg-rose-50 dark:bg-rose-900/20',
      iconColor: 'text-rose-500'
    },
    'Coffee Chat': { 
      icon: Coffee, 
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: 'text-amber-600'
    },
    'Music Lovers': { 
      icon: Music, 
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-500'
    },
    'Book Club': { 
      icon: Book, 
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-500'
    },
    'Gaming': { 
      icon: Gamepad2, 
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-500'
    },
    'Photography': { 
      icon: Camera, 
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
      iconColor: 'text-cyan-500'
    },
    'Art & Design': { 
      icon: Palette, 
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      iconColor: 'text-pink-500'
    },
    'Fitness': { 
      icon: Dumbbell, 
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      iconColor: 'text-orange-500'
    }
  }
  
  return themeMap[theme] || { 
    icon: Users, 
    bgColor: 'bg-slate-50 dark:bg-slate-900/20',
    iconColor: 'text-slate-500'
  }
}

export default function ModernLobbySelection() {
  const [activeLobbies, setActiveLobbies] = useState<Lobby[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [userJoinedLobbyId, setUserJoinedLobbyId] = useState<string | null>(null)
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    let timer: NodeJS.Timeout

    const updateInfo = async () => {
      await Promise.all([
        checkUserLobbyStatus(),
        fetchActiveLobbies()
      ])
    }

    updateInfo()
    timer = setInterval(updateInfo, 3000)

    return () => clearInterval(timer)
  }, [session])

  const fetchActiveLobbies = async () => {
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
    } catch (error) {
      console.error('Error fetching lobbies:', error)
      setError('Failed to load lobbies')
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
        .maybeSingle()

      if (error && error.code !== 'PGRST116') throw error
      setUserJoinedLobbyId(data?.lobby_id || null)
    } catch (error) {
      console.error('Error checking user lobby status:', error)
    }
  }

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
      await fetchActiveLobbies()
    } catch (error) {
      console.error('Error joining lobby:', error)
      setError('Failed to join lobby')
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
      await fetchActiveLobbies()
    } catch (error) {
      console.error('Error leaving lobby:', error)
      setError('Failed to leave lobby')
    } finally {
      setLoading(null)
    }
  }
  

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pb-20 md:pb-8 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="space-y-8">
          {/* Error State */}
          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-2xl"
            >
              {error}
            </motion.div>
          )}

          {/* Header Section */}
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <ScrollVelocity
                texts={['Find Your Match', 'Blindfolded Connections']} 
                velocity={30} 
                className="text-neutral-850 dark:text-gray-100"
                scrollerClassName="text-2xl md:text-4xl font-bold tracking-tight"
              />
            </div>
            <div className="hidden md:flex items-center space-x-2 bg-secondary-50 dark:bg-gray-800 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-neutral-750 dark:text-gray-300 font-medium">
                {activeLobbies.length} active lobbies
              </span>
            </div>
          </div>
          

          {/* Lobbies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeLobbies.map((lobby, index) => {
              const themeConfig = getThemeConfig(lobby.theme)
              const IconComponent = themeConfig.icon
              
              return (
                <motion.div
                  key={lobby.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ModernCard className="hover:shadow-float bg-indigo-300 dark:bg-gray-800 border-l-8 border-l-indigo-400 dark:border-l-indigo-500 hover:shadow-lg transition-shadow duration-200" hover>
                    <div className="space-y-4 ">
                      {/* Header with theme */}
                      <div className="flex justify-between items-start">
                        <div className={`p-4 rounded-2xl ${themeConfig.bgColor}`}>
                          <IconComponent size={32} className={themeConfig.iconColor} />
                        </div>
                        <div className="text-right">

                          {userJoinedLobbyId === lobby.id && (
                            <div className="mt-2">
                              <div className="w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm mx-auto"></div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-xl font-semibold text-neutral-850 dark:text-gray-100 mb-1">
                            {lobby.name}
                          </h3>
                          <p className="text-sm text-primary-500 dark:text-primary-400 font-medium mb-2">
                            {lobby.theme}
                          </p>
                        </div>
                        
                        <p className="text-neutral-750 dark:text-gray-300 text-sm leading-relaxed line-clamp-2">
                          {lobby.description || 'Join the conversation and meet new people!'}
                        </p>
                
                        {/* Tags/Stats */}
                        <div className="flex gap-2 flex-wrap">
                          <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-500 dark:text-primary-400 rounded-full text-xs font-medium">
                            {lobby.participant_count} members
                          </span>
                          <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-500 dark:text-primary-400 rounded-full text-xs font-medium">
                            Active now
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2">
                        {userJoinedLobbyId === lobby.id ? (
                          <div className="flex gap-3">
                            <ModernButton
                              variant="primary"
                              className="flex-1"
                              onClick={() => router.push(`/lobby/${lobby.id}`)}
                              disabled={loading === lobby.id}
                            >
                              {loading === lobby.id ? (
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                              ) : (
                                <>
                                  <ArrowRight size={16} className="mr-2" />
                                  Enter
                                </>
                              )}
                            </ModernButton>
                            <ModernButton
                              variant="outline"
                              size="md"
                              onClick={() => handleLeaveLobby(lobby.id)}
                              disabled={loading === lobby.id}
                              className="px-4"
                            >
                              <LogOut size={16} />
                            </ModernButton>
                          </div>
                        ) : (
                          <ModernButton
                            variant="primary"
                            className="w-full"
                            onClick={() => handleJoinLobby(lobby.id)}
                            disabled={loading === lobby.id || userJoinedLobbyId !== null}
                          >
                            {loading === lobby.id ? (
                              <>
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                Joining...
                              </>
                            ) : (
                              <>
                                <Plus size={16} className="mr-2" />
                                Join Lobby
                              </>
                            )}
                          </ModernButton>
                        )}
                      </div>
                    </div>
                  </ModernCard>
                </motion.div>
              )
            })}
          </div>

          {/* Empty State */}
          {activeLobbies.length === 0 && !error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 bg-primary-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Users className="h-12 w-12 text-primary-500" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-850 mb-3">No active lobbies</h3>
              <p className="text-neutral-750 max-w-md mx-auto leading-relaxed">
                Check your internet connection. New lobbies are created regularly throughout the day.
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}