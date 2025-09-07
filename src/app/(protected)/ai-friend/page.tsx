// app/(protected)/ai-friend/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import ChatInterface from '@/components/ai/ChatInterface'
import SimpleTopNav from '@/components/shared/SimpleTopNav'
import SimpleBottomNav from '@/components/shared/SimpleBottomNav'

export default function AIFriendPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [aiFriend, setAIFriend] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }

    loadAIFriend()
  }, [session])

  const loadAIFriend = async () => {
    try {
      const response = await fetch('/api/ai/setup')
      if (response.ok) {
        const { aiFriend } = await response.json()
        if (aiFriend) {
          setAIFriend(aiFriend)
        } else {
          router.push('/ai-friend/setup')
          return
        }
      } else {
        setError('Failed to load AI friend')
      }
    } catch (error) {
      console.error('Error loading AI friend:', error)
      setError('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <SimpleTopNav />
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">Loading your AI friend...</p>
          </div>
        </div>
        {/* <SimpleBottomNav /> */}
      </>
    )
  }

  if (error || !aiFriend) {
    return (
      <>
        <SimpleTopNav />
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <div className="text-6xl mb-4">🤖💔</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              AI Friend Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || "Let's create your AI companion!"}
            </p>
            <button
              onClick={() => router.push('/ai-friend/setup')}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-full font-semibold transition-colors"
            >
              Create AI Friend
            </button>
          </motion.div>
        </div>
        {/* <SimpleBottomNav /> */}
      </>
    )
  }

  return (
    <>
      {/* <SimpleTopNav /> */}
      <div className="pb-0"> {/* Space for bottom nav */}
        <ChatInterface aiFriend={aiFriend} />
      </div>
      {/* <SimpleBottomNav /> */}
    </>
  )
}

