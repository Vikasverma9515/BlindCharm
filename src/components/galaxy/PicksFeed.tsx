'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiStarSmileFill } from 'react-icons/ri';
import DailyPickCard from '@/components/discovery/DailyPickCard';
import Image from 'next/image';
import PickDetailView from '@/components/discovery/PickDetailView';
import { Sparkles, Clock, RefreshCw } from 'lucide-react';
import { resetUserHistoryAction, swipeAction } from '@/app/galaxy/actions';
import { useRouter } from 'next/navigation';

interface PicksFeedProps {
    initialPicks: any[];
}

export default function PicksFeed({ initialPicks }: PicksFeedProps) {
    const [picks, setPicks] = useState<any[]>(initialPicks);
    const [selectedPick, setSelectedPick] = useState<any | null>(null);
    const [timeLeft, setTimeLeft] = useState('');
    const router = useRouter();

    // Countdown Timer logic
    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setHours(24, 0, 0, 0); // Next midnight
            const diff = tomorrow.getTime() - now.getTime();

            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            return `${hours}h ${minutes}m`;
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    const handleRemove = (id: string) => {
        setPicks(prev => prev.filter(p => p.id !== id));
        if (selectedPick?.id === id) {
            setSelectedPick(null);
        }
    };

    const handleLike = (pick: any) => {
        console.log('Liked:', pick.name);
        handleRemove(pick.id);
        swipeAction(pick.id, 'like').catch(console.error);
    };

    const handlePass = (pick: any) => {
        console.log('Passed:', pick.name);
        handleRemove(pick.id);
        swipeAction(pick.id, 'pass').catch(console.error);
    };

    const handleNextDay = async () => {
        await resetUserHistoryAction();
        router.refresh();
    };

    return (
        <div className="h-full w-full overflow-y-auto bg-black text-white p-4 pb-5 pt-5 flex flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Header Section */}
            <div className="mb-4 px-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-yellow-400/10 p-2 rounded-xl">
                            <RiStarSmileFill className="text-yellow-400" size={24} />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">Daily Picks</h1>
                    </div>

                    {/* Timer Badge */}
                    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs font-medium text-white/70">
                        <Clock size={13} />
                        <span>{timeLeft}</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            {picks.length === 0 ? (
                /* Compact Empty State */
                <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in duration-700 -mt-20 px-6">
                    <div className="relative mb-8 w-64 h-32 flex items-center justify-center">
                        {/* Fan Layout for Daily Picks */}
                        <div className="absolute w-16 h-16 rounded-full border-2 border-zinc-900 bg-zinc-800 z-0 -translate-x-12 translate-y-2 -rotate-12 opacity-60">
                            <Image src="/HeroAvatar/a4.svg" alt="Avatar" width={64} height={64} className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute w-16 h-16 rounded-full border-2 border-zinc-900 bg-zinc-800 z-10 translate-x-12 translate-y-2 rotate-12 opacity-60">
                            <Image src="/HeroAvatar/a7.svg" alt="Avatar" width={64} height={64} className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute w-20 h-20 rounded-full border-2 border-zinc-900 bg-zinc-800 z-20 -translate-y-4 shadow-2xl">
                            <Image src="/HeroAvatar/a1.svg" alt="Avatar" width={80} height={80} className="w-full h-full object-cover" />
                            {/* Star Badge */}
                            <div className="absolute -top-1 -right-1 bg-yellow-400 text-black p-1 rounded-full border-2 border-zinc-900 shadow-sm">
                                <RiStarSmileFill size={12} />
                            </div>
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-white mb-2">You're all caught up</h1>
                    <p className="text-white/50 text-sm max-w-[260px] leading-relaxed mb-8">
                        Check back tomorrow for more curated matches.
                    </p>

                    <div className="flex flex-col items-center gap-4 w-full max-w-[200px]">
                        <div className="w-full flex items-center justify-between bg-zinc-900 rounded-xl p-3 border border-white/5 shadow-sm">
                            <span className="text-xs font-medium text-white/60">Refreshes in</span>
                            <div className="flex items-center gap-1.5 text-white/90 text-sm font-semibold">
                                <Clock size={14} />
                                <span>{timeLeft}</span>
                            </div>
                        </div>

                        {/* Testing Tool using Action */}
                        <button
                            onClick={handleNextDay}
                            className="text-xs text-white/30 hover:text-white/60 transition-colors flex items-center gap-1.5 uppercase tracking-wider font-medium"
                        >
                            <RefreshCw size={12} />
                            <span>Simulate Next Day</span>
                        </button>
                    </div>
                </div>
            ) : (
                /* Grid Layout */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode='popLayout'>
                        {picks.map((pick, index) => (
                            <motion.div
                                key={pick.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <DailyPickCard
                                    profile={pick}
                                    onClick={() => setSelectedPick(pick)}
                                    onLike={() => handleLike(pick)}
                                    onPass={() => handlePass(pick)}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Bottom Note (Only valid when not empty, or handled by layout) */}
            {picks.length > 0 && (
                <div className="mt-12 text-center pb-4">
                    <div className="inline-flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest border border-white/10 px-4 py-2 rounded-full">
                        <Sparkles size={12} />
                        <span>AI-Powered Curation</span>
                    </div>
                </div>
            )}

            {/* Detail View Modal */}
            <AnimatePresence>
                {selectedPick && (
                    <PickDetailView
                        profile={selectedPick}
                        onClose={() => setSelectedPick(null)}
                        onLike={() => handleLike(selectedPick)}
                        onPass={() => handlePass(selectedPick)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
