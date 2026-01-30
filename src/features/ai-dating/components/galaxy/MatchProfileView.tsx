'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import CardPreview from '@/components/profile/CardPreview';

interface MatchProfileViewProps {
    isOpen: boolean;
    onClose: () => void;
    profile: any;
}

export default function MatchProfileView({ isOpen, onClose, profile }: MatchProfileViewProps) {
    if (!profile) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: '100%' }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-50 bg-black flex flex-col"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-[calc(env(safe-area-inset-top)+1rem)] right-4 z-50 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 transition-all"
                    >
                        <X size={24} />
                    </button>

                    {/* Profile Card */}
                    <div className="flex-1 relative w-full h-full overflow-hidden">
                        <CardPreview
                            profile={profile}
                            theme="modern"
                            color="#a855f7"
                            mood="vibing"
                            border="thin"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
