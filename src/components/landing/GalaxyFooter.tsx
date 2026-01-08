'use client'

import { motion } from 'framer-motion'
import { Heart, Twitter, Instagram, Github, Linkedin, ArrowRight } from 'lucide-react'
import { boldonse, inter } from '@/app/fonts'
import Link from 'next/link'
import Image from 'next/image'

export default function GalaxyFooter() {
    const socialLinks = [
        { icon: Twitter, href: "#", color: "hover:text-cyan-400", label: "Twitter" },
        { icon: Instagram, href: "#", color: "hover:text-pink-500", label: "Instagram" },
        { icon: Github, href: "#", color: "hover:text-white", label: "Github" },
        { icon: Linkedin, href: "#", color: "hover:text-blue-500", label: "LinkedIn" }
    ]

    const footerLinks = [
        { title: "Explore", links: ["Voice Matches", "Anti-Swipe", "Success Stories", "Safety"] },
        { title: "Company", links: ["Manifesto", "Careers", "Press", "Contact"] },
        { title: "Legal", links: ["Privacy", "Terms", "Cookies", "Guidelines"] }
    ]

    return (
        <footer className="relative bg-black pt-32 pb-10 overflow-hidden">
            {/* Massive Background Glow */}
            <div className="absolute bottom-0 left-0 w-full h-[600px] bg-gradient-to-t from-purple-900/40 via-black to-black pointer-events-none" />
            <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-pink-600/20 rounded-full blur-[150px] pointer-events-none animate-pulse" />

            {/* Meteor Shower Animation */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {[...Array(7)].map((_, i) => (
                    <motion.div
                        key={`meteor-${i}`}
                        className="absolute h-[2px] bg-gradient-to-r from-transparent via-white to-transparent rounded-full"
                        style={{
                            width: Math.random() * 250 + 100 + 'px', // Longer, more elegant tails
                            left: `${Math.random() * 120 - 10}%`,
                            top: -150,
                            rotate: '115deg',
                            boxShadow: '0 0 15px rgba(255, 255, 255, 0.4)' // Softer, premium glow
                        }}
                        animate={{
                            x: [0, -400],
                            y: [0, 1000],
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            duration: Math.random() * 1.5 + 1.5, // Slower, more majestic
                            repeat: Infinity,
                            delay: Math.random() * 5,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>

            {/* Giant Watermark Text */}
            <div className="absolute top-0 left-0 w-full overflow-hidden pointer-events-none opacity-5">
                <h1 className={`${boldonse.className} text-[20vw] text-white leading-none text-center whitespace-nowrap`}>
                    BLINDCHARM
                </h1>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* Top CTA Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-24 border-b border-white/10 pb-12">
                    <div className="text-center md:text-left">
                        <h2 className={`${boldonse.className} text-4xl md:text-6xl text-white mb-4`}>
                            Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Connect?</span>
                        </h2>
                        <p className={`${inter.className} text-gray-400 text-lg max-w-md`}>
                            Join the revolution of intent-based dating. No more games. Just vibes.
                        </p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Get the App <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-200 to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                </div>

                {/* Links Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">

                    {/* Brand Column (Span 4) */}
                    <div className="md:col-span-4 space-y-8">
                        <Link href="/" className="inline-block">
                            <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12">
                                    <Image
                                        src="/logo3.png"
                                        alt="BlindCharm Logo"
                                        fill
                                        className="object-contain drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]"
                                    />
                                </div>
                                <span className={`${boldonse.className} text-3xl text-white tracking-wider`}>BlindCharm</span>
                            </div>
                        </Link>
                        <p className={`${inter.className} text-gray-500 leading-relaxed`}>
                            We're building a future where personality isn't an afterthought. It's the main event.
                        </p>

                        {/* Socials */}
                        <div className="flex gap-4">
                            {socialLinks.map((social, index) => (
                                <motion.a
                                    key={index}
                                    href={social.href}
                                    whileHover={{ y: -5, scale: 1.1 }}
                                    className={`w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] ${social.color}`}
                                >
                                    <social.icon className="w-5 h-5" />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Spacer (Span 1) */}
                    <div className="hidden md:block md:col-span-1" />

                    {/* Links Columns (Span 7) */}
                    <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
                        {footerLinks.map((column, idx) => (
                            <div key={idx} className="space-y-6">
                                <h4 className={`${boldonse.className} text-xl text-white tracking-wide`}>{column.title}</h4>
                                <ul className="space-y-4">
                                    {column.links.map((link, linkIdx) => (
                                        <li key={linkIdx}>
                                            <Link
                                                href="#"
                                                className={`${inter.className} text-gray-400 hover:text-white transition-colors flex items-center gap-2 group w-fit`}
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 scale-0 group-hover:scale-100 transition-transform" />
                                                <span className="group-hover:translate-x-1 transition-transform">{link}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className={`${inter.className} text-gray-600 text-sm`}>
                        © {new Date().getFullYear()} BlindCharm Inc.
                    </p>

                    <div className="flex items-center gap-6">
                        <Link href="#" className="text-gray-600 hover:text-white text-sm transition-colors">Privacy</Link>
                        <Link href="#" className="text-gray-600 hover:text-white text-sm transition-colors">Terms</Link>

                        <div className="h-4 w-px bg-gray-800" />

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>Made with</span>
                            <motion.div
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.5 }}
                            >
                                <Heart className="w-4 h-4 text-pink-500 fill-current drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
                            </motion.div>
                            <span>in the Galaxy</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
