'use client'

import { motion } from 'framer-motion'
import { Sparkles, Brain, Heart, Zap } from 'lucide-react'
import { bitcountGrid, boldonse, inter } from '@/app/fonts'

export default function GalaxyPhilosophy() {
    return (
        <section id="manifesto" className="relative py-24 px-4 overflow-hidden bg-black">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Section Header */}
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
                    >
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className={`${inter.className} text-sm text-purple-200 tracking-wider uppercase`}>BlindCharm Phase-2</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className={`${boldonse.className} text-4xl md:text-6xl text-white mb-6`}
                    >
                        Connect with <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                            Purpose
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className={`${inter.className} text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed`}
                    >
                        Move away from random, endless swiping. <br className="hidden md:block" />
                        Experience context-aware, emotionally intelligent connections.
                    </motion.p>
                </div>

                {/* Core Philosophy Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Card 1: Context Aware */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Brain className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className={`${boldonse.className} text-2xl text-white mb-4`}>Context Aware</h3>
                            <p className={`${inter.className} text-gray-400 leading-relaxed`}>
                                The system understands the moment, not just preferences. It suggests people who fit your current intent.
                            </p>
                        </div>
                    </motion.div>

                    {/* Card 2: Emotionally Intelligent */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-pink-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Heart className="w-6 h-6 text-pink-400" />
                            </div>
                            <h3 className={`${boldonse.className} text-2xl text-white mb-4`}>Emotionally Intelligent</h3>
                            <p className={`${inter.className} text-gray-400 leading-relaxed`}>
                                Dating, friendship, collaboration. Connections are situational. Find what fits your "right now".
                            </p>
                        </div>
                    </motion.div>

                    {/* Card 3: One Card, One Story */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Zap className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className={`${boldonse.className} text-2xl text-white mb-4`}>One Card, One Story</h3>
                            <p className={`${inter.className} text-gray-400 leading-relaxed`}>
                                Every suggestion must feel intentional, safe, and explainable. No more random noise.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
