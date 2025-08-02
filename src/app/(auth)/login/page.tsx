// src/app/(auth)/login/page.tsx
import LoginForm from '@/components/auth/LoginForm'
import Link from 'next/link'
import CuteFaceBubble2 from '@/components/ui/CuteFaceBubble2'

export default function LoginPage() {
  return (
    <div className="min-h-screen relative flex flex-col justify-center dark:bg-gray-900 transition-all duration-500">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 bg-lime-300 opacity-90"></div>

      {/* Flowing Thread Animation */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="threadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#84cc16" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Main flowing thread */}
          <path
            d="M-100 50 Q200 150 400 100 T800 200 Q1000 250 1200 150 T1600 300"
            stroke="url(#threadGradient)"
            strokeWidth="3"
            fill="none"
            opacity="0.7"
            className="animate-pulse"
          />

          {/* Secondary thread */}
          <path
            d="M-50 200 Q300 50 600 250 T1200 100 Q1400 200 1700 150"
            stroke="#fbbf24"
            strokeWidth="2"
            fill="none"
            opacity="0.5"
            className="animate-pulse"
            style={{ animationDelay: '1s' }}
          />

          {/* Subtle accent thread */}
          <path
            d="M100 300 Q400 100 700 350 T1300 200 Q1500 100 1800 250"
            stroke="#84cc16"
            strokeWidth="1.5"
            fill="none"
            opacity="0.4"
            className="animate-pulse"
            style={{ animationDelay: '2s' }}
          />
        </svg>
      </div>

      <div className="relative z-20 flex flex-col justify-center min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            {/* Logo/Icon */}
            {/* <div className="mx-auto w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div> */}
            <div className="flex justify-center mb-3 scale-75">
              <CuteFaceBubble2 size="md" />
            </div>

            <h1 className="text-3xl font-blindcharm-tech text-gray-900 dark:text-gray-100 mb-0">
              Welcome Back
            </h1>
            <p className="text-gray-800 dark:text-gray-400 text-lg">
              Sign in to continue your journey
            </p>
          </div>

          {/* Register link */}
          <div className="text-center mb-3">
            <p className="text-sm text-gray-800 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="font-semibold text-red-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 transition-colors duration-200"
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
            <div className="absolute inset-0 bg-indigo-500 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50"></div>

            {/* Form content */}
            <div className="relative p-8">
              <LoginForm />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full max-w-md mx-auto mt-8 text-center">
          <p className="text-xs text-gray-800 dark:text-gray-400">
            Secure login protected by industry-standard encryption
          </p>
        </div>
      </div>
    </div>
  )
}