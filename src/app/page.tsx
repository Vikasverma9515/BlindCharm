'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

const BACKGROUND_IMAGES = [
  "/photos/p1.jpg",
  "/photos/p2.jpg",
  "/photos/p3.jpg",
  "/photos/p4.jpg",
  "/photos/p5.jpg",
  "/photos/p6.jpg",
  "/photos/p7.jpg",
  "/photos/p8.jpg",
  "/photos/p9.jpg",
  "/photos/p10.jpg"
];

export default function LandingPage() {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Slideshow Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);



  return (
    <div className="min-h-screen bg-black text-white font-serif selection:bg-pink-500/30">
      {/* Background Slideshow */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}

          className="fixed inset-0 z-0"
        >
          <Image
            src={BACKGROUND_IMAGES[currentImageIndex]}
            alt="Background"
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90" />
        </motion.div>
      </AnimatePresence>

      {/* Content Content - Z-Index 10 */}
      <div className="relative z-10 h-[100dvh] flex flex-col px-6 pb-8 pt-12 sm:py-10 sticky top-0">

        {/* Logo Area - Top Left */}
        <div className="flex-none">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="relative w-15 h-15">
              <Image
                src="/logo3.png"
                alt="BlindCharm Logo"
                fill
                className="object-contain rounded-xl"
                priority
              />
            </div>
            <h1 className="text-4xl font-bold tracking-tighter" style={{ fontFamily: 'var(--font-outfit)' }}>
              BlindCharm
            </h1>
          </motion.div>
        </div>

        {/* Spacer to push content down */}
        <div className="flex-1" />

        {/* Main Action Area - Bottom Aligned */}
        <div className="flex-none flex flex-col w-full max-w-lg mx-auto relative">

          {/* Landing Content - Always rendered to maintain layout height */}
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0, pointerEvents: 'auto' }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="space-y-4 mb-4">
              <h2 className="text-6xl sm:text-7xl font-bold leading-[0.9] tracking-tight" style={{ fontFamily: 'var(--font-outfit)' }}>
                Charm <br /> comes <br />
                <span className="italic font-normal text-pink-500" style={{ fontFamily: 'var(--font-playfair)' }}>
                  first.
                </span>
              </h2>
              <p className="text-base text-white/80 font-medium" style={{ fontFamily: 'var(--font-outfit)' }}>
                Love is blind. Chemistry is real.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/login')}
                className="w-full py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-gray-100 transition-transform active:scale-95 shadow-xl"
                style={{ fontFamily: 'var(--font-outfit)' }}
              >
                Create account
              </button>
            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-white/50 leading-relaxed pb-4" style={{ fontFamily: 'var(--font-outfit)' }}>
                By tapping "Create account", you agree to our{' '}
                <Link href="/terms" className="underline hover:text-white transition-colors">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="underline hover:text-white transition-colors">Privacy Policy</Link>.
              </p>
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                Photos from Unsplash
              </p>
            </div>
          </motion.div>
        </div>

        {/* Removed Separate Footer Section as it's now integrated */}
      </div>

      {/* Desktop Only Expanded Sections */}
      <div className="relative z-20 bg-black hidden md:block">

        {/* Mission Section */}
        <section className="py-32 px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.2 }}
                className="text-5xl lg:text-7xl font-bold leading-tight"
                style={{ fontFamily: 'var(--font-outfit)' }}
              >
                Connection <br />
                <span className="text-pink-500 italic font-normal" style={{ fontFamily: 'var(--font-playfair)' }}>Real Vibes.</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.2 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-white/70 leading-relaxed max-w-lg"
                style={{ fontFamily: 'var(--font-outfit)' }}
              >
                Experience dating without the doubt. Swipe on 100% verified profiles and find people who match your energy, right now.
                Real people, real vibes, real time.
              </motion.p>
            </div>
            <div className="relative h-[600px] w-full rounded-3xl overflow-hidden group">
              <Image
                src="/photos/p8.jpg"
                alt="Connection"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-8 left-8">
                <p className="text-2xl font-bold italic" style={{ fontFamily: 'var(--font-playfair)' }}>Verified Vibes Only.</p>
              </div>
            </div>
          </div>
        </section>

        {/* The BlindCharm Way - Redesigned */}
        <section className="py-24 bg-zinc-900 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-pink-900/10 blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 space-y-32 relative z-10">
            <div className="text-center space-y-6 mb-20">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.2 }}
                className="text-4xl md:text-6xl font-bold"
                style={{ fontFamily: 'var(--font-outfit)' }}
              >
                The <span className="text-pink-500 italic" style={{ fontFamily: 'var(--font-playfair)' }}>BlindCharm</span> Experience.
              </motion.h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                Dating, elevated. Real, Safe, and Spontaneous.
              </p>
            </div>

            {/* Feature 1: Verified Only */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 mb-8">
                  <span className="text-3xl">🛡️</span>
                </div>
                <h3 className="text-4xl md:text-5xl font-bold leading-tight" style={{ fontFamily: 'var(--font-outfit)' }}>
                  Verified <br />
                  <span className="text-pink-500 italic" style={{ fontFamily: 'var(--font-playfair)' }}>Only.</span>
                </h3>
                <p className="text-xl text-white/70 leading-relaxed">
                  Zero bots. Zero catfishes. Every single profile is phone-verified so you can trust who you're talking to.
                  Real people, guaranteed.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.8 }}
                className="relative h-[500px] w-full rounded-3xl overflow-hidden group border border-white/10 shadow-2xl"
              >
                <Image src="/photos/p5.jpg" alt="Verified" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </motion.div>
            </div>

            {/* Feature 2: Vibe Check */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.8 }}
                className="relative h-[500px] w-full rounded-3xl overflow-hidden group border border-white/10 shadow-2xl order-2 lg:order-1"
              >
                <Image src="/photos/p9.jpg" alt="Vibe Check" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.8 }}
                className="space-y-6 order-1 lg:order-2 lg:pl-12"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center border border-white/10 mb-8">
                  <span className="text-3xl">⚡</span>
                </div>
                <h3 className="text-4xl md:text-5xl font-bold leading-tight" style={{ fontFamily: 'var(--font-outfit)' }}>
                  Vibe <br />
                  <span className="text-yellow-500 italic" style={{ fontFamily: 'var(--font-playfair)' }}>Check.</span>
                </h3>
                <p className="text-xl text-white/70 leading-relaxed">
                  Find someone for the moment. Whether it's a spontaneous coffee or a deep midnight drive, match on mood and energy.
                </p>
              </motion.div>
            </div>

            {/* Feature 3: Swipe & Match */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center border border-white/10 mb-8">
                  <span className="text-3xl">🔥</span>
                </div>
                <h3 className="text-4xl md:text-5xl font-bold leading-tight" style={{ fontFamily: 'var(--font-outfit)' }}>
                  Swipe <br />
                  <span className="text-purple-500 italic" style={{ fontFamily: 'var(--font-playfair)' }}>& Match.</span>
                </h3>
                <p className="text-xl text-white/70 leading-relaxed">
                  The interface you know, with the safety you deserve. Connect instantly when the vibe is mutual. No games, just sparks.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.8 }}
                className="relative h-[500px] w-full rounded-3xl overflow-hidden group border border-white/10 shadow-2xl"
              >
                <Image src="/photos/p3.jpg" alt="Swipe" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </motion.div>
            </div>

          </div>
        </section>

        {/* Safety Principles */}
        <section className="py-32 px-8 bg-black">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1 relative h-[600px] rounded-3xl overflow-hidden">
                <Image
                  src="/photos/p6.jpg"
                  alt="Safety"
                  fill
                  className="object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
                <div className="absolute bottom-12 left-12 max-w-sm">
                  <blockquote className="text-2xl font-light italic text-white/90" style={{ fontFamily: 'var(--font-playfair)' }}>
                    "Finally, a place where I feel like a person, not a product."
                  </blockquote>
                  <p className="mt-4 text-pink-400 font-bold">— Sarah K.</p>
                </div>
              </div>
              <div className="order-1 lg:order-2 space-y-12">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ amount: 0.2 }}
                >
                  <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'var(--font-outfit)' }}>
                    Real by <br />
                    <span className="text-zinc-500">Design.</span>
                  </h2>
                  <p className="text-lg text-white/60">
                    We built BlindCharm to be the definitive modern dating app. Safe, verified, and strictly for real connections.
                  </p>
                </motion.div>

                <div className="space-y-8">
                  {[
                    { title: "100% Verified Users", desc: "Phone verification means you're talking to a real human." },
                    { title: "Moment-Based Matching", desc: "Find people who want what you want, right now." },
                    { title: "Secure & Private", desc: "Your data is yours. We just help you connect." }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ amount: 0.2 }}
                      transition={{ delay: 0.2 + (i * 0.1) }}
                      className="flex gap-6"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 text-pink-500">
                        <Check size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-outfit)' }}>{item.title}</h3>
                        <p className="text-white/50">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-20 px-4 bg-zinc-950">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h3 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-outfit)' }}>Vibe Check</h3>
              <p className="text-white/60" style={{ fontFamily: 'var(--font-outfit)' }}>See what happens when you let go.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 h-[800px] overflow-hidden">
              {/* Masonry-ish grid layout manually composed */}
              <div className="space-y-4 relative -top-12">
                <div className="h-64 relative rounded-xl overflow-hidden"><Image src="/photos/p1.jpg" alt="Vibe" fill className="object-cover hover:scale-110 transition-transform duration-500" /></div>
                <div className="h-96 relative rounded-xl overflow-hidden"><Image src="/photos/p2.jpg" alt="Vibe" fill className="object-cover hover:scale-110 transition-transform duration-500" /></div>
                <div className="h-64 relative rounded-xl overflow-hidden"><Image src="/photos/p3.jpg" alt="Vibe" fill className="object-cover hover:scale-110 transition-transform duration-500" /></div>
              </div>
              <div className="space-y-4 relative top-8">
                <div className="h-80 relative rounded-xl overflow-hidden"><Image src="/photos/p4.jpg" alt="Vibe" fill className="object-cover hover:scale-110 transition-transform duration-500" /></div>
                <div className="h-64 relative rounded-xl overflow-hidden"><Image src="/photos/p5.jpg" alt="Vibe" fill className="object-cover hover:scale-110 transition-transform duration-500" /></div>
                <div className="h-80 relative rounded-xl overflow-hidden"><Image src="/photos/p6.jpg" alt="Vibe" fill className="object-cover hover:scale-110 transition-transform duration-500" /></div>
              </div>
              <div className="space-y-4 relative -top-4">
                <div className="h-72 relative rounded-xl overflow-hidden"><Image src="/photos/p7.jpg" alt="Vibe" fill className="object-cover hover:scale-110 transition-transform duration-500" /></div>
                <div className="h-80 relative rounded-xl overflow-hidden"><Image src="/photos/p9.jpg" alt="Vibe" fill className="object-cover hover:scale-110 transition-transform duration-500" /></div>
                <div className="h-64 relative rounded-xl overflow-hidden"><Image src="/photos/p10.jpg" alt="Vibe" fill className="object-cover hover:scale-110 transition-transform duration-500" /></div>
              </div>
              <div className="space-y-4 relative top-12 hidden lg:block">
                <div className="h-64 relative rounded-xl overflow-hidden"><Image src="/photos/p3.jpg" alt="Vibe" fill className="object-cover hover:scale-110 transition-transform duration-500" /></div>
                <div className="h-96 relative rounded-xl overflow-hidden"><Image src="/photos/p5.jpg" alt="Vibe" fill className="object-cover hover:scale-110 transition-transform duration-500" /></div>
              </div>
            </div>

            {/* CTA in Footer */}
            <div className="text-center pt-20 pb-10">
              <h2 className="text-5xl font-bold mb-8" style={{ fontFamily: 'var(--font-outfit)' }}>Ready to dive in?</h2>
              <button
                onClick={() => router.push('/login')}
                className="px-8 py-4 bg-white text-black rounded-full font-bold text-xl hover:bg-gray-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                style={{ fontFamily: 'var(--font-outfit)' }}
              >
                Start your journey
              </button>
              <div className="flex justify-center gap-6 mt-12 text-sm text-white/40">
                <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              </div>
              <p className="mt-8 text-xs text-white/20">© 2024 BlindCharm. All rights reserved.</p>
            </div>
          </div>
        </section>
      </div>

    </div>
  )
}
