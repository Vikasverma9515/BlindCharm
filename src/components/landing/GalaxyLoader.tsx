'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { boldonse, inter } from '@/app/fonts'

export default function GalaxyLoader({ onLoadingComplete }: { onLoadingComplete: () => void }) {
    const [progress, setProgress] = useState(0)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer)
                    setTimeout(onLoadingComplete, 1000)
                    return 100
                }
                return prev + 1
            })
        }, 25)

        return () => clearInterval(timer)
    }, [onLoadingComplete])

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden"
        >
            {/* Starry Background */}
            <div className="absolute inset-0 z-0">
                {mounted && [...Array(50)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute bg-white rounded-full"
                        initial={{ opacity: Math.random() * 0.5 + 0.1, scale: Math.random() * 0.5 + 0.5 }}
                        animate={{ opacity: [0.2, 0.8, 0.2] }}
                        transition={{ duration: Math.random() * 3 + 2, repeat: Infinity }}
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            width: Math.random() < 0.1 ? '3px' : '1px',
                            height: Math.random() < 0.1 ? '3px' : '1px',
                        }}
                    />
                ))}
            </div>

            {/* Shooting Stars */}
            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                {mounted && [...Array(15)].map((_, i) => (
                    <motion.div
                        key={`shooting-star-${i}`}
                        className="absolute h-[2px] bg-gradient-to-r from-transparent via-white to-transparent rounded-full"
                        style={{
                            width: Math.random() * 100 + 100 + 'px',
                            left: `${Math.random() * 150 - 25}%`,
                            top: `${Math.random() * 150 - 25}%`,
                            rotate: '45deg',
                        }}
                        initial={{ opacity: 0, x: -100, y: -100 }}
                        animate={{
                            opacity: [0, 1, 0],
                            x: [0, 400],
                            y: [0, 400]
                        }}
                        transition={{
                            duration: Math.random() * 1.5 + 0.5,
                            repeat: Infinity,
                            delay: Math.random() * 3,
                            ease: "easeIn"
                        }}
                    />
                ))}
            </div>

            {/* Central Content */}
            <div className="relative z-20 flex flex-col items-center justify-center">

                {/* Logo - Smaller */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="relative w-16 h-16 mb-6"
                >
                    <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full animate-pulse" />
                    <Image
                        src="/logo3.png"
                        alt="BlindCharm"
                        fill
                        className="object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                    />
                </motion.div>

                {/* Typography - Smaller */}
                <div className="text-center">
                    <motion.h1
                        className={`${boldonse.className} text-3xl text-white tracking-widest mb-2`}
                        animate={{ opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        BlindCharm
                    </motion.h1>
                    <p className={`${inter.className} text-gray-400 text-[10px] tracking-[0.4em] uppercase`}>
                        Gathering the Galaxy... {progress}%
                    </p>
                </div>
            </div>
        </motion.div>
    )
}
