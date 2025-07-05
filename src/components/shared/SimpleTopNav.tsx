// src/components/shared/SimpleTopNav.tsx
'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
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
  LogOut 
} from 'lucide-react'

interface SimpleTopNavProps {
  pageName?: string
  actionButton?: ReactNode
}

export default function SimpleTopNav({ pageName, actionButton }: SimpleTopNavProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()

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
        className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-amber-400 backdrop-blur-xl border-b-4 border-primary-100/50 dark:border-gray-700/50 shadow-soft hidden md:block transition-colors duration-300 rounded-b-2xl "
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 rounded-[28px]  ">
          <div className="flex justify-between items-center h-16 px-5">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <img 
                src="/logo2.png" 
                alt="BlindCharm Logo" 
                className="h-10 w-auto"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
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
                    <Users size={18} />
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
                    <Heart size={18} />
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
                    <MessageCircle size={18} />
                    <span>Whispers</span>
                  </Link>
                  <Link
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
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full font-medium text-neutral-750 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 ml-2"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/login"
                    className="px-6 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 font-medium transition-colors shadow-soft"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 font-medium transition-colors shadow-soft"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Top Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full backdrop-blur-xl border-b border-primary-100/50 dark:border-gray-700/50 shadow-soft md:hidden bg-white/80 dark:bg-amber-400 transition-colors duration-300 rounded-b-2xl"
      >
        <div className="flex justify-between items-center h-16 px-5 ">
          {/* Left side - Logo and Page Name */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <img 
                src="/logo2.png" 
                alt="BlindCharm Logo" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                BlindCharm
              </span>
            </Link>
            {pageName && (
              <>
                <span className="mx-2 text-primary-300 dark:text-primary-400">•</span>
                <span className="text-lg font-semibold text-neutral-850 dark:text-gray-100">{pageName}</span>
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