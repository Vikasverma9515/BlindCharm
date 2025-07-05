// src/app/(protected)/profile/setup/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase'
import ProfileOnboarding from '@/components/onboarding/ProfileOnboarding'

export default function ProfileSetup() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profileCompleted, setProfileCompleted] = useState(false)

  useEffect(() => {
    const checkProfileStatus = async () => {
      if (status === 'loading') return
      
      if (!session?.user?.id) {
        router.push('/login')
        return
      }

      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('profile_completed')
          .eq('id', session.user.id)
          .single()

        if (error) {
          console.error('Error checking profile status:', error)
          setLoading(false)
          return
        }

        if (userData?.profile_completed) {
          setProfileCompleted(true)
          router.push('/lobby')
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Error:', error)
        setLoading(false)
      }
    }

    checkProfileStatus()
  }, [session, status, router])

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mb-4 mx-auto animate-spin">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (profileCompleted) {
    return null // Will redirect to lobby
  }

  return <ProfileOnboarding />
}