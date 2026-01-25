'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ReactionPickerProps {
    onReact: (emoji: string) => void;
    isOpen: boolean;
}

const REACTIONS = ['❤️', '😂', '🔥', '👍', '😮', '😢'];

export default function ReactionPicker({ onReact, isOpen }: ReactionPickerProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full left-0 mb-2 bg-zinc-900 border border-white/10 rounded-full px-2 py-2 flex gap-1 shadow-lg z-50"
                >
                    {REACTIONS.map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => onReact(emoji)}
                            className="w-9 h-9 flex items-center justify-center text-2xl hover:bg-white/10 rounded-full transition-all active:scale-90"
                        >
                            {emoji}
                        </button>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
