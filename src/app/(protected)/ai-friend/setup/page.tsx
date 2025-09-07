// app/(protected)/ai-friend/setup/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AISetup from '@/components/ai/AISetup'
import SimpleTopNav from '@/components/shared/SimpleTopNav'

export default function AIFriendSetupPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }

    // Check if user already has AI friend
    checkExistingFriend()
  }, [session])

  const checkExistingFriend = async () => {
    try {
      const response = await fetch('/api/ai/setup')
      if (response.ok) {
        const { aiFriend } = await response.json()
        if (aiFriend) {
          router.push('/ai-friend')
          return
        }
      }
    } catch (error) {
      console.error('Error checking AI friend:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetupComplete = (friend: any) => {
    router.push('/ai-friend')
  }

  if (isLoading) {
    return (
      <>
        <SimpleTopNav />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
        </div>
      </>
    )
  }

  return (
    <>
      <SimpleTopNav />
      <AISetup onSetupComplete={handleSetupComplete} />
    </>
  )
}