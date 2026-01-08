'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import {
  Users,
  Heart,
  MessageCircle,
  User,
  LogOut,
  Sparkles,
  X
} from 'lucide-react'
import { BijliExperienceCard } from '../companion/BijliExperienceCard'

export default function ModernNavbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [showBijli, setShowBijli] = useState(false)

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
    { href: '/profile', icon: User, label: 'Profile' }
  ]

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-primary-100/50 shadow-soft hidden md:block"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <img
                src="/logo2.png"
                alt="BlindCharm Logo"
                className="h-10 w-auto"
              />
              <span className="text-2xl font-bold text-red-600">BlindCharm</span>
            </Link>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowBijli(true)}
                className="hidden md:inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white/60 px-4 py-2 text-sm font-semibold text-primary-600 transition hover:bg-primary-50"
              >
                <Sparkles className="h-4 w-4" />
                Meet Bijli
              </button>
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
                            : 'text-neutral-750 hover:text-primary-600 hover:bg-primary-50'}
                        `}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full font-medium text-neutral-750 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/login"
                    className="px-6 py-2 text-neutral-750 transition-colors hover:text-primary-600"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-2 rounded-full bg-primary-500 text-white shadow-soft transition-colors hover:bg-primary-600"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-primary-100/50 shadow-soft md:hidden"
      >
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/" className="flex items-center space-x-3">
            <img
              src="/logo2.png"
              alt="BlindCharm Logo"
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-red-600">BlindCharm</span>
          </Link>
          <button
            onClick={() => setShowBijli(true)}
            className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white/60 px-3 py-1.5 text-xs font-semibold text-primary-600 transition hover:bg-primary-50"
          >
            <Sparkles className="h-4 w-4" />
            Bijli
          </button>
        </div>
      </motion.header>

      <div className="h-16" />

      <AnimatePresence>
        {showBijli && (
          <motion.div
            key="bijli-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 px-4 py-10 backdrop-blur"
            onClick={() => setShowBijli(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="relative w-full max-w-3xl"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                onClick={() => setShowBijli(false)}
                className="absolute -top-4 -right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-lg"
              >
                <X className="h-4 w-4" />
              </button>
              <BijliExperienceCard
                username={session?.user?.name || session?.user?.email || 'You'}
                loyaltyLevel="bestie"
                streakDays={5}
                heroStat={{ label: 'Energy Level', value: 'High Key' }}
                vibePackLabel="Festival Dhamaka"
                vibeMeme="Govinda dance loop of the day"
                vibeBuzzwords={['scene solid', 'main character', 'delulu but legendary']}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
