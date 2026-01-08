'use client'

import { motion } from 'framer-motion'
import { Mic, Play, Pause, Sparkles } from 'lucide-react'
import { bitcountGrid, boldonse, inter } from '@/app/fonts'
import { useState } from 'react'

export default function GalaxyVoiceFeature() {
    const [isPlaying, setIsPlaying] = useState(false)

    return (
        <section className="relative py-32 px-4 overflow-hidden bg-black">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/10 to-black pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Left Side: Visuals (Waveform & Mic) */}
                    <div className="relative h-[500px] flex items-center justify-center order-2 lg:order-1">
                        {/* Glowing Orb Background */}
                        <div className="absolute w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse" />

                        {/* Central Mic Container */}
                        <motion.div
                            className="relative z-20 w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.5)] cursor-pointer group"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsPlaying(!isPlaying)}
                        >
                            {isPlaying ? (
                                <Pause className="w-12 h-12 text-white fill-current" />
                            ) : (
                                <Mic className="w-12 h-12 text-white" />
                            )}

                            {/* Ripple Effect */}
                            <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping opacity-20" />
                        </motion.div>

                        {/* Animated Waveforms */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            {[...Array(8)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute rounded-full border border-purple-500/30"
                                    style={{
                                        width: 150 + i * 40,
                                        height: 150 + i * 40,
                                    }}
                                    animate={{
                                        scale: isPlaying ? [1, 1.05, 1] : 1,
                                        opacity: isPlaying ? [0.3, 0.6, 0.3] : 0.3,
                                        borderColor: isPlaying ? ['rgba(168,85,247,0.3)', 'rgba(236,72,153,0.5)', 'rgba(168,85,247,0.3)'] : 'rgba(168,85,247,0.3)'
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        delay: i * 0.1,
                                        ease: "easeInOut"
                                    }}
                                />
                            ))}
                        </div>

                        {/* Floating Voice Bubbles */}
                        {[
                            { text: "Hey, love your vibe! 🎵", x: -120, y: -100, delay: 0 },
                            { text: "That laugh is contagious 😂", x: 140, y: -60, delay: 1 },
                            { text: "Let's grab coffee? ☕", x: -100, y: 120, delay: 2 },
                            { text: "Your voice is amazing! ✨", x: 130, y: 80, delay: 1.5 },
                        ].map((bubble, index) => (
                            <motion.div
                                key={index}
                                className="absolute px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-medium flex items-center gap-2"
                                style={{ x: bubble.x, y: bubble.y }}
                                initial={{ opacity: 0, scale: 0 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: bubble.delay, duration: 0.5 }}
                                animate={{
                                    y: [bubble.y, bubble.y - 10, bubble.y],
                                }}
                            >
                                <Play className="w-3 h-3 text-purple-400 fill-current" />
                                {bubble.text}
                            </motion.div>
                        ))}
                    </div>

                    {/* Right Side: Text Content */}
                    <div className="order-1 lg:order-2 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-900/30 border border-purple-500/30 mb-6"
                        >
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span className={`${inter.className} text-sm text-purple-200 tracking-wider uppercase`}>Voice Matches</span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className={`${boldonse.className} text-5xl md:text-7xl text-white mb-6 leading-tight`}
                        >
                            Hear the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                                Vibe
                            </span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className={`${inter.className} text-xl text-gray-300 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0`}
                        >
                            Text can be misleading. Photos can be filtered. But a voice? <br />
                            <span className="text-white font-semibold">A voice is real.</span>
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col gap-4 max-w-md mx-auto lg:mx-0"
                        >
                            {[
                                "Listen to 30-second voice intros",
                                "Feel the chemistry before you match",
                                "No awkward first dates"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-green-400" />
                                    </div>
                                    <span className={`${inter.className} text-gray-300`}>{item}</span>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}
