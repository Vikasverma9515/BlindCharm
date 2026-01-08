'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Palette, Sparkles, Layout, Box } from 'lucide-react';
import CardPreview from './CardPreview';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface CardCustomizerProps {
    isOpen: boolean;
    onClose: () => void;
    profile: any;
    onUpdate: (updates: any) => void;
}

const THEMES = [
    { id: 'classic', name: 'Classic' },
    { id: 'modern', name: 'Modern' },
    { id: 'minimal', name: 'Minimal' },
    { id: 'glass', name: 'Glass' },
    { id: 'neon', name: 'Neon' },
    { id: 'luxury', name: 'Luxury' },
    { id: 'polaroid', name: 'Polaroid' },
];

const BORDERS = [
    { id: 'thin', name: 'Thin' },
    { id: 'none', name: 'None' },
    { id: 'glow', name: 'Glow' },
    { id: 'double', name: 'Double' },
    { id: 'gradient', name: 'Gradient' },
];

const COLORS = [
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#D4AF37', // Gold (Luxury)
    '#00FFFF', // Cyan (Neon)
];

const MOODS = [
    '⚡ Energetic', '🌙 Chill', '✨ Creative',
    '🤔 Curious', '🦋 Social', '🎯 Focused',
    '🔥 Spicy', '💎 Classy'
];

export default function CardCustomizer({ isOpen, onClose, profile, onUpdate }: CardCustomizerProps) {
    const [theme, setTheme] = useState(profile.card_theme || 'classic');
    const [color, setColor] = useState(profile.primary_color || '#8B5CF6');
    const [mood, setMood] = useState(profile.mood_status || '');
    const [border, setBorder] = useState(profile.card_border || 'thin');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const updates = {
                card_theme: theme,
                primary_color: color,
                mood_status: mood,
                card_border: border
            };

            const { error } = await supabase
                .from('galaxy_profiles')
                .update(updates)
                .eq('user_id', profile.user_id);

            if (error) throw error;

            onUpdate(updates);
            toast.success('Card style updated!');
            onClose();
        } catch (error) {
            console.error('Failed to update card style:', error);
            toast.error('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
                            <X size={24} />
                        </button>
                        <h2 className="text-lg font-bold">Customize Card</h2>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="text-purple-400 font-semibold disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Preview */}
                        <div className="flex justify-center">
                            <div className="w-full max-w-xs">
                                <CardPreview
                                    profile={profile}
                                    theme={theme}
                                    color={color}
                                    mood={mood}
                                    border={border}
                                />
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="space-y-6 max-w-md mx-auto pb-10">
                            {/* Theme Selection */}
                            <div>
                                <div className="flex items-center gap-2 mb-3 text-white/80">
                                    <Layout size={18} />
                                    <span className="font-medium">Card Theme</span>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {THEMES.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setTheme(t.id)}
                                            className={`p-2 rounded-xl border transition-all ${theme === t.id
                                                    ? 'border-purple-500 bg-purple-500/20'
                                                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                                                }`}
                                        >
                                            <div className="text-xs font-medium text-center">{t.name}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Border Selection */}
                            <div>
                                <div className="flex items-center gap-2 mb-3 text-white/80">
                                    <Box size={18} />
                                    <span className="font-medium">Border Style</span>
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                    {BORDERS.map((b) => (
                                        <button
                                            key={b.id}
                                            onClick={() => setBorder(b.id)}
                                            className={`p-2 rounded-xl border transition-all ${border === b.id
                                                    ? 'border-purple-500 bg-purple-500/20'
                                                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                                                }`}
                                        >
                                            <div className="text-[10px] font-medium text-center">{b.name}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color Selection */}
                            <div>
                                <div className="flex items-center gap-2 mb-3 text-white/80">
                                    <Palette size={18} />
                                    <span className="font-medium">Accent Color</span>
                                </div>
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                    {COLORS.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setColor(c)}
                                            className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center transition-transform ${color === c ? 'scale-110 ring-2 ring-white' : 'hover:scale-105'
                                                }`}
                                            style={{ backgroundColor: c }}
                                        >
                                            {color === c && <Check size={16} className="text-white" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Mood Selection */}
                            <div>
                                <div className="flex items-center gap-2 mb-3 text-white/80">
                                    <Sparkles size={18} />
                                    <span className="font-medium">Current Mood</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {MOODS.map((m) => (
                                        <button
                                            key={m}
                                            onClick={() => setMood(m)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${mood === m
                                                    ? 'bg-white text-black border-white'
                                                    : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                                                }`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
