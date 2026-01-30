'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Users, ArrowRight, Heart, Coffee, Music, Book, Gamepad2, Camera, Palette, Dumbbell } from 'lucide-react'
import Link from 'next/link'

interface Lobby {
  id: string
  theme: string
  name: string
  participant_count: number
  status: string
  description?: string
  image_url?: string | null
  user_id: string
}

// Theme configuration
const getThemeConfig = (theme: string) => {
  const themeMap: Record<string, { icon: any; bgColor: string; iconColor: string; gradient: string }> = {
    'Dating': {
      icon: Heart,
      bgColor: 'bg-rose-50 dark:bg-rose-900/20',
      iconColor: 'text-rose-500',
      gradient: 'from-rose-400 to-pink-500'
    },
    'Coffee Chat': {
      icon: Coffee,
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: 'text-amber-600',
      gradient: 'from-amber-400 to-orange-500'
    },
    'Music Lovers': {
      icon: Music,
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-500',
      gradient: 'from-purple-400 to-indigo-500'
    },
    'Book Club': {
      icon: Book,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-500',
      gradient: 'from-blue-400 to-cyan-500'
    },
    'Gaming': {
      icon: Gamepad2,
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-500',
      gradient: 'from-emerald-400 to-teal-500'
    },
    'Photography': {
      icon: Camera,
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
      iconColor: 'text-cyan-500',
      gradient: 'from-cyan-400 to-blue-500'
    },
    'Art & Design': {
      icon: Palette,
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      iconColor: 'text-pink-500',
      gradient: 'from-pink-400 to-rose-500'
    },
    'Fitness': {
      icon: Dumbbell,
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      iconColor: 'text-orange-500',
      gradient: 'from-orange-400 to-red-500'
    }
  }

  return themeMap[theme] || {
    icon: Users,
    bgColor: 'bg-slate-50 dark:bg-slate-900/20',
    iconColor: 'text-slate-500',
    gradient: 'from-slate-400 to-gray-500'
  }
}

export default function JoinLobbyClient({ lobbyId }: { lobbyId: string }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [lobby, setLobby] = useState<Lobby | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    fetchLobby()
  }, [lobbyId])

  const fetchLobby = async () => {
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
        .eq('id', lobbyId)
        .eq('status', 'waiting')
        .single()

      if (error) throw error

    //   const participantCount = data.lobby_participants?.filter(p => p.status === 'waiting').length || 0
      
    //   setLobby({
    //     ...data,
    //     participant_count: participantCount
    //   })
    } catch (error: any) {
      console.error('Error fetching lobby:', error)
      setError('Lobby not found or no longer active')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinLobby = async () => {
    if (!session?.user || !lobby) return
    
    setJoining(true)
    setError(null)

    try {
      // First check if user is already in any lobby
      const { data: existingParticipation, error: checkError } = await supabase
        .from('lobby_participants')
        .select('lobby_id')
        .eq('user_id', session.user.id)
        .eq('status', 'waiting')
        .maybeSingle()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingParticipation && existingParticipation.lobby_id !== lobby.id) {
        setError('You are already in another lobby. Please leave it first to join this one.')
        return
      }

      if (existingParticipation && existingParticipation.lobby_id === lobby.id) {
        // User is already in this lobby, just redirect
        router.push(`/lobby/${lobby.id}`)
        return
      }

      // Join the lobby
      const { error: joinError } = await supabase
        .from('lobby_participants')
        .insert({
          user_id: session.user.id,
          lobby_id: lobby.id,
          status: 'waiting'
        })

      if (joinError) throw joinError

      // Redirect to lobby
      router.push(`/lobby/${lobby.id}`)
    } catch (error: any) {
      console.error('Error joining lobby:', error)
      
      if (error.code === '23505') {
        setError('You are already in this lobby!')
        // Still redirect since they're already in
        setTimeout(() => router.push(`/lobby/${lobby.id}`), 2000)
      } else {
        setError('Failed to join lobby. Please try again.')
      }
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin h-16 w-16 border-4 border-primary-200 border-t-primary-500 rounded-full mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-2xl">🎯</div>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading your invitation...</p>
        </div>
      </div>
    )
  }

  if (error && !lobby) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="text-8xl mb-6">😕</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Lobby Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            This lobby might have ended, reached capacity, or the link might be invalid.
          </p>
          <Link 
            href="/lobby-selection" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white px-8 py-4 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Browse Active Lobbies
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    )
  }

  if (!lobby) return null

  const themeConfig = getThemeConfig(lobby.theme)
  const IconComponent = themeConfig.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-lg w-full border border-white/20 dark:border-gray-700/20"
      >
        {/* Header with animated icon */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className={`w-20 h-20 bg-gradient-to-r ${themeConfig.gradient} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}
          >
            <IconComponent size={32} className="text-white" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3"
          >
            You're Invited! 🎉
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 dark:text-gray-400 text-lg"
          >
            Join this amazing BlindCharm lobby
          </motion.p>
        </div>

        {/* Lobby Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`${themeConfig.bgColor} rounded-2xl p-6 mb-6 border border-gray-100 dark:border-gray-700`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                {lobby.theme}
              </span>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            {lobby.name}
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            {lobby.description || 'Join the conversation and meet amazing people through authentic anonymous chats! Connect based on personality, not photos.'}
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 ${themeConfig.bgColor} rounded-lg`}>
                <Users size={18} className={themeConfig.iconColor} />
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-gray-100">
                  {lobby.participant_count} members
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {lobby.participant_count === 0 ? 'Be the first!' : 'already joined'}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Actions */}
        {status === 'loading' ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full"></div>
          </div>
        ) : session ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <button
              onClick={handleJoinLobby}
              disabled={joining}
              className={`w-full bg-gradient-to-r ${themeConfig.gradient} hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-105 hover:-translate-y-0.5`}
            >
              {joining ? (
                <>
                  <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
                  Joining...
                </>
              ) : (
                <>
                  Join {lobby.name} 
                  <ArrowRight size={20} />
                </>
              )}
            </button>
            
            <Link 
              href="/lobby-selection"
              className="w-full block text-center py-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors"
            >
              Browse Other Lobbies
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(`/join-lobby/${lobby.id}`)}`}
              className={`w-full bg-gradient-to-r ${themeConfig.gradient} hover:shadow-lg text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-105 hover:-translate-y-0.5`}
            >
              Sign In to Join
              <ArrowRight size={20} />
            </Link>
            
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                New to BlindCharm?
              </p>
              <Link
                href={`/register?callbackUrl=${encodeURIComponent(`/join-lobby/${lobby.id}`)}`}
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold text-sm border-b border-current"
              >
                Create Your Account
              </Link>
                        </div>
          </motion.div>
        )}

        {/* BlindCharm Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <img src="/logo2.png" alt="BlindCharm" className="h-6 w-15" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Connect through personality, not photos
            </p>
            <div className="flex justify-center gap-6 text-xs text-gray-400 dark:text-gray-500">
              <span>🎭 Anonymous Chats</span>
              <span>❤️ Real Connections</span>
              <span>✨ Blind Dating</span>
            </div>
          </div>
        </motion.div>

        {/* Floating particles animation (optional) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary-200 dark:bg-primary-800 rounded-full opacity-30"
              initial={{ 
                x: Math.random() * 400, 
                y: Math.random() * 600,
                scale: 0 
              }}
              animate={{ 
                y: [null, Math.random() * 600],
                scale: [0, 1, 0],
                opacity: [0, 0.3, 0]
              }}
              transition={{ 
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}