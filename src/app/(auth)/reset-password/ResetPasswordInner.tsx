// src/app/(auth)/reset-password/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import CuteFaceBubble2 from '@/components/ui/CuteFaceBubble2'
import { supabase } from '@/lib/auth'
import { Suspense } from 'react'
import { resetPassword } from '@/lib/auth'


export default function ResetPasswordInner(){
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isValidToken, setIsValidToken] = useState(false)

  useEffect(() => {
    // Check if we have the necessary URL parameters for password reset
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    const type = searchParams.get('type')

    if (type === 'recovery' && accessToken && refreshToken) {
      // Set the session with the tokens from the URL
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
      setIsValidToken(true)
    } else {
      setError('Invalid or expired reset link. Please request a new password reset.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    // Validate passwords
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setMessage('Password updated successfully! Redirecting to login...')
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)

    } catch (error: any) {
      setError(error.message || 'An error occurred while updating your password.')
    } finally {
      setLoading(false)
    }
  }

  if (!isValidToken && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
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
            style={{animationDelay: '1s'}}
          />
          
          {/* Subtle accent thread */}
          <path 
            d="M100 300 Q400 100 700 350 T1300 200 Q1500 100 1800 250"
            stroke="#84cc16" 
            strokeWidth="1.5" 
            fill="none"
            opacity="0.4"
            className="animate-pulse"
            style={{animationDelay: '2s'}}
          />
        </svg>
      </div>

      <div className="relative z-20 flex flex-col justify-center min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            {/* Logo/Icon */}
            <div className="flex justify-center mb-3 scale-75">
              <CuteFaceBubble2 size="md" />
            </div>
            
            <h1 className="text-3xl font-blindcharm-tech text-gray-900 dark:text-gray-100 mb-2">
              Set New Password
            </h1>
            <p className="text-gray-800 dark:text-gray-400 text-lg">
              Enter your new password below
            </p>
          </div>

          {/* Back to login link */}
          <div className="text-center mb-8">
            <p className="text-sm text-gray-800 dark:text-gray-400">
              Remember your password?{' '}
              <Link
                href="/login"
                className="font-semibold text-red-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 transition-colors duration-200"
              >
                Sign in
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
              <div className="space-y-6">
                {/* Success Message */}
                {message && (
                  <div className="rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">{message}</p>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
                    </div>
                  </div>
                )}

                {isValidToken && (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* New Password */}
                    <div className="group">
                      <label htmlFor="password" className="block text-sm font-blindcharm-brand text-white dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-gray-300 dark:group-hover:border-gray-500 text-base"
                          placeholder="Enter new password"
                          minLength={6}
                          style={{ fontSize: '16px' }}
                        />
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="group">
                      <label htmlFor="confirmPassword" className="block text-sm font-blindcharm-brand text-white dark:text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-gray-300 dark:group-hover:border-gray-500 text-base"
                          placeholder="Confirm new password"
                          minLength={6}
                          style={{ fontSize: '16px' }}
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full overflow-hidden rounded-2xl bg-red-600 hover:bg-red-700 px-6 py-4 text-white font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <div className="relative flex items-center justify-center space-x-2">
                          {loading ? (
                            <>
                              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Updating...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              <span>Update Password</span>
                            </>
                          )}
                        </div>
                      </button>
                    </div>
                  </form>
                )}

                {!isValidToken && error && (
                  <div className="text-center">
                    <Link
                      href="/forgot-password"
                      className="inline-flex items-center space-x-2 text-sm font-medium text-red-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>Request New Reset Link</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full max-w-md mx-auto mt-8 text-center">
          <p className="text-xs text-gray-800 dark:text-gray-400">
            Your password should be at least 6 characters long
          </p>
        </div>
      </div>
    </div>
  )
}