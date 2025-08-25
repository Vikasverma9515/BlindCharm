// src/components/shared/SimpleTopNav.tsx
'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { ReactNode, useState } from 'react'
import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Home,
  User,
  Users,
  Heart,
  MessageCircle,
  LogIn,
  UserPlus,
  LogOut,
  ShieldUser,
  MessageCircleHeart,
  VenetianMask,
  HelpCircle
} from 'lucide-react'
import { Roboto } from 'next/font/google'
// import { Boldonse } from 'next/font/google'
import { Anton } from 'next/font/google'
import { boldonse, righteous, specialGothic } from '@/app/fonts'
import { supabase } from '@/lib/supabase'


const anton = Anton({
  weight: ['400'],
  subsets: ['latin'],
  // variable: '--font-roboto'
})
interface SimpleTopNavProps {
  pageName?: string
  actionButton?: ReactNode
}

interface UserProfile {
  id: string;
  full_name: string;
  username: string;
  profile_picture: string | null;
}
interface ProfileAvatarProps {
  userProfile: UserProfile | null;
}





export default function SimpleTopNav({ pageName, actionButton }: SimpleTopNavProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)


  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user?.id) return

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

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  const isActive = (path: string) => {
    if (path === '/lobby' && pathname.startsWith('/lobby')) return true
    return pathname === path
  }

  // Prevent hydration mismatch
  if (status === 'loading') {
    return null
  }


  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black backdrop-blur-xl border-b-4 border-primary-100/50 dark:border-gray-700/50 shadow-soft hidden md:block transition-colors duration-300 rounded-b-2xl "
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 rounded-[28px]  ">
          <div className="flex justify-between items-center h-16 px-5">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <img
                src="/logo2.png"
                alt="BlindCharm Logo"
                className="h-10 w-auto dark:hidden"
              />
              <img
                src="/logo3.png"
                alt="BlindCharm Logo"
                className="h-8 w-auto hidden dark:block"
              />
              <span className={`${boldonse.className} text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent`}>
                BlindCharm
              </span>
            </Link>

            {/* Navigation Items */}
            <div className="flex items-center space-x-1">
              {session ? (
                <>
                  <Link
                    href="/lobby"
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all duration-200
                      ${isActive('/lobby')
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 shadow-soft'
                        : 'text-neutral-750 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                      }
                    `}
                  >
                    <ShieldUser size={24} />
                    <span>Lobby</span>
                  </Link>
                  <Link
                    href="/matches"
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all duration-200
                      ${isActive('/matches')
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 shadow-soft'
                        : 'text-neutral-750 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                      }
                    `}
                  >
                    <MessageCircleHeart size={24} />
                    <span>Matches</span>
                  </Link>
                  <Link
                    href="/whispers"
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all duration-200
                      ${isActive('/whispers')
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 shadow-soft'
                        : 'text-neutral-750 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                      }
                    `}
                  >
                    <VenetianMask size={24} />
                    <span>Whispers</span>
                  </Link>
                  <Link
                    href="/how-it-works"
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all duration-200
                      ${isActive('/how-it-works')
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 shadow-soft'
                        : 'text-neutral-750 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                      }
                    `}
                  >
                    <HelpCircle size={24} />
                    <span>How It Works</span>
                  </Link>
                  {/* <Link
                    href="/profile"
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all duration-200
                      ${isActive('/profile') 
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 shadow-soft' 
                        : 'text-neutral-750 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                      }
                    `}
                  >
                    <User size={18} />
                    <span>Profile</span>
                  </Link> */}
                  <NavItem
                    href="/profile"
                    icon={<ProfileAvatar userProfile={userProfile} />}
                    isActive={isActive('/profile')}

                  />
                  {/* <NavItem 
                href="/profile"
               icon={<ProfileAvatar userProfile={userProfile} />}
                 isActive={isActive('/profile')}
                
               /><span>Profile</span> */}

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full font-medium text-neutral-750 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 ml-2"
                  >
                    <LogOut size={24} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/how-it-works"
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all duration-200
                      ${isActive('/how-it-works')
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 shadow-soft'
                        : 'text-neutral-750 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                      }
                    `}
                  >
                    <HelpCircle size={20} />
                    <span>How It Works</span>
                  </Link>
                  <Link
                    href="/login"
                    className="px-6 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 font-medium transition-colors shadow-soft"
                  >
                    Login
                  </Link>
                  {/* <Link
                    href="/register"
                    className="px-6 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 font-medium transition-colors shadow-soft"
                  >
                    Sign Up
                  </Link> */}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Top Header */}
      {/* <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full backdrop-blur-xl border-b border-primary-100/50 dark:border-gray-700/50 shadow-soft md:hidden bg-white/50 dark:bg-amber-400 transition-colors duration-300 rounded-b-2xl"
        // className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-amber-400 backdrop-blur-xl border-b-4 border-primary-100/50 dark:border-gray-700/50 shadow-soft hidden md:block transition-colors duration-300 rounded-b-2xl"
      > */}
      <motion.header
        // initial={{ y: -100, opacity: 0 }}
        // animate={{ y: 0, opacity: 1 }}
        style={{ paddingTop: 'env(safe-area-inset-top)' }} // ✅ Safe area padding
        className="top-0 left-0 right-0 z-50 
             w-full 
             backdrop-blur-xl 
             border-b border-primary-100/50 dark:border-b-white 
             shadow-soft md:hidden 
             bg-white/50 dark:bg-black/50  
             transition-colors duration-300 
             rounded-b-2xl"
      >
        <div className="flex justify-between items-center h-16 px-5 ">
          {/* Left side - Logo and Page Name */}
          <div className="flex items-center">
            <Link href={pathname.startsWith('/lobby') || pathname.startsWith('/matches') || pathname.startsWith('/whispers') || pathname.startsWith('/profile') ? '/lobby' : '/'} className="flex items-center space-x-3">
              {/* Light mode logo */}
              <img
                src="/logo2.png"
                alt="BlindCharm Logo"
                className="h-8 w-auto dark:hidden"
              />
              {/* Dark mode logo */}
              <img
                src="/logo3.png"
                alt="BlindCharm Logo"
                className="h-8 w-auto hidden dark:block"
              />
              <div className={`${boldonse.className} text-md font-bold`}>
                <span className=" bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                  BlindCharm
                </span>
              </div>
            </Link>
            {pageName && (
              <>
              
                <span className="mx-2 text-primary-300 dark:text-primary-400">•</span>
                
                <span className={`${boldonse.className} text-sm font-semibold text-neutral-850 dark:text-gray-100`}>{pageName}</span>
                <br />
                {/* <span className=''> <NavItem
                href="/how-it-works"
                icon={<HelpCircle size={26} />}
                isActive={isActive('/how-it-works')}
              /></span> */}
              
              </>
            )}
          </div>

          {/* Right side - Action Button */}
          {actionButton && (
            <div className="flex items-center">
              {actionButton}
            </div>
          )}
        </div>
      </motion.header>


    </>
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
        {/* {notificationCount && notificationCount > 0 && (
          // <NotificationBadge count={NotificationStatus} size="sm" />
        )} */}

      </motion.div>
    </Link>
  )
}

// Profile Avatar Component
// interface ProfileAvatarProps {
//   userProfile: UserProfile | null;
// }

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
    return <div><User size={24} /></div>
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