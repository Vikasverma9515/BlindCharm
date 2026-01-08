// // src/components/shared/DesktopNavbar.tsx
// 'use client'

// import { useState } from 'react'
// import { useSession } from 'next-auth/react'
// import Link from 'next/link'
// import { signOut } from 'next-auth/react'
// import { AnimatePresence, motion } from 'framer-motion'
// import { 
//   Home, 
//   User, 
//   Users, 
//   Heart, 
//   MessageCircle, 
//   LogIn, 
//   UserPlus,
//   LogOut,
//   Sparkles,
//   X
// } from 'lucide-react'
// import { BijliExperienceCard } from '../companion/BijliExperienceCard'

// export default function DesktopNavbar() {
//   const { data: session, status } = useSession()
//   const [showBijli, setShowBijli] = useState(false)
//   const username = session?.user?.name || session?.user?.email || 'You'

//   const handleLogout = async () => {
//     await signOut({ callbackUrl: '/login' })
//   }

//   // Prevent hydration mismatch
//   if (status === 'loading') {
//     return null
//   }

//   return (
//     <>
//       <nav className="bg-white border-b border-gray-200 shadow-sm hidden md:block">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="flex justify-between items-center h-16">
//             {/* Logo */}
//             <Link href="/" className="flex items-center">
//               <img className="h-10 w-auto" src="/logo2.png" alt="Logo" />
//               <span className="ml-3 text-xl brand-font-bold text-gray-900 hover:text-red-600 transition-colors duration-300">
//                 BlindCharm
//               </span>
//             </Link>

//             <div className="flex items-center space-x-6">
//               <button
//                 onClick={() => setShowBijli(true)}
//                 className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white/60 px-4 py-2 text-sm font-semibold text-primary-600 transition hover:bg-primary-50"
//               >
//                 <Sparkles className="h-4 w-4" />
//                 Meet Bijli
//               </button>
//               {session ? (
//                 <>
//                   <Link
//                     href="/lobby"
//                     className="flex items-center space-x-2 text-gray-700 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-all duration-200 font-medium"
//                   >
//                     <Users size={18} />
//                     <span>Lobby</span>
//                   </Link>
//                   <Link
//                     href="/matches"
//                     className="flex items-center space-x-2 text-gray-700 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-all duration-200 font-medium"
//                   >
//                     <Heart size={18} />
//                     <span>Matches</span>
//                   </Link>
//                   <Link
//                     href="/whispers"
//                     className="flex items-center space-x-2 text-gray-700 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-all duration-200 font-medium"
//                   >
//                     <MessageCircle size={18} />
//                     <span>Whispers</span>
//                   </Link>
//                   <Link
//                     href="/profile"
//                     className="flex items-center space-x-2 text-gray-700 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-all duration-200 font-medium"
//                   >
//                     <User size={18} />
//                     <span>Profile</span>
//                   </Link>
//                   <button
//                     onClick={handleLogout}
//                     className="flex items-center space-x-2 text-gray-700 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-all duration-200 font-medium"
//                   >
//                     <LogOut size={18} />
//                     <span>Logout</span>
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <Link
//                     href="/"
//                     className="flex items-center space-x-2 text-gray-700 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-all duration-200 font-medium"
//                   >
//                     <Home size={18} />
//                     <span>Home</span>
//                   </Link>
//                   <Link
//                     href="/login"
//                     className="flex items-center space-x-2 text-gray-700 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-all duration-200 font-medium"
//                   >
//                     <LogIn size={18} />
//                     <span>Login</span>
//                   </Link>
//                   <Link
//                     href="/register"
//                     className="flex items-center space-x-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 font-medium shadow-md"
//                   >
//                     <UserPlus size={18} />
//                     <span>Sign Up</span>
//                   </Link>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </nav>

//       <AnimatePresence>
//         {showBijli && (
//           <motion.div
//             key="bijli-overlay"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 px-4 py-10 backdrop-blur"
//             onClick={() => setShowBijli(false)}
//           >
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               transition={{ type: 'spring', stiffness: 200, damping: 25 }}
//               className="relative w-full max-w-3xl"
//               onClick={(event) => event.stopPropagation()}
//             >
//               <button
//                 onClick={() => setShowBijli(false)}
//                 className="absolute -top-4 -right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-lg"
//               >
//                 <X className="h-4 w-4" />
//               </button>
//               <BijliExperienceCard
//                 username={username}
//                 loyaltyLevel="bestie"
//                 streakDays={5}
//                 heroStat={{ label: 'Energy Level', value: 'High Key' }}
//                 vibePackLabel="Festival Dhamaka"
//                 vibeMeme="Govinda dance loop of the day"
//                 vibeBuzzwords={['scene solid', 'main character', 'delulu but legendary']}
//               />
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//   )
// }