'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SwipeDeck from '@/components/discovery/SwipeDeck';
import IntentDrawer from '@/components/discovery/IntentDrawer';
import GalaxyOnboardingWizard from '@/components/galaxy/onboarding/GalaxyOnboardingWizard';
import { Sparkles, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StoryCard as StoryCardType } from '@/types/ai';
import { supabase } from '@/lib/supabase';

interface GalaxyFeedProps {
    initialProfile: any;
    initialFeed: StoryCardType[];
    isOnboardingParam: boolean;
    userId: string;
}

export default function GalaxyFeed({ initialProfile, initialFeed, isOnboardingParam, userId }: GalaxyFeedProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [cards, setCards] = useState<StoryCardType[]>(initialFeed);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [mode, setMode] = useState<'classic' | 'intent'>('classic');
    const [isOnboarding, setIsOnboarding] = useState(isOnboardingParam);
    const [currentUserProfile, setCurrentUserProfile] = useState(initialProfile);

    const fetchProfiles = useCallback(async (interestedIn: string[] = ['everyone']) => {
        setIsLoading(true);
        try {
            // 1. Fetch Excluded Interactions
            const { data: interactions } = await supabase
                .from('galaxy_matches')
                .select('user_a, user_b')
                .or(`user_a.eq.${userId},user_b.eq.${userId}`)
                .limit(5000);

            const excludedIds = new Set([userId]);
            if (interactions) {
                interactions.forEach((i: any) => {
                    if (i.user_a === userId) excludedIds.add(i.user_b);
                    else excludedIds.add(i.user_a);
                });
            }

            let query = supabase
                .from('galaxy_profiles')
                .select('*')
                .neq('user_id', userId);

            if (interestedIn && interestedIn.length > 0 && !interestedIn.includes('everyone')) {
                query = query.in('gender', interestedIn);
            }

            // Fetch extra for client-side filtering
            query = query.limit(200);

            const { data: profilesData, error: profilesError } = await query;

            if (profilesError) throw profilesError;

            if (profilesData && profilesData.length > 0) {
                // Filter excluded interactions
                const filteredProfiles = profilesData
                    .filter((p: any) => !excludedIds.has(p.user_id))
                    .slice(0, 50);

                // Map to StoryCard format (mirroring server logic)
                const mappedCards: StoryCardType[] = filteredProfiles.map((profile: any) => {
                    const userData = profile.users || {}; // Assuming public view might not join users table client side if RLS is strict, but let's assume it works like before or we use what's in 'galaxy_profiles'

                    return {
                        user_id: profile.user_id,
                        full_name: profile.full_name || 'BlindCharm User',
                        age: profile.birth_date ? new Date().getFullYear() - new Date(profile.birth_date).getFullYear() : 25,
                        birth_date: profile.birth_date,
                        location: profile.location || 'Unknown',
                        bio: profile.bio || '',
                        about_me: profile.about_me || profile.bio || '',
                        story_line: profile.about_me ? profile.about_me.substring(0, 100) : (profile.bio ? profile.bio.substring(0, 100) : "Ready to connect."),
                        story_sentence: profile.bio ? profile.bio.substring(0, 100) : "Ready to connect.",
                        photos: profile.photos && profile.photos.length > 0 ? profile.photos : [userData.profile_picture],
                        photo_url: userData.profile_picture || '',
                        visual_cue: "Galaxy Member",
                        visual_proof_tags: profile.identity_signals ? profile.identity_signals.slice(0, 3) : (profile.interests ? profile.interests.slice(0, 3) : []),
                        match_score: 80,
                        voice_url: profile.voice_url,
                        pronouns: profile.pronouns,
                        height: profile.height,
                        job_title: profile.job_title,
                        company: profile.company,
                        school: profile.school,
                        gender: profile.gender,
                        identity_signals: profile.identity_signals || [],
                        interest_capsules: profile.interest_capsules || profile.interests || [],
                        connection_style: profile.connection_style,
                        prompts: profile.prompts || [],
                        current_mood: profile.current_mood || 'Chill',
                        energy_level: profile.energy_level,
                        intent_history: profile.intent_history,
                        avatar_url: userData?.profile_picture || profile.photos?.[0],
                        theme: profile.card_theme || 'modern',
                        color: profile.card_color || profile.primary_color || '#a855f7',
                        mood: profile.current_mood || 'vibing',
                        border: profile.card_border || 'thin',
                        is_verified: userData.face_verified || false
                    };
                });
                setCards(mappedCards.sort(() => Math.random() - 0.5));
            }
        } catch (err) {
            console.error('Error fetching profiles:', err);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    // Realtime Profile Updates (Preferences)

    useEffect(() => {
        if (!userId) return;

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
                    fetchProfiles(freshProfile.interested_in);
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
                fetchProfiles(newProfile.interested_in);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, fetchProfiles]);

    const handleMatchesFound = (results: any[], query: string) => {
        setIsLoading(true);
        setIsDrawerOpen(false);
        try {
            console.log('🌌 AI Matches Found:', results.length);

            if (results.length === 0) {
                // Should handle empty state, but AIMatchmaker handles it partially or we show empty deck
                setCards([]);
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

            setCards(mappedCards);
            setMode('intent');
        } catch (error) {
            console.error('Failed to process intent results:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = () => {
        setMode('classic');
        fetchProfiles(currentUserProfile?.interested_in || ['everyone']);
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
                    isLoading={isLoading}
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
