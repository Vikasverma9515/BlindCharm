'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, EyeOff, UserCheck } from 'lucide-react'
import { bitcountGrid, boldonse, inter } from '@/app/fonts'

export default function GalaxySafety() {
    return (
        <section className="relative py-32 px-4 overflow-hidden bg-black">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-900/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-900/20 border border-green-500/20 mb-6"
                    >
                        <Shield className="w-4 h-4 text-green-400" />
                        <span className={`${inter.className} text-sm text-green-200 tracking-wider uppercase`}>Safety & Trust</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className={`${boldonse.className} text-4xl md:text-6xl text-white mb-6`}
                    >
                        Designed for <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                            Peace of Mind
                        </span>
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: UserCheck,
                            title: "Fewer, Better Suggestions",
                            desc: "Scarcity is intentional. You get 3-5 high-quality matches a day. No spam, no overwhelm."
                        },
                        {
                            icon: EyeOff,
                            title: "No Invasive Tracking",
                            desc: "Suggestions are based on shared patterns and intent, not your private activity or chats."
                        },
                        {
                            icon: Lock,
                            title: "Control Over Pace",
                            desc: "You decide when to reveal more. Voice first, photos later. Safety is built into the flow."
                        }
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-center group"
                        >
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-gray-800 to-black flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-white/5">
                                <item.icon className="w-8 h-8 text-gray-400 group-hover:text-green-400 transition-colors" />
                            </div>
                            <h3 className={`${boldonse.className} text-2xl text-white mb-4`}>{item.title}</h3>
                            <p className={`${inter.className} text-gray-400 leading-relaxed`}>
                                {item.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
