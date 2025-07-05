// src/app/(auth)/login/page.tsx
import LoginForm from '@/components/auth/LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-500">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,0,0,0.15)_1px,transparent_0)] [background-size:20px_20px] opacity-20"></div>
      
      <div className="relative flex flex-col justify-center min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            {/* Logo/Icon */}
            <div className="mx-auto w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Sign in to continue your journey
            </p>
          </div>

          {/* Register link */}
          <div className="text-center mb-8">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="font-semibold text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 transition-colors duration-200"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md mx-auto">
          <div className="relative">
            {/* Glassmorphism background */}
            <div className="absolute inset-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50"></div>
            
            {/* Form content */}
            <div className="relative p-8">
              <LoginForm />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full max-w-md mx-auto mt-8 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Secure login protected by industry-standard encryption
          </p>
        </div>
      </div>
    </div>
  )
}