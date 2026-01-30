'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { X, Heart, Sparkles, SlidersHorizontal, LucideKeySquare } from 'lucide-react';
import StoryCard from '@/features/ai-dating/components/discovery/StoryCard';
import { StoryCard as StoryCardType } from '@/types/ai';
import { Skeleton } from '@/components/ui/Skeleton';
import { swipeAction } from '@/app/(ai-dating)/galaxy/actions'; // Assuming this exists or will be moved

interface SwipeDeckProps {
    initialCards: StoryCardType[];
    isLoading?: boolean;
    onSwipeComplete?: () => void;
    onIntentTrigger?: () => void;
    onIndexChange?: (index: number) => void;
}

export default function SwipeDeck({ initialCards, isLoading = false, onSwipeComplete, onIntentTrigger, onIndexChange }: SwipeDeckProps) {
    const [cards, setCards] = useState<StoryCardType[]>(initialCards);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [exitX, setExitX] = useState<number | null>(null);

    // Smart Update: Handle appending data without resetting view
    useEffect(() => {
        // 1. Initial Load or Reset (Filters changed)
        if (cards.length === 0 || (initialCards.length > 0 && cards.length > 0 && initialCards[0].user_id !== cards[0].user_id)) {
            setCards(initialCards);
            setCurrentIndex(0);
        } else {
            // 2. Append / Update (Infinite Scroll)
            // Just update the cards array, preserve current index
            setCards(initialCards);
        }
    }, [initialCards]);

    // Motion Values
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    const handleDragEnd = (event: any, info: PanInfo) => {
        if (info.offset.x > 100) {
            setExitX(200);
            handleLike();
        } else if (info.offset.x < -100) {
            setExitX(-200);
            handlePass();
        }
    };

    const handleLike = async () => {
        if (!cards[currentIndex]) return;
        const targetId = cards[currentIndex]?.user_id;
        if (!targetId) return;

        console.log('Liked user:', targetId);
        setTimeout(() => nextCard(), 200);

        // Server Action (fire and forget)
        swipeAction(targetId, 'like').catch(console.error);
    };

    const handlePass = async () => {
        if (!cards[currentIndex]) return;
        const targetId = cards[currentIndex]?.user_id;
        if (!targetId) return;

        console.log('Passed user:', targetId);
        setTimeout(() => nextCard(), 200);

        // Server Action
        swipeAction(targetId, 'pass').catch(console.error);
    };

    const nextCard = () => {
        setExitX(null);
        x.set(0);
        const newIndex = currentIndex + 1;

        if (newIndex < cards.length) {
            setCurrentIndex(newIndex);
            if (onIndexChange) onIndexChange(newIndex);
        } else {
            // End of stack
            setCurrentIndex(newIndex); // Increment to trigger empty state
            if (onSwipeComplete) onSwipeComplete();
        }
    };

    const showEmptyState = !isLoading && (cards.length === 0 || currentIndex >= cards.length);

    return (
        <div className="relative z-10 w-full h-full px-1.5 pt-1.5 pb-32"> {/* pb-32 space for floating buttons */}

            {/* 1. Loading State */}
            {isLoading && (
                <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
                    <Skeleton className="h-full w-full absolute inset-0 opacity-20" />
                    <div className="relative z-20 w-full">
                        <Skeleton className="h-8 w-3/4 mb-2 rounded-lg" />
                        <Skeleton className="h-4 w-1/2 mb-6 rounded-md" />
                        <Skeleton className="h-24 w-full rounded-xl" />
                    </div>
                </div>
            )}

            {/* 2. Empty State */}
            {showEmptyState && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 pb-40 text-center bg-black">
                    <div className="relative w-32 h-24 mb-6 mx-auto flex items-center justify-center">
                        {/* Avatar 1 - Left */}
                        <div className="absolute left-0 w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-900 shadow-xl z-0 transform -rotate-12 bg-zinc-800 opacity-60 grayscale">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/HeroAvatar/a8.svg"
                                alt="Avatar 1"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Avatar 2 - Right */}
                        <div className="absolute right-0 w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-900 shadow-xl z-10 transform rotate-12 translate-y-2 bg-zinc-800 opacity-60 grayscale">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/HeroAvatar/a5.svg"
                                alt="Avatar 2"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Centered Avatar / Icon - Main Focus */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-6 z-20 w-20 h-20 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center shadow-2xl">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/HeroAvatar/a9.svg"
                                alt="Me"
                                className="w-full h-full object-cover rounded-full opacity-80"
                            />
                            {/* Status Indicator */}
                            <div className="absolute top-0 right-0 w-5 h-5 bg-yellow-500 rounded-full border-2 border-zinc-900 flex items-center justify-center">
                                <span className="text-[10px] text-black font-bold">★</span>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">That's everyone!</h3>
                    <p className="text-white/50 text-sm max-w-[240px] mx-auto">Broaden your filters or check back later for more recommendations.</p>
                </div>
            )}

            {/* 3. Card Stack */}
            <AnimatePresence mode="wait">
                {!showEmptyState && !isLoading && cards[currentIndex] && (
                    <motion.div
                        key={cards[currentIndex].user_id}
                        style={{ x, rotate, opacity }}
                        /* drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={handleDragEnd} */
                        initial={{ scale: 1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, x: exitX || 0 }}
                        exit={{ scale: 1.1, opacity: 0, x: exitX ? exitX : 0 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-x-1.5 inset-y-1.5 cursor-grab active:cursor-grabbing box-border z-30"
                    >
                        <StoryCard
                            card={cards[currentIndex]}
                            onLike={() => { setExitX(200); handleLike(); }}
                            onPass={() => { setExitX(-200); handlePass(); }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 4. STATIC CONTROLS - Floating at bottom */}
            {!isLoading && (
                <div className="absolute bottom-[calc(10rem+env(safe-area-inset-bottom))] left-0 right-0 px-8 z-[100] flex items-center justify-center gap-8 pointer-events-none">

                    {/* Pass Button - Large & Red Accent */}
                    <button
                        onClick={() => { setExitX(-200); handlePass(); }}
                        disabled={showEmptyState}
                        className={`pointer-events-auto w-16 h-16 rounded-full bg-neutral-900/80 backdrop-blur-md border-2 border-red-500/50 flex items-center justify-center transition-all duration-300 shadow-xl shadow-red-500/10 group ${showEmptyState ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-500 hover:border-red-500 active:scale-95 hover:scale-110 hover:shadow-red-500/40'}`}
                    >
                        <X size={28} className="text-red-500 group-hover:text-white transition-colors duration-300" strokeWidth={3} />
                    </button>

                    {/* Intent / Vibe Trigger - Sleek Pill - pushed down slightly */}
                    <button
                        onClick={onIntentTrigger}
                        className="pointer-events-auto h-12 px-6 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center gap-2 hover:bg-white/10 transition-all active:scale-95 shadow-lg group -mb-2"
                    >
                        <Sparkles size={18} className="text-yellow-400 group-hover:animate-pulse" />
                        <span className="text-sm font-medium text-white/90 tracking-wide">Vibe</span>
                    </button>

                    {/* Like Button - Large & Vibrant Gradient */}
                    <button
                        onClick={() => { setExitX(200); handleLike(); }}
                        disabled={showEmptyState}
                        className={`pointer-events-auto w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-red-600 shadow-xl shadow-rose-500/30 border-2 border-white/20 text-white flex items-center justify-center transition-all duration-300 ${showEmptyState ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-110 hover:shadow-rose-500/50 active:scale-95 hover:from-rose-400 hover:to-red-500'}`}
                    >
                        <Heart size={28} fill="currentColor" strokeWidth={2} />
                    </button>
                </div>
            )}
        </div>
    );
}
