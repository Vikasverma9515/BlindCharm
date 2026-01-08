'use client'

import { useState, useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { bitcountGrid, boldonse, inter } from '@/app/fonts'
import { ArrowRight, Sparkles, Star, Zap, Heart, MessageCircle, Users, Globe, Rocket } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const FloatingElement = ({ children, delay = 0, x = 0, y = 0, scale = 1 }: { children: React.ReactNode, delay?: number, x?: number, y?: number, scale?: number }) => (
    <motion.div
        initial={{ y: 0 }}
        animate={{
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0]
        }}
        transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: delay
        }}
        className="absolute"
        style={{ left: `${x}%`, top: `${y}%`, scale }}
    >
        {children}
    </motion.div>
)

export default function GalaxyHero() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20
            })
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    return (
        <div className="relative min-h-screen bg-black overflow-hidden flex flex-col items-center justify-center pt-24 text-white selection:bg-pink-500 selection:text-white">

            {/* Starry Background */}
            <div className="absolute inset-0 z-0">
                {mounted && [...Array(100)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute bg-white rounded-full"
                        initial={{ opacity: Math.random() * 0.5 + 0.3, scale: Math.random() * 0.5 + 0.5 }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: Math.random() * 3 + 2, repeat: Infinity }}
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            width: Math.random() < 0.1 ? '3px' : '2px',
                            height: Math.random() < 0.1 ? '3px' : '2px',
                            boxShadow: Math.random() < 0.1 ? '0 0 4px rgba(255, 255, 255, 0.8)' : 'none'
                        }}
                    />
                ))}
            </div>

            {/* Shooting Stars (Matching Loading Screen) */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {mounted && [...Array(15)].map((_, i) => (
                    <motion.div
                        key={`shooting-star-${i}`}
                        className="absolute h-[2px] bg-gradient-to-r from-transparent via-white to-transparent rounded-full"
                        style={{
                            width: Math.random() * 100 + 100 + 'px',
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            rotate: '45deg',
                        }}
                        initial={{ opacity: 0, x: -100, y: -100 }}
                        animate={{
                            opacity: [0, 1, 0],
                            x: [0, 400],
                            y: [0, 400]
                        }}
                        transition={{
                            duration: Math.random() * 1.5 + 2, // Slightly slower for hero
                            repeat: Infinity,
                            delay: Math.random() * 5,
                            ease: "easeIn"
                        }}
                    />
                ))}
            </div>

            {/* Floating Avatars / Elements */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <motion.div
                    className="absolute inset-0"
                    animate={{ x: mousePosition.x * -1, y: mousePosition.y * -1 }}
                    transition={{ type: "spring", damping: 30 }}
                >
                    {/* Left Side Cluster (8 Images) */}
                    {/* Top-Left - Hidden on mobile */}
                    <div className="hidden md:block">
                        <FloatingElement x={8} y={18} delay={0} scale={0.9}>
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.5)]">
                                <Image src="/HeroAvatar/a1.svg" alt="User" width={64} height={64} className="w-full h-full object-cover" />
                            </div>
                        </FloatingElement>
                    </div>

                    {/* Mid-Left (Main) - Hidden on mobile now for cleaner look */}
                    <div className="hidden md:block">
                        <FloatingElement x={5} y={32} delay={1} scale={1.3}>
                            <div className="w-10 h-10 md:w-20 md:h-20 rounded-full overflow-hidden border-4 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.6)]">
                                <Image src="/HeroAvatar/a2.svg" alt="User" width={80} height={80} className="w-full h-full object-cover" />
                            </div>
                        </FloatingElement>
                    </div>

                    {/* Mid-Left-Low - Hidden on mobile */}
                    <div className="hidden md:block">
                        <FloatingElement x={10} y={48} delay={2} scale={1.0}>
                            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                                <Image src="/HeroAvatar/a3.svg" alt="User" width={56} height={56} className="w-full h-full object-cover" />
                            </div>
                        </FloatingElement>
                    </div>

                    {/* Bottom-Left - Hidden on mobile */}
                    <div className="hidden md:block">
                        <FloatingElement x={5} y={65} delay={0.5} scale={1.1}>
                            <div className="w-10 h-10 md:w-18 md:h-18 rounded-full overflow-hidden border-2 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                                <Image src="/HeroAvatar/a4.svg" alt="User" width={72} height={72} className="w-full h-full object-cover" />
                            </div>
                        </FloatingElement>
                    </div>

                    {/* Far-Left-Mid - Hidden on mobile */}
                    <div className="hidden md:block">
                        <FloatingElement x={4} y={40} delay={1.5} scale={0.8}>
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.5)]">
                                <Image src="/HeroAvatar/a5.svg" alt="User" width={48} height={48} className="w-full h-full object-cover" />
                            </div>
                        </FloatingElement>
                    </div>

                    {/* Inner-Left-Low - Hidden on mobile */}
                    <div className="hidden md:block">
                        <FloatingElement x={18} y={55} delay={2.5} scale={0.8}>
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.5)]">
                                <Image src="/HeroAvatar/a6.svg" alt="User" width={64} height={64} className="w-full h-full object-cover" />
                            </div>
                        </FloatingElement>
                    </div>

                    {/* Bottom-Left-Corner - Hidden on mobile */}
                    <div className="hidden md:block">
                        <FloatingElement x={6} y={78} delay={1.2} scale={0.7}>
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]">
                                <Image src="/HeroAvatar/a7.svg" alt="User" width={40} height={40} className="w-full h-full object-cover" />
                            </div>
                        </FloatingElement>
                    </div>

                    {/* Inner-Left-Top - Hidden on mobile */}
                    <div className="hidden md:block">
                        <FloatingElement x={16} y={20} delay={0.8} scale={0.7}>
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                                <Image src="/HeroAvatar/a8.svg" alt="User" width={48} height={48} className="w-full h-full object-cover" />
                            </div>
                        </FloatingElement>
                    </div>


                    {/* Right Side Cluster (8 Images) */}
                    {/* Top-Right - Hidden on mobile */}
                    <div className="hidden md:block">
                        <FloatingElement x={88} y={18} delay={0.8} scale={1.0}>
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.5)]">
                                <Image src="/HeroAvatar/a9.svg" alt="User" width={64} height={64} className="w-full h-full object-cover" />
                            </div>
                        </FloatingElement>
                    </div>

                    {/* Mid-Right (Main) - Hidden on mobile */}
                    <div className="hidden md:block">
                        <FloatingElement x={90} y={32} delay={1.8} scale={1.2}>
                            <div className="w-10 h-10 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                                <Image src="/HeroAvatar/a10.svg" alt="User" width={80} height={80} className="w-full h-full object-cover" />
                            </div>
                        </FloatingElement>
                    </div>

                    {/* Far-Right-Mid - Hidden on mobile */}
                    <div className="hidden md:block">
                        <FloatingElement x={94} y={40} delay={2.2} scale={0.9}>
                            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-400 shadow-[0_0_15px_rgba(156,163,175,0.5)]">
                                <Image src="/HeroAvatar/a11.svg" alt="User" width={56} height={56} className="w-full h-full object-cover" />
                            </div>
                        </FloatingElement>
                    </div>

                    {/* Mid-Right-Low - Hidden on mobile */}
                    <div className="hidden md:block">
                        <FloatingElement x={90} y={52} delay={1.2} scale={1.1}>
                            <div className="w-10 h-10 md:w-18 md:h-18 rounded-full overflow-hidden border-2 border-blue-400 shadow-[0_0_25px_rgba(96,165,250,0.5)]">
                                <Image src="/HeroAvatar/a12.svg" alt="User" width={72} height={72} className="w-full h-full object-cover" />
                            </div>
                        </FloatingElement>
                    </div>

                    {/* Bottom-Right - Hidden on mobile */}
                    <div className="hidden md:block">
                        <FloatingElement x={84} y={70} delay={2.8} scale={1.0}>
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                                <Image src="/HeroAvatar/a13.svg" alt="User" width={64} height={64} className="w-full h-full object-cover" />
                            </div>
                        </FloatingElement>
                    </div>

                    {/* Inner-Right-Top - Hidden on mobile */}
                    <div className="hidden md:block">
                        <FloatingElement x={80} y={22} delay={0.5} scale={0.7}>
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                                <Image src="/HeroAvatar/a14.svg" alt="User" width={40} height={40} className="w-full h-full object-cover" />
                            </div>
                        </FloatingElement>
                    </div>

                    {/* Bottom-Right-Corner - Hidden on mobile */}
                    <div className="hidden md:block">
                        <FloatingElement x={92} y={75} delay={1.5} scale={0.8}>
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                                <Image src="/HeroAvatar/a15.svg" alt="User" width={48} height={48} className="w-full h-full object-cover" />
                            </div>
                        </FloatingElement>
                    </div>

                    {/* Inner-Right-Low - Hidden on mobile */}
                    <div className="hidden md:block">
                        <FloatingElement x={82} y={55} delay={2.0} scale={0.8}>
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                                <Image src="/HeroAvatar/a16.svg" alt="User" width={48} height={48} className="w-full h-full object-cover" />
                            </div>
                        </FloatingElement>
                    </div>



                </motion.div>
            </div>

            {/* Main Content */}
            <div className="relative z-20 text-center max-w-5xl mx-auto px-4">

                {/* Top Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 mb-8"
                >
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span className={`${inter.className} text-sm font-medium tracking-wide`}>Now Live: Voice Matches</span>
                    <ArrowRight className="w-4 h-4 text-white/70" />
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className={`${boldonse.className} text-4xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-wide`}
                >
                    Connect with <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-gradient-x">
                        Purpose
                    </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className={`${inter.className} text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed`}
                >
                    Find people for the moment you're in. <br />
                    <span className="text-white font-medium">No random swiping. Just context-aware connections.</span>
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-col items-center gap-8"
                >
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link
                            href="/galaxy"
                            className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg overflow-hidden transition-transform hover:scale-105"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <Rocket className="w-5 h-5" />
                                Start Your Journey
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-200 to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>

                        <Link
                            href="/how-it-works"
                            className="group px-8 py-4 bg-transparent border border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all flex items-center gap-2"
                        >
                            <Globe className="w-5 h-5" />
                            How it Works
                        </Link>
                    </div>

                    {/* Mobile Only - Row of Icons below CTA */}
                    <div className="md:hidden flex items-center justify-center gap-6 mt-4">
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 1.0 }}
                            className="w-14 h-14 rounded-full overflow-hidden border-2 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                        >
                            <Image src="/HeroAvatar/a1.svg" alt="User" width={56} height={56} className="w-full h-full object-cover" />
                        </motion.div>

                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 1.2 }}
                            className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] -mt-4"
                        >
                            <Image src="/HeroAvatar/a3.svg" alt="User" width={64} height={64} className="w-full h-full object-cover" />
                        </motion.div>

                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 1.4 }}
                            className="w-14 h-14 rounded-full overflow-hidden border-2 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                        >
                            <Image src="/HeroAvatar/a4.svg" alt="User" width={56} height={56} className="w-full h-full object-cover" />
                        </motion.div>
                    </div>
                </motion.div>

                {/* Bottom Features */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                    className="mt-24 hidden md:flex flex-col items-center gap-6"
                >
                    <span className="text-gray-500 text-sm uppercase tracking-widest font-medium">How it works:</span>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                        <div className="flex items-center gap-3 text-white/90 hover:text-white transition-colors">
                            <Users className="w-6 h-6 text-pink-500" />
                            <span className="font-bold text-lg">Real Connections</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/90 hover:text-white transition-colors">
                            <Zap className="w-6 h-6 text-yellow-400" />
                            <span className="font-bold text-lg">Instant Matching</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/90 hover:text-white transition-colors">
                            <Heart className="w-6 h-6 text-red-500" />
                            <span className="font-bold text-lg">Personality First</span>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    )
}
