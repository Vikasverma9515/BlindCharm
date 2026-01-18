'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-[#FFA6A6] overflow-x-hidden">

      {/* --- GRID NAVBAR --- */}
      <nav className="border-b-2 border-black bg-white relative z-50">
        <div className="grid grid-cols-12 h-16 md:h-20 items-stretch">

          {/* Left Links - Hidden on Mobile, Visible on MD+ */}
          <div className="hidden md:flex col-span-4 border-r-2 border-black divide-x-2 divide-black">
            {['Chat', 'Partnership', 'Blog'].map((item) => (
              <Link key={item} href="#" className="flex-1 flex items-center justify-center font-bold hover:bg-gray-50 transition-colors text-sm lg:text-base">
                {item}
              </Link>
            ))}
          </div>

          {/* Logo - Center */}
          <div className="col-span-6 md:col-span-4 flex items-center justify-center font-black text-2xl md:text-3xl tracking-tighter border-r-2 md:border-r-2 border-black gap-2">
            <div className="relative w-8 h-8 md:w-10 md:h-10">
              <Image src="/logo2.png" alt="BlindCharm Logo" fill className="object-contain" />
            </div>
            <span className="text-[#FFA6A6]">BLIND</span>
            <span>CHARM</span>
          </div>

          {/* Right Links - Log In / Sign Up */}
          <div className="col-span-6 md:col-span-4 flex divide-x-2 divide-black">
            <Link href="/login" className="flex-1 flex items-center justify-center font-bold hover:bg-gray-50 transition-colors">
              Log In
            </Link>
            <Link href="/login" className="flex-1 flex items-center justify-center font-bold bg-[#FFA6A6] hover:bg-[#ff8f8f] transition-colors">
              Sign Up
            </Link>
          </div>

        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="relative pt-16 pb-0 md:pt-32 px-4 overflow-hidden min-h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] md:min-h-[600px] flex flex-col justify-end">
        <div className="max-w-7xl mx-auto text-center relative z-10 w-full mb-auto mt-auto">

          {/* Floating Polaroids (Decorative) */}
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-60 left-[5%] hidden xl:block w-20 h-24 bg-white border-2 border-black p-2 shadow-[3px_3px_0px_0px_#000] rotate-[-12deg] z-20"
          >
            <div className="w-full h-[70%] bg-pink-100 flex items-center justify-center border border-black/10">
              <span className="text-xl">❤️</span>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute top-50 right-[5%] hidden xl:block w-20 h-24 bg-white border-2 border-black p-2 shadow-[3px_3px_0px_0px_#000] rotate-[12deg] z-20"
          >
            <div className="w-full h-[70%] bg-blue-100 flex items-center justify-center border border-black/10">
              <span className="text-xl">💙</span>
            </div>
          </motion.div>


          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-black mb-3 md:mb-2 tracking-tight leading-[1.1] md:leading-[1]">
            Find Your <span className="text-[#FFA6A6]">Real Connections</span>
          </h1>

          {/* Subtext */}
          <p className="max-w-xl mx-auto text-lg md:text-xl font-medium text-gray-600 mb-6 leading-tight">
            We are committed to helping singles find love every day.
            BlindCharm matches single women and men for lasting relationships.
          </p>

          {/* Brutalist CTA */}
          <button
            onClick={() => router.push('/login')}
            className="inline-block bg-[#FFA6A6] text-black font-black text-lg sm:text-xl md:text-3xl px-8 py-3 sm:px-12 sm:py-4 md:px-16 md:py-6 border-2 md:border-[3px] border-black rounded-full shadow-[4px_4px_0px_0px_#000] md:shadow-[6px_6px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] md:hover:shadow-[4px_4px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] md:active:translate-x-[6px] md:active:translate-y-[6px] active:shadow-none transition-all tracking-wide"
          >
            Join BlindCharm
          </button>
        </div>

        {/* --- ILLUSTRATION AREA --- */}
        <div className="relative w-full max-w-6xl mx-auto h-[25vh] sm:h-[30vh] min-h-[250px] sm:min-h-[300px] mt-4 sm:mt-0 flex items-end justify-center gap-2 sm:gap-4 md:gap-[500px]">

          {/* Center Heart BG */}
          <div className="absolute left-1/2 top-40 -translate-x-1/2 w-64 h-64 md:w-[500px] md:h-[500px] bg-pink-50 rounded-full blur-3xl opacity-50 z-0" />

          {/* Left Phone & Chat */}
          <div className="relative z-10 w-[100px] md:w-[200px] aspect-[9/18] transform -rotate-6 translate-y-20 md:translate-y-24">
            {/* Chat Bubble Left */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute -top-16 -right-12 md:-right-24 bg-white border-2 border-black px-4 py-2 rounded-2xl rounded-bl-none shadow-[4px_4px_0px_0px_#000] z-30 max-w-[140px] md:max-w-none"
            >
              <p className="text-xs md:text-sm font-bold">Hey! Love your vibe ✨</p>
            </motion.div>

            {/* Phone Body */}
            <div className="w-full h-full bg-white border-[3px] md:border-4 border-black rounded-[2rem] overflow-hidden relative shadow-xl">
              <div className="absolute top-0 left-0 w-full h-8 bg-black/5 border-b-2 border-black z-20 flex items-center justify-center">
                <div className="w-8 h-2 bg-black rounded-full/20 bg-black/20" />
              </div>
              <div className="w-full h-full relative bg-gray-50">
                <Image src="/HeroAvatar/a4.svg" alt="User 1" fill className="object-cover object-top pt-8" />
              </div>
              {/* Floating Heart Icon Overlay */}
              <div className="absolute bottom-4 right-4 w-6 h-6 md:w-8 md:h-8 bg-white border-2 border-black rounded-full flex items-center justify-center z-20">
                <span className="text-xs md:text-base">❤️</span>
              </div>
            </div>
          </div>

          {/* Center Connection (Motion Heart) */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute left-1/2 top-10 -translate-x-1/2 z-0 hidden md:flex"
          >
            <div className="w-16 h-16 bg-[#FF6B6B] rounded-full flex items-center justify-center pb-1 shadow-xl border-4 border-white">
              <svg width="60%" height="60%" viewBox="0 0 24 24" fill="white" className="transform translate-y-1">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          </motion.div>

          {/* Right Phone & Chat */}
          <div className="relative z-10 w-[100px] md:w-[200px] aspect-[9/18] transform rotate-6 translate-y-20 md:translate-y-24">
            {/* Chat Bubble Right */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="absolute -top-12 -left-12 md:-left-24 bg-[#E3F2FD] border-2 border-black px-4 py-2 rounded-2xl rounded-br-none shadow-[4px_4px_0px_0px_#000] z-30 max-w-[140px] md:max-w-none"
            >
              <p className="text-xs md:text-sm font-bold">Matched 100%! 😉</p>
            </motion.div>

            {/* Phone Body */}
            <div className="w-full h-full bg-white border-[3px] md:border-4 border-black rounded-[2rem] overflow-hidden relative shadow-xl">
              <div className="absolute top-0 left-0 w-full h-8 bg-black/5 border-b-2 border-black z-20 flex items-center justify-center">
                <div className="w-8 h-2 bg-black rounded-full/20 bg-black/20" />
              </div>
              <div className="w-full h-full relative bg-gray-50">
                {/* Flipped for looking at left */}
                <div className="w-full h-full transform -scale-x-100">
                  <Image src="/HeroAvatar/a10.svg" alt="User 2" fill className="object-cover object-top pt-8" />
                </div>
              </div>
              {/* Floating Icon Overlay */}
              <div className="absolute bottom-4 left-4 w-6 h-6 md:w-8 md:h-8 bg-white border-2 border-black rounded-full flex items-center justify-center z-20">
                <span className="text-xs md:text-base">💬</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* --- FEATURES SECTION (Phase 2) --- */}
      <section className="grid grid-cols-1 md:grid-cols-3 border-t-2 border-black">

        {/* Feature 1: AI Vibe Finding (Cyan) */}
        <div className="bg-[#E0F7FA] border-b-2 md:border-b-0 md:border-r-2 border-black p-8 md:p-12 flex flex-col items-start min-h-[400px]">
          <div className="w-16 h-16 bg-white border-2 border-black rounded-full flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#000]">
            <span className="text-3xl">✨</span>
          </div>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 leading-tight">AI Vibe Finding</h3>
          <p className="text-lg font-bold mb-4">"Chemistry is Real"</p>
          <p className="text-black/80 font-medium leading-relaxed">
            Our advanced AI doesn't just look at demographics; it analyzes your "vibe"—your voice, your style, your personality. It finds matches that you will actually click with on a deeper level.
          </p>
        </div>

        {/* Feature 2: Swiping Reimagined (Yellow) */}
        <div className="bg-[#FFF9C4] border-b-2 md:border-b-0 md:border-r-2 border-black p-8 md:p-12 flex flex-col items-start min-h-[400px]">
          <div className="w-16 h-16 bg-white border-2 border-black rounded-full flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#000]">
            <span className="text-3xl">🤳</span>
          </div>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 leading-tight">Swiping Reimagined</h3>
          <p className="text-lg font-bold mb-4">"Intuitive Discovery"</p>
          <p className="text-black/80 font-medium leading-relaxed">
            We've kept the familiar ease of the swipe but refined the quality. A smoother, more engaging interface that puts the focus on the person, not just the profile picture.
          </p>
        </div>

        {/* Feature 3: Smart Daily Picks (Pink) */}
        <div className="bg-[#FCE4EC] p-8 md:p-12 flex flex-col items-start min-h-[400px]">
          <div className="w-16 h-16 bg-white border-2 border-black rounded-full flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#000]">
            <span className="text-3xl">🎯</span>
          </div>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 leading-tight">Smart Daily Picks</h3>
          <p className="text-lg font-bold mb-4">"Quality Over Quantity"</p>
          <p className="text-black/80 font-medium leading-relaxed">
            Every day, BlindCharm curates a selection of profiles just for you. Hand-picked by our algorithms to ensure you see the most relevant people first.
          </p>
        </div>

      </section>

      {/* --- HOW IT WORKS SECTION --- */}
      <section className="bg-[#FFF9C4] border-t-2 border-black py-12 sm:py-16 md:py-20 px-4 overflow-hidden relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

          {/* Left Content */}
          <div className="flex flex-col gap-10">
            <div>
              <h2 className="text-4xl md:text-6xl font-black text-black mb-4">
                How Our App <span className="text-[#FFA6A6]">Work?</span>
              </h2>
              <p className="text-lg font-medium text-gray-800 leading-relaxed max-w-lg">
                We are committed to helping singles find love every day. BlindCharm matches single women and men for lasting and fulfilling relationships.
              </p>
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Step 1 */}
              <div className="bg-[#E0F7FA] border-2 border-black p-6 shadow-[4px_4px_0px_0px_#000]">
                <span className="block text-2xl font-black mb-2 opacity-50">1</span>
                <h4 className="text-xl font-bold mb-2">Download App</h4>
                <p className="text-sm font-medium opacity-80">Get started by downloading BlindCharm on iOS or Android.</p>
              </div>

              {/* Step 2 */}
              <div className="bg-[#E3F2FD] border-2 border-black p-6 shadow-[4px_4px_0px_0px_#000]">
                <span className="block text-2xl font-black mb-2 opacity-50">2</span>
                <h4 className="text-xl font-bold mb-2">Create Account</h4>
                <p className="text-sm font-medium opacity-80">Sign up in seconds using your phone number or social login.</p>
              </div>

              {/* Step 3 */}
              <div className="bg-[#E8F5E9] border-2 border-black p-6 shadow-[4px_4px_0px_0px_#000]">
                <span className="block text-2xl font-black mb-2 opacity-50">3</span>
                <h4 className="text-xl font-bold mb-2">Fill Profile</h4>
                <p className="text-sm font-medium opacity-80">Let our AI analyze your vibe. Upload photos and answer prompts.</p>
              </div>

              {/* Step 4 */}
              <div className="bg-[#F3E5F5] border-2 border-black p-6 shadow-[4px_4px_0px_0px_#000]">
                <span className="block text-2xl font-black mb-2 opacity-50">4</span>
                <h4 className="text-xl font-bold mb-2">Start Swiping</h4>
                <p className="text-sm font-medium opacity-80">Discover matches that resonate with your real personality.</p>
              </div>

            </div>
          </div>

          {/* Right Illustration (Mockup Placeholder) */}
          <div className="relative h-full min-h-[500px] hidden lg:flex items-center justify-center">
            {/* Abstract Blob Background */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#FFA6A6]/20 rounded-full blur-3xl z-0" />

            {/* Phone Mockup (CSS only for now) */}
            <div className="relative w-[300px] h-[600px] bg-white border-4 border-black rounded-[3rem] shadow-[12px_12px_0px_0px_#000] z-10 overflow-hidden flex flex-col">
              <div className="h-8 bg-black/5 border-b-2 border-black flex items-center justify-center gap-2">
                <div className="w-12 h-4 bg-black rounded-full" />
              </div>
              <div className="flex-1 bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
                {/* Reuse Hero Avatar as content inside phone */}
                <div className="absolute top-10 w-full h-full">
                  <Image src="/HeroAvatar/a10.svg" alt="App Content" fill className="object-cover object-top opacity-80" />
                </div>
                {/* Floating Hearts inside phone */}
                <div className="absolute bottom-10 right-10 bg-white border-2 border-black p-2 rounded-full shadow-md z-20">
                  <span className="text-2xl">❤️</span>
                </div>
                <div className="absolute bottom-10 left-10 bg-white border-2 border-black p-2 rounded-full shadow-md z-20">
                  <span className="text-2xl">❌</span>
                </div>
              </div>
            </div>

            {/* Hand Graphic (Simplified CSS Shape or omit if too complex) */}
            {/* Using a simple rotated div to simulate a 'grip' for now just to match the vibe */}
            <div className="absolute bottom-[-50px] right-[50px] w-64 h-64 bg-[#FFCCBC] rounded-full border-2 border-black z-20 hidden"></div>
          </div>

        </div>
      </section>

      {/* --- ARTICLES SECTION --- */}
      <section className="bg-white border-t-2 border-black py-12 sm:py-16 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-black mb-6">
              Our <span className="text-[#FFA6A6]">Articles & Tips</span> Update
            </h2>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-600 font-medium leading-relaxed px-2">
              We are committed to helping singles find love every day and we are confident in our ability to do so. MatchMaker matches single women and men.
            </p>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">

            {/* Card 1 */}
            <div className="border-2 border-black hover:shadow-[8px_8px_0px_0px_#000] transition-shadow duration-300">
              <div className="h-64 bg-[#FFE0B2] border-b-2 border-black relative overflow-hidden group">
                {/* Placeholder Illustration */}
                <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <div className="w-40 h-40 relative">
                    <Image src="/HeroAvatar/a6.svg" alt="Article 1" fill className="object-contain" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-black mb-3 leading-tight">Getting Over the Fantasy of Dating Someone</h3>
                <p className="text-gray-600 mb-6 font-medium">There's plenty of advice out there on how to get over a breakup, but what about those situations...</p>
                <Link href="/blog/getting-over-fantasy" className="inline-flex items-center font-black underline decoration-2 underline-offset-4 hover:text-[#FFA6A6] transition-colors">
                  Read More <span className="ml-2">→</span>
                </Link>
              </div>
            </div>

            {/* Card 2 */}
            <div className="border-2 border-black hover:shadow-[8px_8px_0px_0px_#000] transition-shadow duration-300">
              <div className="h-64 bg-[#F8BBD0] border-b-2 border-black relative overflow-hidden group">
                <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <div className="w-40 h-40 relative">
                    <Image src="/HeroAvatar/a8.svg" alt="Article 2" fill className="object-contain" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-black mb-3 leading-tight">6 Strategies to Increase Your Vulnerability</h3>
                <p className="text-gray-600 mb-6 font-medium">There's plenty of advice out there on how to get over a breakup, but what about those situations...</p>
                <Link href="/blog/strategies-vulnerability" className="inline-flex items-center font-black underline decoration-2 underline-offset-4 hover:text-[#FFA6A6] transition-colors">
                  Read More <span className="ml-2">→</span>
                </Link>
              </div>
            </div>

            {/* Card 3 */}
            <div className="border-2 border-black hover:shadow-[8px_8px_0px_0px_#000] transition-shadow duration-300">
              <div className="h-64 bg-[#FFCDD2] border-b-2 border-black relative overflow-hidden group">
                <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <div className="w-40 h-40 relative">
                    <Image src="/HeroAvatar/a12.svg" alt="Article 3" fill className="object-contain" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-black mb-3 leading-tight">The Puzzle of Finding Real Connection</h3>
                <p className="text-gray-600 mb-6 font-medium">There's plenty of advice out there on how to get over a breakup, but what about those situations...</p>
                <Link href="/blog/finding-real-connection" className="inline-flex items-center font-black underline decoration-2 underline-offset-4 hover:text-[#FFA6A6] transition-colors">
                  Read More <span className="ml-2">→</span>
                </Link>
              </div>
            </div>

          </div>

          {/* View More Button */}
          <div className="text-center">
            <button className="inline-block bg-[#FFA6A6] text-black font-black text-sm sm:text-base md:text-lg px-6 py-3 sm:px-10 sm:py-4 border-2 border-black shadow-[4px_4px_0px_0px_#000] md:shadow-[6px_6px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] md:hover:shadow-[4px_4px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] md:active:translate-x-[6px] md:active:translate-y-[6px] active:shadow-none transition-all uppercase tracking-widest">
              View more articles
            </button>
          </div>

        </div>
      </section>


      {/* --- FIND YOUR LOVE SECTION --- */}
      <section className="bg-white py-12 sm:py-16 md:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative">

          {/* Top Left Spiral Decoration (SVG) */}
          <div className="absolute -top-10 -left-10 z-0 opacity-50 hidden lg:block">
            <svg width="150" height="150" viewBox="0 0 100 100" fill="none" stroke="#E91E63" strokeWidth="2">
              <path d="M50 50 m 0 0 a 1 1 0 0 1 2 0 a 3 3 0 0 1 -6 0 a 6 6 0 0 1 12 0 a 10 10 0 0 1 -20 0 a 15 15 0 0 1 30 0 a 21 21 0 0 1 -42 0 a 28 28 0 0 1 56 0" strokeLinecap="round" />
            </svg>
          </div>

          {/* Top Right Polaroid */}
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [12, 15, 12] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 right-10 z-10 w-20 h-24 bg-white border-2 border-black p-2 shadow-[3px_3px_0px_0px_#000] rotate-[12deg] hidden md:block"
          >
            <div className="w-full h-[70%] bg-pink-100 flex items-center justify-center border border-black/10">
              <span className="text-xl">❤️</span>
            </div>
          </motion.div>

          <div className="flex flex-col lg:flex-row items-stretch min-h-[500px]">

            {/* Left: The Card */}
            <div className="w-full lg:w-1/2 relative z-20 flex items-center">
              <div className="bg-white border-2 border-black p-6 sm:p-8 md:p-12 w-full max-w-lg shadow-[8px_8px_0px_0px_#000] relative mt-10 lg:mt-0">
                {/* Pink Pill Decoration */}
                <div className="absolute -top-6 left-20 w-12 h-20 bg-[#FF4081] border-2 border-black rounded-full rotate-[-45deg] z-30" />
                <div className="absolute -top-6 left-20 w-12 h-20 bg-white border-2 border-black rounded-full rotate-[-45deg] z-20 translate-x-1 translate-y-1" />

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6">
                  Find <span className="text-black">Your love</span>
                </h2>
                <p className="text-gray-600 font-medium mb-8 leading-relaxed">
                  There's plenty of advice out there on how to get over a breakup, but what about those situations in which you have to let go of someone you.
                </p>
                <button className="bg-[#FFA6A6] text-black font-bold px-8 py-3 border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all">
                  Join Now
                </button>
              </div>
            </div>

            {/* Right: The Illustration Area */}
            <div className="w-full lg:w-1/2 bg-[#FFCDD2] relative min-h-[400px] lg:min-h-auto rounded-none lg:rounded-tr-[5rem] lg:rounded-bl-[5rem] mt-10 lg:mt-0 border-2 border-black overflow-hidden flex items-center justify-center">
              {/* Leaf Decorations */}
              <span className="absolute top-10 right-10 text-6xl text-[#EF5350] rotate-12">🌿</span>
              <span className="absolute bottom-10 left-10 text-6xl text-[#EF5350] -rotate-12">🌿</span>
              <span className="absolute top-1/2 right-4 text-4xl text-[#EF5350]">🍂</span>

              {/* Phone Illustration */}
              <div className="relative w-[180px] md:w-[240px] aspect-[9/18] bg-white border-4 border-black rounded-[2rem] shadow-2xl rotate-[-5deg] overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-8 bg-gray-100 border-b-2 border-black flex items-center justify-center z-10">
                  <div className="w-10 h-2 bg-gray-300 rounded-full" />
                </div>
                <div className="w-full h-full p-4 flex flex-col items-center pt-10 bg-pink-50">
                  <div className="w-16 h-16 rounded-full border-2 border-black overflow-hidden mb-2 bg-white">
                    <Image src="/HeroAvatar/a13.svg" alt="Match" width={64} height={64} />
                  </div>
                  <div className="w-20 h-3 bg-gray-200 rounded mb-4" />
                  <div className="w-full h-32 bg-[#FFEBEE] rounded-xl border-2 border-black flex items-center justify-center">
                    <span className="text-4xl animate-pulse">❤️</span>
                  </div>
                  {/* Fishing Line Graphic (CSS/SVG overlay) */}
                  <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                    <path d="M -100 100 Q 50 50 120 250" fill="none" stroke="black" strokeWidth="2" strokeDasharray="5,5" />
                  </svg>
                </div>
              </div>

              {/* Person Fishing (Composition) */}
              <div className="absolute left-[-20px] bottom-10 z-10 w-32 h-32 hidden md:block">
                <Image src="/HeroAvatar/a15.svg" alt="Fisher" width={128} height={128} />
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative bg-black text-white border-t-4 border-[#FFA6A6] overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFA6A6]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">

          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">

            {/* Logo & Tagline */}
            <div className="md:col-span-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="relative w-12 h-12">
                  <Image src="/logo3.png" alt="BlindCharm" fill className="object-contain" />
                </div>
                <div className="text-3xl font-black tracking-tighter">
                  <span className=" text-red-500 px-2 py-1 rounded-sm">BLIND</span>
                  <span className="ml-1">CHARM</span>
                </div>
              </div>
              <p className="text-gray-400 font-medium leading-relaxed max-w-sm">
                Where charm comes first. Experience authentic connections beyond the surface.
              </p>

              {/* App Store Badges */}
              <div className="flex gap-3 mt-6">
                <div className="bg-white text-black px-4 py-2 rounded-lg border-2 border-white hover:bg-[#FFA6A6] hover:border-[#FFA6A6] transition-all font-bold text-xs cursor-pointer shadow-[3px_3px_0px_0px_rgba(255,166,166,0.3)]">

                </div>
                <div className="bg-white text-black px-4 py-2 rounded-lg border-2 border-white hover:bg-[#FFA6A6] hover:border-[#FFA6A6] transition-all font-bold text-xs cursor-pointer shadow-[3px_3px_0px_0px_rgba(255,166,166,0.3)]">

                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-3">
              <h4 className="text-lg font-black mb-4 text-[#FFA6A6]">DISCOVER</h4>
              <ul className="space-y-3">
                {[
                  { label: 'How It Works', href: '#' },
                  { label: 'Features', href: '#' },
                  { label: 'Success Stories', href: '#' },
                  { label: 'Pricing', href: '#' },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-[#FFA6A6] transition-colors font-medium inline-flex items-center gap-2 group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="md:col-span-2">
              <h4 className="text-lg font-black mb-4 text-[#FFA6A6]">COMPANY</h4>
              <ul className="space-y-3">
                {[
                  { label: 'About Us', href: '#' },
                  { label: 'Careers', href: '#' },
                  { label: 'Press', href: '#' },
                  { label: 'Contact', href: '#' },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-[#FFA6A6] transition-colors font-medium inline-flex items-center gap-2 group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div className="md:col-span-3">
              <h4 className="text-lg font-black mb-4 text-[#FFA6A6]">SUPPORT</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Help Center', href: '#' },
                  { label: 'Safety Tips', href: '#' },
                  { label: 'Community Guidelines', href: '#' },
                  { label: 'Report Issue', href: '#' },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-[#FFA6A6] transition-colors font-medium inline-flex items-center gap-2 group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Divider */}
          <div className="h-[2px] bg-gradient-to-r from-transparent via-[#FFA6A6]/30 to-transparent mb-8" />

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">

            {/* Copyright */}
            <div className="text-gray-400 text-sm font-medium">
              © 2026 BlindCharm. All rights reserved. Made with ❤️ for real connections.
            </div>

            {/* Legal Links */}
            <div className="flex gap-6 text-sm font-medium">
              <Link href="#" className="text-gray-400 hover:text-[#FFA6A6] transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-gray-400 hover:text-[#FFA6A6] transition-colors">Terms of Service</Link>
              <Link href="#" className="text-gray-400 hover:text-[#FFA6A6] transition-colors">Cookie Policy</Link>
            </div>

            {/* Social Icons */}
            <div className="flex gap-3">
              {[
                { icon: 'I', label: 'Instagram' },
                { icon: 'F', label: 'Facebook' },
                { icon: 'T', label: 'Twitter' },
                { icon: 'L', label: 'LinkedIn' },
              ].map((social) => (
                <div
                  key={social.label}
                  className="group relative w-12 h-12 border-2 border-gray-700 rounded-full flex items-center justify-center hover:border-[#FFA6A6] hover:bg-[#FFA6A6]/10 transition-all cursor-pointer"
                  title={social.label}
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">{social.icon}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
