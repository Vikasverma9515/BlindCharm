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
import LogoutButton from '../auth/LogoutButton'

export default function Navbar() {
  const { data: session, status } = useSession()

  // Prevent hydration mismatch
  if (status === 'loading') {
    return null // or a loading spinner
  }

  return (
    <nav className="">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <img className="h-12 w-auto" src="/logo2.png" alt="Logo" />
              <span className="ml-2 text-xl font-semibold text-rose-600">
                BlindCharm
              </span>
            </Link>
          </div>

          <div className="flex items-center">
            {session ? (
              <>
                {/* <span className="mr-4 text-black">{session.user?.email}</span> */}
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-400 rounded-l font-bold"
                >
                  Profile
                </Link>
                <Link
                  href="/lobby"
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-bold"
                >
                  Lobby
                </Link>
                <Link
                  href="/matches"
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-bold"
                >
                  Matches
                </Link>

                <LogoutButton />
              </>
            ) : (
              <div className="space-x-4">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-gray-900"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}