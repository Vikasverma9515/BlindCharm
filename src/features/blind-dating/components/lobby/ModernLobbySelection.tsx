'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Users, Heart, Coffee, Music, Book, Gamepad2, Camera, Palette, Dumbbell, Plus, ArrowRight, LogOut, Settings, User, HandMetal, HelpCircle, ChevronDown } from 'lucide-react'
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
import QuickContactButtons from '@/components/contact/QuickContactButtons'
import FloatingContactButton from '@/components/contact/FloatingContactButton'
import { Search, X } from 'lucide-react'
import { Share2, Copy, MessageCircle, ExternalLink } from 'lucide-react'
import ConnectRequests from './ConnectRequests'



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
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredLobbies, setFilteredLobbies] = useState<Lobby[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)


  const [showShareModal, setShowShareModal] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const generateShareContent = (lobby: Lobby) => {
    // Use environment variable or fallback
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blindcharm.com'
    const lobbyUrl = `${baseUrl}/lobby/${lobby.id}`

    const message = `🎯✨ Join "${lobby.name}" on BlindCharm!

💫 ${lobby.description || 'Connect with amazing people through authentic conversations'}

🔥 ${lobby.participant_count} people are already vibing
🎨 Theme: ${lobby.theme}

✨ Why BlindCharm?
💕 Join lobby where you meet like minded people
❤️ Real connections, not superficial swipes
🎭 Personality over photos
💬 Anonymous chats that reveal true chemistry

🚀 Ready to join? Tap here:
${lobbyUrl}

#BlindCharm #RealConnections #${lobby.theme.replace(/\s+/g, '')}`

    return { message, url: lobbyUrl }
  }

  // Add share functions
  const shareToWhatsApp = (lobby: Lobby) => {
    const { message } = generateShareContent(lobby)
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const copyShareLink = async (lobby: Lobby) => {
    const { message } = generateShareContent(lobby)

    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = message
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareNative = async (lobby: Lobby) => {
    const { message, url } = generateShareContent(lobby)

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join "${lobby.name}" on BlindCharm`,
          text: message,
          url: url
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      copyShareLink(lobby)
    }
  }


  // Create search suggestions
  const getSearchSuggestions = () => {
    const suggestions = new Set<string>()

    // Add all lobby names
    activeLobbies.forEach(lobby => {
      suggestions.add(lobby.name)
      suggestions.add(lobby.theme)
    })

    // Add popular themes that might not have active lobbies
    const popularThemes = ['Dating', 'Coffee Chat', 'Music Lovers', 'Gaming', 'Book Club', 'Photography', 'Art & Design', 'Fitness']
    popularThemes.forEach(theme => suggestions.add(theme))

    // Filter based on search query
    if (!searchQuery.trim()) {
      return Array.from(suggestions).slice(0, 8) // Show top 8 when no query
    }

    return Array.from(suggestions)
      .filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 6) // Show top 6 matches
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const suggestions = getSearchSuggestions()

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedSuggestionIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
        setSearchQuery(suggestions[selectedSuggestionIndex])
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setSelectedSuggestionIndex(-1)
    }
  }

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);

    // Find lobby by name or theme
    const matchedLobby = activeLobbies.find(
      lobby => lobby.name === suggestion || lobby.theme === suggestion
    );

    if (matchedLobby) {
      if (userJoinedLobbyId === matchedLobby.id) {
        // Already joined this lobby, navigate
        router.push(`/lobby/${matchedLobby.id}`);
      } else if (userJoinedLobbyId === null) {
        // Not in any lobby, join
        handleJoinLobby(matchedLobby.id);
      } else {
        // Already in another lobby, navigate to that lobby
        router.push(`/lobby/${userJoinedLobbyId}`);
      }
    }
  }

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLobbies(activeLobbies)
    } else {
      const filtered = activeLobbies.filter(lobby =>
        lobby.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lobby.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lobby.description && lobby.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredLobbies(filtered)
    }
  }, [activeLobbies, searchQuery])

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
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.search-container')) {
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
      }
    }

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSuggestions])


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
                {/* {isAdmin && ( */}
                <>
                  {/* <AdminBadge size="sm" /> */}

                  <ModernButton
                    variant="primary"
                    size="sm"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <Plus size={12} className="mr-2" />
                    Create Lobby
                  </ModernButton>
                </>
                {/* )} */}
                <div className="flex items-center gap-2">
                  {session?.user?.id && activeLobbies.map(lobby => (
                    <ConnectRequests
                      key={lobby.id}
                      lobbyId={lobby.id}
                      currentUserId={session.user.id}
                    />
                  ))}
                </div>
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
                  {/* {session?.user?.id && userJoinedLobbyId && ( */}
                  {session?.user?.id && userJoinedLobbyId && (
                    <ConnectRequests lobbyId={userJoinedLobbyId} currentUserId={session.user.id} />
                  )}

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
                  {/* {isAdmin && ( */}
                  <ModernButton
                    variant="primary"
                    size="sm"
                    onClick={() => setShowCreateModal(true)}
                    className="flex-1 mr-4"
                  >
                    {/* <Plus size={16} className="mr-2" /> */}
                    Create Lobby
                  </ModernButton>
                  {/* )} */}
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
                      {activeLobbies.length} Lobbies
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Search Section with Dropdown */}
          <div className="relative">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 z-10" />
              <input
                type="text"
                placeholder="Search or browse all lobbies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
                className="w-full pl-11 pr-20 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent text-neutral-850 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm shadow-sm transition-all duration-200"
              />

              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                {/* Show All Button */}
                <button
                  onClick={() => {
                    setShowSuggestions(!showSuggestions)
                    setSearchQuery('')
                  }}
                  className="text-gray-400 hover:text-primary-500 transition-colors p-1 rounded"
                  title="Browse all lobbies"
                >
                  <ChevronDown size={16} className={`transform transition-transform ${showSuggestions ? 'rotate-180' : ''}`} />
                </button>

                {/* Clear Button */}
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setShowSuggestions(false)
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Dropdown Suggestions */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg z-50 max-h-60 overflow-y-auto">
                {(() => {
                  const suggestions = getSearchSuggestions()

                  if (suggestions.length === 0) {
                    return (
                      <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
                        No matches found
                      </div>
                    )
                  }

                  return (
                    <div className="py-2">
                      {/* Section Headers */}
                      {!searchQuery && (
                        <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Browse All Lobbies
                        </div>
                      )}

                      {suggestions.map((suggestion, index) => {
                        const isLobbyName = activeLobbies.some(lobby => lobby.name === suggestion)
                        const isTheme = activeLobbies.some(lobby => lobby.theme === suggestion)

                        // Fix: Calculate total participants, not lobby count
                        const participantCount = activeLobbies
                          .filter(lobby => lobby.name === suggestion || lobby.theme === suggestion)
                          .reduce((total, lobby) => total + lobby.participant_count, 0)

                        // Get matching lobbies count for themes (useful for themes with multiple lobbies)
                        const matchingLobbiesCount = activeLobbies.filter(lobby =>
                          lobby.name === suggestion || lobby.theme === suggestion
                        ).length

                        return (
                          <button
                            key={`${suggestion}-${index}`}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between group ${selectedSuggestionIndex === index ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0">
                                {isLobbyName ? (
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                ) : (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {suggestion}
                                </span>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {isLobbyName ? 'Lobby name' : `Theme category ${matchingLobbiesCount > 1 ? `(${matchingLobbiesCount} lobbies)` : ''}`}
                                </div>
                              </div>
                            </div>

                            {participantCount > 0 && (
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Users size={12} />
                                <span>{participantCount}</span>
                              </div>
                            )}
                          </button>
                        )
                      })}

                      {/* Quick Actions */}
                      <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                        <button
                          onClick={() => {
                            setSearchQuery('')
                            setShowSuggestions(false)
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          ✨ Show all lobbies
                        </button>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}

            {/* Compact Results Summary */}
            {searchQuery && !showSuggestions && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 px-2">
                {filteredLobbies.length === 0
                  ? `No results for "${searchQuery}"`
                  : `${filteredLobbies.length} found`
                }
              </p>
            )}
          </div>


          <div className='flex justify-center md:hidden size-1/2 m-auto'>
            <div style={{ height: '190px', position: 'relative' }}>
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
          <div className="mt-0   rounded-xl ">
            {/* <h5 className="font-medium text-gray-900 dark:text-white mb-3 text-center">
              💬 Help Us Improve
            </h5> */}
            <QuickContactButtons />
            {/* <p className="text-xs text-gray-500 dark:text-gray-400 text-center lg:mt-4 ">
                    Your feedback helps us make BlindCharm better!
                  </p> */}
          </div>




          <div className="w-full">
            <OnboardingCards />
          </div>


          {/* Lobbies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* {[...activeLobbies] */}
            {[...filteredLobbies]
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

                              {/* Notification Bell */}
                              {session?.user?.id && (
                                <div className="absolute top-4 right-4 z-20 scale-70">
                                  <ConnectRequests lobbyId={lobby.id} currentUserId={session.user.id} />
                                </div>
                              )}
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

                        {/* Action Area
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
                        </div> */}
                        {/* Action Area - Updated with Share Button */}
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
                              <div className="flex items-center gap-1">
                                {/* Share Button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setShowShareModal(lobby.id)
                                  }}
                                  className="p-2.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-full transition-all duration-200"
                                  title="Share lobby"
                                >
                                  <Share2 size={18} />
                                </button>
                                {/* Leave Button */}
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
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${canJoin ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                  {isLoading ? (
                                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                  ) : (
                                    <Plus size={18} className="text-white" />
                                  )}
                                </div>
                                <div>
                                  <span className={`font-bold text-base block transition-colors duration-200 ${canJoin ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`}>
                                    {isLoading ? 'Joining...' : 'Join Lobby'}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {canJoin ? 'Tap anywhere to join' : 'Already in another lobby'}
                                  </span>
                                </div>
                              </div>

                              {/* Share Button for non-joined lobbies */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setShowShareModal(lobby.id)
                                }}
                                className="p-2.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-full transition-all duration-200"
                                title="Share lobby"
                              >
                                <Share2 size={18} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
          </div>
          {/* Enhanced Share Modal */}
          {showShareModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowShareModal(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {(() => {
                  const lobby = activeLobbies.find(l => l.id === showShareModal)
                  if (!lobby) return null

                  const themeConfig = getThemeConfig(lobby.theme)
                  const IconComponent = themeConfig.icon

                  return (
                    <>
                      {/* Preview Section */}
                      <div className="mb-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
                          Share Preview
                        </h2>

                        {/* WhatsApp-style Preview */}
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            {/* Mock link preview */}
                            <div className="flex items-start gap-3">
                              <div className={`w-16 h-16 ${themeConfig.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                <IconComponent size={24} className={themeConfig.iconColor} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-sm text-gray-900 mb-1 line-clamp-2">
                                  🎯 Join "{lobby.name}" on BlindCharm!
                                </h3>
                                <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                  💫 {lobby.description || 'Connect through personality, not photos'} • 🔥 {lobby.participant_count} members
                                </p>
                                <span className="text-xs text-gray-400">blindcharm.com</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {lobby.participant_count > 0 && (
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex -space-x-2">
                              {Array.from({ length: Math.min(lobby.participant_count, 5) }).map((_, i) => (
                                <div
                                  key={i}
                                  className="w-8 h-8 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                                >
                                  {String.fromCharCode(65 + i)} {/* A, B, C, etc. */}
                                </div>
                              ))}
                              {lobby.participant_count > 5 && (
                                <div className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center text-gray-600 text-xs font-bold">
                                  +{lobby.participant_count - 5}
                                </div>
                              )}
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">are already chatting</span>
                          </div>
                        )}

                        {/* Message preview */}
                        <div className="bg-gray-50 rounded-2xl p-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900 mb-2">Your message:</div>
                            <div className="text-gray-700 whitespace-pre-line text-xs leading-relaxed">
                              {`🎯✨ *${lobby.name}* on BlindCharm!

💫 ${lobby.description || 'Connect with amazing people'}

🔥 *${lobby.participant_count} people* already vibing
🎨 Theme: *${lobby.theme}*

✨ Real connections, not superficial swipes
🎭 Personality over photos

🚀 Join now!`}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Share Options */}
                      <div className="space-y-3">
                        {/* WhatsApp Share */}
                        <button
                          onClick={() => {
                            shareToWhatsApp(lobby)
                            setShowShareModal(null)
                          }}
                          className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          <MessageCircle size={24} />
                          <div className="text-left flex-1">
                            <div className="font-semibold">Share on WhatsApp</div>
                            <div className="text-sm opacity-90">Beautiful link preview included</div>
                          </div>
                          <ExternalLink size={16} />
                        </button>

                        {/* Copy Link */}
                        <button
                          onClick={() => copyShareLink(lobby)}
                          className="w-full flex items-center gap-4 p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-2xl transition-colors"
                        >
                          <Copy size={24} />
                          <div className="text-left flex-1">
                            <div className="font-semibold">
                              {copied ? '✅ Copied!' : 'Copy Rich Message'}
                            </div>
                            <div className="text-sm opacity-70">
                              {copied ? 'Formatted message copied' : 'Copy with emojis & formatting'}
                            </div>
                          </div>
                        </button>

                        {/* Instagram Stories / Social */}
                        <button
                          onClick={() => {
                            // Copy the OG image URL for social sharing
                            const ogUrl = `${window.location.origin}/api/og-lobby?name=${encodeURIComponent(lobby.name)}&theme=${encodeURIComponent(lobby.theme)}&count=${lobby.participant_count}`
                            navigator.clipboard.writeText(ogUrl)
                          }}
                          className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl transition-all"
                        >
                          <Camera size={24} />
                          <div className="text-left flex-1">
                            <div className="font-semibold">Social Media</div>
                            <div className="text-sm opacity-90">Copy image for Instagram/stories</div>
                          </div>
                        </button>
                      </div>

                      {/* Close */}
                      <button
                        onClick={() => setShowShareModal(null)}
                        className="w-full mt-6 py-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )
                })()}
              </motion.div>
            </motion.div>
          )}
          {/* Updated Empty State */}
          {filteredLobbies.length === 0 && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 bg-primary-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                {searchQuery ? (
                  <Search className="h-12 w-12 text-primary-500" />
                ) : (
                  <Users className="h-12 w-12 text-primary-500" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-neutral-850 mb-3">
                {searchQuery ? 'No matching lobbies' : 'No active lobbies'}
              </h3>
              <p className="text-neutral-750 max-w-md mx-auto leading-relaxed">
                {searchQuery
                  ? `Try adjusting your search terms or browse all available lobbies.`
                  : 'Check your internet connection. New lobbies are created regularly throughout the day.'
                }
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-full transition-colors"
                >
                  Clear Search
                </button>
              )}
            </motion.div>
          )}

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
