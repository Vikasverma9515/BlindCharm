'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PhoneAuth from '@/components/auth/PhoneAuth'
import FirebaseTest from '@/components/auth/FirebaseTest'
import { ArrowLeft, Shield, CheckCircle } from 'lucide-react'

export default function PhoneLoginPage() {
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
                Redirecting you to complete your profile...
              </p>
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex items-center mb-6">
            <Link
              href="/login"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white ml-3">
              Phone Verification
            </h1>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Secure Phone Verification
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  We use Firebase for secure phone verification. Your number is encrypted and never shared.
                </p>
              </div>
            </div>
          </div>

          {/* Firebase Configuration Test */}
          {/* <FirebaseTest /> */}

          {/* Phone Auth Component */}
          <PhoneAuth
            onSuccess={handleAuthSuccess}
            onError={handleAuthError}
          />
          {/* <div>
            <small>
              This site is protected by reCAPTCHA and the Google
              <a href="https://policies.google.com/privacy">Privacy Policy</a> and
              <a href="https://policies.google.com/terms">Terms of Service</a> apply.
            </small>

          </div> */}

          {/* Alternative Login */}
          {/* <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Prefer email login?
              </p>
              <Link
                href="/login"
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm"
              >
                Sign in with Email & Password
              </Link>
            </div>
          </div> */}
          <div className="mt-6 space-y-2">
            <small className="  text-gray-900 dark:text-white">
              This site is protected by reCAPTCHA and the Google
              <a className='text-primary-600' href="https://policies.google.com/privacy">Privacy Policy</a> and
              <a className='text-primary-600' href="https://policies.google.com/terms">Terms of Service</a> apply.
            </small>

          </div>

          {/* Benefits */}
          {/* <div className="mt-6 space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Why phone verification?
            </h4>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Prevents fake accounts and spam</li>
              <li>• Faster login without passwords</li>
              <li>• More secure than email verification</li>
              <li>• Better user experience</li>
            </ul>
          </div> */}
        </div>
      </div>
    </div>
  )
}