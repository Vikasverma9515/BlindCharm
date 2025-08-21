// src/app/(auth)/login/page.tsx
'use client'
import LoginForm from '@/components/auth/LoginForm'
import Link from 'next/link'
import CuteFaceBubble2 from '@/components/ui/CuteFaceBubble2'
import PhoneAuth from '@/components/auth/PhoneAuth'
import { useRouter } from 'next/navigation'
import { use, useState } from 'react'
import { ArrowLeft, CheckCircle, Shield } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [authSuccess, setAuthSuccess] = useState(false)
  const handleAuthSuccess = (phoneNumber: string) => {
    setAuthSuccess(true)

    // Redirect after a short delay to show success message
    setTimeout(() => {
      router.push('/profile/setup')
    }, 2000)
  }
  const handleAuthError = (error: string) => {
    console.error('Phone auth error:', error)
  }
  if (authSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Phone Verified Successfully!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Welcome to BlindCharm.
              </p>
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
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

      <div className="relative z-20 flex flex-col justify-center min-h-screen py-3 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="w-full max-w-md mx-auto">
          <div className="text-center pb-2 ">
            {/* Logo/Icon */}
            {/* <div className="mx-auto w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div> */}
            <div className="flex justify-center mb-0 scale-75">
              <CuteFaceBubble2 size="md" />
            </div>

            <h1 className="text-3xl font-blindcharm-tech text-gray-900  mb-0">
              Join BlindCharm
            </h1>
            <p className="text-gray-800  text-sm">
              Start your anonymous dating journey
            </p>
          </div>

          {/* Register link */}
          {/* <div className="text-center mb-3">
            <p className="text-sm text-gray-800 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="font-semibold text-red-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 transition-colors duration-200"
              >
                Create one
              </Link>
            </p>
          </div> */}
          {/* <div className="flex items-center mb-6">
            <Link
              href="/login"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white ml-3">
              Phone Verification
            </h1>
          </div> */}
          {/* <div className="bg-blue-50 scale-70  border border-blue-200  rounded-xl p-3  ">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600  mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900  mb-1">
                  Secure Phone Verification
                </h3>
                <p className="text-sm text-blue-700 ">
                  We use Firebase for secure phone verification. Your number is encrypted and never shared.
                </p>
              </div>
            </div>
          </div> */}
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md mx-auto">
          <div className="relative">
            {/* Glassmorphism background */}
            <div className="absolute inset-0 bg-indigo-500 dark:bg-gray-800 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50"></div>

            {/* Form content */}
            <div className="relative p-8">
              {/* <LoginForm /> */}
              <PhoneAuth
                onSuccess={handleAuthSuccess}
                onError={handleAuthError}
              />
            </div>

          </div>

        </div>
        <div className="scale-80  flex  bg-white rounded-xl p-3  items-center justify-center mt-6">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-600  mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="flex font-medium text-blue-900  mb-1">
                Secure Phone Verification
              </h3>
              <p className="text-sm text-blue-700 ">
                We use Firebase for secure phone verification. Your number is encrypted and never shared.
              </p>
            </div>
          </div>
        </div>



        {/* Footer */}
        <div className="w-full flex  justify-center scale-76 max-w-md mx-auto mt-0 text-center">
          {/* <p className="text-xs text-gray-800 dark:text-gray-400">
            Secure login protected by industry-standard encryption
          </p> */}

          <p className="text-xs text-gray-800 dark:text-black mt-2">
            This site is protected by reCAPTCHA and the Google

            <a className='text-primary-600 p-1' href="https://policies.google.com/privacy">Privacy Policy</a> and

            <a className='text-primary-600 p-1' href="https://policies.google.com/terms">Terms of Service</a> apply.
          </p>
        </div>
      </div>
    </div>
  )
}