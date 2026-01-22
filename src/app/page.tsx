'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import VibeTypingAnimation from '@/components/landing/VibeTypingAnimation';
import { ShieldCheck, Shield, Headset } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-900/30 overflow-x-hidden">

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 md:px-12 flex justify-between items-center bg-gradient-to-b from-black/90 to-transparent ">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="relative w-12 h-12 md:w-10 md:h-10">
            <Image src="/logo3.png" alt="BlindCharm Logo" fill className="object-contain" />
          </div>
          <span className="font-heading font-bold text-xl md:text-2xl tracking-tight text-white">
            BlindCharm
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          <Link href="/login" className="hidden md:block font-medium text-sm tracking-wide text-gray-300 hover:text-white transition-colors">
            Login
          </Link>
          <button
            onClick={() => router.push('/login')}
            className="bg-white text-black font-bold text-sm px-6 py-3 rounded-full hover:bg-gray-200 transition-colors"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="relative w-full h-screen flex flex-col justify-end pb-20 md:pb-32 px-6 md:px-12">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/photos/p2.jpg"
            alt="Couple Connection"
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-heading font-black text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight mb-10"
          >
            Your vibe changes <br />
            <span className="italic font-serif text-[#DC2626]">daily</span>. So do <br />
            your matches.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            <button
              onClick={() => router.push('/login')}
              className="bg-[#DC2626] text-white font-bold text-lg px-10 py-4 rounded-full hover:bg-[#B91C1C] transition-all transform hover:scale-105 shadow-lg shadow-red-900/30"
            >
              Find Real Connection
            </button>
          </motion.div>
        </div>
      </main>

      {/* --- WHY WE BUILT THIS SECTION --- */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-black border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          {/* Main Quote */}
          <div className="mb-16">
            <div className="inline-block mb-6">
              <span className="text-gray-500 font-mono text-sm tracking-widest">OUR MISSION</span>
            </div>
            <h2 className="font-heading font-black text-4xl md:text-5xl lg:text-6xl leading-tight mb-8">
              Dating apps made you <br />
              swipe on photos. <br />
              We made you fall for <span className="italic text-white/60">vibes</span>.
            </h2>
          </div>

          {/* Description */}
          <div className="space-y-6 text-lg md:text-xl text-gray-400 leading-relaxed">
            <p>
              We were tired of dating apps that felt like shopping catalogs. Endless profiles,
              superficial connections, and the same disappointment every time.
            </p>
            <p>
              So we built BlindCharm—where your personality, voice, and energy matter more than your height or job title.
              Where AI understands your mood <span className="text-white italic">today</span>, not a bio you wrote months ago.
            </p>
            <p className="text-white font-medium">
              Real connections don't come from filters. They come from vibes.
            </p>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS SECTION --- */}
      <section className="py-20 md:py-32 px-6 md:px-12 bg-black">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="font-heading font-black text-4xl md:text-5xl lg:text-6xl mb-4">
              How it works
            </h2>
            <p className="text-gray-400 text-lg md:text-xl">
              Three simple steps to find your match
            </p>
          </div>

          {/* Step 1: Swipe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32">
            <div className="order-2 md:order-1">
              <div className="mb-4">
                <span className="text-gray-500 font-mono text-sm">01</span>
                <h3 className="font-heading font-bold text-3xl md:text-4xl mt-2">
                  Explore profiles
                </h3>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed">
                Browse through authentic profiles in the Galaxy feed. Each card shows who they really are—voice notes, personality, and real vibes.
              </p>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              {/* Phone Mockup 1 */}
              <div className="relative w-[280px] h-[570px] bg-zinc-900 rounded-[3rem] border-4 border-zinc-800 overflow-hidden shadow-2xl">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-10" />
                {/* Screenshot */}
                <div className="w-full h-full">
                  <Image
                    src="/photos/m1.png"
                    alt="Profile swipe"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Vibe Search (Typing Animation) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32">
            <div className="flex justify-center">
              <VibeTypingAnimation />
            </div>
            <div>
              <div className="mb-4">
                <span className="text-gray-500 font-mono text-sm">02</span>
                <h3 className="font-heading font-bold text-3xl md:text-4xl mt-2">
                  Describe your vibe
                </h3>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed">
                Tell our AI what energy you're looking for. "Someone adventurous and spontaneous" or "deep conversations over coffee"—we'll find them.
              </p>
            </div>
          </div>

          {/* Step 3: Match */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="mb-4">
                <span className="text-gray-500 font-mono text-sm">03</span>
                <h3 className="font-heading font-bold text-3xl md:text-4xl mt-2">
                  Get matched
                </h3>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed">
                AI curates profiles that match your current mood and energy. Every match is personalized to who you are today, not yesterday.
              </p>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              {/* Phone Mockup 2 */}
              <div className="relative w-[280px] h-[570px] bg-zinc-900 rounded-[3rem] border-4 border-zinc-800 overflow-hidden shadow-2xl">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-10" />
                {/* Screenshot */}
                <div className="w-full h-full">
                  <Image
                    src="/photos/m3.png"
                    alt="Curated matches"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- WHAT MAKES US DIFFERENT --- */}
      <section className="relative py-24 md:py-32 px-6 md:px-12 bg-black border-t border-white/5 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/photos/p7.jpg"
            alt="Connection"
            fill
            className="object-cover opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-heading font-black text-4xl md:text-5xl lg:text-6xl mb-4">
              What makes us different
            </h2>
            <p className="text-gray-400 text-lg md:text-xl">
              We're not like other dating apps
            </p>
          </div>

          {/* Comparison Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Other Apps */}
            <div>
              <div className="mb-8">
                <h3 className="font-heading font-bold text-3xl md:text-4xl text-gray-500 mb-3">
                  Other apps
                </h3>
                <div className="w-12 h-1 bg-gray-700"></div>
              </div>
              <div className="space-y-5">
                <div className="flex items-start gap-4 group">
                  <div className="mt-1 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-600 flex items-center justify-center">
                      <span className="text-gray-600 text-sm">✗</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-lg">Endless swiping on photos</p>
                </div>
                <div className="flex items-start gap-4 group">
                  <div className="mt-1 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-600 flex items-center justify-center">
                      <span className="text-gray-600 text-sm">✗</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-lg">Static profiles from months ago</p>
                </div>
                <div className="flex items-start gap-4 group">
                  <div className="mt-1 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-600 flex items-center justify-center">
                      <span className="text-gray-600 text-sm">✗</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-lg">Filter by height, job, zodiac sign</p>
                </div>
                <div className="flex items-start gap-4 group">
                  <div className="mt-1 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-600 flex items-center justify-center">
                      <span className="text-gray-600 text-sm">✗</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-lg">Superficial connections</p>
                </div>
              </div>
            </div>

            {/* BlindCharm */}
            <div className="lg:border-l lg:border-white/10 lg:pl-12">
              <div className="mb-8">
                <h3 className="font-heading font-bold text-3xl md:text-4xl text-white mb-3">
                  BlindCharm
                </h3>
                <div className="w-12 h-1 bg-white"></div>
              </div>
              <div className="space-y-5">
                <div className="flex items-start gap-4 group">
                  <div className="mt-1 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                      <span className="text-black text-sm font-bold">✓</span>
                    </div>
                  </div>
                  <p className="text-white text-lg font-medium">Vibe-first matching with AI</p>
                </div>
                <div className="flex items-start gap-4 group">
                  <div className="mt-1 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                      <span className="text-black text-sm font-bold">✓</span>
                    </div>
                  </div>
                  <p className="text-white text-lg font-medium">Matches your mood today</p>
                </div>
                <div className="flex items-start gap-4 group">
                  <div className="mt-1 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                      <span className="text-black text-sm font-bold">✓</span>
                    </div>
                  </div>
                  <p className="text-white text-lg font-medium">Search by personality and energy</p>
                </div>
                <div className="flex items-start gap-4 group">
                  <div className="mt-1 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                      <span className="text-black text-sm font-bold">✓</span>
                    </div>
                  </div>
                  <p className="text-white text-lg font-medium">Real, authentic connections</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- TRUST & SAFETY --- */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-black border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-black text-4xl md:text-5xl lg:text-6xl mb-4">
              Your safety matters
            </h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
              Multiple layers of verification and a dedicated support team to keep you safe
            </p>
          </div>

          {/* Safety Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Verification */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-heading font-bold text-xl mb-2">Triple Verification</h3>
              <p className="text-gray-400 text-sm">
                Face, phone, and email verification for authentic profiles
              </p>
            </div>

            {/* User Controls */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-heading font-bold text-xl mb-2">Full Control</h3>
              <p className="text-gray-400 text-sm">
                Report, block, or unmatch anytime. You're always in control
              </p>
            </div>

            {/* Support Team */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                <Headset className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-heading font-bold text-xl mb-2">24/7 Support</h3>
              <p className="text-gray-400 text-sm">
                Real people ready to help. Report issues and get quick responses
              </p>
            </div>
          </div>

          {/* Bottom Statement */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Read our{' '}
              <Link href="/safety-center" className="text-white hover:underline">
                Safety Center
              </Link>
              {' '}and{' '}
              <Link href="/community-guidelines" className="text-white hover:underline">
                Community Guidelines
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* --- SIMPLE CTA --- */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-black border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading font-black text-4xl md:text-5xl lg:text-6xl mb-6">
            Ready to find your vibe?
          </h2>
          <p className="text-gray-400 text-lg md:text-xl mb-10">
            Join thousands finding real connections.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="bg-white text-black font-bold text-lg px-12 py-5 rounded-full hover:bg-gray-200 transition-colors"
          >
            Get Started Free
          </button>
        </div>
      </section>

      {/* --- MINIMAL FOOTER WITH HERO AVATARS --- */}
      <footer className="relative bg-black text-gray-500 py-16 px-6 md:px-12 border-t border-white/5 overflow-hidden">
        {/* Floating Hero Avatars Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          {/* Row 1 */}
          <motion.div
            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 left-[5%]"
          >
            <Image src="/HeroAvatar/a1.svg" alt="" width={40} height={40} className="opacity-60" />
          </motion.div>

          <motion.div
            animate={{ y: [0, 15, 0], x: [0, -8, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-20 left-[25%]"
          >
            <Image src="/HeroAvatar/a3.svg" alt="" width={35} height={35} className="opacity-40" />
          </motion.div>

          <motion.div
            animate={{ y: [0, -18, 0], x: [0, 5, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute top-8 right-[30%]"
          >
            <Image src="/HeroAvatar/a7.svg" alt="" width={38} height={38} className="opacity-50" />
          </motion.div>

          <motion.div
            animate={{ y: [0, 12, 0], x: [0, -10, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-16 right-[10%]"
          >
            <Image src="/HeroAvatar/a10.svg" alt="" width={42} height={42} className="opacity-30" />
          </motion.div>

          {/* Row 2 */}
          <motion.div
            animate={{ y: [0, -15, 0], x: [0, 12, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute bottom-20 left-[15%]"
          >
            <Image src="/HeroAvatar/a5.svg" alt="" width={36} height={36} className="opacity-50" />
          </motion.div>

          <motion.div
            animate={{ y: [0, 20, 0], x: [0, -6, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            className="absolute bottom-32 left-[40%]"
          >
            <Image src="/HeroAvatar/a12.svg" alt="" width={40} height={40} className="opacity-40" />
          </motion.div>

          <motion.div
            animate={{ y: [0, -10, 0], x: [0, 8, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
            className="absolute bottom-24 right-[20%]"
          >
            <Image src="/HeroAvatar/a14.svg" alt="" width={38} height={38} className="opacity-60" />
          </motion.div>

          <motion.div
            animate={{ y: [0, 18, 0], x: [0, -12, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
            className="absolute bottom-10 right-[5%]"
          >
            <Image src="/HeroAvatar/a16.svg" alt="" width={44} height={44} className="opacity-35" />
          </motion.div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="relative w-8 h-8">
                  <Image src="/logo3.png" alt="BlindCharm" fill className="object-contain" />
                </div>
                <span className="font-heading font-bold text-xl text-white">
                  BlindCharm
                </span>
              </div>
              <p className="text-gray-500 text-sm max-w-xs mb-4">
                AI-powered dating that matches your vibe.
              </p>
              {/* Small Avatar Row */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex -space-x-2">
                  <Image src="/HeroAvatar/a2.svg" alt="" width={28} height={28} className="rounded-full border-2 border-black" />
                  <Image src="/HeroAvatar/a6.svg" alt="" width={28} height={28} className="rounded-full border-2 border-black" />
                  <Image src="/HeroAvatar/a9.svg" alt="" width={28} height={28} className="rounded-full border-2 border-black" />
                  <Image src="/HeroAvatar/a11.svg" alt="" width={28} height={28} className="rounded-full border-2 border-black" />
                </div>
                <span className="text-xs text-gray-600">Join thousands finding their vibe</span>
              </div>
              {/* Social Links */}
              <div className="flex items-center gap-3">
                <a
                  href="https://www.linkedin.com/company/blindcharm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-white transition-colors"
                  aria-label="BlindCharm LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/blindcharmx/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-white transition-colors"
                  aria-label="BlindCharm Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-bold text-white text-sm mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">How it works</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-white text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h4 className="font-bold text-white text-sm mb-3">Community</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/safety-center" className="hover:text-white transition-colors">Safety Center</Link></li>
                <li><Link href="/community-guidelines" className="hover:text-white transition-colors">Community Guidelines</Link></li>
                <li><Link href="/dating-tips" className="hover:text-white transition-colors">Dating Tips</Link></li>
                <li><Link href="/founder" className="hover:text-white transition-colors">Meet the Founder</Link></li>
                {/* <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li> */}
                {/* <li>
                  <a
                    href="https://www.linkedin.com/in/vikas-verma-9515/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Creator (Vikas)
                  </a>
                </li> */}
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-white/5 text-center md:text-left">
            <p className="text-sm text-gray-600">
              © 2026 BlindCharm. All rights reserved.
            </p>
          </div>
        </div>
      </footer>


    </div>
  );
}
