'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Shield, Lock, Eye, AlertTriangle, Flag } from 'lucide-react';
import Image from 'next/image';

export default function SafetyCenterPage() {
  const router = useRouter();

  const tips = [
    {
      icon: Lock,
      title: "Keep it on BlindCharm",
      description: "Get to know someone before sharing your phone number or switching to other messaging apps. Our chat is designed to keep you safe."
    },
    {
      icon: Eye,
      title: "Meeting in Person",
      description: "Always meet in a public place for the first few dates. Tell a friend where you're going and share your location."
    },
    {
      icon: AlertTriangle,
      title: "Spotting Red Flags",
      description: "Be wary of anyone asking for money, personal financial info, or pushing for a relationship too quickly."
    },
    {
      icon: Flag,
      title: "Report Anything Fishy",
      description: "Your safety is our #1 priority. If someone makes you uncomfortable, use the Shield icon to report them immediately."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="font-medium" style={{ fontFamily: 'var(--font-outfit)' }}>Back</span>
          </button>
          <span className="font-bold text-lg" style={{ fontFamily: 'var(--font-outfit)' }}>Safety Center</span>
          <div className="w-16" />
        </div>
      </header>

      <main className="pt-24 pb-20 px-6 max-w-2xl mx-auto">

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-16 text-center"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] -z-10" />

          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full opacity-20 animate-pulse" />
            <Image
              src="/HeroAvatar/a12.svg"
              alt="Safety Guardian"
              width={128}
              height={128}
              className="relative z-10 drop-shadow-2xl hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute -bottom-2 -right-2 bg-zinc-900 rounded-full p-2 border border-zinc-800">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
            Your Safety First,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Always.</span>
          </h1>
          <p className="text-white/60 text-lg leading-relaxed max-w-md mx-auto">
            BlindCharm is a community built on trust. Here's how we keep the vibes immaculate and safe.
          </p>
        </motion.div>

        {/* Tips Grid */}
        <div className="grid gap-6">
          {tips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 hover:bg-zinc-900/80 transition-colors group"
            >
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <tip.icon className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-white/90" style={{ fontFamily: 'var(--font-outfit)' }}>
                    {tip.title}
                  </h3>
                  <p className="text-white/50 leading-relaxed">
                    {tip.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 p-6 rounded-3xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-white/5 text-center"
        >
          <p className="text-white/80 font-medium mb-4">Need urgent help?</p>
          <button className="bg-white text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform" onClick={() => window.open('mailto:safety@blindcharm.com')}>
            Contact Support
          </button>
        </motion.div>

      </main>
    </div>
  );
}