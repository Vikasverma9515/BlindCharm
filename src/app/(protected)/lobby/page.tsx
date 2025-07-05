// src/app/(protected)/lobby/page.tsx
'use client'

import { useSession } from 'next-auth/react'
import { LobbyProvider } from '@/contexts/LobbyContext'
import ModernLobbySelection from '@/components/lobby/ModernLobbySelection'
import { useLobby } from '@/contexts/LobbyContext'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import SimpleTopNav from '@/components/shared/SimpleTopNav'
import SimpleBottomNav from '@/components/shared/SimpleBottomNav'
import ReelStyleLobby from '@/components/lobby/ReelStyleLobby'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ensureProfileCompletedField } from '@/lib/migrations'

function LobbyContent() {
  const { activeLobby } = useLobby()
  const [error, setError] = useState<string | null>(null)

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-red-500 dark:text-red-400 text-center">
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return activeLobby ? <ReelStyleLobby lobbyId={activeLobby} /> : <ModernLobbySelection />
}

export default function LobbyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profileCheckLoading, setProfileCheckLoading] = useState(true)

  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (status === 'loading') return
      
      if (!session?.user?.id) {
        setProfileCheckLoading(false)
        return
      }

      try {
        // First ensure the profile_completed field exists
        const fieldExists = await ensureProfileCompletedField()
        
        if (!fieldExists) {
          // If field doesn't exist, check if user has basic profile info
          const { data: userData, error } = await supabase
            .from('users')
            .select('full_name, bio, interests')
            .eq('id', session.user.id)
            .single()

          if (error) {
            console.error('Error checking user data:', error)
            setProfileCheckLoading(false)
            return
          }

          const hasBasicInfo = userData?.full_name && 
                              userData.full_name.trim() !== '' && 
                              userData?.bio && 
                              userData.bio.trim() !== '' && 
                              userData?.interests && 
                              userData.interests.length > 0

          if (!hasBasicInfo) {
            router.push('/profile/setup')
            return
          }
        } else {
          // Field exists, check profile_completed status
          const { data: userData, error } = await supabase
            .from('users')
            .select('profile_completed')
            .eq('id', session.user.id)
            .single()

          if (error) {
            console.error('Error checking profile status:', error)
            setProfileCheckLoading(false)
            return
          }

          if (!userData?.profile_completed) {
            router.push('/profile/setup')
            return
          }
        }

        setProfileCheckLoading(false)
      } catch (error) {
        console.error('Error:', error)
        setProfileCheckLoading(false)
      }
    }

    checkProfileCompletion()
  }, [session, status, router])

  if (status === 'loading' || profileCheckLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-soft">
            <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-850 dark:text-gray-100">Loading...</h2>
          <p className="text-neutral-750 dark:text-gray-400">Preparing your experience</p>
        </motion.div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-6"
        >
          <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-soft">
            <div className="w-10 h-10 bg-primary-500 rounded-2xl"></div>
          </div>
          <h2 className="text-2xl font-bold text-neutral-850 dark:text-gray-100 mb-3">Welcome to BlindCharm</h2>
          <p className="text-neutral-750 dark:text-gray-400 mb-6">Please log in to access the lobby and start connecting with amazing people.</p>
          <button className="bg-primary-500 text-white px-8 py-3 rounded-full font-medium hover:bg-primary-600 transition-colors shadow-soft">
            Sign In
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <SimpleTopNav pageName="Lobby" />
      <LobbyProvider>
        <LobbyContent />
      </LobbyProvider>
      <SimpleBottomNav />
    </>
  )
}