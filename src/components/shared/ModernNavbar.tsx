'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { 
  Users, 
  Heart, 
  MessageCircle, 
  User, 
  LogOut
} from 'lucide-react'

export default function ModernNavbar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  const isActive = (path: string) => {
    if (path === '/lobby' && pathname.startsWith('/lobby')) return true
    return pathname === path
  }

  const navItems = [
    { href: '/lobby', icon: Users, label: 'Lobby' },
    { href: '/matches', icon: Heart, label: 'Matches' },
    { href: '/whispers', icon: MessageCircle, label: 'Whispers' },
    { href: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <>
      {/* Desktop Navbar Only */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-primary-100/50 shadow-soft hidden md:block"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <img 
                src="/logo2.png" 
                alt="BlindCharm Logo" 
                className="h-10 w-auto"
              />
              <span className="text-2xl font-bold text-red-600">
                BlindCharm
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="flex items-center space-x-1">
              {session ? (
                <>
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`
                          flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all duration-200
                          ${active 
                            ? 'bg-primary-50 text-primary-600 shadow-soft' 
                            : 'text-neutral-750 hover:text-primary-600 hover:bg-primary-50'
                          }
                        `}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                  
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full font-medium text-neutral-750 hover:text-red-600 hover:bg-red-50 transition-all duration-200 ml-2"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/login"
                    className="px-6 py-2 text-neutral-750 hover:text-primary-600 font-medium transition-colors"
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
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-primary-100/50 shadow-soft md:hidden"
      >
        <div className="flex justify-center items-center h-16 px-4">
          <Link href="/" className="flex items-center space-x-3">
            <img 
              src="/logo2.png" 
              alt="BlindCharm Logo" 
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-red-600">
              BlindCharm
            </span>
          </Link>
        </div>
      </motion.header>

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-16"></div>
    </>
  )
}