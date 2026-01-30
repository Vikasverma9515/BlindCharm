'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import SwipeDeck from '@/features/ai-dating/components/discovery/SwipeDeck';
import IntentDrawer from '@/features/ai-dating/components/discovery/IntentDrawer';
import PullToRefresh from '@/components/shared/PullToRefresh';
import { SlidersHorizontal, Sparkles, RefreshCw } from 'lucide-react';
import { StoryCard as StoryCardType } from '@/types/ai';
import { supabase } from '@/lib/supabase';
import { FilterState } from '@/features/ai-dating/components/discovery/DiscoveryFilters';
import { useDiscovery } from '@/context/DiscoveryContext';

import { useSession } from 'next-auth/react';

// Helper: Haversine Distance (in km)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export default function GalaxyDiscoveryPage() {
    const router = useRouter();
    const { filters, setFilters } = useDiscovery();

    // Start loading immediately to show skeleton
    const [isLoading, setIsLoading] = useState(true);
    const [cards, setCards] = useState<StoryCardType[]>([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [mode, setMode] = useState<'classic' | 'intent'>('classic');
    const { data: session } = useSession();

    // Fetch real profiles
    const fetchProfiles = async (activeFilters: FilterState = filters, options: { showLoader?: boolean } = { showLoader: true }) => {
        if (options.showLoader) setIsLoading(true);

        try {
            const currentUserId = (session?.user as any)?.id;
            let currentUserLocation = { lat: 0, lon: 0 };

            if (currentUserId) {
                // Get current user location for distance calc
                const { data: userData } = await supabase
                    .from('galaxy_profiles')
                    .select('latitude, longitude')
                    .eq('user_id', currentUserId)
                    .single();
                if (userData) {
                    currentUserLocation = { lat: userData.latitude || 0, lon: userData.longitude || 0 };
                }
            }

            // 1. Fetch Galaxy Profiles DIRECTLY
            let query = supabase
                .from('galaxy_profiles')
                .select('*')
                .eq('is_paused', false) // Hide paused users
                .limit(100); // Fetch more to allow client-side filtering

            if (currentUserId) {
                query = query.neq('user_id', currentUserId);
            }

            // Apply Gender Filter
            if (!activeFilters.interestedIn.includes('everyone')) {
                query = query.in('gender', activeFilters.interestedIn);
            }

            // Apply Verified Filter
            if (activeFilters.verifiedOnly) {
                query = query.eq('is_verified', true);
            }

            // Apply Age Filter (Database Side)
            // Calculate birth dates for age range
            // minAge means birth_date <= Today - minAge
            // maxAge means birth_date >= Today - (maxAge + 1) roughly
            const today = new Date();
            const minBirthDate = new Date(today.getFullYear() - activeFilters.minAge, today.getMonth(), today.getDate()).toISOString().split('T')[0];
            const maxBirthDate = new Date(today.getFullYear() - activeFilters.maxAge - 1, today.getMonth(), today.getDate()).toISOString().split('T')[0];

            // Correct Logic:
            // older people have smaller birth years. younger people have larger birth years.
            // minAge (youngest) -> max Birth Date (latest date)
            // maxAge (oldest) -> min Birth Date (earliest date)
            const latestBorn = new Date(today.getFullYear() - activeFilters.minAge, today.getMonth(), today.getDate()).toISOString();
            const earliestBorn = new Date(today.getFullYear() - activeFilters.maxAge - 1, today.getMonth(), today.getDate()).toISOString();

            query = query.lte('birth_date', latestBorn)
                .gte('birth_date', earliestBorn);

            let { data: profilesData, error: profilesError } = await query;

            if (profilesError) throw profilesError;

            let isFallback = false;

            // FALLBACK LOGIC: If no matches, fetch broader audience
            if (!profilesData || profilesData.length === 0) {
                console.log("No matches found with filters. Fetching fallback recommendations.");
                isFallback = true;

                // Fetch random profiles excluding self
                let fallbackQuery = supabase
                    .from('galaxy_profiles')
                    .select('*')
                    .eq('is_paused', false) // Hide paused users
                    .limit(50);

                if (currentUserId) {
                    fallbackQuery = fallbackQuery.neq('user_id', currentUserId);
                }

                const { data: fallbackData, error: fallbackError } = await fallbackQuery;

                if (!fallbackError && fallbackData) {
                    profilesData = fallbackData;
                }
            }

            if (profilesData && profilesData.length > 0) {
                // 2. Client Side Filtering (Distance) & Mapping
                // Note: If Fallback, skip distance check or make it lenient?
                // Let's keep strict distance for primary, but lenient for fallback if we want.
                // For now, apply distance filter only if NOT fallback, or just apply it loosely?
                // Visuals: If fallback, let's show them regardless of distance to ensure "Show More" works.

                const mappedCards: StoryCardType[] = profilesData
                    .filter((profile: any) => {
                        if (isFallback) return true; // Show all in fallback mode

                        // Distance Filter (Strict in normal mode)
                        if (currentUserLocation.lat && currentUserLocation.lon && profile.latitude && profile.longitude) {
                            const dist = calculateDistance(currentUserLocation.lat, currentUserLocation.lon, profile.latitude, profile.longitude);
                            if (dist > activeFilters.maxDistance) return false;
                        }
                        return true;
                    })
                    .map((profile: any) => {
                        return {
                            user_id: profile.user_id,
                            full_name: profile.full_name && profile.full_name !== 'BlindCharm User' ? profile.full_name : (profile.users?.full_name || 'BlindCharm User'),
                            age: profile.birth_date ? new Date().getFullYear() - new Date(profile.birth_date).getFullYear() : 25,
                            birth_date: profile.birth_date,
                            location: profile.location || 'Unknown',
                            bio: profile.bio || '',
                            // About Me / Story Line logic
                            about_me: profile.about_me || profile.bio || '',
                            story_line: profile.about_me ? profile.about_me.substring(0, 100) : (profile.bio ? profile.bio.substring(0, 100) : "Ready to connect."),
                            story_sentence: profile.bio ? profile.bio.substring(0, 100) : "Ready to connect.",

                            // Visuals
                            photos: profile.photos && profile.photos.length > 0 ? profile.photos : [],
                            photo_url: '',
                            visual_cue: isFallback ? "Suggested for you" : "Galaxy Member", // Fallback Tag
                            visual_proof_tags: profile.identity_signals ? profile.identity_signals.slice(0, 3) : (profile.interests ? profile.interests.slice(0, 3) : []),
                            match_score: isFallback ? 50 : 80,

                            // Rich Profile Data (Passed to CardPreview)
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
                            // avatar_url removed

                            // Theme & Styling
                            theme: profile.card_theme || 'modern',
                            color: profile.card_color || profile.primary_color || '#a855f7', // Handle varied column names if needed
                            mood: profile.current_mood || 'vibing',
                            border: profile.card_border || 'thin'
                        };
                    });

                // Shuffle the deck (simple sort)
                setCards(mappedCards.sort(() => Math.random() - 0.5));

                // Show toast if fallback
                if (isFallback && mappedCards.length > 0) {
                    // We could import toast but might be heavy. Just let the UI speak.
                }
            } else {
                setCards([]); // Truly empty
            }
        } catch (err) {
            console.error('Error fetching profiles:', err);
        } finally {
            if (options.showLoader) setIsLoading(false);
        }
    };

    // Initial Load: Check Profile & Load Preferences
    useEffect(() => {
        const init = async () => {
            if (!session?.user?.id) return;
            const uid = (session.user as any).id;

            // Check existence in galaxy_profiles and get preferences
            const { data: profile } = await supabase
                .from('galaxy_profiles')
                .select('id, interested_in, discovery_min_age, discovery_max_age, discovery_max_distance, discovery_verified_only, discovery_min_height, discovery_max_height')
                .eq('user_id', uid)
                .maybeSingle();

            if (!profile) {
                console.log("No galaxy profile found, redirecting to onboarding...");
                router.push('/galaxy/onboarding');
                return;
            }

            // Load saved preferences if they exist
            if (profile) {
                // Construct loaded filters, falling back to defaults for missing cols
                const loadedFilters: FilterState = {
                    interestedIn: profile.interested_in || ['everyone'],
                    minAge: profile.discovery_min_age || 18,
                    maxAge: profile.discovery_max_age || 50,
                    maxDistance: profile.discovery_max_distance || 100,
                    verifiedOnly: profile.discovery_verified_only || false,
                    minHeight: profile.discovery_min_height || 150,
                    maxHeight: profile.discovery_max_height || 220
                };
                setFilters(loadedFilters);
                fetchProfiles(loadedFilters, { showLoader: true });
            } else {
                fetchProfiles(undefined, { showLoader: true });
            }
        };

        if (session?.user) {
            init();
        }
    }, [session]);

    const handleIntentSubmit = async (input: string) => {
        setIsLoading(true);
        setIsDrawerOpen(false); // Close drawer to show loading/results

        try {
            // Simulate RAG / AI Processing
            console.log('🌌 Processing Intent:', input);

            // In a real implementation, we would call the server action here
            // const intent = await extractIntentAction(input);
            // const matches = await fetchMatches(intent);

            // For now, shuffle/filter mock profiles to simulate "finding matches"
            await new Promise(resolve => setTimeout(resolve, 1500));

            const shuffled = [...cards].sort(() => 0.5 - Math.random());
            // Add a "story" based on input
            const customizedCards = shuffled.map(card => ({
                ...card,
                story_sentence: `Matches your vibe: "${input}"`,
                visual_cue: "Intent Match"
            }));

            setCards(customizedCards);
            setMode('intent');

        } catch (error) {
            console.error('Failed to process intent:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const [isRefreshing, setIsRefreshing] = useState(false);

    // ... (keep existing fetchProfiles)

    const handleRefresh = async () => {
        setMode('classic');
        setIsRefreshing(true);
        // Do NOT show full screen loader for pull-to-refresh, but show skeleton via isRefreshing
        try {
            await fetchProfiles(filters, { showLoader: false });
        } finally {
            setIsRefreshing(false);
        }
    };

    // ... (keep existing handleFilterApply)

    return (
        <div className="h-full w-full bg-black text-white flex flex-col items-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />

            {/* Mode Controls & Filter Overlay */}
            <div className="absolute top-4 left-0 w-full flex justify-between px-4 z-20 pointer-events-none">
                <div className="pointer-events-auto">
                    {mode === 'intent' && (
                        <button onClick={handleRefresh} className="text-white/50 hover:text-white transition-colors flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                            <RefreshCw size={14} />
                            <span className="text-xs font-medium">Reset</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Main Swipe Deck - Wrapped in PullToRefresh */}
            <div className="relative z-10 w-full h-full flex flex-col">
                <PullToRefresh onRefresh={async () => handleRefresh()}>
                    <SwipeDeck
                        initialCards={cards}
                        isLoading={isLoading || isRefreshing}
                        onSwipeComplete={() => {
                            setIsDrawerOpen(true);
                        }}
                        onIntentTrigger={() => setIsDrawerOpen(true)}
                    />
                </PullToRefresh>
            </div>

            {/* Intent Drawer Overlay */}
            <IntentDrawer
                isOpen={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                onIntentSubmit={handleIntentSubmit}
            />
        </div>
    );
}
