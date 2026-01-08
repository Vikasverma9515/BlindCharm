'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { boldonse, inter } from '@/app/fonts'
import { ToggleLeft, Menu, X, Sparkles, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function GalaxyHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { scrollY } = useScroll()
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const unsubscribe = scrollY.on("change", (latest) => {
            setIsScrolled(latest > 50)
        })
        return () => unsubscribe()
    }, [scrollY])

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'How It Works', href: '#how-it-works' },
        { name: 'Manifesto', href: '#manifesto' },
    ]

    return (
        <motion.header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'py-4' : 'py-6'}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
            <div className="max-w-7xl mx-auto px-6">
                <div className={`relative rounded-full transition-all duration-500 ${isScrolled ? 'bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl shadow-purple-500/10' : 'bg-transparent border border-transparent'}`}>
                    <div className="flex items-center justify-between px-6 h-16">

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group relative z-10">
                            <div className="relative">
                                <div className="absolute inset-0 bg-pink-500 blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                                <div className="w-10 h-10 bg-white border border-white/10 rounded-full flex items-center justify-center overflow-hidden relative z-10 group-hover:border-pink-500/50 transition-colors">
                                    <Image src="/logo2.png" alt="BlindCharm" width={40} height={40} className="w-8 h-8 object-contain" />
                                </div>
                            </div>
                            <span className={`${boldonse.className} text-2xl text-white tracking-wide group-hover:text-pink-200 transition-colors`}>
                                BlindCharm
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                            <div className="flex items-center bg-white/5 border border-white/5 rounded-full p-1 backdrop-blur-md">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={`${inter.className} relative px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors rounded-full group overflow-hidden`}
                                    >
                                        <span className="relative z-10">{link.name}</span>
                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                                    </Link>
                                ))}
                            </div>
                        </nav>

                        {/* Actions */}
                        <div className="hidden md:flex items-center gap-4">
                            <Link
                                href="/login"
                                className="group relative px-6 py-2.5 bg-white text-black rounded-full text-sm font-bold overflow-hidden transition-transform hover:scale-105"
                            >
                                <span className="relative z-10 flex items-center gap-1">
                                    Get App <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-pink-200 to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden text-white p-2 hover:bg-white/10 rounded-full transition-colors relative z-10"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-24 left-6 right-6 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:hidden flex flex-col gap-4 shadow-2xl shadow-purple-900/20"
                >
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`${boldonse.className} text-xl text-white p-4 hover:bg-white/5 rounded-2xl border border-transparent hover:border-white/5 transition-all flex items-center justify-between group`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {link.name}
                            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </Link>
                    ))}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />
                </motion.div>
            )}
        </motion.header>
    )
}
