// src/app/(auth)/register/page.tsx
import Link from 'next/link'
import SignUpForm from '@/components/auth/SignUpForm'
import CuteFaceBubble from '@/components/ui/CuteFaceBubbe'
import CuteFaceBubble2 from '@/components/ui/CuteFaceBubble2'
import { boldonse } from '@/app/fonts'

export default function RegisterPage() {


  return (


    // <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-500">
    //   {/* Background Pattern */}
    //   <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,0,0,0.15)_1px,transparent_0)] [background-size:20px_20px] opacity-30"></div>

    //   <div className="relative flex flex-col justify-center min-h-screen py-8 px-4 sm:px-6 lg:px-8">
    // <div className="min-h-screen  bg-transparent dark:bg-gray-900 transition-all duration-500">
    <div className="min-h-screen relative flex flex-col justify-center dark:bg-gray-900 transition-all duration-500">
      {/* Background Pattern */}
     
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

            <div className="flex justify-center mb-3 scale-75">
              <CuteFaceBubble2 size="md" />
            </div>

            <h1 className="text-3xl font-blindcharm-tech text-gray-900 dark:text-gray-100 mb-2">
              Join BlindCharm
            </h1>
            <p className="text-gray-800 dark:text-gray-400 text-lg font-ui">
              Start your anonymous dating journey
            </p>
          </div>

          <div>
            {/* Sign in link */}
            <div className="text-center mb-8 ">
              <p className="text-sm  text-gray-800 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 transition-colors duration-200"
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
              <div className="absolute inset-0 bg-indigo-500  dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border  dark:border-gray-700/50"></div>

              {/* Form content */}
              <div className="relative p-8">
                <SignUpForm />
              </div>
            </div>
          </div>

        </div>



        {/* Footer */}
        <div className="w-full max-w-md mx-auto mt-8 text-center">
          <p className="text-xs text-gray-800 dark:text-gray-400">
            By creating an account, you agree to our{' '}
            <a href="/terms" className="text-red-600 dark:text-red-400 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-red-600 dark:text-red-400 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>

  )
}