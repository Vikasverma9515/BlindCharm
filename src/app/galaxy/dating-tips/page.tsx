'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Check, X, Heart, Sparkles, MessageCircle, Coffee, Ghost } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DatingTipsPage() {
    const router = useRouter();

    return (
        <div className="h-full bg-black text-white relative overflow-y-auto overflow-x-hidden pb-24 scrollbar-hide">
            {/* Background Gradients (Red/Yellow/Black Theme) */}
            {/* <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] bg-yellow-600/10 rounded-full blur-[100px]" />
                <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-[100px]" />
            </div> */}

            {/* Back Button */}
            <motion.button
                onClick={() => router.back()}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-6 left-6 z-50 p-2 rounded-full bg-zinc-900/80 border border-white/10 backdrop-blur-md hover:bg-zinc-800 transition-all text-yellow-500"
            >
                <ChevronLeft size={24} />
            </motion.button>

            {/* Hero Section */}
            <HeroSection />

            {/* Main Content */}
            <div className="relative z-10 px-6 max-w-4xl mx-auto space-y-24">
                <DosAndDontsSection />
                <ExpertTipsSection />
                <ProfileGuideSection />
                <ChattingMasterclassSection />
                <IcebreakersSection />

                {/* Closing */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center py-12"
                >
                    <h2 className="text-3xl font-serif mb-4 text-white">
                        Ready to find your person?
                    </h2>
                    <p className="text-white/60 mb-8 max-w-md mx-auto">
                        Remember, the best connection is an authentic one. Just be you.
                    </p>
                    <button
                        onClick={() => router.push('/galaxy')}
                        className="px-8 py-4 bg-yellow-500 text-black rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                    >
                        Back to Galaxy
                    </button>
                </motion.div>
            </div>
        </div>
    );
}

// --- Hero Section with "Hero Avatars" ---
function HeroSection() {
    // Local assets from public/HeroAvatar
    const avatars = [
        "/HeroAvatar/a1.svg",
        "/HeroAvatar/a2.svg",
        "/HeroAvatar/a3.svg",
        "/HeroAvatar/a4.svg",
        "/HeroAvatar/a5.svg"
    ];

    return (
        <div className="relative min-h-[80vh] flex flex-col items-center justify-center text-center pt-20 pb-10">
            {/* Floating Avatars (Hero Custom Visual) */}
            <div className="relative w-full max-w-md h-[300px] mb-12 flex justify-center items-center">
                {avatars.map((src, i) => (
                    <HeroAvatar key={i} src={src} index={i} total={avatars.length} />
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4 px-4"
            >
                <div className="inline-block px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 backdrop-blur-sm text-sm font-medium tracking-wide mb-4 text-yellow-400">
                    DATING MASTERCLASS
                </div>
                <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight">
                    <span className="block text-white mb-2">The Art of</span>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-500 animate-gradient-x">
                        Connection
                    </span>
                </h1>
                <p className="text-xl text-white/60 max-w-lg mx-auto">
                    Modern dating is messy. We&apos;re here to clear the air.
                    Here&apos;s what actually works.
                </p>
            </motion.div>
        </div>
    );
}

function HeroAvatar({ src, index, total }: { src: string; index: number; total: number }) {
    const angle = (index / total) * 2 * Math.PI;
    const radius = 100;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    return (
        <motion.div
            className="absolute rounded-full p-1 bg-gradient-to-tr from-yellow-500 to-red-600"
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{
                opacity: 1,
                scale: 1,
                x: x, // Fixed position, no random jitter
                y: y,
            }}
            transition={{
                duration: 1.2,
                delay: index * 0.1,
                type: "spring",
                stiffness: 100
            }}
            style={{ zIndex: total - index }}
        >
            <motion.div
                // Reduced floating animation
                animate={{ y: [0, -5, 0] }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.5
                }}
            >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-black bg-black shadow-xl">
                    <img
                        src={src}
                        alt="User"
                        className="w-full h-full object-cover"
                    />
                </div>
            </motion.div>
        </motion.div>
    );
}

// --- Dos and Don'ts Section ---
function DosAndDontsSection() {
    const items = [
        {
            type: 'do',
            title: "Be Intentional",
            desc: "Know what you're looking for. It's sexy to be clear about your vibe."
        },
        {
            type: 'dont',
            title: "Ghosting",
            desc: "It's small energy. If you're not feeling it, just say a polite goodbye."
        },
        {
            type: 'do',
            title: "Ask Questions",
            desc: "Be curious. People love talking about themselves. Let them."
        },
        {
            type: 'dont',
            title: "Copy-Paste Openers",
            desc: "\"Hey\" is boring. \"How's your Tuesday?\" is better. Authenticity wins."
        }
    ];

    return (
        <section>
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl font-serif mb-12 text-center text-white"
            >
                The Rules of Engagement
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-6">
                {items.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className={`p-1 rounded-3xl ${item.type === 'do' ? 'bg-gradient-to-br from-yellow-500/40 to-yellow-900/0' : 'bg-gradient-to-br from-red-600/40 to-red-900/0'}`}
                    >
                        <div className="bg-black h-full p-8 rounded-[22px] border border-white/5 relative overflow-hidden group">
                            <div className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center ${item.type === 'do' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-500'}`}>
                                {item.type === 'do' ? <Check size={16} /> : <X size={16} />}
                            </div>

                            <h3 className={`text-xl font-bold mb-3 ${item.type === 'do' ? 'text-yellow-400' : 'text-red-500'}`}>
                                {item.type === 'do' ? 'DO' : "DON'T"}: {item.title}
                            </h3>
                            <p className="text-white/70 leading-relaxed">
                                {item.desc}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

// --- Expert Tips (Accordion/Cards) ---
function ExpertTipsSection() {
    return (
        <section>
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl font-serif mb-12 text-center text-white"
            >
                Spilling the Tea 🍵
            </motion.h2>

            <div className="space-y-6">
                <TipCard
                    icon={<Coffee className="text-yellow-500" />}
                    title="The First Date Blueprint"
                    content="Keep it low stakes. Coffee, drinks, or a walk. Dinner can feel like an interview. You want to see if you vibe, not if they can use a salad fork correctly."
                />
                <TipCard
                    icon={<MessageCircle className="text-red-400" />}
                    title="Texting: Less is More"
                    content="Don't have the whole relationship over text. Use messaging to set up the next date. Mystery is attractive. Leave something to talk about in person."
                />
                <TipCard
                    icon={<Sparkles className="text-yellow-300" />}
                    title="Red Flags vs. Beige Flags"
                    content="Red flag: They're rude to the waiter. Beige flag: They put pineapple on pizza. Learn the difference. Don't write off a potential soulmate because they have a quirky hobby."
                />
            </div>
        </section>
    );
}

function TipCard({ icon, title, content }: { icon: React.ReactNode; title: string; content: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            layout
            onClick={() => setIsOpen(!isOpen)}
            className="cursor-pointer bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden hover:bg-zinc-800 transition-colors"
        >
            <motion.div layout className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-black rounded-xl border border-white/5">
                        {icon}
                    </div>
                    <h3 className="text-xl font-medium text-white">{title}</h3>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    className="text-white/50"
                >
                    <ChevronLeft className="-rotate-90" />
                </motion.div>
            </motion.div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-6 pt-0 text-white/70 leading-relaxed border-t border-white/5"
                    >
                        <div className="pt-4">
                            {content}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function ProfileGuideSection() {
    return (
        <section>
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl font-serif mb-8 text-center text-white"
            >
                Attract Your Person
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                        <span className="text-2xl">📸</span> Photos
                    </h3>
                    <ul className="space-y-3 text-white/70">
                        <li className="flex gap-2">
                            <Check className="text-yellow-500 shrink-0" size={18} />
                            <span>First photo: Just you, clear face, killer smile.</span>
                        </li>
                        <li className="flex gap-2">
                            <Check className="text-yellow-500 shrink-0" size={18} />
                            <span>Full body shot doing something you love.</span>
                        </li>
                        <li className="flex gap-2">
                            <X className="text-red-500 shrink-0" size={18} />
                            <span>No sunglasses indoors. We want to see your eyes.</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                        <span className="text-2xl">📝</span> Bio & Prompts
                    </h3>
                    <ul className="space-y-3 text-white/70">
                        <li className="flex gap-2">
                            <Check className="text-yellow-500 shrink-0" size={18} />
                            <span>Be specific. "I love food" is boring. "I'm on a quest for the best spicy ramen" is a hook.</span>
                        </li>
                        <li className="flex gap-2">
                            <X className="text-red-500 shrink-0" size={18} />
                            <span>Negative lists ("Don't swipe if..."). It's a mood killer.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    );
}

function ChattingMasterclassSection() {
    return (
        <section>
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl font-serif mb-8 text-center text-white"
            >
                Master the Chat
            </motion.h2>

            <div className="space-y-4">
                <div className="bg-gradient-to-r from-zinc-900 to-black p-6 rounded-2xl border border-yellow-500/20">
                    <h4 className="font-bold text-lg mb-2 text-yellow-400">The Opener</h4>
                    <p className="text-white/60 mb-2 italic">"Hey" is a ghost town.</p>
                    <p className="text-white/80">
                        Try: "I check my scope before I commit—what's your take on [Something in their profile]?" or just "Your travel photos are intense, where was that waterfall?"
                    </p>
                </div>

                <div className="bg-gradient-to-r from-zinc-900 to-black p-6 rounded-2xl border border-red-500/20">
                    <h4 className="font-bold text-lg mb-2 text-red-400">Moving it Offline</h4>
                    <p className="text-white/80">
                        Don't become a pen pal. After 3-4 days of good flow, say:
                        <br />
                        <span className="italic block mt-2 text-white">"I'm enjoying this. Want to continue this over coffee this weekend?"</span>
                    </p>
                </div>
            </div>
        </section>
    );
}

// --- Icebreakers (Horizontal Scroll) ---
function IcebreakersSection() {
    const questions = [
        "What's your most controversial opinion?",
        "Best travel story in 5 words?",
        "What's a skill you'd love to master?",
        "Zombies attack—what's your weapon?",
        "Describe your perfect Sunday."
    ];

    return (
        <section>
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl font-serif mb-8 flex items-center justify-center gap-3 text-white"
            >
                <Ghost className="text-red-400" />
                <span>Better than "Hey"</span>
            </motion.h2>

            <div className="flex gap-4 overflow-x-auto pb-8 snap-x scrollbar-hide">
                {questions.map((q, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        className="snap-center shrink-0 w-64 h-40 bg-zinc-900 border border-white/10 rounded-3xl p-6 flex flex-col justify-center items-center text-center backdrop-blur-md"
                    >
                        <p className="text-lg font-medium text-yellow-100">"{q}"</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
