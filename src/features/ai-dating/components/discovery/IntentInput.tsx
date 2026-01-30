'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Search, MessageCircle, Coffee, Moon, Code, Zap } from 'lucide-react';

interface IntentInputProps {
    onSubmit: (intent: string) => void;
    onSkip: () => void;
}

const SUGGESTIONS = [
    { id: 'talk', label: 'Just someone to talk to', icon: MessageCircle, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { id: 'calm', label: 'Calm & comforting', icon: Moon, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { id: 'fun', label: 'Fun and light', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    { id: 'deep', label: 'Deep conversation', icon: Coffee, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { id: 'code', label: 'Code / build together', icon: Code, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
];

export default function IntentInput({ onSubmit, onSkip }: IntentInputProps) {
    const [intent, setIntent] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (intent.trim()) {
            onSubmit(intent);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative z-20">
                {/* Header Section */}
                <div className="text-center mb-6 space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 mb-2">
                        <Sparkles size={10} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">AI Matchmaker</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                        Find your kind of people.
                    </h2>
                    <p className="text-white/50 text-xs font-light max-w-[80%] mx-auto leading-relaxed">
                        Tell us exactly who you're looking for. Avoid the small talk and get straight to the vibe.
                    </p>
                </div>

                {/* Example Prompts (Inspiration) */}
                <div className="mb-4 pl-1">
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2">Try asking for...</p>
                    <div className="flex flex-col gap-1.5 opacity-60">
                        <div className="text-xs text-white/70 italic flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-white/40" />
                            "Someone to explore hidden jazz bars with downtown."
                        </div>
                        <div className="text-xs text-white/70 italic flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-white/40" />
                            "A witty debate partner for 2am deep talks."
                        </div>
                    </div>
                </div>

                {/* Input Bar */}
                <form onSubmit={handleSubmit} className="relative mb-6 group">
                    <div className={`relative bg-[#1A1A1A] border transition-all duration-300 rounded-2xl p-1 ${isFocused ? 'border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.15)]' : 'border-white/10'}`}>
                        <div className="relative flex items-center">
                            <div className="pl-3 pr-2 text-white/40">
                                <Search className={`w-4 h-4 transition-colors ${isFocused || intent ? 'text-purple-400' : ''}`} />
                            </div>

                            <input
                                ref={inputRef}
                                type="text"
                                value={intent}
                                onChange={(e) => setIntent(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                placeholder="Describe your ideal connection..."
                                className="flex-1 bg-transparent border-none outline-none text-white/90 placeholder-white/20 py-3 text-sm"
                            />

                            <AnimatePresence>
                                {intent.trim() && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        type="submit"
                                        className="mr-1 p-2 bg-white text-black rounded-xl hover:bg-gray-200 transition-colors shadow-lg shadow-white/10"
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </form>

                {/* Quick Select Carousel */}
                <div>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-3 pl-1">Or pick a vibe</p>
                    <div className="w-full overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 mask-fade-sides">
                        <div className="flex gap-2 w-max">
                            {SUGGESTIONS.map((chip, index) => (
                                <motion.button
                                    key={chip.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 + index * 0.05 }}
                                    onClick={() => onSubmit(chip.label)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border backdrop-blur-sm transition-all hover:scale-105 active:scale-95 whitespace-nowrap ${chip.bg} ${chip.border}`}
                                >
                                    <chip.icon className={`w-3.5 h-3.5 ${chip.color}`} />
                                    <span className="text-white/80 text-xs font-medium tracking-wide">{chip.label}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
