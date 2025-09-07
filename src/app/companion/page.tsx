'use client'

import CompanionChat from '@/components/companion/CompanionChat'
import { useFirebaseAuth } from '@/providers/FirebaseAuthProvider'
import { useAuth } from '@/providers/AuthProvider'

export default function CompanionPage() {
  // Try Firebase first; fall back to Supabase auth context if present
  let fbUserId: string | null = null
  try {
    // hooks must be called unconditionally in React
  } catch {}
  const { user: fbUser, loading: fbLoading } = (() => {
    try { return useFirebaseAuth() } catch { return { user: null, loading: false } as any }
  })()
  const { user: sbUser, loading: sbLoading } = (() => {
    try { return useAuth() } catch { return { user: null, loading: false } as any }
  })()

  const loading = fbLoading || sbLoading
  const userId = fbUser?.uid || sbUser?.id || ''

  return (
    <div className="px-4 md:px-8 py-6">
      <h1 className="text-2xl font-bold mb-4">AI Companion</h1>
      {loading ? (
        <div className="text-sm text-gray-600 dark:text-gray-300">Loading...</div>
      ) : userId ? (
        <CompanionChat userId={userId} />
      ) : (
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Please sign in to chat with your companion.
        </div>
      )}
    </div>
  )
}