// // src/components/shared/SimpleBottomNav.tsx
// 'use client'

// import Link from 'next/link'
// import { usePathname } from 'next/navigation'
// import { useSession } from 'next-auth/react'
// import { 
//   Home, 
//   Users, 
//   Heart, 
//   MessageCircle, 
//   User,
//   LogIn,
//   UserPlus
// } from 'lucide-react'

// export default function SimpleBottomNav() {
//   const pathname = usePathname()
//   const { data: session, status } = useSession()

//   // Don't show on desktop
//   const isActive = (path: string) => {
//     if (path === '/lobby' && pathname.startsWith('/lobby')) return true
//     return pathname === path
//   }

//   // Prevent hydration mismatch
//   if (status === 'loading') {
//     return null
//   }

//   return (
//     <nav className="fixed bottom-0 left-0 right-0 z-50 bg-amber-400 backdrop-blur-md border-t border-gray-200 shadow-lg md:hidden">
//       <div className="flex justify-around items-center h-15 px-2">
//         {session ? (
//           <>
//             <Link
//               href="/lobby"
//               className={`flex flex-col items-center justify-center flex-1 py-0.5 px-0.5 rounded-lg transition-all duration-200 ${
//                 isActive('/lobby')
//                   ? 'text-red-600 bg-red-50'
//                   : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
//               }`}
//             >
//               <Users size={20} />
//               <span className="text-xs mt-1 font-medium">Lobby</span>
//             </Link>
//             <Link
//               href="/matches"
//               className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-all duration-200 ${
//                 isActive('/matches')
//                   ? 'text-red-600 bg-red-50'
//                   : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
//               }`}
//             >
//               <Heart size={20} />
//               <span className="text-xs mt-1 font-medium">Matches</span>
//             </Link>
//             <Link
//               href="/whispers"
//               className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-all duration-200 ${
//                 isActive('/whispers')
//                   ? 'text-red-600 bg-red-50'
//                   : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
//               }`}
//             >
//               <MessageCircle size={20} />
//               <span className="text-xs mt-1 font-medium">Whispers</span>
//             </Link>
//             <Link
//               href="/profile"
//               className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-all duration-200 ${
//                 isActive('/profile')
//                   ? 'text-red-600 bg-red-50'
//                   : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
//               }`}
//             >
//               <User size={20} />
//               <span className="text-xs mt-1 font-medium">Profile</span>
//             </Link>
//           </>
//         ) : (
//           <>
//             <Link
//               href="/"
//               className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-all duration-200 ${
//                 isActive('/')
//                   ? 'text-red-600 bg-red-50'
//                   : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
//               }`}
//             >
//               <Home size={20} />
//               <span className="text-xs mt-1 font-medium">Home</span>
//             </Link>
//             <Link
//               href="/login"
//               className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-all duration-200 ${
//                 isActive('/login')
//                   ? 'text-red-600 bg-red-50'
//                   : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
//               }`}
//             >
//               <LogIn size={20} />
//               <span className="text-xs mt-1 font-medium">Login</span>
//             </Link>
//             <Link
//               href="/register"
//               className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-all duration-200 ${
//                 isActive('/register')
//                   ? 'text-red-600 bg-red-50'
//                   : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
//               }`}
//             >
//               <UserPlus size={20} />
//               <span className="text-xs mt-1 font-medium">Sign Up</span>
//             </Link>
//           </>
//         )}
//       </div>
//     </nav>
//   )
// }


// src/components/shared/SimpleBottomNav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
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
  MessageCircleHeart
} from 'lucide-react'

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

  const isActive = (path: string) => {
    if (path === '/lobby' && pathname.startsWith('/lobby')) return true
    return pathname === path
  }

  // Fetch user profile data for avatar
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

  if (status === 'loading') return null

  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 md:hidden"
    >
      
      <div className="bg-white/90 dark:bg-black backdrop-blur-xl rounded-[28px] shadow-soft border border-primary-100/50 dark:border-gray-200 border-t-2 p-4 w-[420px] rounded-b-none transition-colors duration-300  shadow-sm ">
      {/* backdrop-blur-md border-b border-gray-200 shadow-sm */}
        <div className="flex justify-between items-center px-10">
          {session ? (
            <>
              <NavItem
                href="/lobby"
                icon={<ShieldUser size={30} />}
                isActive={isActive('/lobby')}
              />
              <NavItem
                href="/matches"
                icon={<MessageCircleHeart size={30} />}
                isActive={isActive('/matches')}
              />
              <NavItem
                href="/whispers"
                icon={<VenetianMask size={30} />}
                isActive={isActive('/whispers')}
              />
              <NavItem
                href="/profile"
                icon={<ProfileAvatar userProfile={userProfile} />}
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
                href="/login"
                icon={<LogIn size={24} />}
                isActive={isActive('/login')}
              />
              <NavItem
                href="/register"
                icon={<UserPlus size={24} />}
                isActive={isActive('/register')}
              />
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
}

const NavItem = ({ href, icon, isActive }: NavItemProps) => {
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
          className={`relative z-10 transition-colors duration-200 ${
            isActive ? 'text-white' : 'text-neutral-750 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400'
          }`}
        >
          {icon}
        </div>
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