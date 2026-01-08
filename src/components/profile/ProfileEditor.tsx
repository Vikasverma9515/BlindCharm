'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Heart, Sparkles, MessageSquareQuote, Zap, Moon, Sun, Coffee, Music, Smile } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileData {
    about_me: string;
    identity_signals: string[];
    connection_style: string;
    interest_capsules: string[];
    current_mood: string;
    pronouns: string;
    location: string;
    gender: string;
    height?: string;
    full_name?: string;
    birth_date?: string; // Added field
    energy_level?: string;
    // Legacy fields (optional/hidden)
    bio?: string;
    job_title?: string;
    company?: string;
    school?: string;
    interests?: string[];
    prompts?: any[];
    latitude?: number | null;
    longitude?: number | null;
}

interface ProfileEditorProps {
    data: ProfileData;
    onChange: (data: ProfileData) => void;
}

const IDENTITY_SIGNALS = [
    "Night owl 🌙", "Early riser ☀️", "Deep thinker 🧠", "Light-hearted 🎈",
    "Calm 🌱", "Energetic ⚡", "Introvert 🎧", "Ambivert 🤝", "Extrovert 🗣️",
    "Planner 📝", "Go-with-the-flow 🌊"
];

const CONNECTION_STYLES = [
    "...the conversation flows naturally.",
    "...there’s mutual curiosity.",
    "...things feel calm and unforced.",
    "...we can laugh at ourselves.",
    "...we share silence comfortably.",
    "...we can be weird together."
];

const INTEREST_CAPSULES = [
    "Fitness 🏋️", "Nature 🌿", "Gaming 🎮", "Books 📚", "Music 🎧",
    "Coding 💻", "Art 🎨", "Foodie 🍕", "Travel ✈️", "Movies 🎬",
    "Astrology ✨", "Coffee ☕", "Pets 🐾", "Fashion 👗", "Tech 🤖"
];

const CURRENT_MOODS = [
    "Calm 🌱", "Curious 🧐", "Social 👯", "Low-key 🛋️",
    "Energetic ⚡", "Creative 🎨", "Focused 🎯", "Chilling ❄️"
];

const AVAILABLE_PROMPTS = [
    "My simple pleasure is...",
    "I'm overly competitive about...",
    "The way to win me over is...",
    "Unpopular opinion...",
    "My golden rule...",
    "I bet you can't...",
    "Best travel story...",
    "My zombie apocalypse plan...",
    "I feel most myself when...",
    "A non-negotiable for me is...",
    "The risk I want to take is..."
];

export default function ProfileEditor({ data, onChange }: ProfileEditorProps) {
    const handleChange = (field: keyof ProfileData, value: any) => {
        onChange({ ...data, [field]: value });
    };

    const toggleSelection = (field: 'identity_signals' | 'interest_capsules', item: string, max: number) => {
        const current = data[field] || [];
        if (current.includes(item)) {
            handleChange(field, current.filter(i => i !== item));
        } else {
            if (current.length < max) {
                handleChange(field, [...current, item]);
            }
        }
    };

    return (
        <div className="space-y-8">
            {/* 1. Core Identity & Basic Info */}
            <div className="space-y-4">
                <label className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-2 uppercase tracking-wider">
                    <User size={16} /> Core Identity
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        value={data.full_name || ''}
                        onChange={(e) => handleChange('full_name', e.target.value)}
                        placeholder="Full Name"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/30 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                    <input
                        type="date"
                        value={data.birth_date || ''}
                        onChange={(e) => handleChange('birth_date', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/30 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                    <input
                        type="text"
                        value={data.pronouns}
                        onChange={(e) => handleChange('pronouns', e.target.value)}
                        placeholder="Pronouns (e.g., he/him)"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/30 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                    <div className="relative">
                        <input
                            type="text"
                            value={data.location}
                            onChange={(e) => handleChange('location', e.target.value)}
                            placeholder="City / Location"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pr-10 text-white placeholder:text-white/30 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                if (!navigator.geolocation) return;
                                const toastId = toast.loading('Locating...');
                                navigator.geolocation.getCurrentPosition(async (pos) => {
                                    try {
                                        const { latitude, longitude } = pos.coords;
                                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                                        const json = await res.json();
                                        const addr = json.address;
                                        const city = addr.city || addr.town || addr.village || addr.suburb || addr.county;
                                        const state = addr.state;
                                        const loc = city ? (state ? `${city}, ${state}` : city) : "Unknown Location";

                                        // Update Local State AND Coordinates
                                        onChange({
                                            ...data,
                                            location: loc,
                                            latitude: latitude,
                                            longitude: longitude
                                        });

                                        toast.dismiss(toastId);
                                        toast.success('Location & Coordinates updated');
                                    } catch (e) {
                                        toast.dismiss(toastId);
                                        toast.error('Failed to get city name');
                                    }
                                }, () => {
                                    toast.dismiss(toastId);
                                    toast.error('Permission denied');
                                });
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                            title="Use my current location"
                        >
                            <MapPin size={18} />
                        </button>
                    </div>
                    <input
                        type="text"
                        value={data.height || ''}
                        onChange={(e) => handleChange('height', e.target.value)}
                        placeholder="Height (e.g., 5'10)"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/30 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                    <select
                        value={data.gender}
                        onChange={(e) => handleChange('gender', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none appearance-none"
                    >
                        <option value="" className="bg-black">Gender...</option>
                        <option value="male" className="bg-black">Male</option>
                        <option value="female" className="bg-black">Female</option>
                        <option value="non-binary" className="bg-black">Non-binary</option>
                        <option value="other" className="bg-black">Other</option>
                    </select>

                    {/* Professional / Education */}
                    <input
                        type="text"
                        value={data.job_title || ''}
                        onChange={(e) => handleChange('job_title', e.target.value)}
                        placeholder="Job Title"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/30 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                    <input
                        type="text"
                        value={data.company || ''}
                        onChange={(e) => handleChange('company', e.target.value)}
                        placeholder="Company"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/30 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                    <input
                        type="text"
                        value={data.school || ''}
                        onChange={(e) => handleChange('school', e.target.value)}
                        placeholder="School / University"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/30 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                </div>
            </div>

            {/* 2. Bio & About Me */}
            <div className="space-y-6">
                {/* Short About Me */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center gap-2 uppercase tracking-wider">
                        <MessageSquareQuote size={16} /> About Me
                    </label>
                    <p className="text-xs text-white/50">One human line. No flexing, just your vibe.</p>
                    <textarea
                        value={data.about_me}
                        onChange={(e) => handleChange('about_me', e.target.value)}
                        placeholder="I’m someone who enjoys quiet moments and meaningful conversations..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/30 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none h-46 transition-all text-lg font-light leading-relaxed"
                        maxLength={150}
                    />
                    <div className="text-right text-xs text-white/30">
                        {(data.about_me || '').length}/150
                    </div>
                </div>

                {/* Extended Bio */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center gap-2 uppercase tracking-wider">
                        <MessageSquareQuote size={16} /> Extended Bio
                    </label>
                    <p className="text-xs text-white/50">Tell your full story. Details for the AI to match you better.</p>
                    <textarea
                        value={data.bio || ''}
                        onChange={(e) => handleChange('bio', e.target.value)}
                        placeholder="I grew up in..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/30 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none h-32 transition-all text-sm leading-relaxed"
                    />
                </div>
            </div>

            {/* 3. Identity Signals */}
            <div className="space-y-3">
                <label className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 flex items-center gap-2 uppercase tracking-wider">
                    <Sparkles size={16} /> Identity Signals
                </label>
                <p className="text-xs text-white/50">Select up to 4 soft traits.</p>
                <div className="flex flex-wrap gap-2">
                    {IDENTITY_SIGNALS.map(signal => (
                        <button
                            key={signal}
                            onClick={() => toggleSelection('identity_signals', signal, 4)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all transform hover:scale-105 border ${(data.identity_signals || []).includes(signal)
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {signal}
                        </button>
                    ))}
                </div>
            </div>

            {/* 4. How I Connect */}
            <div className="space-y-3">
                <label className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400 flex items-center gap-2 uppercase tracking-wider">
                    <Zap size={16} /> How I Connect
                </label>
                <div className="relative">
                    <select
                        value={data.connection_style}
                        onChange={(e) => handleChange('connection_style', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none appearance-none cursor-pointer text-lg"
                    >
                        <option value="" className="bg-black">I connect best when...</option>
                        {CONNECTION_STYLES.map(style => (
                            <option key={style} value={style} className="bg-black">{style}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                        ▼
                    </div>
                </div>
            </div>

            {/* 5. Interest Capsules */}
            <div className="space-y-3">
                <label className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500 flex items-center gap-2 uppercase tracking-wider">
                    <Heart size={16} /> Interest Capsules
                </label>
                <p className="text-xs text-white/50">Select up to 5 interests.</p>
                <div className="flex flex-wrap gap-2">
                    {INTEREST_CAPSULES.map(interest => (
                        <button
                            key={interest}
                            onClick={() => toggleSelection('interest_capsules', interest, 5)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all transform hover:scale-105 border ${(data.interest_capsules || []).includes(interest)
                                ? 'bg-pink-500/20 border-pink-500/50 text-pink-200 shadow-[0_0_10px_rgba(236,72,153,0.2)]'
                                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {interest}
                        </button>
                    ))}
                </div>
            </div>

            {/* 6. Current Mood & Energy */}
            <div className="space-y-6">
                {/* Mood */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400 flex items-center gap-2 uppercase tracking-wider">
                        <Smile size={16} /> Current Mood
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {CURRENT_MOODS.map(mood => (
                            <button
                                key={mood}
                                onClick={() => handleChange('current_mood', mood)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all transform hover:scale-105 border ${data.current_mood === mood
                                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-200 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {mood}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Energy Level */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400 flex items-center gap-2 uppercase tracking-wider">
                        <Zap size={16} /> Energy Level
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {['calm', 'focused', 'energetic', 'passionate', 'deep'].map(energy => (
                            <button
                                key={energy}
                                onClick={() => handleChange('energy_level', energy)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all transform hover:scale-105 capitalize border ${data.energy_level === energy
                                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {energy}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 7. Card Customization */}
            {/* Removed Theme/Border Selectors */}

            {/* 8. Vibe Check (Prompts) */}
            <div className="space-y-4">
                <label className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400 flex items-center gap-2 uppercase tracking-wider">
                    <MessageSquareQuote size={16} /> Vibe Check
                </label>
                <p className="text-xs text-white/50">Pick up to 3 conversation starters.</p>

                {(data.prompts || []).map((prompt, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 relative group"
                    >
                        <select
                            value={prompt.question}
                            onChange={(e) => {
                                const newPrompts = [...(data.prompts || [])];
                                newPrompts[index] = { ...newPrompts[index], question: e.target.value };
                                handleChange('prompts', newPrompts);
                            }}
                            className="w-full bg-transparent text-pink-300 font-medium text-sm focus:outline-none cursor-pointer"
                        >
                            {AVAILABLE_PROMPTS.map(p => (
                                <option key={p} value={p} className="bg-gray-900 text-white">{p}</option>
                            ))}
                        </select>
                        <textarea
                            value={prompt.answer}
                            onChange={(e) => {
                                const newPrompts = [...(data.prompts || [])];
                                newPrompts[index] = { ...newPrompts[index], answer: e.target.value };
                                handleChange('prompts', newPrompts);
                            }}
                            placeholder="Your answer..."
                            className="w-full bg-transparent text-white placeholder:text-white/20 focus:outline-none resize-none h-12 text-lg font-light"
                        />
                        <button
                            onClick={() => {
                                const newPrompts = [...(data.prompts || [])];
                                newPrompts.splice(index, 1);
                                handleChange('prompts', newPrompts);
                            }}
                            className="absolute top-2 right-2 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            ×
                        </button>
                    </motion.div>
                ))}

                {(data.prompts || []).length < 3 && (
                    <button
                        onClick={() => {
                            handleChange('prompts', [...(data.prompts || []), { question: AVAILABLE_PROMPTS[0], answer: '' }]);
                        }}
                        className="w-full py-3 rounded-xl border border-dashed border-white/20 text-white/40 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all text-sm font-medium"
                    >
                        + Add a Prompt
                    </button>
                )}
            </div>
        </div>
    );
}
