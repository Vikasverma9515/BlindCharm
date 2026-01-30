'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Briefcase, GraduationCap, Heart } from 'lucide-react'
import Image from 'next/image'

interface MatchProfileDrawerProps {
    isOpen: boolean
    onClose: () => void
    profile: {
        user_id: string
        full_name: string
        age: number
        bio: string
        photos: string[]
        location?: string
        work?: string
        education?: string
        interests?: string[]
        height?: number
        gender?: string
    } | null
}

export default function MatchProfileDrawer({ isOpen, onClose, profile }: MatchProfileDrawerProps) {
    if (!profile) return null

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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed inset-x-0 bottom-0 z-50 bg-gradient-to-b from-zinc-900 to-black rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col"
                    >
                        {/* Drag Handle */}
                        <div className="flex justify-center pt-3 pb-2">
                            <div className="w-12 h-1.5 bg-white/20 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 pb-4">
                            <h2 className="text-xl font-bold text-white">Profile</h2>
                            <button
                                onClick={onClose}
                                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
                            {/* Photo Grid */}
                            <div className="grid grid-cols-3 gap-2">
                                {profile.photos?.slice(0, 6).map((photo, i) => (
                                    <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden">
                                        <Image
                                            src={photo}
                                            alt={`Photo ${i + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Name & Age */}
                            <div>
                                <h3 className="text-3xl font-bold text-white mb-1">
                                    {profile.full_name}, {profile.age}
                                </h3>
                                {profile.gender && (
                                    <p className="text-white/60 text-sm">{profile.gender}</p>
                                )}
                            </div>

                            {/* Basic Info */}
                            <div className="space-y-3">
                                {profile.location && (
                                    <div className="flex items-center gap-3 text-white/80">
                                        <MapPin className="w-5 h-5 text-purple-400" />
                                        <span>{profile.location}</span>
                                    </div>
                                )}
                                {profile.work && (
                                    <div className="flex items-center gap-3 text-white/80">
                                        <Briefcase className="w-5 h-5 text-purple-400" />
                                        <span>{profile.work}</span>
                                    </div>
                                )}
                                {profile.education && (
                                    <div className="flex items-center gap-3 text-white/80">
                                        <GraduationCap className="w-5 h-5 text-purple-400" />
                                        <span>{profile.education}</span>
                                    </div>
                                )}
                                {profile.height && (
                                    <div className="flex items-center gap-3 text-white/80">
                                        <span className="text-purple-400">📏</span>
                                        <span>{Math.floor(profile.height / 30.48)}'{Math.round((profile.height % 30.48) / 2.54)}\"</span>
                                    </div>
                                )}
                            </div>

                            {/* Bio */}
                            {profile.bio && (
                                <div>
                                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                                        <Heart className="w-4 h-4 text-purple-400" />
                                        About
                                    </h4>
                                    <p className="text-white/70 leading-relaxed">{profile.bio}</p>
                                </div>
                            )}

                            {/* Interests */}
                            {profile.interests && profile.interests.length > 0 && (
                                <div>
                                    <h4 className="text-white font-semibold mb-3">Interests</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.interests.map((interest, i) => (
                                            <span
                                                key={i}
                                                className="px-4 py-2 bg-white/10 text-white rounded-full text-sm border border-white/10"
                                            >
                                                {interest}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
