'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Heart, X, Sparkles, Mic } from 'lucide-react';
import Image from 'next/image';

interface DailyPickCardProps {
    profile: any; // Allow flexibility for mapped Supabase data
    onLike?: () => void;
    onPass?: () => void;
    onClick?: () => void;
}

export default function DailyPickCard({ profile, onLike, onPass, onClick }: DailyPickCardProps) {
    const [isPlaying, setIsPlaying] = useState(false);

    // Mock voice play
    const handleVoiceToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsPlaying(!isPlaying);
        // actual audio logic would go here
    };

    return (
        <motion.div
            onClick={onClick}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-[3/4] rounded-3xl overflow-hidden group shadow-2xl border border-white/10 cursor-pointer"
        >
            {/* Background Image */}
            <Image
                src={profile.photo_url}
                alt={profile.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />

            {/* Content Container */}
            <div className="absolute inset-0 p-5 flex flex-col justify-end">



                {/* Connectivity Insight - THE UNIQUE FEATURE */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-3 mb-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <div className="flex items-start gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm font-medium text-white/90 leading-snug">
                            {profile.connection_insight}
                        </p>
                    </div>
                </div>

                {/* Name & Basic Info */}
                <div className="mb-4">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        {profile.name}, {profile.age}
                    </h3>
                    <p className="text-sm text-white/60">{profile.location}</p>
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-between gap-3">
                    {/* Voice Button */}
                    {profile.voice_url && (
                        <button
                            onClick={handleVoiceToggle}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300 ${isPlaying
                                ? 'bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]'
                                : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                                }`}
                        >
                            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                            <span className="text-xs font-bold uppercase tracking-wide">
                                {isPlaying ? 'Playing' : 'Voice'}
                            </span>
                            {/* Visualizer bars (static mock) */}
                            {!isPlaying && <div className="flex gap-0.5 items-end h-3">
                                <div className="w-0.5 h-1.5 bg-current rounded-full" />
                                <div className="w-0.5 h-3 bg-current rounded-full" />
                                <div className="w-0.5 h-2 bg-current rounded-full" />
                            </div>}
                            {isPlaying && <div className="flex gap-0.5 items-end h-3">
                                <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-0.5 bg-current rounded-full" />
                                <motion.div animate={{ height: [8, 4, 10] }} transition={{ repeat: Infinity, duration: 0.4, delay: 0.1 }} className="w-0.5 bg-current rounded-full" />
                                <motion.div animate={{ height: [5, 9, 3] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-0.5 bg-current rounded-full" />
                            </div>}
                        </button>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); onPass?.(); }}
                            className="w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white/70 hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/50 transition-all"
                        >
                            <X size={20} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onLike?.(); }}
                            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-pink-500 hover:text-white hover:scale-105 transition-all shadow-lg"
                        >
                            <Heart size={20} fill="currentColor" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
