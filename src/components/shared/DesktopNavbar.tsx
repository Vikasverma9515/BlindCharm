// src/components/shared/DesktopNavbar.tsx
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

export default function DesktopNavbar() {
  const { data: session, status } = useSession()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  // Prevent hydration mismatch
  if (status === 'loading') {
    return null
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm hidden md:block">
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
  )
}