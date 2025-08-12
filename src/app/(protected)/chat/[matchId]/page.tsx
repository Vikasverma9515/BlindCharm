// src/app/(protected)/chat/[matchId]/page.tsx
'use client'

import { use, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import MatchChat from '@/components/match/MatchChat'
import CacheStats from '@/components/debug/CacheStats'
import { ArrowLeft, Loader2 } from 'lucide-react'

interface ChatPageProps {
  params: Promise<{ matchId: string }>
}

export default function ChatPage({ params }: ChatPageProps) {
  const resolvedParams = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  const [match, setMatch] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user?.id) {
      router.push('/login')
      return
    }

    fetchMatchData()
    checkAdminStatus()
  }, [session, status, resolvedParams.matchId])

  const fetchMatchData = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          user1:user1_id (id, username, profile_picture),
          user2:user2_id (id, username, profile_picture)
        `)
        .eq('id', resolvedParams.matchId)
        .single()

      if (error) throw error

      // Verify user is part of this match
      const currentUserId = session?.user?.id
      if (data.user1_id !== currentUserId && data.user2_id !== currentUserId) {
        throw new Error('You are not authorized to view this chat')
      }

      setMatch(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const checkAdminStatus = async () => {
    if (!session?.user?.id) return

    try {
      const { data, error } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', session.user.id)
        .single()

      if (!error && data) {
        setIsAdmin(data.is_admin || false)
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Match Not Found</h1>
          <p className="text-gray-600">This match does not exist or you don't have access to it.</p>
        </div>
      </div>
    )
  }

  const currentUserId = session?.user?.id || ''
  const otherUserId = match.user1_id === currentUserId ? match.user2_id : match.user1_id

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Match Chat
            </h1>
            <p className="text-sm text-gray-500">
              {match.status === 'active' ? 'Active Match' : 'Match Ended'}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="h-[calc(100vh-80px)]">
        <MatchChat
          matchId={resolvedParams.matchId}
          currentUserId={currentUserId}
          otherUserId={otherUserId}
        />
      </div>

      {/* Cache Statistics (Debug) - Only show for admins */}
      {isAdmin && <CacheStats />}
    </div>
  )
}