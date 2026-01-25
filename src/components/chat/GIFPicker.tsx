'use client';

import { useState, useEffect } from 'react';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, TrendingUp } from 'lucide-react';
import Image from 'next/image';

interface GIFPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectGIF: (gifUrl: string, gifId: string) => void;
}

const gf = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_API_KEY || 'YOUR_API_KEY');

export default function GIFPicker({ isOpen, onClose, onSelectGIF }: GIFPickerProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [gifs, setGifs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Load trending GIFs on open
    useEffect(() => {
        if (isOpen && searchQuery === '') {
            loadTrendingGIFs();
        }
    }, [isOpen]);

    const loadTrendingGIFs = async () => {
        setLoading(true);
        try {
            const { data } = await gf.trending({ limit: 20 });
            setGifs(data);
        } catch (error) {
            console.error('Failed to load trending GIFs:', error);
        } finally {
            setLoading(false);
        }
    };

    const searchGIFs = async () => {
        if (!searchQuery.trim()) {
            loadTrendingGIFs();
            return;
        }

        setLoading(true);
        try {
            const { data } = await gf.search(searchQuery, { limit: 20 });
            setGifs(data);
        } catch (error) {
            console.error('Failed to search GIFs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectGIF = (gif: any) => {
        const gifUrl = gif.images.fixed_height.url;
        onSelectGIF(gifUrl, gif.id);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    />

                    {/* GIF Picker Drawer */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-[70] bg-zinc-900 rounded-t-3xl border-t border-white/10 max-h-[70vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-purple-400" />
                                <h3 className="text-white font-semibold">
                                    {searchQuery ? 'Search Results' : 'Trending GIFs'}
                                </h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-white/60" />
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && searchGIFs()}
                                    placeholder="Search for GIFs..."
                                    className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50"
                                />
                            </div>
                        </div>

                        {/* GIF Grid */}
                        <div className="flex-1 overflow-y-auto p-4 pt-0">
                            {loading ? (
                                <div className="flex items-center justify-center h-40">
                                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {gifs.map((gif) => (
                                        <motion.button
                                            key={gif.id}
                                            onClick={() => handleSelectGIF(gif)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="relative aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all"
                                        >
                                            <Image
                                                src={gif.images.fixed_height_small.url}
                                                alt={gif.title || 'GIF'}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </motion.button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Powered by Giphy */}
                        <div className="p-3 text-center border-t border-white/5">
                            <p className="text-xs text-white/30">Powered by GIPHY</p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
