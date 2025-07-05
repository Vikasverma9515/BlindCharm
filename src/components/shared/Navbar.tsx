// // src/components/shared/Navbar.tsx
// 'use client'

// import { useState, useEffect } from 'react'
// import Link from 'next/link'
// import { useRouter } from 'next/navigation'
// import { supabase } from '@/lib/supabase'
// import Image from 'next/image'
// import type { User } from '@/types'

// export default function Navbar() {
//   const router = useRouter()
//   const [user, setUser] = useState<User | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false)

//   useEffect(() => {
//     const getUser = async () => {
//       try {
//         const { data: { session } } = await supabase.auth.getSession()
//         if (session?.user) {
//           const { data: profile } = await supabase
//             .from('users')
//             .select('*')
//             .eq('id', session.user.id)
//             .single()

//           setUser(profile)
//         }
//       } catch (error) {
//         console.error('Error fetching user:', error)
//       } finally {
//         setLoading(false)
//       }
//     }

//     getUser()

//     const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
//       if (session?.user) {
//         const { data: profile } = await supabase
//           .from('users')
//           .select('*')
//           .eq('id', session.user.id)
//           .single()

//         setUser(profile)
//       } else {
//         setUser(null)
//       }
//     })

//     return () => {
//       subscription.unsubscribe()
//     }
//   }, [])

//   const handleLogout = async () => {
//     try {
//       await supabase.auth.signOut()
//       window.location.href = '/login'
//     } catch (error) {
//       console.error('Error logging out:', error)
//     }
//   }

//   return (
//     <nav className="w-full z-50 bg-white shadow-sm">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between h-16">
//           <div className="flex items-center">
//             <Link href="/" className="flex items-center">
//               <Image
//                 src="/logo2.png"
//                 alt="BlindCharm"
//                 width={40}
//                 height={40}
//                 className="w-20"
//               />
//               <span className="ml-2 text-xl font-semibold text-gray-900">
//                 BlindCharm
//               </span>
//             </Link>
//           </div>

//           <div className="flex items-center space-x-4">
//             {user ? (
//               // Logged in navigation
//               <>
//                 <Link 
//                   href="/lobby" 
//                   className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
//                 >
//                   Lobby
//                 </Link>

//                 <div className="relative">
//                   <button
//                     onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                     className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium focus:outline-none"
//                   >
//                     Account
//                   </button>

//                   {isDropdownOpen && (
//                     <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
//                       <Link
//                         href="/profile"
//                         className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                       >
//                         Profile
//                       </Link>
//                       <Link
//                         href="/settings"
//                         className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                       >
//                         Settings
//                       </Link>
//                       <button
//                         onClick={handleLogout}
//                         disabled={loading}
//                         className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 disabled:opacity-50"
//                       >
//                         {loading ? 'Logging out...' : 'Logout'}
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </>
//             ) : (
//               // Not logged in navigation
//               <>
//                 <Link 
//                   href="/login" 
//                   className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
//                 >
//                   Login
//                 </Link>
//                 <Link 
//                   href="/register" 
//                   className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors text-sm font-medium"
//                 >
//                   Sign Up
//                 </Link>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </nav>
//   )
// }

// src/components/shared/Navbar.tsx
// 'use client'

// import { useState, useEffect } from 'react'
// import Link from 'next/link'
// import { useRouter } from 'next/navigation'
// import { supabase } from '@/lib/supabase'
// import Image from 'next/image'

// export default function Navbar() {
//   const router = useRouter()
//   const [user, setUser] = useState<any>(null)
//   const [loading, setLoading] = useState(true)
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false)

//   useEffect(() => {
//     const getUser = async () => {
//       const { data: { session } } = await supabase.auth.getSession()
//       setUser(session?.user || null)
//       setLoading(false)
//     }

//     getUser()

//     const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user || null)
//     })

//     return () => subscription.unsubscribe()
//   }, [])

//   const handleLogout = async () => {
//     try {
//       await supabase.auth.signOut()
//       window.location.href = '/login'
//     } catch (error) {
//       console.error('Logout error:', error)
//     }
//   }

//   if (loading) return null

//   return (
//     <nav className="bg-white shadow-sm fixed w-full z-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between h-16">
//           <div className="flex items-center">
//             <Link href="/" className="flex items-center">
//               <Image
//                 src="/logo2.png"
//                 alt="BlindCharm"
//                 width={40}
//                 height={40}
//                 className="w-10 h-10"
//               />
//               <span className="ml-2 text-xl font-semibold text-gray-900">
//                 BlindCharm
//               </span>
//             </Link>
//           </div>

//           <div className="flex items-center space-x-4">
//             {user ? (
//               <>
//                 <Link
//                   href="/lobby"
//                   className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
//                 >
//                   Lobby
//                 </Link>
//                 <div className="relative">
//                   <button
//                     onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                     className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
//                   >
//                     Account
//                   </button>
//                   {isDropdownOpen && (
//                     <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
//                       <Link
//                         href="/profile"
//                         className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                       >
//                         Profile
//                       </Link>
//                       <button
//                         onClick={handleLogout}
//                         className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
//                       >
//                         Logout
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </>
//             ) : (
//               <>
//                 <Link
//                   href="/login"
//                   className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
//                 >
//                   Login
//                 </Link>
//                 <Link
//                   href="/register"
//                   className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors text-sm font-medium"
//                 >
//                   Sign Up
//                 </Link>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </nav>
//   )
// }


// src/components/shared/Navbar.tsx
'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { 
  Home, 
  User, 
  Users, 
  Heart, 
  MessageCircle, 
  LogIn, 
  UserPlus,
  LogOut 
} from 'lucide-react'

export default function Navbar() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Prevent hydration mismatch
  if (status === 'loading') {
    return null
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <>
      {/* Mobile Top Header */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="flex justify-center items-center h-16 px-4">
            <Link href="/" className="flex items-center">
              <img className="h-10 w-auto" src="/logo2.png" alt="Logo" />
              <span className="ml-3 text-xl brand-font-bold text-gray-900 hover:text-red-600 transition-colors duration-300">
                BlindCharm
              </span>
            </Link>
          </div>
        </header>
      )}

      {/* Desktop Navigation - Logo and Nav in same line */}
      {!isMobile && (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center">
                <img className="h-10 w-auto" src="/logo2.png" alt="Logo" />
                <span className="ml-3 text-xl brand-font-bold text-gray-900 hover:text-red-600 transition-colors duration-300">
                  BlindCharm
                </span>
              </Link>

              {/* Navigation Items */}
              <div className="flex items-center space-x-6">
                {session ? (
                  <>
                    <Link
                      href="/lobby"
                      className="flex items-center space-x-2 text-gray-700 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-all duration-200 font-medium"
                    >
                      <Users size={18} />
                      <span>Lobby</span>
                    </Link>
                    <Link
                      href="/matches"
                      className="flex items-center space-x-2 text-gray-700 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-all duration-200 font-medium"
                    >
                      <Heart size={18} />
                      <span>Matches</span>
                    </Link>
                    <Link
                      href="/whispers"
                      className="flex items-center space-x-2 text-gray-700 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-all duration-200 font-medium"
                    >
                      <MessageCircle size={18} />
                      <span>Whispers</span>
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 text-gray-700 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-all duration-200 font-medium"
                    >
                      <User size={18} />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-gray-700 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-all duration-200 font-medium"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/"
                      className="flex items-center space-x-2 text-gray-700 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-all duration-200 font-medium"
                    >
                      <Home size={18} />
                      <span>Home</span>
                    </Link>
                    <Link
                      href="/login"
                      className="flex items-center space-x-2 text-gray-700 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-all duration-200 font-medium"
                    >
                      <LogIn size={18} />
                      <span>Login</span>
                    </Link>
                    <Link
                      href="/register"
                      className="flex items-center space-x-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 font-medium shadow-md"
                    >
                      <UserPlus size={18} />
                      <span>Sign Up</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg">
          <div className="flex justify-around items-center h-16 px-2">
            {session ? (
              <>
                <Link
                  href="/lobby"
                  className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
                >
                  <Users size={20} />
                  <span className="text-xs mt-1 font-medium">Lobby</span>
                </Link>
                <Link
                  href="/matches"
                  className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
                >
                  <Heart size={20} />
                  <span className="text-xs mt-1 font-medium">Matches</span>
                </Link>
                <Link
                  href="/whispers"
                  className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
                >
                  <MessageCircle size={20} />
                  <span className="text-xs mt-1 font-medium">Whispers</span>
                </Link>
                <Link
                  href="/profile"
                  className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
                >
                  <User size={20} />
                  <span className="text-xs mt-1 font-medium">Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
                >
                  <LogOut size={20} />
                  <span className="text-xs mt-1 font-medium">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
                >
                  <Home size={20} />
                  <span className="text-xs mt-1 font-medium">Home</span>
                </Link>
                <Link
                  href="/login"
                  className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
                >
                  <LogIn size={20} />
                  <span className="text-xs mt-1 font-medium">Login</span>
                </Link>
                <Link
                  href="/register"
                  className="flex flex-col items-center justify-center p-2 text-red-600 hover:text-red-700 transition-colors duration-200"
                >
                  <UserPlus size={20} />
                  <span className="text-xs mt-1 font-medium">Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </>
  )
}