'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Sparkles, Zap, Clock, ChevronLeft, MapPin } from 'lucide-react';
import Image from 'next/image';

const MOCK_PICKS = [
    {
        id: 'p1',
        name: 'Elena',
        age: 23,
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop',
        match_score: 94,
        insight: "Indie music lover",
        bio: "Gallery hopper and coffee snob.",
        location: "Brooklyn, NY"
    },
    {
        id: 'p2',
        name: 'Jordan',
        age: 26,
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop',
        match_score: 88,
        insight: "Hiking partner",
        bio: "Always looking for the next peak.",
        location: "Denver, CO"
    },
    {
        id: 'p3',
        name: 'Sam',
        age: 24,
        image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1000&auto=format&fit=crop',
        match_score: 91,
        insight: "Creative soul",
        bio: "Designer. Maker. Dreamer.",
        location: "Austin, TX"
    },
    {
        id: 'p4',
        name: 'Liam',
        age: 25,
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop',
        match_score: 85,
        insight: "Early bird",
        bio: "Morning runs and black coffee.",
        location: "Seattle, WA"
    }
];

export default function DailyPicksDemo() {
    const [step, setStep] = useState(0);

    useEffect(() => {
        let timer: NodeJS.Timeout;

        const runSequence = () => {
            setStep(0);

            // 1. Loading State (2s)
            timer = setTimeout(() => {
                setStep(1); // Show Grid

                // 2. Wait, then simulate click on first card (2s)
                setTimeout(() => {
                    setStep(2); // Show Cursor moving

                    setTimeout(() => {
                        setStep(3); // Open Detail View

                        // 3. Stay on detail view (5s)
                        setTimeout(() => {
                            // Loop
                            runSequence();
                        }, 5000);

                    }, 800);
                }, 2000);

            }, 2000);
        };

        runSequence();
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative flex items-center justify-center">

            {/* FLOATING AI INSIGHT BUBBLE (Overlapping Phone) */}


            <div className="relative w-[300px] h-[600px] bg-black rounded-[3rem] border-4 border-zinc-800 shadow-2xl ring-8 ring-black/50 z-10 overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-50 pointer-events-none" />

                <div className="relative w-full h-full bg-zinc-950 flex flex-col font-sans">

                    {/* SCROLLABLE CONTENT AREA */}
                    <div className="flex-1 relative overflow-y-auto no-scrollbar scroll-smooth">

                        {/* HEADER */}
                        <div className="pt-12 px-6 pb-4 flex justify-between items-end bg-gradient-to-b from-zinc-950 via-zinc-950/90 to-transparent z-10 sticky top-0">
                            <div>
                                <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Thursday</span>
                                <h2 className="text-white text-2xl font-bold leading-none mt-1">Daily Picks</h2>
                            </div>
                            <div className="bg-white/5 border border-white/10 px-2 py-1 rounded-md flex items-center gap-1.5">
                                <Clock size={12} className="text-white/60" />
                                <span className="text-white/60 text-[10px] font-mono">14h 20m</span>
                            </div>
                        </div>

                        {/* STEP 0: LOADING / SCANNING */}
                        <AnimatePresence mode='wait'>
                            {step === 0 && (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center pb-20"
                                >
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
                                        <div className="relative w-20 h-20 rounded-full border-2 border-purple-500/30 flex items-center justify-center animate-spin-slow">
                                            <div className="w-16 h-16 rounded-full border-2 border-t-purple-500 border-r-transparent border-l-transparent border-b-transparent animate-spin" />
                                        </div>
                                        <Sparkles size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white animate-pulse" />
                                    </div>
                                    <p className="text-white/50 text-xs mt-6 tracking-widest uppercase font-medium">Curating matches...</p>
                                </motion.div>
                            )}

                            {/* STEP 1: GRID VIEW */}
                            {(step === 1 || step === 2) && (
                                <motion.div
                                    key="grid"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="px-4 pb-20"
                                >
                                    <div className="grid grid-cols-2 gap-3">
                                        {MOCK_PICKS.map((pick, i) => (
                                            <motion.div
                                                key={pick.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="relative aspect-[3/4.2] bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 shadow-lg group"
                                            >
                                                <Image src={pick.image} alt={pick.name} fill className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                                <div className="absolute bottom-3 left-3 right-3">
                                                    <p className="text-white font-bold text-sm leading-tight">{pick.name}, {pick.age}</p>
                                                    <div className="flex items-center gap-1 mt-1.5 opacity-80">
                                                        <Zap size={10} className="text-purple-400 shrink-0" />
                                                        <span className="text-[10px] text-gray-200 truncate">{pick.insight}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 3: DETAIL VIEW */}
                            {step === 3 && (
                                <motion.div
                                    key="detail"
                                    initial={{ opacity: 0, y: '100%' }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: '100%' }}
                                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                    className="absolute inset-0 z-30 bg-zinc-950 flex flex-col"
                                >
                                    {/* Image Section */}
                                    <div className="relative h-[100%] w-full">
                                        <Image src={MOCK_PICKS[0].image} alt="Elena" fill className="object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-90" />

                                        {/* Back Button */}
                                        <div className="absolute top-12 left-4 w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10">
                                            <ChevronLeft size={20} />
                                        </div>
                                    </div>

                                    {/* Info Section */}
                                    <div className="flex-1 px-6 -mt-12 relative z-10 flex flex-col">
                                        <div className="mb-4">
                                            <div className="flex justify-between items-start">
                                                <h2 className="text-3xl font-heading font-bold text-white">
                                                    Elena, 23
                                                </h2>

                                                {/* Adjusted Pick Badge */}
                                                <div className="bg-purple-500/20 text-purple-300 text-[9px] px-2 py-1 rounded-lg uppercase tracking-wider font-bold border border-purple-500/20 shadow-sm backdrop-blur-md">
                                                    Pick of day
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 text-white/50 text-sm mt-1">
                                                <MapPin size={12} />
                                                <span>Brooklyn, NY</span>
                                            </div>
                                        </div>

                                        {/* Insight Card */}
                                        <div className="bg-zinc-900 border border-white/10 rounded-xl p-4 mb-4 shadow-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Sparkles size={14} className="text-purple-400" />
                                                <span className="text-xs font-bold text-white uppercase tracking-widest">Connect Deeply</span>
                                            </div>
                                            <p className="text-sm text-gray-300 leading-snug">
                                                You both hang out in Brooklyn tech galleries. Great conversation starter about modern art.
                                            </p>
                                        </div>

                                        <p className="text-white/60 text-sm leading-relaxed mb-auto line-clamp-2">
                                            {MOCK_PICKS[0].bio} Looking for someone who can appreciate a perfectly plated risotto.
                                        </p>

                                        {/* Actions */}
                                        <div className="flex gap-4 justify-center pb-8 pt-4">
                                            <div className="w-14 h-14 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-red-500/50 hover:bg-zinc-800 transition-colors">
                                                <X size={24} />
                                            </div>
                                            <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-white/10">
                                                <Heart size={24} fill="currentColor" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* CURSOR SIMULATION */}
                    <AnimatePresence>
                        {step === 2 && (
                            <motion.div
                                initial={{ opacity: 0, x: 100, y: 300 }}
                                animate={{ opacity: 1, x: 70, y: 160 }}
                                exit={{ opacity: 0, scale: 1.5 }}
                                transition={{ duration: 1, ease: "easeInOut" }}
                                className="absolute top-0 left-0 z-50 pointer-events-none"
                            >
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full border border-white/50 flex items-center justify-center shadow-2xl">
                                    <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </div>
        </div>
    );
}
