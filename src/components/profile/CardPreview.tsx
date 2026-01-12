'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Play, Pause, MapPin, Briefcase, GraduationCap, Heart, Sparkles, Star, Zap, MessageSquareQuote, Check } from 'lucide-react';
import { useState, useRef } from 'react';

interface CardPreviewProps {
    profile: any;
    theme: string;
    color: string;
    mood: string;
    border: string;
}

const getZodiacSign = (dateString: string) => {
    if (!dateString) return "✨ Star Child";
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;

    if ((month == 1 && day <= 19) || (month == 12 && day >= 22)) return "♑ Capricorn";
    if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) return "♒ Aquarius";
    if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) return "♓ Pisces";
    if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return "♈ Aries";
    if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return "♉ Taurus";
    if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return "♊ Gemini";
    if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return "♋ Cancer";
    if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return "♌ Leo";
    if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return "♍ Virgo";
    if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return "♎ Libra";
    if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return "♏ Scorpio";
    if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return "♐ Sagittarius";
    return "✨ Star Child";
};

export default function CardPreview({ profile, theme, color, mood, border }: CardPreviewProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [activePhotoIndex, setActivePhotoIndex] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Parallax Motion Values
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15 });
    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["7deg", "-7deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-7deg", "7deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const toggleAudio = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    // Theme Styles
    const getThemeStyles = () => {
        switch (theme) {
            case 'modern':
                return 'bg-white/10 backdrop-blur-xl';
            case 'minimal':
                return 'bg-black';
            case 'glass':
                return 'bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-2xl';
            case 'neon':
                return 'bg-black shadow-[0_0_20px_rgba(0,0,0,0.5)]';
            case 'luxury':
                return 'bg-gradient-to-b from-gray-900 to-black';
            case 'polaroid':
                return 'bg-white text-black';
            default: // classic
                return 'bg-gradient-to-b from-gray-900 to-black';
        }
    };

    // Border Styles
    const getBorderStyles = () => {
        switch (border) {
            case 'none':
                return 'border-0';
            case 'glow':
                return `border border-white/20 shadow-[0_0_15px_${color}60]`;
            case 'double':
                return `border-4 border-double border-white/20`;
            case 'gradient':
                return 'border-2 border-transparent bg-clip-padding';
            case 'thin':
            default:
                return 'border border-white/10';
        }
    };

    // Dynamic Styles for Gradient Border
    const gradientStyle = border === 'gradient' ? {
        backgroundImage: `linear-gradient(${theme === 'polaroid' ? '#fff, #fff' : '#000, #000'}), linear-gradient(to right, ${color}, #fff)`,
        backgroundOrigin: 'border-box',
        backgroundClip: 'content-box, border-box'
    } : {};

    const isLightMode = theme === 'polaroid';
    const displayMood = profile.current_mood || mood;

    return (
        <motion.div
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
                ...gradientStyle
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`relative w-full h-full overflow-hidden rounded-[32px] ${getThemeStyles()} ${getBorderStyles()} transition-all duration-300 group flex flex-col`}
        >
            {/* SCROLLABLE CONTAINER FOR WHOLE CARD */}
            <div className="w-full h-full overflow-y-auto scrollbar-hide pb-60 rounded-[32px]">

                {/* --- PHOTO SECTION (Tall Header) --- */}
                <div className="relative h-[65vh] w-full shrink-0 bg-gray-900">
                    {/* Photo Carousel */}
                    {profile.photos?.[0] ? (
                        <motion.img
                            key={profile.photos[activePhotoIndex]}
                            src={profile.photos[activePhotoIndex]}
                            alt="Profile"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-white/20 text-lg">No Photo</span>
                        </div>
                    )}

                    {/* Gradient Overlay for Text Readability at Bottom of Photo */}
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />

                    {/* Photo Navigation Overlays */}
                    {profile.photos?.length > 1 && (
                        <>
                            <div
                                className="absolute inset-y-0 left-0 w-1/2 z-20 cursor-w-resize"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActivePhotoIndex(prev => prev === 0 ? profile.photos.length - 1 : prev - 1);
                                }}
                            />
                            <div
                                className="absolute inset-y-0 right-0 w-1/2 z-20 cursor-e-resize"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActivePhotoIndex(prev => (prev + 1) % profile.photos.length);
                                }}
                            />

                            {/* Indicators (Straight & Short) */}
                            <div className="absolute top-[calc(env(safe-area-inset-top)+1rem)] left-0 right-0 flex justify-center gap-1 z-30 px-10">
                                {profile.photos.map((_: any, i: number) => (
                                    <div
                                        key={i}
                                        className={`h-1 flex-1 rounded-full transition-all duration-300 shadow-sm
                                        ${i === activePhotoIndex ? 'bg-white' : 'bg-white/30'}
                                        `}
                                    />
                                ))}
                            </div>
                        </>
                    )}



                    {/* Voice Intro Badge (Floating) */}
                    {profile.voice_url && (
                        <div className="absolute bottom-4 right-4 z-30">
                            <button
                                onClick={toggleAudio}
                                className="flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-xl bg-black/30 border border-white/20 hover:bg-white/20 transition-all active:scale-95 shadow-lg group"
                            >
                                <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center">
                                    {isPlaying ? <Pause size={10} fill="currentColor" /> : <Play size={10} fill="currentColor" className="ml-0.5" />}
                                </div>
                                <span className="text-[10px] font-bold text-white/90 uppercase tracking-wider mr-1 group-hover:text-white">Voice Intro</span>
                                <audio ref={audioRef} src={profile.voice_url} onEnded={() => setIsPlaying(false)} />
                            </button>
                        </div>
                    )}

                    <div className="absolute bottom-4 left-5 z-20 max-w-[calc(100%-180px)]">
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-3xl font-bold text-white shadow-black drop-shadow-md">
                                {profile.full_name?.split(' ')[0] || 'User'}
                                {profile.birth_date && !isNaN(new Date(profile.birth_date).getTime()) && (
                                    <span className="ml-2 text-2xl font-light opacity-90">
                                        {new Date().getFullYear() - new Date(profile.birth_date).getFullYear()}
                                    </span>
                                )}
                            </h2>
                            {profile.is_verified && (
                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg" title="Verified">
                                    <Check size={12} strokeWidth={4} />
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs text-white/90 font-medium">
                            {profile.location && (
                                <div className="flex items-center gap-1">
                                    <MapPin size={12} />
                                    <span>{profile.location}</span>
                                </div>
                            )}
                            {profile.height && (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                                    <span>{profile.height}</span>
                                </div>
                            )}
                            {profile.gender && (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                                    <span>{profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- CONTENT SECTION (Flows below photo) --- */}
                <div className={`relative w-full p-6 flex flex-col gap-6 ${isLightMode ? 'bg-white text-black' : 'text-white'}`}>

                    {/* AI Connection Insight (Integrated) */}
                    {profile.connection_insight && (
                        <div className={`p-4 rounded-2xl border ${isLightMode
                            ? 'bg-purple-50/80 border-purple-100 shadow-sm'
                            : 'bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/20'}`}>
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-full shrink-0 ${isLightMode ? 'bg-purple-100' : 'bg-purple-500/20'}`}>
                                    <Sparkles size={16} className={isLightMode ? 'text-purple-600' : 'text-purple-300'} />
                                </div>
                                <div>
                                    <h3 className={`text-xs font-bold uppercase tracking-wider mb-1 ${isLightMode ? 'text-purple-800' : 'text-purple-300'}`}>
                                        Why you match
                                    </h3>
                                    <p className={`text-sm font-medium leading-relaxed ${isLightMode ? 'text-purple-900' : 'text-white/90'}`}>
                                        {profile.connection_insight}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AI Deep Dive Compatibility (New) */}
                    {profile.compatibility_summary && (
                        <div className={`p-5 rounded-3xl border relative overflow-hidden group ${isLightMode
                            ? 'bg-blue-50/50 border-blue-100'
                            : 'bg-white/5 border-white/10 hover:border-white/20 transition-colors'}`}>

                            {/* Decorative Background Blur */}
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-all duration-700" />

                            <div className="flex items-center gap-2 mb-3 relative z-10">
                                <Zap size={14} className={isLightMode ? 'text-blue-500' : 'text-blue-400'} fill="currentColor" />
                                <span className={`text-xs font-bold uppercase tracking-widest ${isLightMode ? 'text-blue-900' : 'text-blue-200'}`}>
                                    The Vibe Check
                                </span>
                            </div>

                            <p className="text-sm leading-7 opacity-90 font-light relative z-10">
                                {profile.compatibility_summary}
                            </p>

                            <div className="mt-4 flex items-center gap-2 cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
                                <span className="text-[10px] uppercase font-bold tracking-wider">Analysis complete</span>
                                <div className="h-px flex-1 bg-current opacity-20" />
                            </div>
                        </div>
                    )}

                    {/* About Quote */}
                    {profile.about_me && (
                        <div className="relative pt-2">
                            <MessageSquareQuote className={`absolute -top-1 -left-1 w-6 h-6 opacity-20 ${isLightMode ? 'text-black' : 'text-white'}`} />
                            <p className="text-lg font-light leading-relaxed pl-6 opacity-90 italic">
                                "{profile.about_me}"
                            </p>
                        </div>
                    )}

                    {/* Career & School */}
                    {(profile.job_title || profile.company || profile.school) && (
                        <div className="flex flex-col gap-2 opacity-80 text-sm">
                            {(profile.job_title || profile.company) && (
                                <div className="flex items-center gap-2">
                                    <Briefcase size={14} />
                                    <span>
                                        {profile.job_title}
                                        {profile.job_title && profile.company && ' at '}
                                        {profile.company}
                                    </span>
                                </div>
                            )}
                            {profile.school && (
                                <div className="flex items-center gap-2">
                                    <GraduationCap size={14} />
                                    <span>{profile.school}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Identity Chips */}
                    <div className="flex flex-wrap gap-2">
                        {profile.identity_signals?.map((signal: string, i: number) => (
                            <span key={`id-${i}`} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${isLightMode
                                ? 'bg-emerald-100/50 border-emerald-200 text-emerald-800'
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                                }`}>
                                {signal}
                            </span>
                        ))}
                    </div>

                    {/* Extended Bio */}
                    {profile.bio && (
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider opacity-50">About Me</h3>
                            <p className="text-sm opacity-80 leading-loose whitespace-pre-wrap font-light">
                                {profile.bio}
                            </p>
                        </div>
                    )}

                    {/* Connection Style */}
                    {profile.connection_style && (
                        <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-orange-50/50 border-orange-100' : 'bg-orange-500/5 border-orange-500/10'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <Zap size={14} className={isLightMode ? 'text-orange-500' : 'text-orange-400'} />
                                <span className={`text-xs font-bold uppercase tracking-wider ${isLightMode ? 'text-orange-800' : 'text-orange-200'}`}>I connect best when...</span>
                            </div>
                            <p className={`text-sm ${isLightMode ? 'text-orange-900' : 'text-orange-100'}`}>{profile.connection_style}</p>
                        </div>
                    )}

                    {/* Interests */}
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider opacity-50">Interests</h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.interest_capsules?.map((interest: string, i: number) => (
                                <span key={`int-${i}`} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${isLightMode
                                    ? 'bg-pink-100/50 border-pink-200 text-pink-800'
                                    : 'bg-pink-500/10 border-pink-500/20 text-pink-200'
                                    }`}>
                                    {interest}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Prompts */}
                    {profile.prompts && profile.prompts.length > 0 && (
                        <div className="space-y-6 pt-4 border-t border-dashed border-white/10">
                            {profile.prompts.map((prompt: any, i: number) => (
                                <div key={i} className={`p-4 rounded-xl ${isLightMode ? 'bg-black/5' : 'bg-white/5'}`}>
                                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-2">{prompt.question}</p>
                                    <p className="text-base font-medium">{prompt.answer}</p>
                                </div>
                            ))}
                        </div>
                    )}


                </div>
            </div>
        </motion.div>
    );
}
