'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, Check, Users, Shield, Globe, MapPin, Ruler, Calendar } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useDiscovery } from '@/context/DiscoveryContext';

export default function PreferencesPage() {
    const router = useRouter();
    const { filters, setFilters } = useDiscovery();
    const [localFilters, setLocalFilters] = useState(filters);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const { data: session } = useSession();

    // Load preferences from DB on mount
    useEffect(() => {
        const loadPreferences = async () => {
            try {
                // @ts-ignore
                if (!session?.user?.id) return;
                // @ts-ignore
                const uid = session.user.id;

                const { data: profile, error } = await supabase
                    .from('galaxy_profiles') // Added discovery_global to query
                    .select('interested_in, discovery_min_age, discovery_max_age, discovery_max_distance, discovery_verified_only, discovery_min_height, discovery_max_height, discovery_global')
                    .eq('user_id', uid)
                    .maybeSingle();

                if (profile) {
                    setLocalFilters({
                        interestedIn: profile.interested_in || ['everyone'],
                        minAge: profile.discovery_min_age || 18,
                        maxAge: profile.discovery_max_age || 100,
                        maxDistance: profile.discovery_max_distance || 100,
                        verifiedOnly: profile.discovery_verified_only || false,
                        minHeight: profile.discovery_min_height || 150,
                        maxHeight: profile.discovery_max_height || 220,
                        globalMode: profile.discovery_global || false
                    });
                }
            } catch (error) {
                console.error("Error loading preferences:", error);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user) {
            loadPreferences();
        } else if (!session && typeof window !== 'undefined') {
            const timer = setTimeout(() => setLoading(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [session]);

    const handleSave = async () => {
        setSaving(true);
        try {
            // 1. Update Context
            setFilters(localFilters);

            // 2. Persist to DB
            // @ts-ignore
            if (session?.user?.id) {
                const { error } = await supabase
                    .from('galaxy_profiles')
                    .update({
                        interested_in: localFilters.interestedIn,
                        discovery_min_age: localFilters.minAge,
                        discovery_max_age: localFilters.maxAge,
                        discovery_max_distance: localFilters.maxDistance,
                        discovery_verified_only: localFilters.verifiedOnly,
                        discovery_min_height: localFilters.minHeight,
                        discovery_max_height: localFilters.maxHeight,
                        discovery_global: localFilters.globalMode
                    })
                    // @ts-ignore
                    .eq('user_id', session.user.id);

                if (error) throw error;
            }

            toast.success("Preferences saved");
            router.refresh(); // Force Server Components to re-fetch data
            router.back();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save preferences");
        } finally {
            setSaving(false);
        }
    };

    const handleGenderSelect = (value: string) => {
        let newInterestedIn = [...localFilters.interestedIn];

        // Single select behavior logic similar to Tinder/Bumble usually, but let's stick to what allows single toggle or multiple if logic permits. 
        // Replicating previous behavior:
        if (value === 'everyone') {
            setLocalFilters({ ...localFilters, interestedIn: ['everyone'] });
        } else {
            // If selecting male/female, remove 'everyone'.
            // Toggle logic
            if (newInterestedIn.includes('everyone')) {
                setLocalFilters({ ...localFilters, interestedIn: [value] });
            } else {
                if (newInterestedIn.includes(value)) {
                    // Prevent empty
                    if (newInterestedIn.length > 1) {
                        setLocalFilters({ ...localFilters, interestedIn: newInterestedIn.filter(i => i !== value) });
                    }
                } else {
                    setLocalFilters({ ...localFilters, interestedIn: [...newInterestedIn, value] });
                }
            }
        }
    };

    const SettingSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <div className="mb-6">
            <h3 className="uppercase text-xs font-bold text-white/40 tracking-wider mb-2 px-4">{title}</h3>
            <div className="bg-zinc-900 rounded-3xl overflow-hidden text-white/90">
                {children}
            </div>
        </div>
    );

    const SettingItem = ({ icon: Icon, label, value, onClick, showToggle, toggleValue, onToggle, isSelected }: any) => (
        <div
            onClick={onClick}
            className={`flex items-center justify-between p-4 border-b border-white/5 last:border-0 ${onClick ? 'cursor-pointer hover:bg-white/5 transition-colors' : ''}`}
        >
            <div className="flex items-center gap-3">
                {Icon && <Icon size={20} className="text-white/60" />}
                <span className={`text-base font-medium ${isSelected ? "text-red-400" : "text-white"}`}>{label}</span>
            </div>

            <div className="flex items-center gap-2">
                {value && <span className="text-white/40 text-sm">{value}</span>}
                {showToggle && (
                    <div
                        className={`w-11 h-6 rounded-full relative transition-colors ${toggleValue ? 'bg-red-600' : 'bg-white/20'}`}
                        onClick={(e) => { e.stopPropagation(); onToggle && onToggle(!toggleValue); }}
                    >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${toggleValue ? 'left-6' : 'left-1'}`} />
                    </div>
                )}
                {isSelected && <Check size={18} className="text-red-400" />}
            </div>
        </div>
    );

    const RangeSettingItem = ({ icon: Icon, label, valueLabel, children, disabled }: any) => (
        <div className={`p-4 border-b border-white/5 last:border-0 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    {Icon && <Icon size={20} className="text-white/60" />}
                    <span className="text-base font-medium text-white">{label}</span>
                </div>
                <span className="text-white/40 text-sm font-medium">{valueLabel}</span>
            </div>
            <div className="px-1">
                {children}
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-black text-white flex flex-col font-sans overflow-hidden"
        >
            {/* Header */}
            <div className="shrink-0 z-30 bg-black/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-white/5 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
                    >
                        <ChevronLeft size={24} />
                    </button>
                </div>
                <h1 className="text-lg font-bold w-full text-center">Discovery Settings</h1>
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="text-red-500 font-semibold text-sm hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Done'}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-0 px-4 pt-4 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

                {/* 1. Show Me */}
                <SettingSection title="Show Me">
                    <SettingItem
                        icon={Users}
                        label="Women"
                        isSelected={localFilters.interestedIn.includes('female')}
                        onClick={() => handleGenderSelect('female')}
                    />
                    <SettingItem
                        icon={Users}
                        label="Men"
                        isSelected={localFilters.interestedIn.includes('male')}
                        onClick={() => handleGenderSelect('male')}
                    />
                    <SettingItem
                        icon={Users}
                        label="Everyone"
                        isSelected={localFilters.interestedIn.includes('everyone')}
                        onClick={() => handleGenderSelect('everyone')}
                    />
                </SettingSection>

                {/* 2. Preferences */}
                <SettingSection title="Preferences">

                    {/* Age Range */}
                    <RangeSettingItem
                        icon={Calendar}
                        label="Age Range"
                        valueLabel={`${localFilters.minAge} - ${localFilters.maxAge}`}
                    >
                        <div className="relative h-6 flex items-center">
                            <div className="absolute w-full h-1 bg-white/10 rounded-full"></div>
                            <div
                                className="absolute h-1 bg-red-600 rounded-full"
                                style={{
                                    left: `${Math.min(((localFilters.minAge - 18) / (100 - 18)) * 100, ((localFilters.maxAge - 18) / (100 - 18)) * 100)}%`,
                                    width: `${Math.abs(((localFilters.maxAge - 18) / (100 - 18)) * 100 - ((localFilters.minAge - 18) / (100 - 18)) * 100)}%`
                                }}
                            />
                            <input
                                type="range"
                                min={18} max={100}
                                value={localFilters.minAge}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (val < localFilters.maxAge) setLocalFilters({ ...localFilters, minAge: val });
                                }}
                                className="absolute w-full h-8 bg-transparent appearance-none pointer-events-none z-20 cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg"
                            />
                            <input
                                type="range"
                                min={18} max={100}
                                value={localFilters.maxAge}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (val > localFilters.minAge) setLocalFilters({ ...localFilters, maxAge: val });
                                }}
                                className="absolute w-full h-8 bg-transparent appearance-none pointer-events-none z-20 cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg"
                            />
                        </div>
                    </RangeSettingItem>

                    {/* Height Range */}
                    <RangeSettingItem
                        icon={Ruler}
                        label="Height"
                        valueLabel={`${(localFilters.minHeight || 150)} - ${(localFilters.maxHeight || 220)} cm`}
                    >
                        <div className="relative h-6 flex items-center">
                            <div className="absolute w-full h-1 bg-white/10 rounded-full"></div>
                            <div
                                className="absolute h-1 bg-red-600 rounded-full"
                                style={{
                                    left: `${Math.min((((localFilters.minHeight || 150) - 140) / (220 - 140)) * 100, (((localFilters.maxHeight || 220) - 140) / (220 - 140)) * 100)}%`,
                                    width: `${Math.abs((((localFilters.maxHeight || 220) - 140) / (220 - 140)) * 100 - (((localFilters.minHeight || 150) - 140) / (220 - 140)) * 100)}%`
                                }}
                            />
                            <input
                                type="range"
                                min={140} max={220}
                                value={localFilters.minHeight || 150}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (val < (localFilters.maxHeight || 220)) setLocalFilters({ ...localFilters, minHeight: val });
                                }}
                                className="absolute w-full h-8 bg-transparent appearance-none pointer-events-none z-20 cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg"
                            />
                            <input
                                type="range"
                                min={140} max={220}
                                value={localFilters.maxHeight || 220}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (val > (localFilters.minHeight || 150)) setLocalFilters({ ...localFilters, maxHeight: val });
                                }}
                                className="absolute w-full h-8 bg-transparent appearance-none pointer-events-none z-20 cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg"
                            />
                        </div>
                    </RangeSettingItem>

                </SettingSection>

                {/* 3. Location */}
                <SettingSection title="Location">
                    <SettingItem
                        icon={Globe}
                        label="Global Mode"
                        showToggle
                        toggleValue={localFilters.globalMode}
                        onToggle={() => setLocalFilters({ ...localFilters, globalMode: !localFilters.globalMode })}
                    />

                    <RangeSettingItem
                        icon={MapPin}
                        label="Max Distance"
                        valueLabel={localFilters.globalMode ? 'Global' : `${localFilters.maxDistance} km`}
                        disabled={localFilters.globalMode}
                    >
                        <div className="relative h-6 flex items-center">
                            <div className="absolute w-full h-1 bg-white/10 rounded-full"></div>
                            <div
                                className="absolute h-1 bg-red-600 rounded-full"
                                style={{ width: `${(localFilters.maxDistance / 200) * 100}%` }}
                            />
                            <input
                                type="range"
                                min={5} max={200} step={5}
                                value={localFilters.maxDistance}
                                onChange={(e) => setLocalFilters({ ...localFilters, maxDistance: parseInt(e.target.value) })}
                                className="absolute w-full h-8 bg-transparent appearance-none pointer-events-auto z-20 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg"
                                disabled={localFilters.globalMode}
                            />
                        </div>
                    </RangeSettingItem>
                </SettingSection>

                {/* 4. Safety */}
                <SettingSection title="Safety">
                    <SettingItem
                        icon={Shield}
                        label="Verified Profiles Only"
                        showToggle
                        toggleValue={localFilters.verifiedOnly}
                        onToggle={() => setLocalFilters({ ...localFilters, verifiedOnly: !localFilters.verifiedOnly })}
                    />
                </SettingSection>
            </div>
        </motion.div>
    );
}
