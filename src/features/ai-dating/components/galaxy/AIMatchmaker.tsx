'use client';

import { useState, useRef, useEffect } from 'react';
import { searchByVibeAction } from '@/app/actions/ai-matchmaker';
import { Loader2, Search } from 'lucide-react';
import { FaMagic } from 'react-icons/fa';

interface AIMatchmakerProps {
    onMatchesFound?: (results: any[], query: string) => void;
}

export default function AIMatchmaker({ onMatchesFound }: AIMatchmakerProps) {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // iOS keyboard handling
    useEffect(() => {
        const handleResize = () => {
            // When keyboard appears, scroll textarea into view
            if (document.activeElement === textareaRef.current) {
                setTimeout(() => {
                    textareaRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 100);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleFocus = () => {
        // Scroll into view when focused
        setTimeout(() => {
            textareaRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 300); // Wait for keyboard animation
    };

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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            {/* Compact Header */}
            <div className="text-center mb-4">
                <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-500/20">
                    <FaMagic className="text-white w-5 h-5" />
                </div>
                <h1 className="text-lg font-bold text-white mb-1">
                    AI Matchmaker
                </h1>
                <p className="text-white/50 text-xs">
                    Describe your vibe. We'll find the match.
                </p>
            </div>

            {/* Compact Search Input */}
            <form onSubmit={handleSearch} className="relative">
                <textarea
                    ref={textareaRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={handleFocus}
                    placeholder="e.g. Someone who loves jazz and hiking..."
                    rows={3}
                    className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl p-3 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-zinc-900 transition-all resize-none"
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
                    className="absolute bottom-3 right-3 p-2 bg-red-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                </button>
            </form>
        </div>
    );
}
