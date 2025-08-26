'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Users, Heart, Coffee, Music, Book, Gamepad2, Camera, Palette, Dumbbell, Plus, ArrowRight, LogOut, Settings, User, HandMetal, HelpCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import CreateLobbyModal from './CreateLobbyModal'
import AdminBadge from '@/components/ui/AdminBadge'
import { Roboto } from 'next/font/google'
// import { openSans } from '@/app/fonts'
import { boldonse } from '@/app/fonts'
import { righteous, specialGothic } from '@/app/fonts'
import ScrollStack, { ScrollStackItem } from '@/blocks/Components/ScrollStack/ScrollStack'
import Carousel from '@/blocks/Components/Carousel/Carousel'
import OnboardingCards from './OnboardingCards'




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
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false)
  const [isFirstTime, setIsFirstTime] = useState(false)
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

    // Check if this is a first-time user
    const hasSeenGuide = localStorage.getItem('blindcharm-seen-guide')
    if (!hasSeenGuide && session?.user?.id) {
      setShowWelcomeGuide(true)
      setIsFirstTime(true)
    } else {
      setIsFirstTime(false)
    }
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

  const handleDismissGuide = () => {
    setShowWelcomeGuide(false)
    setIsFirstTime(false)
    localStorage.setItem('blindcharm-seen-guide', 'true')
  }


  return (
    <div className="min-h-screen bg-gray-50  dark:from-indigo-900 dark:via-sky-900 dark:bg-gray-900 pb-20 md:pb-8 transition-colors duration-300">
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

          {/* Welcome Guide Modal */}
          {showWelcomeGuide && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={handleDismissGuide}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16  rounded-full flex items-center justify-center mx-auto mb-4">
                    {/* <Heart size={32} className="text-white" /> */}
                    <img
                      src="/logo2.png"
                      alt=""
                      className='h-8 w-15'
                    />
                  </div>
                  <h2 className="text-2xl font-blindcharm-logo text-neutral-850 dark:text-gray-100 mb-2">
                    Welcome to BlindCharm! 👋
                  </h2>
                  <p className="text-neutral-700 dark:text-gray-300">
                    Let's get you started with our unique blind dating experience
                  </p>
                </div>
                <div className="space-y-4 mb-8">
                  {/* Step 1 */}
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 dark:text-primary-400 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-850 dark:text-gray-100 mb-1">Enter the Lobby</h3>
                      <p className="text-sm text-neutral-700 dark:text-gray-300">
                        Step into a vibe-driven space where everyone starts with just words—no photos, no pressure.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 dark:text-primary-400 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-850 dark:text-gray-100 mb-1">Chat & Connect</h3>
                      <p className="text-sm text-neutral-700 dark:text-gray-300">
                        Hang out in the lobby, share thoughts, and vibe with others. Blind matches happen daily at <strong>12:00 AM, 6:00 AM </strong>
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 dark:text-primary-400 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-850 dark:text-gray-100 mb-1">Reveal & Go Deeper</h3>
                      <p className="text-sm text-neutral-700 dark:text-gray-300">
                        Once matched, chat privately and when both agree, reveal your identities—turning conversations into real connections.
                      </p>
                    </div>
                  </div>
                </div>



                <div className="flex gap-3">
                  <Link
                    href="/how-it-works"
                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 px-6 rounded-full font-medium transition-colors text-center"
                    onClick={handleDismissGuide}
                  >
                    Learn More
                  </Link>
                  <button
                    onClick={handleDismissGuide}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-neutral-850 dark:text-gray-100 py-3 px-6 rounded-full font-medium transition-colors"
                  >
                    Got It!
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Header Section */}
          <div className="space-y-3">
            {/* Desktop Header */}
            <div className="hidden md:flex justify-between items-center">
              <div className="flex-1">
                <h1 className="flex items-start text-2xl md:text-4xl lg:text-2xl font-blindcharm-brand tracking-tight text-neutral-850 dark:text-gray-100 mb-2 ">
                  Hello, {profile?.full_name || profile?.username || profile?.email || 'BlindCharm User'}
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
                      <Plus size={12} className="mr-2" />
                      Create Lobby
                    </ModernButton>
                  </>
                )}
                <div className="flex items-center space-x-2 bg-secondary-50 dark:bg-gray-800 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-neutral-750 dark:text-gray-300 font-medium">
                    {activeLobbies.length} Lobbies
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Header */}
            <div className="md:hidden space-y-2 ">
              <div className="">
                <div className={roboto.className}>
                  <h1 className={`${specialGothic.className} text-3xl font-bold tracking-tight text-neutral-850 dark:text-gray-100 mb-1 blindcharm-heading flex items-center`} >
                    Hello, {profile?.full_name || profile?.username || profile?.email || 'Guest'}
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
                <div className="flex items-center justify-between gap-3 ">
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
                      className="flex-1 mr-4"
                    >
                      {/* <Plus size={16} className="mr-2" /> */}
                      Create Lobby
                    </ModernButton>
                  )}
                  <div className="flex items-center space-x-1 bg-lime-200 dark:bg-gray-800 px-2 py-2 rounded-full">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-neutral-750 dark:text-gray-300 font-medium">
                      {activeLobbies.length} Lobbies
                    </span>
                  </div>
                </div>
              )}
              {!isAdmin && (
                <div className="flex items-end justify-between gap-3">
                  <div className="flex items-center space-x-2 bg-lime-50 dark:bg-gray-800 px-4 py-2 rounded-full">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-neutral-750 dark:text-gray-300 font-medium">
                      {activeLobbies.length} active
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Guide Section */}
          {/* <ModernCard className={`bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-primary-200 dark:border-primary-700 ${isFirstTime ? 'ring-2 ring-primary-300 dark:ring-primary-600' : ''}`}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                  <HelpCircle size={24} className="text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-850 dark:text-gray-100 mb-2">
                  New to BlindCharm? Here's how it works:
                </h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm text-neutral-700 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-xs">1</div>
                    <span>Join a lobby that matches your interests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-xs">2</div>
                    <span>Chat anonymously with other members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-xs">3</div>
                    <span>Connect based on personality, not photos</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <Link 
                    href="/how-it-works"
                    className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm transition-colors"
                  >
                    <span>Learn more about BlindCharm</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </ModernCard> */}

          {/* ScrollStack Section */}
          {/* <div className="w-full max-w-3xl mx-auto my-8"> */}
          {/* <ScrollStack>
              <div className="flex space-x-6 overflow-x-auto pb-4">
                <ScrollStackItem>
                  <div className="min-w-[250px] bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-6">
                    <h2 className="font-bold text-lg mb-2">Card 1</h2>
                    <p>This is the first card in the stack</p>
                  </div>
                </ScrollStackItem>
                <ScrollStackItem>
                  <div className="min-w-[250px] bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-6">
                    <h2 className="font-bold text-lg mb-2">Card 2</h2>
                    <p>This is the second card in the stack</p>
                  </div>
                </ScrollStackItem>
                <ScrollStackItem>
                  <div className="min-w-[250px] bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-6">
                    <h2 className="font-bold text-lg mb-2">Card 3</h2>
                    <p>This is the third card in the stack</p>
                  </div>
                </ScrollStackItem>
              </div>
            </ScrollStack> */}
          {/* </div> */}

          <div className='flex justify-center md:hidden'>
            <div style={{ height: '250px', position: 'relative' }}>
              <Carousel
                baseWidth={350}
                autoplay={true}
                autoplayDelay={5000}
                pauseOnHover={true}
                loop={true}
                round={false}
              />
            </div>
          </div>
          <div className="w-full">
            <OnboardingCards />
          </div>
          {/* <div className="w-full">
            <OnboardingCards />
          </div> */}

          {/* Lobbies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[...activeLobbies]
              .sort((a, b) => {
                if (a.id === userJoinedLobbyId) return -1;
                if (b.id === userJoinedLobbyId) return 1;
                return 0;
              })
              .map((lobby, index) => {
                const themeConfig = getThemeConfig(lobby.theme)
                const IconComponent = themeConfig.icon
                const isJoined = userJoinedLobbyId === lobby.id
                const isLoading = loading === lobby.id
                const canJoin = !isLoading && userJoinedLobbyId === null

                const handleCardClick = () => {
                  if (isJoined) {
                    router.push(`/lobby/${lobby.id}`)
                  } else if (canJoin) {
                    handleJoinLobby(lobby.id)
                  }
                }

                return (
                  <motion.div
                    key={lobby.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    {/* Modern Card with Floating Content */}
                    <div
                      className={`
                        relative group transition-all duration-300 cursor-pointer
                        ${canJoin || isJoined ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'}
                      `}
                      onClick={handleCardClick}
                    >
                      {/* Image/Icon Section */}
                      <div className={`
                        relative aspect-[16/9] overflow-hidden rounded-3xl shadow-lg
                        transition-all duration-300 
                        ${isJoined ? 'ring-2 ring-primary-500 shadow-xl' : 'hover:shadow-xl hover:-translate-y-1'}
                      `}>
                        {lobby.image_url ? (
                          <img
                            src={lobby.image_url}
                            alt={lobby.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className={`w-full h-full ${themeConfig.bgColor} flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}>
                            <IconComponent size={64} className={themeConfig.iconColor} />
                          </div>
                        )}

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                        {/* Status Indicators */}
                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                          {/* Theme Badge */}
                          <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-gray-800 rounded-full text-xs font-semibold shadow-sm">
                            {lobby.theme}
                          </span>

                          {/* Joined Indicator */}
                          {isJoined && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 rounded-full shadow-sm">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                              <span className="text-white text-xs font-semibold">Joined</span>
                            </div>
                          )}
                        </div>

                        {/* Bottom Content on Image */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-white font-bold text-xl mb-2 drop-shadow-lg line-clamp-1">
                            {lobby.name}
                          </h3>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-white/90">
                              <Users size={16} />
                              <span className="text-sm font-semibold">{lobby.participant_count} members</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <span className="text-white/90 text-sm font-semibold">Live</span>
                            </div>
                          </div>
                        </div>

                        {/* Loading Overlay on Image */}
                        {isLoading && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-3xl">
                            <div className="flex flex-col items-center gap-3">
                              <div className="animate-spin h-10 w-10 border-3 border-white border-t-transparent rounded-full" />
                              <span className="text-sm font-semibold text-white">
                                {isJoined ? 'Entering...' : 'Joining...'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Floating Content Section - No Background */}
                      <div className="mt-2 px-1 font-black">
                        {/* Description */}
                        <p className="text-neutral-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-2 mb-1">
                          {lobby.description || 'Join the conversation and meet new people!'}
                        </p>

                        {/* Action Area */}
                        <div className="flex items-center justify-between">
                          {isJoined ? (
                            <>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center shadow-md">
                                  <ArrowRight size={18} className="text-white" />
                                </div>
                                <div>
                                  <span className="text-primary-600 dark:text-primary-400 font-bold text-base block">Enter Lobby</span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">Tap anywhere to enter</span>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleLeaveLobby(lobby.id)
                                }}
                                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-200"
                                disabled={isLoading}
                              >
                                <LogOut size={18} />
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${canJoin ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                                  }`}>
                                  {isLoading ? (
                                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                  ) : (
                                    <Plus size={18} className="text-white" />
                                  )}
                                </div>
                                <div>
                                  <span className={`font-bold text-base block transition-colors duration-200 ${canJoin ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'
                                    }`}>
                                    {isLoading ? 'Joining...' : 'Join Lobby'}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {canJoin ? 'Tap anywhere to join' : 'Already in another lobby'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
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

      {/* Floating Help Button */}
      <Link href="/how-it-works">
        <motion.div
          className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-40"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <div className="w-14 h-14 bg-primary-500 hover:bg-primary-600 rounded-full shadow-lg flex items-center justify-center text-white transition-colors duration-200">
            <HelpCircle size={24} />
          </div>
          <div className="absolute -top-12 right-0 bg-gray-900 text-white text-xs px-3 py-1 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            How BlindCharm Works
          </div>
        </motion.div>
      </Link>
    </div>
  )
}