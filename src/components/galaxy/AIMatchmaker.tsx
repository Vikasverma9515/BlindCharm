'use client';

import { useState } from 'react';
import { searchByVibeAction } from '@/app/actions/ai-matchmaker';
import { Loader2, Search, Sparkles, User, MessageCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';


interface AIMatchmakerProps {
    onMatchesFound?: (results: any[], query: string) => void;
}

export default function AIMatchmaker({ onMatchesFound }: AIMatchmakerProps) {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);

    // We don't need local results state anymore if we are passing them up

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query.trim()) return;

        setLoading(true);

        try {
            const matches = await searchByVibeAction(query);

            if (onMatchesFound) {
                onMatchesFound(matches, query);
            }
        } catch (error) {
            console.error(error);
            // Handle error (toast)
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full text-white relative w-full">

            <div className="flex-1 overflow-y-auto z-10 scrollbar-hide">
                <div className="max-w-xl mx-auto space-y-2">

                    {/* Header */}
                    <div className="text-center space-y-1 mb-6">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <Sparkles className="text-white w-5 h-5" />
                        </div>
                        <h1 className="text-xl font-medium text-white">
                            AI Matchmaker
                        </h1>
                        <p className="text-white/50 text-xs max-w-xs mx-auto">
                            Describe your vibe. We'll find the match.
                        </p>
                    </div>

                    {/* Search Input */}
                    <form onSubmit={handleSearch} className="relative">
                        <textarea
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g. Someone who loves jazz and hiking..."
                            className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl p-4 pr-12 min-h-[80px] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-zinc-900 transition-all resize-none"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSearch();
                                }
                            }}
                        />
                        <button
                            type="submit"
                            disabled={loading || !query.trim()}
                            className="absolute bottom-3 right-3 p-2 bg-white text-black rounded-xl hover:bg-white/90 disabled:opacity-50 transition-all"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                        </button>
                    </form>

                    {/* No Results List - Results are handled by parent */}
                </div>
            </div>
        </div>
    );
}
