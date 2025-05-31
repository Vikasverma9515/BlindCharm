// src/app/(protected)/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return <div>Loading...</div>
  }

  return <>{children}</>
}


// // src/app/(protected)/layout.tsx
// import { useSession } from 'next-auth/react'
// import { useRouter } from 'next/navigation' 

// export default function ProtectedLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   const { data: session, status } = useSession()
//   const router = useRouter()

//   if (status === 'loading') {
//     return <div>Loading...</div>
//   }

//   if (!session) {
//     router.push('/login')
//     return null
//   }

//   return <>{children}</>
// }