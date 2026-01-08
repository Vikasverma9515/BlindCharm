'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Mic, Sparkles, Heart, Coffee } from 'lucide-react';
import Image from 'next/image';

export default function DatingTipsPage() {
    const router = useRouter();

    const tips = [
        {
            icon: Mic,
            title: "Voice is Magic",
            description: "Don't be shy! Voice messages build trust 10x faster than text. Let them hear that charisma."
        },
        {
            icon: Sparkles,
            title: "Be Unapologetically You",
            description: "BlindCharm is about personality first. Share your weird hobbies and true passions."
        },
        {
            icon: Coffee,
            title: "First Date Ideas",
            description: "Keep it casual. Coffee, a walk in the park, or an arcade. Low pressure, high fun."
        },
        {
            icon: Heart,
            title: "Respect the Pace",
            description: "Everyone moves at their own speed. If the vibe is right, there's no need to rush."
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-pink-500/30">

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
                    <span className="font-bold text-lg" style={{ fontFamily: 'var(--font-outfit)' }}>Dating Tips</span>
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
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-[80px] -z-10" />

                    <div className="flex justify-center items-center gap-4 mb-8">
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Image src="/HeroAvatar/a2.svg" alt="Avatar 1" width={80} height={80} className="drop-shadow-xl" />
                        </motion.div>
                        <Heart className="w-8 h-8 text-pink-500 animate-pulse" fill="currentColor" />
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 3, delay: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Image src="/HeroAvatar/a5.svg" alt="Avatar 2" width={80} height={80} className="drop-shadow-xl" />
                        </motion.div>
                    </div>

                    <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
                        Master the Art of<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-amber-200">Modern Romance.</span>
                    </h1>
                    <p className="text-white/60 text-lg leading-relaxed max-w-md mx-auto">
                        Navigating dating can be tricky. Here are some pro tips to help you find your person.
                    </p>
                </motion.div>

                {/* Tips Grid */}
                <div className="grid gap-6">
                    {tips.map((tip, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 hover:bg-zinc-900/80 transition-colors group"
                        >
                            <div className="flex items-start gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform duration-300">
                                    <tip.icon className="w-6 h-6 text-pink-400" />
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

            </main>
        </div>
    );
}
