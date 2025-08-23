// 'use client'

// import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
// import { auth } from '@/lib/firebase'
// import { onAuthStateChanged, User } from 'firebase/auth'

// interface FirebaseAuthContextType {
//   user: User | null
//   loading: boolean
//   isPhoneVerified: boolean
// }

// const FirebaseAuthContext = createContext<FirebaseAuthContextType>({
//   user: null,
//   loading: true,
//   isPhoneVerified: false,
// })

// export const useFirebaseAuth = () => {
//   const context = useContext(FirebaseAuthContext)
//   if (!context) {
//     throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider')
//   }
//   return context
// }

// interface FirebaseAuthProviderProps {
//   children: ReactNode
// }

// export const FirebaseAuthProvider = ({ children }: FirebaseAuthProviderProps) => {
//   const [user, setUser] = useState<User | null>(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
//       setUser(firebaseUser)
//       setLoading(false)
//     })

//     return unsubscribe
//   }, [])

//   const isPhoneVerified = user?.phoneNumber ? true : false

//   const value: FirebaseAuthContextType = {
//     user,
//     loading,
//     isPhoneVerified,
//   }

//   return (
//     <FirebaseAuthContext.Provider value={value}>
//       {children}
//     </FirebaseAuthContext.Provider>
//   )
// }



// src/providers/FirebaseAuthProvider.tsx
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, User } from 'firebase/auth'

interface FirebaseAuthContextType {
  user: User | null
  loading: boolean
  isPhoneVerified: boolean
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType>({
  user: null,
  loading: true,
  isPhoneVerified: false,
})

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext)
  if (!context) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider')
  }
  return context
}

export const FirebaseAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('🔥 Firebase auth state changed:', firebaseUser ? 'LOGGED IN' : 'LOGGED OUT')
      setUser(firebaseUser)
      setLoading(false)
      
      // ✅ Only handle auth-based redirects, not page-specific ones
      // Don't redirect on every auth state change during page reloads
    })

    return unsubscribe
  }, [])

  const isPhoneVerified = user?.phoneNumber ? true : false

  const value: FirebaseAuthContextType = {
    user,
    loading,
    isPhoneVerified,
  }

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  )
}