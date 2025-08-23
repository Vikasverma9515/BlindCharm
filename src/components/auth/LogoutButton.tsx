// // src/components/auth/LogoutButton.tsx
// 'use client'

// import { signOut } from 'next-auth/react'
// import { useRouter } from 'next/navigation'

// export default function LogoutButton() {
//   const router = useRouter()

//   const handleLogout = async () => {
//     await signOut({ 
//       redirect: false,
//       callbackUrl: '/login'
//     })
//     router.push('/login')
//   }

//   return (
//     <button
//       onClick={handleLogout}
//       className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
//     >
//       Logout
//     </button>
//   )
// }


// src/components/auth/LogoutButton.tsx
'use client'

import { signOut as nextAuthSignOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // Clear client tokens/flags
      try {
        localStorage.removeItem('firebaseToken')
        localStorage.removeItem('userPhone')
      } catch {}

      // Sign out from Supabase (if any client session exists)
      try {
        await supabase.auth.signOut()
      } catch {}

      // Sign out NextAuth without auto-redirect
      await nextAuthSignOut({ redirect: false })

      // Navigate to public login page and refresh to reset state
      router.replace('/login')
      // Ensure all client state is reset
      window.location.reload()
    } catch (e) {
      // Fallback
      router.replace('/login')
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
    >
      Logout
    </button>
  )
}
