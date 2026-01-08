// src/app/(auth)/login/page.tsx
'use client'
import PhoneAuth from '@/components/auth/PhoneAuth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [authSuccess, setAuthSuccess] = useState(false)

  const handleAuthSuccess = async (phoneNumber: string) => {
    setAuthSuccess(true)

    // Wait briefly for NextAuth session to establish
    try {
      const { getSession } = await import('next-auth/react')
      const start = Date.now()
      let session = await getSession()
      while (!session && Date.now() - start < 2000) { // wait up to 2s
        await new Promise(r => setTimeout(r, 200))
        session = await getSession()
      }
    } catch { }

    // Navigate to galaxy
    router.replace('/galaxy')
  }

  const handleAuthError = (error: string) => {
    console.error('Phone auth error:', error)
  }

  if (authSuccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 overflow-hidden bg-black selection:bg-pink-500/30">

      {/* Background Image with Gradient */}
      <div className="absolute inset-0 z-0 select-none">
        <Image
          src="/photos/p5.jpg"
          alt="Login Background"
          fill
          className="object-cover opacity-40 scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">

        {/* Header */}
        <div className="text-center space-y-4">
          {/* Replaced Image Logo with just spacing/alignment or nothing for simplicity */}

          <h1 className="text-6xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-outfit)' }}>
            Blind<span className="text-pink-500 italic font-normal" style={{ fontFamily: 'var(--font-playfair)' }}>Charm</span>
          </h1>
          <p className="text-lg text-white/50 font-light max-w-xs mx-auto leading-relaxed">
            Verified connections only.
          </p>
        </div>

        {/* Auth Card */}
        <div className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-3xl p-1 shadow-2xl relative">
          <div className="bg-white/5 rounded-[20px] p-6 sm:p-8 space-y-6">
            <PhoneAuth onSuccess={handleAuthSuccess} onError={handleAuthError} />
          </div>
        </div>

      </div>

      {/* Footer Text */}
      <div className="absolute bottom-8 w-full text-center z-20">
        <p className="text-xs text-white/30 px-8 leading-relaxed font-light">
          By continuing, you agree to our <Link href="/terms" className="hover:text-white transition-colors underline decoration-white/20">Terms of Service</Link> & <Link href="/privacy" className="hover:text-white transition-colors underline decoration-white/20">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}