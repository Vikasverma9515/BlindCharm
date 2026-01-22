'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const vibeExamples = [
    "Someone adventurous who loves spontaneous road trips...",
    "Looking for deep conversations over coffee...",
    "A creative soul who enjoys art galleries and live music...",
    "Someone chill who's into hiking and nature...",
    "A foodie who loves trying new restaurants...",
];

export default function VibeTypingAnimation() {
    const [currentText, setCurrentText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
        const currentPhrase = vibeExamples[currentIndex];

        if (isPaused) {
            const pauseTimeout = setTimeout(() => {
                setIsPaused(false);
                setIsDeleting(true);
            }, 2000);
            return () => clearTimeout(pauseTimeout);
        }

        if (!isDeleting && currentText === currentPhrase) {
            setIsPaused(true);
            return;
        }

        if (isDeleting && currentText === '') {
            setIsDeleting(false);
            setCurrentIndex((prev) => (prev + 1) % vibeExamples.length);
            return;
        }

        const timeout = setTimeout(() => {
            if (!isDeleting) {
                setCurrentText(currentPhrase.substring(0, currentText.length + 1));
            } else {
                setCurrentText(currentPhrase.substring(0, currentText.length - 1));
            }
        }, isDeleting ? 30 : 80);

        return () => clearTimeout(timeout);
    }, [currentText, isDeleting, currentIndex, isPaused]);

    // Cursor blink effect
    useEffect(() => {
        const cursorInterval = setInterval(() => {
            setShowCursor((prev) => !prev);
        }, 530);
        return () => clearInterval(cursorInterval);
    }, []);

    return (
        <div className="relative w-full max-w-md mx-auto">
            {/* Modal-like container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-zinc-900 rounded-2xl p-6 border border-white/10 shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-center gap-3 mb-6">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center"
                    >
                        <span className="text-white text-xl">✨</span>
                    </motion.div>
                    <h3 className="font-heading font-bold text-xl text-white">
                        AI Matchmaker
                    </h3>
                </div>

                <p className="text-gray-400 text-center mb-6 text-sm">
                    Describe your vibe. We'll find the match.
                </p>

                {/* Input field with typing animation */}
                <div className="relative">
                    <div className="bg-black rounded-xl p-4 border border-white/10 min-h-[80px] flex items-start">
                        <span className="text-gray-300 font-medium">
                            {currentText || <span className="text-gray-600">e.g. Someone who loves jazz and hiking...</span>}
                            <motion.span
                                animate={{ opacity: showCursor ? 1 : 0 }}
                                className="inline-block w-0.5 h-5 bg-red-500 ml-0.5 align-middle"
                            />
                        </span>
                    </div>

                    {/* Search button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="absolute right-3 bottom-3 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-900/30 hover:bg-red-700 transition-colors"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                    </motion.button>
                </div>

                {/* Floating particles effect */}
                {/* <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{
                                opacity: [0, 0.5, 0],
                                y: [20, -100],
                                x: [0, Math.random() * 40 - 20],
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                repeat: Infinity,
                                delay: i * 0.8,
                                ease: "easeOut",
                            }}
                            className="absolute bottom-0 left-1/2 w-1 h-1 bg-red-500 rounded-full"
                            style={{ left: `${20 + i * 15}%` }}
                        />
                    ))}
                </div> */}
            </motion.div>

            {/* Glow effect */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-red-900/20 via-transparent to-transparent rounded-2xl blur-2xl" />
        </div>
    );
}
