// src/components/shared/SimpleBottomNav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { DEMO_MODE, DEMO_LOBBY_USER } from '@/lib/demoData'
import {
  Home,
  Users,
  Heart,
  MessageCircle,
  User,
  LogIn,
  UserPlus,
  ShieldUser,
  VenetianMask,
  MessageCircleHeart,
  Mic,
  HelpCircle,
  AtomIcon,
  LucideMove3D,
  LucideShovel,
  EggFriedIcon,
  Airplay,
  UserCircle,
  FireExtinguisher,
  HelpCircleIcon,

} from 'lucide-react'
import LogoutButton from '../auth/LogoutButton'
// import { useNotifications } from '@/hooks/useNotifications'
// import NotificationBadge from './NotificationBadge'

interface UserProfile {
  id: string;
  full_name: string;
  username: string;
  profile_picture: string | null;
}

export default function SimpleBottomNav() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [connectPendingCount, setConnectPendingCount] = useState<number>(0)
  // const { counts } = useNotifications()
  // const [newMatchesCount, setNewMatchesCount] = useState<number>(0)

  const isActive = (path: string) => {
    if (path === '/lobby' && pathname.startsWith('/lobby')) return true
    if (path === '/voice-swipe' && pathname.startsWith('/voice-swipe')) return true
    return pathname === path
  }

  // useEffect(() => {
  //   let channel: any

  //   const loadNewMatches = async () => {
  //     if (!session?.user?.id) return
  //     try {
  //       const { count, error } = await supabase
  //         .from('matches')
  //         .select('id', { count: 'exact', head: true })
  //         .eq('user_id', session.user.id)
  //         .eq('seen', false)
  //       if (error) throw error
  //       setNewMatchesCount(count ?? 0)
  //     } catch (e) {
  //       console.error('new matches count failed', e)
  //     }
  //   }

  //   loadNewMatches()

  //   if (session?.user?.id) {
  //     channel = supabase
  //       .channel(`matches_dot_${session.user.id}`)
  //       .on('postgres_changes', { event: '*', schema: 'public', table: 'matches', filter: `user_id=eq.${session.user.id}` }, () => {
  //         loadNewMatches()
  //       })
  //       .subscribe()
  //   }

  //   return () => {
  //     try { channel?.unsubscribe() } catch { }
  //   }
  // }, [session?.user?.id])


  // Fetch user profile data for avatar
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user?.id) return
      if (DEMO_MODE) { setUserProfile(DEMO_LOBBY_USER); return }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, full_name, username, profile_picture')
          .eq('id', session.user.id)
          .single()

        if (error) throw error
        setUserProfile(data)
      } catch (err) {
        console.error('Error fetching user profile:', err)
      }
    }

    if (session?.user?.id) {
      fetchUserProfile()
    }
  }, [session])

  // Pending connect requests dot indicator
  useEffect(() => {
    let channel: any

    const loadCounts = async () => {
      if (!session?.user?.id) return
      if (DEMO_MODE) { setConnectPendingCount(0); return }
      try {
        const { count, error } = await supabase
          .from('lobby_connect_requests')
          .select('id', { count: 'exact', head: true })
          .eq('to_user_id', session.user.id)
          .eq('status', 'pending')
        if (error) throw error
        setConnectPendingCount(count ?? 0)
      } catch (e) {
        console.error('connect pending count failed', e)
      }
    }

    loadCounts()

    if (session?.user?.id && !DEMO_MODE) {
      channel = supabase
        .channel(`lobby_connect_dot_${session.user.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'lobby_connect_requests', filter: `to_user_id=eq.${session.user.id}` }, () => {
          loadCounts()
        })
        .subscribe()
    }

    return () => {
      try { channel?.unsubscribe() } catch { }
    }
  }, [session?.user?.id])

  if (status === 'loading') return null

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 pt-2 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none"
    >

      <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-2xl pointer-events-auto flex items-center gap-2">
        {/* backdrop-blur-md border-b border-gray-200 shadow-sm */}
        <div className="flex justify-between items-center px-18">
          {session ? (
            <>
              <NavItem
                href="/galaxy"
                icon={<AtomIcon size={26} />}
                isActive={isActive('/galaxy')}
              />
              <NavItem
                href="/lobby"
                icon={<ShieldUser size={26} />}
                isActive={isActive('/lobby')}
                notificationCount={connectPendingCount}
              />
              {/* <NavItem
                href="/voice-swipe"
                icon={<Mic size={26} />}
                isActive={isActive('/voice-swipe')}
              /> */}
              {/* <NavItem
                href="/matches"
                icon={<MessageCircleHeart size={26} />}
                isActive={isActive('/matches')}
              /> */}
              <NavItem
                href="/matches"
                icon={<MessageCircleHeart size={26} />}
                isActive={isActive('/matches')}
              // notificationCount={newMatchesCount}
              />
              {/* <NavItem
                href="/likes-you"
                icon={<Heart size={26} />}
                isActive={isActive('/likes-you')}
              /> */}
              <NavItem
                href="/whispers"
                icon={<VenetianMask size={26} />}
                isActive={isActive('/whispers')}
              />
              {/* <NavItem
                href="/how-it-works"
                icon={<HelpCircle size={26} />}
                isActive={isActive('/how-it-works')}
              /> */}
              {/* <NavItem
                href="/profile"
                icon={<ProfileAvatar userProfile={userProfile} />}
                isActive={isActive('/profile')}
              /> */}
              <NavItem
                href="/profile"
                icon={userProfile ? <ProfileAvatar userProfile={userProfile} /> : <LogoutButton />}
                isActive={isActive('/profile')}
              />
            </>
          ) : (
            <>
              <NavItem
                href="/"
                icon={<Home size={24} />}
                isActive={isActive('/')}
              />
              <NavItem
                href="/how-it-works"
                icon={<HelpCircle size={24} />}
                isActive={isActive('/how-it-works')}
              />
              <NavItem
                href="/login"
                icon={<LogIn size={24} />}
                isActive={isActive('/login')}
              />
              {/* <NavItem
                href="/register"
                icon={<UserPlus size={24} />}
                isActive={isActive('/register')}
              /> */}
            </>
          )}
        </div>
      </div>

      {/* Subtle shadow/glow effect */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[280px] h-2 bg-primary-500/10 rounded-full blur-xl" />
    </motion.nav>
  )
}

interface NavItemProps {
  href: string
  icon: React.ReactNode
  isActive: boolean
  notificationCount?: number
}

const NavItem = ({ href, icon, isActive, notificationCount }: NavItemProps) => {
  return (
    <Link href={href} className="relative">
      <motion.div
        className="relative w-10 h-10 flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isActive && (
          <motion.div
            layoutId="activeBackground"
            className="absolute inset-0 bg-primary-500 rounded-full shadow-soft"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
        <div
          className={`relative z-10 transition-colors duration-200 ${isActive ? 'text-white' : 'text-neutral-750 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400'
            }`}
        >
          {icon}
        </div>
        {typeof notificationCount === 'number' && notificationCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white" />
        )}

      </motion.div>
    </Link>
  )
}

// Profile Avatar Component
interface ProfileAvatarProps {
  userProfile: UserProfile | null;
}

const ProfileAvatar = ({ userProfile }: ProfileAvatarProps) => {
  const getInitials = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (userProfile?.username) {
      return userProfile.username[0].toUpperCase()
    }
    return '?'
    // else {
    //   LogoutButton(); // Force logout if no user data
    // }
  }

  return (
    <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-transparent">
      {userProfile?.profile_picture ? (
        <img
          src={userProfile.profile_picture}
          alt={userProfile.full_name || userProfile.username || 'Profile'}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-red-500 flex items-center justify-center">
          <span className="text-white text-xs font-bold">
            {getInitials()}
          </span>
        </div>
      )}
    </div>
  )
}