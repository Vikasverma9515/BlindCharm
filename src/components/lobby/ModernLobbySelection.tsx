'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Users, Heart, Coffee, Music, Book, Gamepad2, Camera, Palette, Dumbbell, Plus, ArrowRight, LogOut, Settings, User, HandMetal  } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import CreateLobbyModal from './CreateLobbyModal'
import AdminBadge from '@/components/ui/AdminBadge'
import { Roboto } from 'next/font/google'
// import { openSans } from '@/app/fonts'
import { boldonse } from '@/app/fonts'
import {  righteous, specialGothic } from '@/app/fonts'



const roboto = Roboto({
  weight: '800',
  subsets: ['latin'],
});


interface Lobby {
  id: string
  theme: string
  name: string
  participant_count: number
  status: string
  created_at: string
  ends_at: string
  description?: string
  image_url?: string | null
  lobby_participants?: any[]
}
interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  gender: 'male' | 'female' | 'other';
  dob: string;
  bio: string;
  interests: string[];
  profile_picture: string | null;
  is_admin?: boolean;
  height: number;
  occupation: string;
  education: string;
  languages: string[];
  hobbies: string[];
  looking_for: string[];
  dealbreakers: string[];
  personality_tags: string[];
  lifestyle_tags: string[];
  location: {
    city: string;
    country: string;
  } | string;
  photos: { url: string; is_primary: boolean }[];
  match_preferences: {
    age_range: [number, number];
    distance: number;
    height_range: [number, number];
  };
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
        bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100/50 dark:border-gray-700/50 backdrop-blur-sm 
        transition-all duration-300
        ${className.includes('p-0') ? '' : 'p-6 md:p-8'}
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
  const [isAdmin, setIsAdmin] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<{ full_name?: string; username?: string; email?: string; gender?: string } | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) return
      const { data } = await supabase
        .from('users')
        .select('full_name,username,email')
        .eq('id', session.user.id)
        .single()
      setProfile(data)
    }
    fetchProfile()
  }, [session])

  useEffect(() => {
    let timer: NodeJS.Timeout

    const updateInfo = async () => {
      await Promise.all([
        checkUserLobbyStatus(),
        fetchActiveLobbies(),
        checkAdminStatus()
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
        .order('created_at', { ascending: false })

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

  const checkAdminStatus = async () => {
    if (!session?.user?.id) return
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', session.user.id)
        .single()

      if (error) throw error
      setIsAdmin(data?.is_admin || false)
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
    }
  }

  const handleJoinLobby = async (lobbyId: string) => {
    if (!session?.user) {
      router.push('/login')
      return
    }
    
    // Clear any previous errors
    setError(null)
    setLoading(lobbyId)
    
    try {
      // First check if user is already in a lobby
      const { data: existingParticipation, error: checkError } = await supabase
        .from('lobby_participants')
        .select('lobby_id')
        .eq('user_id', session.user.id)
        .eq('status', 'waiting')
        .maybeSingle()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingParticipation && existingParticipation.lobby_id !== lobbyId) {
        setError('You are already in another lobby. Please leave it first.')
        return
      }

      // Attempt to join the lobby
      const { error } = await supabase
        .from('lobby_participants')
        .insert({
          user_id: session.user.id,
          lobby_id: lobbyId,
          status: 'waiting'
        })

      if (error) {
        console.error('Database error:', error)
        
        // Provide more specific error messages
        if (error.code === '23505') { // Unique constraint violation
          setError('You are already in this lobby')
        } else if (error.code === '42501') { // Insufficient privilege
          setError('Unable to join lobby. Please check your permissions.')
        } else if (error.message?.includes('RLS')) {
          setError('Permission denied. Please try logging out and back in.')
        } else {
          setError(`Failed to join lobby: ${error.message}`)
        }
        return
      }

      setUserJoinedLobbyId(lobbyId)
      await fetchActiveLobbies()
      
      // Success feedback
      console.log('Successfully joined lobby:', lobbyId)
      
    } catch (error: any) {
      console.error('Error joining lobby:', error)
      setError(error.message || 'An unexpected error occurred while joining the lobby')
    } finally {
      setLoading(null)
    }
  }

  const handleLeaveLobby = async (lobbyId: string) => {
    if (!session?.user) return
    
    // Clear any previous errors
    setError(null)
    setLoading(lobbyId)
    
    try {
      const { error } = await supabase
        .from('lobby_participants')
        .delete()
        .match({ 
          user_id: session.user.id, 
          lobby_id: lobbyId 
        })

      if (error) {
        console.error('Database error:', error)
        
        // Provide more specific error messages
        if (error.code === '42501') { // Insufficient privilege
          setError('Unable to leave lobby. Please check your permissions.')
        } else if (error.message?.includes('RLS')) {
          setError('Permission denied. Please try logging out and back in.')
        } else {
          setError(`Failed to leave lobby: ${error.message}`)
        }
        return
      }

      setUserJoinedLobbyId(null)
      await fetchActiveLobbies()
      
      // Success feedback
      console.log('Successfully left lobby:', lobbyId)
      
    } catch (error: any) {
      console.error('Error leaving lobby:', error)
      setError(error.message || 'An unexpected error occurred while leaving the lobby')
    } finally {
      setLoading(null)
    }
  }
  

  return (
    <div className="min-h-screen bg-gradient-to-bottom from-indigo-50 via-sky-50 to-teal-50 dark:from-indigo-900 dark:via-sky-900 dark:bg-gray-900 pb-20 md:pb-8 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 md:pt-20 pb-8"
      >
        <div className="space-y-4 md:space-y-6">
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
          <div className="space-y-3">
            {/* Desktop Header */}
            <div className="hidden md:flex justify-between items-center">
              <div className="flex-1">
                <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-neutral-850 dark:text-gray-100 mb-2 blindcharm-heading">
                   Hello, {profile?.full_name || profile?.username || profile?.email || profile?.gender || 'Guest'} 
                   <HandMetal size={24} className="ml-2" />
                </h1>
                <p className="text-neutral-750 dark:text-gray-400 text-sm md:text-base font-body">
                 Choose a lobby and join the fun!
                </p>
              </div>
              <div className="flex items-center gap-10">
                {isAdmin && (
                  <>
                    <AdminBadge size="sm" />

                    <ModernButton
                      variant="primary"
                      size="sm"
                      onClick={() => setShowCreateModal(true)}
                    >
                      <Plus size={16} className="mr-2" />
                      Create Lobby
                    </ModernButton>
                  </>
                )}
                <div className="flex items-center space-x-2 bg-secondary-50 dark:bg-gray-800 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-neutral-750 dark:text-gray-300 font-medium">
                    {activeLobbies.length} active
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Header */}
            <div className="md:hidden space-y-2 ">
              <div className="">
                <div className={roboto.className}>
                <h1 className={`${specialGothic.className} text-3xl font-bold tracking-tight text-neutral-850 dark:text-gray-100 mb-1 blindcharm-heading flex items-center`} >
                  Hello, {profile?.full_name || profile?.username || profile?.email ||  'Guest'}  
                   <HandMetal size={24} className="ml-2" />
                </h1>
                </div>
                <p className="text-neutral-750 dark:text-gray-400 text-sm font-elegant">
                  Choose a lobby and join the fun!
                </p>
                
                {/* {isAdmin && (
                  <div className="flex justify-center mt-2">
                    <AdminBadge size="sm" />
                  </div>
                )} */}
              </div>
              {isAdmin && (
              <div className="flex items-center justify-between gap-3">
                {isAdmin && (
                  <div className="flex justify-center mt-0">
                    <AdminBadge size="sm" />
                  </div>
                )}
                {isAdmin && (
                  <ModernButton
                    variant="primary"
                    size="sm"
                    onClick={() => setShowCreateModal(true)}
                    className="flex-1 mr-3"
                  >
                    <Plus size={16} className="mr-2" />
                    Create Lobby
                  </ModernButton>
                )}
                <div className="flex items-center space-x-2 bg-secondary-50 dark:bg-gray-800 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-neutral-750 dark:text-gray-300 font-medium">
                    {activeLobbies.length} active
                  </span>
                </div>
              </div>
              )}
              {!isAdmin && (
              <div className="flex items-end justify-between gap-3">
                <div className="flex items-center space-x-2 bg-secondary-50 dark:bg-gray-800 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-neutral-750 dark:text-gray-300 font-medium">
                    {activeLobbies.length} active
                  </span>
                </div>
              </div>
              )}
            </div>
          </div>
          

          {/* Lobbies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...activeLobbies]
              .sort((a, b) => {
                if (a.id === userJoinedLobbyId) return -1;
                if (b.id === userJoinedLobbyId) return 1;
                return 0;
              })
              .map((lobby, index) => {
                const themeConfig = getThemeConfig(lobby.theme)
                const IconComponent = themeConfig.icon
                
                return (
                  <motion.div
                    key={lobby.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ModernCard className="hover:shadow-float bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 overflow-hidden p-0" hover>
                      <div className="flex flex-col h-full">
                        
                        {/* Large Image Header */}
                        <div className="relative w-full aspect-[16/9] overflow-hidden">
                        
                          {lobby.image_url ? (
                            <img
                              src={lobby.image_url}
                              alt={lobby.name}
                              className="w-full h-full object-cover"
                              
                            />
                          ) : (
                            <div className={`w-full h-full ${themeConfig.bgColor} flex items-center justify-center`}>
                              <IconComponent size={64} className={themeConfig.iconColor} />
                            </div>
                          )}
                          {/* Overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                          
                          {/* Status indicator */}
                          {userJoinedLobbyId === lobby.id && (
                            <div className="absolute top-3 right-3">
                              <div className="w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                            </div>
                          )}
                          
                          {/* Theme badge */}
                          <div className="absolute bottom-3 left-3">
                            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-800 rounded-full text-xs font-medium">
                              {lobby.theme}
                            </span>
                          </div>

                          {/* Title overlay on image */}
                          <div className="absolute bottom-3 right-3">
                            <h3 className="text-white font-semibold text-lg drop-shadow-lg">
                              {lobby.name}
                            </h3>
                          </div>
                        </div>

                        {/* Compact Content */}
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div className="space-y-2">
                            <p className="text-neutral-750 dark:text-gray-300 text-xs leading-relaxed line-clamp-2">
                              {lobby.description || 'Join the conversation and meet new people!'}
                            </p>
                    
                            {/* Stats */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Users size={14} className="text-primary-500" />
                                <span className="text-xs font-medium text-neutral-750 dark:text-gray-300">
                                  {lobby.participant_count}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                  Active
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-2">
                            {userJoinedLobbyId === lobby.id ? (
                              <div className="flex gap-2">
                                <ModernButton
                                  variant="primary"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => router.push(`/lobby/${lobby.id}`)}
                                  disabled={loading === lobby.id}
                                >
                                  {loading === lobby.id ? (
                                    <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                                  ) : (
                                    <>
                                      <ArrowRight size={14} className="mr-1" />
                                      Enter
                                    </>
                                  )}
                                </ModernButton>
                                <ModernButton
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleLeaveLobby(lobby.id)}
                                  disabled={loading === lobby.id}
                                  className="px-3"
                                >
                                  <LogOut size={14} />
                                </ModernButton>
                              </div>
                            ) : (
                              <ModernButton
                                variant="primary"
                                size="sm"
                                className="w-full"
                                onClick={() => handleJoinLobby(lobby.id)}
                                disabled={loading === lobby.id || userJoinedLobbyId !== null}
                              >
                                {loading === lobby.id ? (
                                  <>
                                    <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full mr-2" />
                                    Joining...
                                  </>
                                ) : (
                                  <>
                                    <Plus size={14} className="mr-1" />
                                    Join
                                  </>
                                )}
                              </ModernButton>
                            )}
                          </div>
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

      {/* Create Lobby Modal */}
      <CreateLobbyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onLobbyCreated={fetchActiveLobbies}
      />
    </div>
  )
}