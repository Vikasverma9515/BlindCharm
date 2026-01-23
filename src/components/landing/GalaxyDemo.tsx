'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Sparkles, MessageCircleHeart, Zap, Star } from 'lucide-react';
import CardPreview from '@/components/profile/CardPreview';
import { StoryCard } from '@/types/ai';

const MOCK_PROFILES: StoryCard[] = [
    {
        user_id: 'demo-1',
        full_name: 'Sarah',
        age: 24,
        birth_date: '1999-05-15',
        location: 'New York, NY',
        bio: "Art & Food. \n\nLooking for someone who can appreciate a perfectly plated risotto.",
        about_me: "Life is too short for bad coffee.",
        photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop'],
        visual_cue: 'Art & Food',
        match_score: 85,
        theme: 'modern',
        color: '#fb7185', // rose-400
        current_mood: 'Creative',
        identity_signals: ['🎨 Artist', '🍝 Foodie'],
        interest_capsules: ['Photography', 'Cooking'],
        connection_insight: "Creative souls.",
        compatibility_summary: "Matches your creative vibe.",
        visual_proof_tags: ['Art'],
        photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop',
        story_line: 'Art director by day.',
    } as any,
    {
        user_id: 'demo-2',
        full_name: 'James',
        age: 26,
        birth_date: '1997-08-20',
        location: 'Brooklyn, NY',
        bio: "Musician & Coffee. \n\nLet's talk universe.",
        about_me: "Music is the soul.",
        photos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop'],
        visual_cue: 'Music',
        match_score: 72,
        theme: 'minimal',
        color: '#60a5fa', // blue-400
        current_mood: 'Chill',
        identity_signals: ['🎸 Musician', '☕ Coffee'],
        interest_capsules: ['Jazz', 'Vinyl'],
        connection_insight: "Shared arts.",
        compatibility_summary: "Good energy match.",
        visual_proof_tags: ['Music'],
        photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop',
        story_line: 'Musician and coffee enthusiast.',
    } as any,
    {
        user_id: 'demo-3',
        full_name: 'Maya',
        age: 25,
        birth_date: '1998-03-10',
        location: 'Manhattan, NY',
        bio: "Adventurous soul. \n\nHiking, climbing, spontaniety. Keep up!",
        about_me: "Adventure awaits.",
        photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop'],
        visual_cue: 'Adventure',
        match_score: 95,
        theme: 'luxury',
        color: '#facc15', // yellow-400
        current_mood: 'Adventurous',
        identity_signals: ['🏔️ Hiker', '🧗 Climber'],
        interest_capsules: ['Travel', 'Nature'],
        connection_insight: "Perfect match!",
        compatibility_summary: "High compatibility!",
        visual_proof_tags: ['Travel'],
        photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop',
        story_line: 'Adventurous soul.',
    } as any,
];

export default function GalaxyDemo() {
    const [step, setStep] = useState(0);
    const [vibeText, setVibeText] = useState('');
    const [showMatch, setShowMatch] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;

        const runSequence = () => {
            setStep(0);
            setVibeText('');
            setShowMatch(false);

            timer = setTimeout(() => {
                setStep(1); // Swipe Right Sarah
                setTimeout(() => {
                    setStep(2); // Show James
                    setTimeout(() => {
                        setStep(3); // Swipe Left James
                        setTimeout(() => {
                            setStep(4); // Open Vibe

                            const text = "Someone adventurous and spontaneous";
                            let i = 0;
                            const typeInterval = setInterval(() => {
                                setVibeText(text.substring(0, i + 1));
                                i++;
                                if (i === text.length) {
                                    clearInterval(typeInterval);
                                    setTimeout(() => {
                                        setStep(5); // Searching
                                        setTimeout(() => {
                                            setStep(6); // Match Found (Maya)
                                            setShowMatch(true);
                                            setTimeout(() => {
                                                runSequence();
                                            }, 5000);
                                        }, 1500);
                                    }, 800);
                                }
                            }, 40);
                        }, 500);
                    }, 1400);
                }, 500);
            }, 1800);
        };

        runSequence();
        return () => clearTimeout(timer);
    }, []);

    const getCurrentCard = () => {
        if (step === 0 || step === 1) return MOCK_PROFILES[0];
        if (step === 2 || step === 3) return MOCK_PROFILES[1];
        if (step >= 6) return MOCK_PROFILES[2];
        return null;
    };

    const isSwipingRight = step === 1;
    const isSwipingLeft = step === 3;
    const isVibeMode = step >= 4;

    return (
        <div className="relative flex items-center justify-center">

            {/* FLOATING AI INSIGHTS (When Match Found) - Updated z-index and positions */}
            <AnimatePresence>
                {showMatch && (
                    <>
                        {/* Right Bubble - Energy */}
                        <motion.div
                            initial={{ opacity: 0, x: 20, scale: 0.8 }}
                            animate={{ opacity: 1, x: 80, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="absolute top-24 right-25 z-20 translate-x-[50%]"
                        >
                            <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl w-[140px] relative">
                                {/* Connecting Line */}
                                <div className="absolute top-4 -left-2 w-3 h-3 bg-zinc-900/90 border-l border-b border-white/10 rotate-45 transform" />

                                <div className="flex items-center gap-2 mb-1">
                                    <div className="p-1 rounded-full bg-yellow-500/20">
                                        <Zap size={10} className="text-yellow-400" fill="currentColor" />
                                    </div>
                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Energy</span>
                                </div>
                                <p className="text-xs text-gray-300 font-medium leading-snug">"Matches your adventurous spirit"</p>
                            </div>
                        </motion.div>

                        {/* Left Bubble - Connection */}
                        <motion.div
                            initial={{ opacity: 0, x: -20, scale: 0.8 }}
                            animate={{ opacity: 1, x: -80, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ delay: 0.4, type: "spring" }}
                            className="absolute bottom-40 left-25 z-20 -translate-x-[50%]"
                        >
                            <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl w-[140px] relative">
                                {/* Connecting Line */}
                                <div className="absolute top-4 -right-2 w-3 h-3 bg-zinc-900/90 border-t border-r border-white/10 rotate-45 transform" />

                                <div className="flex items-center gap-2 mb-1">
                                    <div className="p-1 rounded-full bg-pink-500/20">
                                        <MessageCircleHeart size={10} className="text-pink-400" fill="currentColor" />
                                    </div>
                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Connection</span>
                                </div>
                                <p className="text-xs text-gray-300 font-medium leading-snug">"Both love spontaneity"</p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>


            <div className="relative w-[300px] h-[600px] bg-black rounded-[3rem] border-4 border-zinc-800 shadow-2xl ring-8 ring-black/50 z-10 overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-50 pointer-events-none" />

                <div className="relative w-full h-full bg-zinc-950 flex flex-col">

                    {/* HEADER */}
                    <div className="absolute top-0 left-0 right-0 z-40 p-4 pt-12 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center">
                        {/* <span className="font-bold text-white text-lg tracking-tight">Galaxy</span> */}
                        {step < 4 && (
                            <div className="bg-white/10 p-2 rounded-full backdrop-blur-md">
                                <Sparkles size={16} className="text-yellow-400" />
                            </div>
                        )}
                    </div>

                    {/* MAIN AREA */}
                    <div className="flex-1 relative overflow-hidden">

                        {/* REFINED VIBE SEARCH OVERLAY */}
                        <AnimatePresence>
                            {isVibeMode && step < 6 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="absolute inset-0 z-30 bg-black/95 flex flex-col items-center justify-center p-6 text-center"
                                >
                                    <div className="mb-6 relative">
                                        <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
                                        {/* <Sparkles size={40} className="text-white relative z-10" /> */}

                                    </div>

                                    <h3 className="text-2xl font-bold text-white mb-6 tracking-tight">Describe your vibe</h3>

                                    <div className="w-full bg-zinc-900/50 rounded-2xl border border-white/10 p-4 flex items-start text-left mb-8 min-h-[100px]">
                                        <span className="text-lg text-white/90 font-medium leading-relaxed">
                                            {vibeText}
                                            <span className="animate-pulse ml-0.5 text-purple-400">|</span>
                                        </span>
                                    </div>

                                    {step === 5 && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex flex-col items-center gap-3"
                                        >
                                            <div className="flex gap-2">
                                                <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                            <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Curating matches</span>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* CARDS */}
                        <AnimatePresence mode='wait'>
                            {!isVibeMode && getCurrentCard() && (
                                <motion.div
                                    key={getCurrentCard()?.user_id}
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={
                                        isSwipingRight
                                            ? { x: 300, opacity: 0, rotate: 15 }
                                            : isSwipingLeft
                                                ? { x: -300, opacity: 0, rotate: -15 }
                                                : { scale: 1, opacity: 1, x: 0, rotate: 0 }
                                    }
                                    transition={{ duration: 0.4 }}
                                    className="absolute inset-0 p-2 pb-24"
                                >
                                    <div className="w-full h-full rounded-[32px] overflow-hidden relative shadow-xl bg-gray-900">
                                        <CardPreview
                                            profile={getCurrentCard()!}
                                            theme={getCurrentCard()!.theme || 'modern'}
                                            color={getCurrentCard()!.color || '#a855f7'}
                                            mood={getCurrentCard()!.current_mood || 'Chill'}
                                            border='thin'
                                        />

                                        {/* Simplified Swipe Indicators */}
                                        {isSwipingRight && (
                                            <div className="absolute top-10 left-10 bg-green-500/20 backdrop-blur-md rounded-lg px-4 py-2 transform -rotate-12 z-50 border border-green-500/50">
                                                <span className="text-green-400 font-bold text-2xl uppercase">LIKE</span>
                                            </div>
                                        )}
                                        {isSwipingLeft && (
                                            <div className="absolute top-10 right-10 bg-red-500/20 backdrop-blur-md rounded-lg px-4 py-2 transform rotate-12 z-50 border border-red-500/50">
                                                <span className="text-red-400 font-bold text-2xl uppercase">PASS</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* MATCH REVEAL */}
                            {step === 6 && getCurrentCard() && (
                                <motion.div
                                    key="match-reveal"
                                    initial={{ scale: 0.8, opacity: 0, y: 50 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    transition={{ type: "spring", damping: 20 }}
                                    className="absolute inset-0 p-2 pb-24"
                                >
                                    {/* Refined Match Badge - More Subtle */}
                                    <div className="absolute top-20 left-0 right-0 z-50 flex justify-center pointer-events-none">
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ type: "spring", bounce: 0.5 }}
                                            className="bg-zinc-900/80 backdrop-blur-xl border border-purple-500/30 px-6 py-2 rounded-full shadow-2xl flex items-center gap-2"
                                        >
                                            <Sparkles size={14} className="text-purple-400" fill="currentColor" />
                                            <span className="font-bold text-xs tracking-widest text-white uppercase">Vibe Match</span>
                                        </motion.div>
                                    </div>

                                    <div className="w-full h-full rounded-[32px] overflow-hidden relative shadow-2xl ring-2 ring-purple-500/50 bg-gray-900">
                                        <CardPreview
                                            profile={getCurrentCard()!}
                                            theme={getCurrentCard()!.theme || 'luxury'}
                                            color={getCurrentCard()!.color || '#facc15'}
                                            mood={getCurrentCard()!.current_mood || 'Adventurous'}
                                            border='glow'
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </div>

                    {/* REFINED FOOTER CONTROLS */}
                    <div className="absolute bottom-8 left-0 right-0 px-8 flex items-center justify-between z-40">
                        <motion.button
                            animate={isSwipingLeft ? { scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" } : { scale: 1 }}
                            className="w-14 h-14 rounded-full bg-zinc-900/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 hover:bg-zinc-800 transition-colors"
                        >
                            <X size={24} />
                        </motion.button>

                        <motion.button
                            animate={isVibeMode ? { scale: 1.05 } : { scale: 1 }}
                            className="h-12 px-6 rounded-full bg-white text-black font-bold flex items-center justify-center gap-2 shadow-lg shadow-white/10"
                        >
                            <Sparkles size={18} className={isVibeMode ? "text-purple-600" : "text-black"} fill={isVibeMode ? "currentColor" : "none"} />
                            <span className="text-sm">Vibe</span>
                        </motion.button>

                        <motion.button
                            animate={isSwipingRight ? { scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" } : { scale: 1 }}
                            className="w-14 h-14 rounded-full bg-zinc-900/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-red-500 hover:bg-zinc-800 transition-colors"
                        >
                            <Heart size={24} fill="currentColor" />
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    );
}
