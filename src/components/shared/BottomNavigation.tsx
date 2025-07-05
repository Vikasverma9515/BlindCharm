// src/components/shared/BottomNavigation.tsx
'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
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

export default function BottomNavigation() {
  const { data: session } = useSession()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg md:hidden">
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
  )
}