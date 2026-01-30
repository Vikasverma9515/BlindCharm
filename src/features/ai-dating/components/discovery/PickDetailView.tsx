'use client';

import { motion } from 'framer-motion';
import { X, Heart, Sparkles } from 'lucide-react';
import CardPreview from '@/components/profile/CardPreview';

interface PickDetailViewProps {
    profile: any;
    onClose: () => void;
    onLike: () => void;
    onPass: () => void;
}

export default function PickDetailView({ profile, onClose, onLike, onPass }: PickDetailViewProps) {
    if (!profile) return null;

    // Map the profile data structure if needed to match CardPreview expectations
    // Daily Picks data might need slight adaptation if it differs from standard profile
    const mappedProfile = {
        ...profile,
        // Ensure keys match what CardPreview expects
        full_name: profile.name,
        birth_date: profile.age ? new Date(new Date().getFullYear() - profile.age, 0, 1).toISOString() : new Date(2000, 0, 1).toISOString(), // Approx birthdate from age
        photos: [profile.photo_url, ...(profile.photos || [])].filter(Boolean), // Ensure there's an array
        // Add other mock fields if they are missing from the DailyPick object but needed for a rich preview
        bio: profile.bio || profile.connection_insight, // Use insight as bio if bio is missing
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-black flex flex-col"
        >
            {/* Close Button (Top Right) */}
            <button
                onClick={onClose}
                className="absolute top-[calc(env(safe-area-inset-top)+1rem)] right-4 z-50 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 transition-all"
            >
                <X size={24} />
            </button>



            {/* Main Content Area */}
            <div className="flex-1 relative w-full h-full overflow-hidden">
                <CardPreview
                    profile={mappedProfile}
                    theme={profile.theme || 'modern'}
                    color={profile.color || '#a855f7'}
                    mood={profile.mood || 'vibing'}
                    border={profile.border || 'thin'}
                />
            </div>

            {/* Floating Action Buttons (Bottom) */}
            <div className="absolute bottom-24 left-0 right-0 px-8 flex items-center justify-between pointer-events-none z-50">

                {/* Pass Button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onPass(); }}
                    className="pointer-events-auto w-16 h-16 rounded-full bg-neutral-900/80 backdrop-blur-md border-2 border-red-500/50 flex items-center justify-center transition-all duration-300 shadow-xl shadow-red-500/10 group hover:bg-red-500 hover:border-red-500 hover:scale-110 active:scale-95"
                >
                    <X size={28} className="text-red-500 group-hover:text-white transition-colors duration-300" strokeWidth={3} />
                </button>

                {/* Like Button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onLike(); }}
                    className="pointer-events-auto w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-red-600 shadow-xl shadow-rose-500/30 border-2 border-white/20 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-rose-500/50 active:scale-95 hover:from-rose-400 hover:to-red-500"
                >
                    <Heart size={28} fill="currentColor" strokeWidth={2} />
                </button>
            </div>
        </motion.div>
    );
}
