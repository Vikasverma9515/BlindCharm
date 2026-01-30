import React from 'react';
import { motion } from 'framer-motion';
import { X, Heart } from 'lucide-react';
import { StoryCard as StoryCardType } from '@/types/ai';
import CardPreview from '@/components/profile/CardPreview';

interface StoryCardProps {
    card: StoryCardType;
    onLike: () => void;
    onPass: () => void;
}

const StoryCard: React.FC<StoryCardProps> = ({ card, onLike, onPass }) => {
    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="relative w-full h-full bg-black overflow-hidden"
        >
            {/* Reusing the CardPreview component for consistency with Profile Page */}
            <div className="absolute inset-0 z-0">
                <CardPreview
                    profile={card}
                    theme={card.theme || 'modern'}
                    color={card.color || '#a855f7'}
                    mood={card.mood || 'vibing'}
                    border={card.border || 'thin'}
                />
            </div>
        </motion.div>
    );
};

export default StoryCard;
