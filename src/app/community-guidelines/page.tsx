'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ThumbsUp, XOctagon, UserCheck, MessageSquare } from 'lucide-react';
import Image from 'next/image';

export default function GuidelinesPage() {
    const router = useRouter();

    const rules = [
        {
            icon: UserCheck,
            title: "Be Respectful",
            description: "Treat everyone with kindness. We're all here to find connection, not conflict."
        },
        {
            icon: XOctagon,
            title: "Zero Tolerance",
            description: "Harassment, hate speech, and inappropriate content will get you banned. Instantly.",
            highlight: true
        },
        {
            icon: UserCheck,
            title: "Be Authentic",
            description: "No catfishing. No fake photos. Just be the real, wonderful you."
        },
        {
            icon: MessageSquare,
            title: "Consent helps",
            description: "Always respect boundaries. If someone says no or stops replying, move on gracefully."
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500/30">

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
                    <span className="font-bold text-lg" style={{ fontFamily: 'var(--font-outfit)' }}>Guidelines</span>
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
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] -z-10" />

                    <div className="relative w-40 h-32 mx-auto mb-6 flex justify-center -space-x-4">
                        <Image src="/HeroAvatar/a8.svg" alt="Community 1" width={90} height={90} className="rounded-full border-4 border-black z-30" />
                        <Image src="/HeroAvatar/a6.svg" alt="Community 2" width={80} height={80} className="rounded-full border-4 border-black z-20 scale-90 translate-y-2 opacity-80" />
                        <Image src="/HeroAvatar/a4.svg" alt="Community 3" width={80} height={80} className="rounded-full border-4 border-black z-10 scale-90 translate-y-2 opacity-60" />
                    </div>

                    <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
                        The BlindCharm<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">Vibe Check.</span>
                    </h1>
                    <p className="text-white/60 text-lg leading-relaxed max-w-md mx-auto">
                        We're building a community of genuine humans. Here's how to fit right in.
                    </p>
                </motion.div>

                {/* Rules Grid */}
                <div className="grid gap-6">
                    {rules.map((rule, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`border rounded-3xl p-6 transition-all group ${rule.highlight
                                    ? 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20'
                                    : 'bg-zinc-900/50 border-white/5 hover:bg-zinc-900/80'
                                }`}
                        >
                            <div className="flex items-start gap-5">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 ${rule.highlight ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/10 text-amber-400'
                                    }`}>
                                    <rule.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className={`text-xl font-bold mb-2 ${rule.highlight ? 'text-red-400' : 'text-white/90'}`} style={{ fontFamily: 'var(--font-outfit)' }}>
                                        {rule.title}
                                    </h3>
                                    <p className="text-white/50 leading-relaxed">
                                        {rule.description}
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
