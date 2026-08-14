'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SwipeDeck from '@/features/ai-dating/components/discovery/SwipeDeck';
import IntentDrawer from '@/features/ai-dating/components/discovery/IntentDrawer';
import GalaxyOnboardingWizard from '@/features/ai-dating/components/galaxy/onboarding/GalaxyOnboardingWizard';
import { Sparkles, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StoryCard as StoryCardType } from '@/types/ai';
import { supabase } from '@/lib/supabase';
import { useExploreFeed } from '@/hooks/queries/useExploreFeed';
import { DEMO_MODE } from '@/lib/demoData';

interface GalaxyFeedProps {
    initialProfile: any;
    initialFeed: StoryCardType[];
    isOnboardingParam: boolean;
    userId: string;
}

export default function GalaxyFeed({ initialProfile, initialFeed, isOnboardingParam, userId }: GalaxyFeedProps) {
    const router = useRouter();

    // 1. State Initialization
    const [isLoading, setIsLoading] = useState(false); // Manual loading state for intent mode
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [mode, setMode] = useState<'classic' | 'intent'>('classic');
    const [isOnboarding, setIsOnboarding] = useState(isOnboardingParam);
    const [currentUserProfile, setCurrentUserProfile] = useState(initialProfile);

    // 2. React Query Hook (Dependent on currentUserProfile)
    const {
        data: feedData,
        fetchNextPage,
        hasNextPage,
        isFetching,
        refetch: refetchFeed
    } = useExploreFeed(userId, currentUserProfile?.interested_in || ['everyone']);

    // 3. Intent Mode State
    const [cardsState, setCardsState] = useState<StoryCardType[]>([]);

    // 4. Derived State: Flatten pages into a single stack of cards
    const derivedCards = mode === 'classic'
        ? (feedData?.pages.flatMap((p: any) => p.cards).filter((c: any) => !!c) || [])
        : (cardsState || []);

    const cards = derivedCards.length > 0 ? derivedCards : initialFeed;

    useEffect(() => {
        // If we are in 'intent' mode, we use cardsState.
        // If 'classic', cards are derived from feedData.
        // No need to sync explicit state for classic unless we want to shuffle locally which SwipeDeck handles.
    }, [feedData]);

    const handleIndexChange = (index: number) => {
        // Mark profile as viewed for analytics
        if (cards[index]) {
            // Dynamic import to avoid bundling issues
            import('@/app/(ai-dating)/galaxy/actions').then(({ markProfileViewedAction }) => {
                markProfileViewedAction(cards[index].user_id);
            });
        }

        // Prefetch when within 5 cards of end
        if (mode === 'classic' && hasNextPage && !isFetching && cards.length - index <= 5) {
            console.log('⚡ Prefetching next batch...');
            fetchNextPage();
        }
    };

    // Realtime Profile Updates (Preferences)

    useEffect(() => {
        if (DEMO_MODE || !userId) return;

        // Backup: Fetch latest profile on mount to ensure we have fresh settings
        // This handles cases where Router Cache might be stale after navigation
        const syncProfile = async () => {
            const { data: freshProfile } = await supabase
                .from('galaxy_profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (freshProfile) {
                // If the fresh profile differs from our initial/current, update and fetch
                if (
                    JSON.stringify(freshProfile.interested_in) !== JSON.stringify(currentUserProfile.interested_in) ||
                    freshProfile.gender !== currentUserProfile.gender
                ) {
                    console.log('🔄 Stale settings detected on mount, syncing feed...');
                    setCurrentUserProfile(freshProfile);
                    // fetchProfiles(freshProfile.interested_in); // Auto-handled by key change
                }
            }
        };

        syncProfile();

        const channel = supabase
            .channel(`galaxy_profile_updates_${userId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'galaxy_profiles',
                filter: `user_id=eq.${userId}`
            }, (payload) => {
                const newProfile = payload.new as any;
                console.log('🔄 Profile updated, refreshing feed...', newProfile.interested_in);
                setCurrentUserProfile(newProfile);
                // When profile changes, we refetch the React Query
                // Note: Changing currentUserProfile updates the key for useExploreFeed, so it might auto-fetch.
                // But if we want to force it:
                // queryClient.invalidateQueries(...) or just let the key change handle it.
                // Since we pass `interested_in` to the hook, changing state triggers re-run!
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    const handleMatchesFound = (results: any[], query: string) => {
        setIsLoading(true);
        setIsDrawerOpen(false);
        try {
            console.log('🌌 AI Matches Found:', results.length);

            if (results.length === 0) {
                // Should handle empty state, but AIMatchmaker handles it partially or we show empty deck
                setCardsState([]);
                setMode('intent');
                return;
            }

            const mappedCards: StoryCardType[] = results.map((profile: any) => {
                // Map RPC profile fields to StoryCard
                // The RPC returns flattened fields from galaxy_profiles
                return {
                    user_id: profile.user_id,
                    full_name: profile.full_name || 'BlindCharm User',
                    age: profile.birth_date ? new Date().getFullYear() - new Date(profile.birth_date).getFullYear() : 25,
                    birth_date: profile.birth_date,
                    location: profile.location || 'Unknown',
                    bio: profile.bio || '',
                    about_me: profile.about_me || profile.bio || '',
                    story_line: profile.about_me ? profile.about_me.substring(0, 100) : (profile.bio ? profile.bio.substring(0, 100) : "Ready to connect."),
                    story_sentence: `Matches your vibe: "${query}"`, // Custom intent message
                    photos: profile.photos && profile.photos.length > 0 ? profile.photos : [],
                    photo_url: profile.photos?.[0] || '',
                    visual_cue: "Intent Match",
                    visual_proof_tags: profile.identity_signals ? profile.identity_signals.slice(0, 3) : (profile.interest_capsules ? profile.interest_capsules.slice(0, 3) : []),
                    match_score: Math.round(profile.similarity * 100),
                    voice_url: profile.voice_url,
                    pronouns: profile.pronouns,
                    height: profile.height,
                    job_title: profile.job_title,
                    company: profile.company,
                    school: profile.school,
                    gender: profile.gender,
                    identity_signals: profile.identity_signals || [],
                    interest_capsules: profile.interest_capsules || [],
                    connection_style: profile.connection_style || "Open",
                    prompts: profile.prompts || [],
                    current_mood: profile.current_mood || 'Vibing',
                    energy_level: profile.energy_level,
                    intent_history: [],
                    avatar_url: profile.photos?.[0],
                    theme: profile.card_theme || 'modern',
                    color: '#a855f7', // Default
                    mood: profile.current_mood || 'vibing',
                    border: profile.card_border || 'thin',
                    is_verified: false
                };
            });

            setCardsState(mappedCards);
            setMode('intent');
        } catch (error) {
            console.error('Failed to process intent results:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = () => {
        setMode('classic');
        // fetchProfiles(...) is not needed as switching mode to classic 
        // renders the Query data, which is cached or refetches if stale.
        refetchFeed();
    };

    if (isOnboarding) {
        return <GalaxyOnboardingWizard onComplete={() => {
            setIsOnboarding(false);
            router.refresh();
        }} />;
    }

    return (
        <div className="h-dvh w-full bg-black text-white flex flex-col items-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />

            {/* Header / Mode Indicator - Premium */}
            <div className="absolute top-4 left-0 w-full flex justify-between px-4 z-20 pointer-events-none">
                {/* Left: Reset / Exit (Only in Intent Mode) */}
                <div className="pointer-events-auto">
                    {mode === 'intent' && (
                        <button
                            onClick={handleRefresh}
                            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-full h-10 w-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-95 shadow-lg group"
                            aria-label="Reset Feed"
                        >
                            <RefreshCw size={18} className="group-hover:-rotate-180 transition-transform duration-500" />
                        </button>
                    )}
                </div>

                {/* Center: Curated Badge (Only in Intent Mode) */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 pointer-events-none">
                    <AnimatePresence>
                        {mode === 'intent' && (
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                className="mt-4 px-4 py-2 bg-purple-500/20 backdrop-blur-xl border border-purple-500/30 rounded-full flex items-center gap-2 shadow-xl shadow-purple-900/20"
                            >
                                <Sparkles size={14} className="text-purple-300 animate-pulse" />
                                <span className="text-xs font-semibold text-purple-100 uppercase tracking-wider">Curated Vibe</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="w-10" /> {/* Spacer for balance */}
            </div>

            {/* Main Swipe Deck */}
            <div className="relative z-10 w-full h-full flex flex-col">
                <SwipeDeck
                    initialCards={cards}
                    isLoading={mode === 'classic' ? (!feedData && isFetching) : isLoading}
                    onSwipeComplete={() => {
                        // If intent mode finishes, automatically switch back to classic feed
                        if (mode === 'intent') {
                            console.log('🌌 AI Queue finished, reverting to classic feed...');
                            handleRefresh();
                            return;
                        }
                        setIsDrawerOpen(true);
                    }}
                    onIntentTrigger={() => setIsDrawerOpen(true)}
                    onIndexChange={handleIndexChange}
                />
            </div>

            {/* Intent Drawer Overlay */}
            <IntentDrawer
                isOpen={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                onMatchesFound={handleMatchesFound}
            />
        </div>
    );
}
