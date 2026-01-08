'use client'

import Link from 'next/link'
import { ReactNode, useState } from 'react'
import { useSession } from 'next-auth/react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'
import { BijliExperienceCard } from '../companion/BijliExperienceCard'

interface TopHeaderProps {
  pageName?: string
  actionButton?: ReactNode
}

export default function TopHeader({ pageName, actionButton }: TopHeaderProps) {
  const { data: session } = useSession()
  const [showBijli, setShowBijli] = useState(false)
  const username = session?.user?.name || session?.user?.email || 'You'

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm md:hidden">
        <div className="pt-safe-area-inset-top">
          <div className="flex justify-between items-center h-16 px-4">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <img className="h-8 w-auto" src="/logo2.png" alt="Logo" />
                <span className="ml-2 text-lg brand-font-bold text-gray-900">BlindCharm</span>
              </Link>
              {pageName && (
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-lg font-semibold text-gray-900">{pageName}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBijli(true)}
                className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white/60 px-3 py-1.5 text-xs font-semibold text-primary-600 transition hover:bg-primary-50"
              >
                <Sparkles className="h-4 w-4" />
                Bijli
              </button>
              {actionButton ? <div className="flex items-center">{actionButton}</div> : null}
            </div>
          </div>
        </div>
      </header>

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
                username={username}
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
