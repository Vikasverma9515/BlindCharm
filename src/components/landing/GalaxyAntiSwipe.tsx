'use client'

import { motion } from 'framer-motion'
import { X, Heart, RefreshCw, Zap } from 'lucide-react'
import { bitcountGrid, boldonse, inter } from '@/app/fonts'

export default function GalaxyAntiSwipe() {
    return (
        <section className="relative py-32 px-4 overflow-hidden bg-black">
            <div className="max-w-7xl mx-auto relative z-10">

                {/* Section Header */}
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={`${boldonse.className} text-4xl md:text-6xl text-white mb-6`}
                    >
                        The Anti-Swipe <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                            Revolution
                        </span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className={`${inter.className} text-xl text-gray-400`}
                    >
                        Dating De-Gamified. No more burnout.
                    </motion.p>
                </div>

                {/* Comparison Visual */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0 relative max-w-5xl mx-auto">

                    {/* Left: The Old Way (Swiping) */}
                    <motion.div
                        className="relative p-12 rounded-3xl md:rounded-l-3xl md:rounded-r-none bg-[#0B0F17] border border-white/5 overflow-hidden group h-full flex flex-col items-center justify-center text-center"
                        initial={{ x: -50, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* Icon: Stack of Cards with X */}
                        <div className="relative w-24 h-24 mb-8">
                            <div className="absolute inset-0 border-2 border-gray-700 rounded-2xl transform -rotate-12 translate-y-2 translate-x-2 bg-gray-900/50" />
                            <div className="absolute inset-0 border-2 border-gray-600 rounded-2xl transform -rotate-6 translate-y-1 translate-x-1 bg-gray-900/80" />
                            <div className="absolute inset-0 border-2 border-gray-500 rounded-2xl bg-[#1A1F2B] flex items-center justify-center">
                                <X className="w-10 h-10 text-gray-400" />
                            </div>
                        </div>

                        <h3 className={`${boldonse.className} text-3xl text-gray-300 mb-4`}>Endless Swiping</h3>
                        <p className={`${inter.className} text-gray-500 text-lg leading-relaxed max-w-sm`}>
                            Mindless scrolling. Ghosting. Burnout. <br />
                            Treating people like playing cards.
                        </p>
                    </motion.div>

                    {/* Right: The New Way (BlindCharm) */}
                    <motion.div
                        className="relative p-12 rounded-3xl md:rounded-r-3xl md:rounded-l-none bg-black border border-purple-500/20 overflow-hidden h-full flex flex-col items-center justify-center text-center"
                        initial={{ x: 50, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* Background Glow */}
                        <div className="absolute inset-0 bg-purple-900/10 pointer-events-none" />
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-purple-500/5 to-transparent" />

                        {/* Icon: Intentional Spark */}
                        <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
                            <div className="absolute inset-0 bg-pink-500/20 blur-2xl rounded-full" />
                            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(236,72,153,0.3)]">
                                <Zap className="w-10 h-10 text-white fill-white" />
                            </div>
                        </div>

                        <h3 className={`${boldonse.className} text-3xl text-white mb-4`}>Intentional Sparks</h3>
                        <p className={`${inter.className} text-gray-300 text-lg leading-relaxed max-w-sm`}>
                            Meaningful intros. Voice first. Personality driven. Connecting with purpose.
                        </p>
                    </motion.div>

                    {/* VS Badge */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-black border border-white/10 rounded-full flex items-center justify-center z-20 hidden md:flex shadow-xl">
                        <span className={`${boldonse.className} text-white text-xl`}>VS</span>
                    </div>

                </div>

                {/* Call to Action */}
                <motion.div
                    className="mt-16 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                >
                    <button className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105">
                        <span className="relative z-10 flex items-center gap-2">
                            Join the Revolution <Heart className="w-5 h-5 text-red-500 fill-current" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-pink-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                </motion.div>

            </div>
        </section>
    )
}
