'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Sparkles, Zap, Music, Mountain, BookOpen, X, Heart, Check } from 'lucide-react'
import Image from 'next/image'
import { boldonse, inter } from '@/app/fonts'

export default function GalaxyHowItWorks() {
    const [cards, setCards] = useState([
        {
            id: 1,
            title: "The Adventurer",
            vibe: "Hiking & Indie Folk",
            icon: Mountain,
            color: "from-emerald-400 to-cyan-500",
            avatar: "/HeroAvatar/a2.svg",
            desc: "Seeking a partner to chase sunsets and discover hidden trails."
        },
        {
            id: 2,
            title: "The Creative",
            vibe: "Art & Late Night Jazz",
            icon: Music,
            color: "from-pink-500 to-rose-500",
            avatar: "/HeroAvatar/a9.svg",
            desc: "Let's make something beautiful together. Muse wanted."
        },
        {
            id: 3,
            title: "The Intellectual",
            vibe: "Books & Deep Talks",
            icon: BookOpen,
            color: "from-violet-500 to-purple-600",
            avatar: "/HeroAvatar/a4.svg",
            desc: "Conversation is the best aphrodisiac. Challenge my mind."
        },
        {
            id: 4,
            title: "The Foodie",
            vibe: "Cooking & Wine Tasting",
            icon: Zap,
            color: "from-orange-400 to-red-500",
            avatar: "/HeroAvatar/a6.svg",
            desc: "Love language is homemade pasta. Let's explore new flavors."
        },
        {
            id: 5,
            title: "The Dreamer",
            vibe: "Stargazing & Sci-Fi",
            icon: Sparkles,
            color: "from-indigo-400 to-blue-600",
            avatar: "/HeroAvatar/a12.svg",
            desc: "Looking for a co-pilot to navigate this galaxy and beyond."
        }
    ])

    const [direction, setDirection] = useState<'left' | 'right' | null>(null)

    const handleSwipe = (dir: 'left' | 'right') => {
        setDirection(dir)
        setTimeout(() => {
            const newCards = [...cards]
            const removedCard = newCards.shift()
            if (removedCard) newCards.push(removedCard) // Cycle back to end
            setCards(newCards)
            setDirection(null)
        }, 400) // Wait for animation
    }

    return (
        <section id="how-it-works" className="relative py-32 px-4 overflow-hidden bg-black">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(76,29,149,0.2),_transparent_70%)] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none animate-pulse" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md"
                    >
                        <Zap className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className={`${inter.className} text-sm text-gray-300 tracking-wider uppercase`}>The Magic Process</span>
                    </motion.div>

                    <h2 className={`${boldonse.className} text-5xl md:text-8xl text-white mb-8 tracking-tight leading-none`}>
                        From Chaos to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient-x drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                            Clarity
                        </span>
                    </h2>
                    <p className={`${inter.className} text-gray-400 text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed`}>
                        You share your raw thoughts. <span className="text-white">We craft the perfect introduction.</span>
                    </p>
                </div>

                {/* Horizontal Flow Container */}
                <div className="flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-32 relative z-10">

                    {/* 1. Input Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="w-full max-w-md relative group"
                    >
                        {/* Floating Label */}
                        <div className="absolute -top-5 left-8 z-20 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-2 rounded-full shadow-[0_0_20px_rgba(56,189,248,0.5)] flex items-center gap-2 transform -rotate-2 group-hover:rotate-0 transition-transform duration-300">
                            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            <span className={`${boldonse.className} text-xs tracking-widest`}>CHAT INPUT</span>
                        </div>

                        <div className="relative bg-gray-900/90 border border-white/10 rounded-[2rem] p-6 shadow-2xl backdrop-blur-xl h-[450px] flex flex-col overflow-hidden group-hover:border-white/20 transition-colors duration-500">

                            {/* Chat Header */}
                            <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 p-[2px]">
                                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                        <Sparkles className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-base font-bold text-white">BlindCharm AI</div>
                                    <div className="text-xs text-green-400 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                        Online
                                    </div>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 space-y-6 overflow-hidden relative">
                                {/* AI Message */}
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 border border-white/10">
                                        <Sparkles className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <div className="bg-gray-800 border border-white/5 rounded-2xl rounded-tl-none p-4 max-w-[85%] text-gray-300 text-sm leading-relaxed">
                                        Describe your ideal match. I'll handle the rest. ✨
                                    </div>
                                </div>

                                {/* User Message (Typing) */}
                                <div className="flex gap-3 flex-row-reverse">
                                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 border border-white/10">
                                        <div className="w-4 h-4 bg-gray-500 rounded-full" />
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl rounded-tr-none p-4 max-w-[85%] text-white text-sm shadow-lg leading-relaxed">
                                        <p>
                                            I'm kinda into <span className="font-bold text-blue-200">hiking</span> and indie music...
                                            Looking for someone who actually <span className="font-bold text-blue-200">reads books</span>.
                                            Not into clubbing, prefer <span className="font-bold text-blue-200">quiet nights</span>.
                                            <span className="inline-block w-1.5 h-4 bg-white ml-1 align-middle animate-pulse" />
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Input Area (Visual only) */}
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <div className="bg-black/50 rounded-full h-12 flex items-center px-5 justify-between border border-white/10 group-hover:border-white/30 transition-colors">
                                    <span className="text-gray-500 text-sm">Type a message...</span>
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                                        <ArrowRight className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </motion.div>

                    {/* 2. Arrow Connector */}
                    <div className="rotate-90 lg:rotate-0 relative scale-150">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 blur-xl opacity-40 rounded-full animate-pulse" />
                        <ArrowRight className="w-12 h-12 text-white relative z-10" />
                    </div>

                    {/* 3. Interactive Swipe Deck */}
                    <div className="w-full max-w-sm h-[550px] relative flex items-center justify-center perspective-1000">
                        <AnimatePresence>
                            {cards.map((card, index) => {
                                // Only render top 3 cards
                                if (index > 2) return null;

                                const isTop = index === 0;

                                return (
                                    <motion.div
                                        key={card.id}
                                        layout
                                        initial={false}
                                        animate={{
                                            scale: isTop ? 1 : 1 - (index * 0.05),
                                            y: isTop ? 0 : index * 15,
                                            z: -index * 50,
                                            opacity: 1 - (index * 0.2),
                                            rotate: isTop && direction ? (direction === 'left' ? -20 : 20) : 0,
                                            x: isTop && direction ? (direction === 'left' ? -200 : 200) : 0
                                        }}
                                        exit={{
                                            x: direction === 'left' ? -500 : 500,
                                            opacity: 0,
                                            rotate: direction === 'left' ? -45 : 45,
                                            transition: { duration: 0.4 }
                                        }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        className="absolute w-full h-full origin-bottom"
                                        style={{
                                            zIndex: cards.length - index,
                                        }}
                                    >
                                        <div className="relative h-full bg-black rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col shadow-2xl">
                                            {/* Card Glow - Only for top card */}
                                            {isTop && (
                                                <div className={`absolute -inset-1 bg-gradient-to-r ${card.color} rounded-[2.5rem] blur-md opacity-40 animate-pulse`} />
                                            )}

                                            {/* Card Content */}
                                            <div className="relative h-full bg-gray-900 rounded-[2.4rem] overflow-hidden flex flex-col">
                                                {/* Image Header */}
                                                <div className="relative h-1/2 w-full overflow-hidden">
                                                    <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-20`} />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${card.color} p-[3px] shadow-2xl`}>
                                                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                                                <Image src={card.avatar} alt="Avatar" width={128} height={128} className="w-full h-full object-cover" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Vibe Tag */}
                                                    <div className="absolute top-6 right-6 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                                                        <card.icon className="w-3 h-3 text-white" />
                                                        <span className="text-xs text-white font-medium">{card.vibe}</span>
                                                    </div>
                                                </div>

                                                {/* Body */}
                                                <div className="relative flex-1 p-8 flex flex-col items-center text-center -mt-8 bg-gray-900 rounded-t-[2.5rem]">
                                                    <h3 className={`${boldonse.className} text-3xl text-white mb-2`}>{card.title}</h3>
                                                    <div className="w-12 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6" />

                                                    <div className="mb-6 relative">
                                                        <Sparkles className="w-8 h-8 text-white/50" />
                                                    </div>

                                                    <p className={`${inter.className} text-gray-300 text-lg leading-relaxed italic`}>
                                                        "{card.desc}"
                                                    </p>
                                                </div>

                                                {/* Swipe Actions (Only visible on top card) */}
                                                {isTop && (
                                                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 z-20">
                                                        <button
                                                            onClick={() => handleSwipe('left')}
                                                            className="w-14 h-14 rounded-full bg-black border border-red-500/30 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white hover:scale-110 transition-all duration-300 shadow-lg"
                                                        >
                                                            <X className="w-6 h-6" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleSwipe('right')}
                                                            className="w-14 h-14 rounded-full bg-black border border-green-500/30 text-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white hover:scale-110 transition-all duration-300 shadow-lg"
                                                        >
                                                            <Heart className="w-6 h-6 fill-current" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </section>
    )
}
