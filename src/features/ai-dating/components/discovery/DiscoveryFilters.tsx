'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, MapPin, Calendar, ShieldCheck } from 'lucide-react';

export interface FilterState {
    interestedIn: string[]; // ['male'], ['female'], or ['everyone']
    minAge: number;
    maxAge: number;
    maxDistance: number; // km
    verifiedOnly: boolean;
    minHeight: number; // cm
    maxHeight: number; // cm
    globalMode?: boolean; // If true, ignore distance
}

interface DiscoveryFiltersProps {
    isOpen: boolean;
    onClose: () => void;
    filters: FilterState;
    onApply: (filters: FilterState) => void;
}

export default function DiscoveryFilters({ isOpen, onClose, filters, onApply }: DiscoveryFiltersProps) {
    const [localFilters, setLocalFilters] = useState<FilterState>(filters);

    useEffect(() => {
        if (isOpen) {
            setLocalFilters(filters);
        }
    }, [isOpen, filters]);

    const handleGenderSelect = (value: string) => {
        let newSelected = [...localFilters.interestedIn];

        if (value === 'everyone') {
            newSelected = ['everyone'];
        } else {
            // Remove 'everyone' if selecting specific
            newSelected = newSelected.filter(s => s !== 'everyone');

            if (newSelected.includes(value)) {
                // Deselect if already selected, enforce at least one
                if (newSelected.length > 1) {
                    newSelected = newSelected.filter(s => s !== value);
                }
            } else {
                newSelected.push(value);
            }

            if (newSelected.length === 0) newSelected = ['everyone'];
        }
        setLocalFilters({ ...localFilters, interestedIn: newSelected });
    };

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-x-4 top-[10%] bottom-[10%] max-w-sm mx-auto bg-[#1A1A1A] border border-white/10 rounded-3xl p-6 z-[70] shadow-2xl flex flex-col overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-6 shrink-0">
                            <h2 className="text-xl font-bold text-white">Discovery Settings</h2>
                            <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                                <X size={20} className="text-white/70" />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 pr-2 space-y-8 scrollbar-hide">
                            {/* SECTION 1: INTERESTED IN */}
                            <section>
                                <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-3">Show Me</h3>
                                <div className="space-y-2">
                                    {[
                                        { id: 'female', label: 'Women' },
                                        { id: 'male', label: 'Men' },
                                        { id: 'everyone', label: 'Everyone' }
                                    ].map((option) => {
                                        const isSelected = localFilters.interestedIn.includes(option.id);
                                        return (
                                            <button
                                                key={option.id}
                                                onClick={() => handleGenderSelect(option.id)}
                                                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${isSelected
                                                    ? 'bg-purple-600/20 border-purple-500 text-white'
                                                    : 'bg-white/5 border-transparent text-white/50 hover:bg-white/10'
                                                    }`}
                                            >
                                                <span className="font-medium">{option.label}</span>
                                                {isSelected && <Check size={18} className="text-purple-400" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* SECTION 2: AGE RANGE */}
                            <section>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider">Age Range</h3>
                                    <span className="text-white font-medium text-sm">{localFilters.minAge} - {localFilters.maxAge}</span>
                                </div>
                                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <Calendar className="text-white/30" size={20} />
                                    <div className="flex-1 flex gap-4">
                                        <div className="flex-1">
                                            <label className="text-[10px] text-white/40 block mb-1">Min</label>
                                            <input
                                                type="number"
                                                min={18} max={localFilters.maxAge}
                                                value={localFilters.minAge}
                                                onChange={(e) => setLocalFilters({ ...localFilters, minAge: parseInt(e.target.value) || 18 })}
                                                className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm text-center focus:border-purple-500 outline-none"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[10px] text-white/40 block mb-1">Max</label>
                                            <input
                                                type="number"
                                                min={localFilters.minAge} max={100}
                                                value={localFilters.maxAge}
                                                onChange={(e) => setLocalFilters({ ...localFilters, maxAge: parseInt(e.target.value) || 100 })}
                                                className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm text-center focus:border-purple-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* SECTION 3: DISTANCE */}
                            <section>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider">Distance</h3>
                                    <span className="text-white font-medium text-sm">{localFilters.maxDistance} km</span>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <MapPin className="text-white/30" size={20} />
                                        <input
                                            type="range"
                                            min={5} max={200} step={5}
                                            value={localFilters.maxDistance}
                                            onChange={(e) => setLocalFilters({ ...localFilters, maxDistance: parseInt(e.target.value) })}
                                            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* SECTION 4: VERIFIED */}
                            <section>
                                <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/10 rounded-full text-blue-400">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <div>
                                            <div className="text-white font-medium text-sm">Verified Profiles Only</div>
                                            <div className="text-white/40 text-xs">Only show users with verified photo</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setLocalFilters({ ...localFilters, verifiedOnly: !localFilters.verifiedOnly })}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${localFilters.verifiedOnly ? 'bg-purple-600' : 'bg-white/20'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${localFilters.verifiedOnly ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                            </section>
                        </div>

                        <div className="pt-6 mt-auto shrink-0 border-t border-white/5">
                            <button
                                onClick={handleApply}
                                className="w-full py-4 rounded-2xl bg-white text-black font-bold text-lg hover:bg-gray-200 transition-colors shadow-lg shadow-white/5"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
