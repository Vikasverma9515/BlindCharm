'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { LogOut, ArrowRight, Mic, Edit2, Check, Eye, MessageSquareQuote, Sparkles, Shield, User, GraduationCap, MapPin, SlidersHorizontal, Settings } from 'lucide-react';

const VoiceRecorder = dynamic(() => import('@/components/profile/VoiceRecorder'), {
    ssr: false,
    loading: () => <div className="h-32 bg-white/5 rounded-2xl animate-pulse" />
});

// import AdminDashboard from '@/features/ai-dating/components/galaxy/profile/AdminDashboard'; // Moved to dedicated page
import PhotoGrid from '@/components/profile/PhotoGrid';
import ProfileEditor from '@/components/profile/ProfileEditor';
import CardPreview from '@/components/profile/CardPreview';
import GalaxyFaceVerification from '@/features/ai-dating/components/galaxy/profile/GalaxyFaceVerification';
import GalaxyCollegeVerification from '@/features/ai-dating/components/galaxy/profile/GalaxyCollegeVerification';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/Skeleton';
import { updateProfileAction } from '@/app/actions/profile';
import GalaxyContactSupport from '@/features/ai-dating/components/galaxy/profile/GalaxyContactSupport';
import { DEMO_MODE, DEMO_CURRENT_USER_PROFILE } from '@/lib/demoData';

export default function GalaxyProfilePage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isEditing, setIsEditing] = useState(false);
    const [showContactSupport, setShowContactSupport] = useState(false); // New state
    const [loading, setLoading] = useState(true);
    const [activeVerification, setActiveVerification] = useState<'face' | 'college' | null>(null);
    const [isVerified, setIsVerified] = useState(false); // Face verification status
    const [isAdmin, setIsAdmin] = useState(false); // Admin status
    const [originalMainPhoto, setOriginalMainPhoto] = useState<string | null>(null); // Track original verified photo
    const [profile, setProfile] = useState({
        // Phase 2 Fields
        about_me: '',
        identity_signals: [] as string[],
        connection_style: '',
        interest_capsules: [] as string[],
        current_mood: '',
        pronouns: '',
        height: '', // New Field
        energy_level: '',
        // avatar_url removed

        // Legacy / Basic Fields
        full_name: '', // Added for display
        bio: '',
        job_title: '',
        company: '',
        school: '',
        location: '',
        gender: '',
        interests: [] as string[],
        photos: [] as string[],
        prompts: [] as { question: string, answer: string }[],
        voice_url: '' as string | null,
        primary_color: '#8B5CF6',
        mood_status: '',
        birth_date: '',
        latitude: null as number | null,
        longitude: null as number | null
    });

    // Calculate profile completion percentage
    const calculateProfileCompletion = () => {
        const fields = [
            { value: profile.photos.length > 0, weight: 20 }, // Photos (critical)
            { value: profile.about_me, weight: 15 }, // About me
            { value: profile.voice_url, weight: 15 }, // Voice intro
            { value: profile.full_name, weight: 10 }, // Name
            { value: profile.birth_date, weight: 10 }, // DOB
            { value: profile.location, weight: 10 }, // Location
            { value: profile.identity_signals?.length > 0, weight: 5 }, // Identity signals
            { value: profile.interest_capsules?.length > 0, weight: 5 }, // Interests
            { value: profile.connection_style, weight: 5 }, // Connection style
            { value: profile.pronouns, weight: 2.5 }, // Pronouns
            { value: profile.height, weight: 2.5 } // Height
        ];

        const completed = fields.reduce((sum, field) => {
            return sum + (field.value ? field.weight : 0);
        }, 0);

        return Math.round(completed);
    };

    const profileCompletionPercentage = calculateProfileCompletion();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (session?.user?.id) {
            fetchProfile();
        }
    }, [session, status]);

    const fetchProfile = async () => {
        try {
            setLoading(true);

            if (DEMO_MODE) {
                setIsVerified(true);
                setProfile(prev => ({ ...prev, ...DEMO_CURRENT_USER_PROFILE }));
                return;
            }

            // Fetch from galaxy_profiles
            const { data: galaxyData, error: galaxyError } = await supabase
                .from('galaxy_profiles')
                .select('*')
                .eq('user_id', session?.user?.id)
                .maybeSingle();

            // Fetch from users (for sync check + verification status)
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', session?.user?.id)
                .maybeSingle();

            // Update verification status
            if (userData) {
                console.log("[ProfilePage] User Data Loaded:", userData);
                setIsVerified(userData.face_verified || false);
                setIsAdmin(userData.is_admin || false);
                // Track original main photo for verification invalidation
                if (userData.face_verified && galaxyData?.photos?.[0]) {
                    setOriginalMainPhoto(galaxyData.photos[0]);
                }
            }

            if (galaxyData) {
                setProfile({
                    // Phase 2 Fields
                    about_me: galaxyData.about_me || '',
                    identity_signals: galaxyData.identity_signals || [],
                    connection_style: galaxyData.connection_style || '',
                    interest_capsules: galaxyData.interest_capsules || [],
                    current_mood: galaxyData.current_mood || '',
                    pronouns: galaxyData.pronouns || '',
                    height: galaxyData.height || '',
                    energy_level: galaxyData.energy_level || '',
                    // avatar_url removed

                    // Legacy / Basic Fields
                    full_name: userData?.full_name || userData?.name || '', // Fetch name from users table
                    bio: galaxyData.bio || '',
                    job_title: galaxyData.job_title || '',
                    company: galaxyData.company || '',
                    school: galaxyData.school || '',
                    location: galaxyData.location || '',
                    gender: galaxyData.gender || '',
                    interests: galaxyData.interests || [],
                    photos: galaxyData.photos && galaxyData.photos.length > 0
                        ? galaxyData.photos
                        : (userData?.profile_picture ? [userData.profile_picture] : []),
                    prompts: galaxyData.prompts || [],
                    voice_url: galaxyData.voice_url || userData?.voice_url || null,
                    primary_color: galaxyData.primary_color || '#8B5CF6',
                    mood_status: galaxyData.mood_status || '',
                    birth_date: userData?.dob || '',
                    latitude: galaxyData.latitude || null,
                    longitude: galaxyData.longitude || null
                });
            } else if (userData) {
                // Fallback to user data if galaxy profile doesn't exist yet
                setProfile(prev => ({
                    ...prev,
                    full_name: userData.full_name || userData.name || '',
                    photos: userData.profile_picture ? [userData.profile_picture] : [],
                    voice_url: userData.voice_url || null,
                    birth_date: userData.dob || ''
                }));
            }
        } catch (e) {
            console.error("Error fetching profile", e);
        } finally {
            setLoading(false);
        }
    };

    const ensureUserExists = async () => {
        if (!session?.user?.id) return false;

        try {
            // Check if user exists
            const { data, error } = await supabase
                .from('users')
                .select('id')
                .eq('id', session.user.id)
                .maybeSingle();

            if (!data) {
                console.log("User record missing in public.users, creating now...");
                // Create user record
                const { error: insertError } = await supabase
                    .from('users')
                    .upsert({
                        id: session.user.id,
                        email: session.user.email,
                        full_name: session.user.name || 'BlindCharm User',
                        profile_picture: (session.user as any).image,
                        updated_at: new Date().toISOString()
                    });

                if (insertError) {
                    console.error("Failed to create user record:", insertError);
                    toast.error("Account sync failed. Please try signing out and back in.");
                    return false;
                }
            }
            return true;
        } catch (err) {
            console.error("Error ensuring user exists:", err);
            return false;
        }
    };



    const handleSave = async () => {
        if (!session?.user?.id) return;

        // Ensure user exists in public.users to satisfy FK constraint
        const userExists = await ensureUserExists();
        if (!userExists) return;

        setIsEditing(false);
        const toastId = toast.loading("Saving profile...");

        try {
            // Prepare data for server action
            const profileData = {
                // Phase 2 Fields
                about_me: profile.about_me,
                identity_signals: profile.identity_signals,
                connection_style: profile.connection_style,
                interest_capsules: profile.interest_capsules,
                current_mood: profile.current_mood,
                pronouns: profile.pronouns,
                height: profile.height,
                energy_level: profile.energy_level,

                // Legacy Fields
                bio: profile.bio,
                job_title: profile.job_title,
                company: profile.company,
                school: profile.school,
                location: profile.location,
                gender: profile.gender,
                interests: profile.interests,
                photos: profile.photos,
                prompts: profile.prompts,
                latitude: profile.latitude,
                longitude: profile.longitude,

                // Prefs
                // card_theme, card_border removed

                // Basic
                full_name: profile.full_name,
                birth_date: profile.birth_date
            };

            const result = await updateProfileAction(profileData);

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.dismiss(toastId);
            toast.success("Profile updated!");

            // Re-fetch to confirm sync
            fetchProfile();

        } catch (e: any) {
            console.error("Failed to save profile", e);
            toast.dismiss(toastId);
            toast.error("Failed to save profile: " + e.message);
            setIsEditing(true); // Re-open edit mode on failure
        }
    };

    const handleVoiceDelete = async () => {
        if (!session?.user?.id) return;
        if (!confirm("Are you sure you want to delete your voice intro?")) return;

        try {
            // Update galaxy_profiles
            const { error: galaxyError } = await supabase.from('galaxy_profiles').update({
                voice_url: null
            }).eq('user_id', session.user.id);

            if (galaxyError) throw galaxyError;

            // Update local state
            setProfile(prev => ({ ...prev, voice_url: null }));

            // Sync to users table
            try {
                await supabase.from('users').update({ voice_url: null }).eq('id', session.user.id);
            } catch (userError) {
                console.warn("Failed to sync voice delete to users table:", userError);
            }

            toast.success("Voice intro deleted");
        } catch (e) {
            console.error("Voice delete error:", e);
            toast.error("Failed to delete voice intro");
        }
    };



    const handleVoiceUpload = async (url: string) => {
        if (!session?.user?.id) return;

        // Ensure user exists in public.users to satisfy FK constraint
        const userExists = await ensureUserExists();
        if (!userExists) return;

        try {
            // Update galaxy_profiles first (priority)
            const { error: galaxyError } = await supabase.from('galaxy_profiles').upsert({
                user_id: session.user.id,
                voice_url: url
            }, { onConflict: 'user_id' });

            if (galaxyError) throw galaxyError;

            // Update local state immediately
            setProfile(prev => ({ ...prev, voice_url: url }));

            // Try to update users table, but don't fail if it doesn't work
            try {
                await supabase.from('users').update({ voice_url: url }).eq('id', session.user.id);
            } catch (userError) {
                console.warn("Failed to sync voice to users table:", userError);
            }

            toast.success("Voice intro updated!");
        } catch (e) {
            console.error("Voice save error:", e);
            toast.error("Failed to save voice intro");
        }
    };

    const handleProfileUpdate = (updates: any) => {
        setProfile(prev => ({ ...prev, ...updates }));
    };

    // Handle photo changes and invalidate verification if main photo changes
    const handlePhotoChange = async (newPhotos: string[]) => {
        const newMainPhoto = newPhotos[0];
        const currentMainPhoto = profile.photos[0];

        // If user is verified and main photo changed, remove verification
        if (isVerified && originalMainPhoto && newMainPhoto !== originalMainPhoto) {
            try {
                // Remove verification from database
                const { error } = await supabase
                    .from('users')
                    .update({
                        face_verified: false,
                        face_verified_at: null
                    })
                    .eq('id', session?.user?.id);

                if (!error) {
                    setIsVerified(false);
                    setOriginalMainPhoto(null);
                    toast.info('Main photo changed - please re-verify your face');
                }
            } catch (e) {
                console.error('Error removing verification:', e);
            }
        }

        // Update photos
        setProfile(prev => ({ ...prev, photos: newPhotos }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white p-4 pb-0">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center mb-8 pt-20">
                    <Skeleton className="h-10 w-48 rounded-lg" />
                    <Skeleton className="h-10 w-24 rounded-full" />
                </div>

                {/* Photos Skeleton */}
                <div className="mb-8">
                    <Skeleton className="h-6 w-20 mb-4 rounded-md" />
                    <div className="aspect-[3/4] w-full rounded-3xl overflow-hidden relative border border-white/10">
                        <Skeleton className="w-full h-full" />
                    </div>
                </div>

                {/* Voice Intro Skeleton */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3 ml-1">
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <Skeleton className="h-5 w-32 rounded-md" />
                    </div>
                    <Skeleton className="h-32 w-full rounded-3xl" />
                </div>

                {/* Details Skeleton */}
                <div className="space-y-6">
                    <div>
                        <Skeleton className="h-5 w-24 mb-3 ml-1 rounded-md" />
                        <Skeleton className="h-40 w-full rounded-2xl" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-32 w-full rounded-2xl" />
                        <Skeleton className="h-32 w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }


    const handleUpdateLocation = async () => {
        if (!session?.user?.id) return;
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        toast.loading("Getting location...");

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;

            try {
                let locationName = "";

                try {
                    // 1. Reverse Geocode (OpenStreetMap Nominatim - Free, no key required)
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();

                    const address = data.address;
                    // Try to construct a friendly location name (e.g. "Bangalore, Karnataka")
                    const city = address.city || address.town || address.village || address.suburb;
                    const state = address.state || address.counties;
                    // const country = address.country;

                    if (city) {
                        locationName = state ? `${city}, ${state}` : city;
                    } else if (address.county) {
                        locationName = address.county;
                    }
                } catch (geoError) {
                    console.warn("Reverse geocoding failed", geoError);
                    // Non-fatal, we still save coordinates
                }

                // 2. Upsert to galaxy_profiles
                const updates: any = {
                    latitude,
                    longitude,
                };

                if (locationName) {
                    updates.location = locationName;
                }

                const { error } = await supabase
                    .from('galaxy_profiles')
                    .update(updates)
                    .eq('user_id', session.user.id);

                if (error) throw error;

                // Update local state
                setProfile(prev => ({
                    ...prev,
                    location: locationName || prev.location
                }));

                toast.dismiss();
                toast.success("Location updated successfully!");
                // Also trigger a refresh of profile if needed
                fetchProfile();

            } catch (err) {
                console.error("Error saving location:", err);
                toast.dismiss();
                toast.error("Failed to save location");
            }
        }, (error) => {
            console.error("Geo error:", error);
            toast.dismiss();
            toast.error("Could not retrieve location. Please allow permissions.");
        });
    };

    return (
        <div className="h-full w-full overflow-y-auto bg-black text-white pb-4 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Floating Save Button (Edit Mode) */}
            {isEditing && (
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="fixed bottom-24 right-6 z-50"
                >
                    <button
                        onClick={handleSave}
                        className="px-6 py-3 bg-white text-black rounded-full font-bold shadow-lg shadow-purple-500/20 flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                        <Check size={20} /> Save Changes
                    </button>
                </motion.div>
            )}

            {isEditing ? (
                <div className="p-4 pt-6 pb-32 space-y-10">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium text-white/70 hover:text-white transition-all"
                        >
                            Cancel
                        </button>
                    </div>

                    <div className="space-y-10 mt-6">
                        {/* 1. Photos */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider ml-1">Photos</h3>
                            <PhotoGrid
                                photos={profile.photos}
                                onChange={handlePhotoChange}
                            />
                        </div>

                        {/* 2. Profile Editor (Fields) */}
                        <ProfileEditor
                            key={profile.location}
                            data={profile}
                            onChange={(data) => setProfile({ ...profile, ...data })}
                        />

                        {/* 3. Voice Intro */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 ml-1">
                                <Mic className="text-pink-500" size={18} />
                                <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Voice Intro</h3>
                            </div>
                            <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-1 border border-white/10 shadow-xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative bg-white/5 backdrop-blur-sm rounded-[22px] p-6">
                                    {session?.user?.id && (
                                        <VoiceRecorder
                                            userId={session.user.id}
                                            onUploadComplete={handleVoiceUpload}
                                            initialAudioUrl={profile.voice_url}
                                            onDelete={handleVoiceDelete}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 4. Verification */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 ml-1">
                                <Shield className="text-cyan-500" size={18} />
                                <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Verification</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setActiveVerification('face')}
                                    className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <User className="text-cyan-400" size={20} />
                                    </div>
                                    <span className="text-sm font-medium text-white/80">
                                        {isVerified ? 'Re-verify' : 'Face Verify'}
                                    </span>
                                    {isVerified && (
                                        <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                            <Check size={12} strokeWidth={3} className="text-white" />
                                        </div>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveVerification('college')}
                                    className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <GraduationCap className="text-purple-400" size={20} />
                                    </div>
                                    <span className="text-sm font-medium text-white/80">Student Verify</span>
                                </button>
                            </div>
                        </div>

                        {/* 5. Location */}
                        <div className="flex justify-center">
                            <button
                                onClick={handleUpdateLocation}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-xs font-medium text-white/60 hover:text-white transition-colors"
                            >
                                <MapPin size={14} />
                                Update My Location
                            </button>
                        </div>

                        {/* 6. Settings Links */}
                        <div className="space-y-3 pt-6 border-t border-white/10">
                            <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider ml-1 mb-2">Settings</h3>

                            {/* Discovery Preferences */}
                            <button
                                onClick={() => router.push('/galaxy/discovery/preferences')}
                                className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 flex items-center justify-between px-6 group transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                                        <SlidersHorizontal className="text-purple-400" size={18} />
                                    </div>
                                    <span className="font-medium text-white/90">Discovery Preferences</span>
                                </div>
                                <ArrowRight className="text-white/40 group-hover:text-white transition-colors" />
                            </button>

                            {/* Switch to Classic Mode */}
                            <button
                                onClick={() => router.push('/lobby')}
                                className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 flex items-center justify-between px-6 group transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                        <ArrowRight className="text-blue-400" size={18} />
                                    </div>
                                    <span className="font-medium text-white/90">Switch to Classic Mode</span>
                                </div>
                                <ArrowRight className="text-white/40 group-hover:text-white transition-colors" />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* HINGE STYLE VIEW MODE */
                <div className="flex flex-col min-h-full">
                    {/* Hinge-style Header */}
                    <div className="flex items-center justify-between px-6 pb-4 pt-[calc(env(safe-area-inset-top)+1.5rem)] sticky top-0 bg-black/80 backdrop-blur-md z-30">
                        <h1 className="text-xl font-bold tracking-tight text-white font-serif">BlindCharm</h1>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/galaxy/discovery/preferences')}
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors"
                            >
                                <SlidersHorizontal size={20} strokeWidth={2} />
                            </button>
                            {/* Toggle Edit Mode via Settings Icon too, or just extra settings */}
                            <button
                                onClick={() => router.push('/galaxy/settings')}
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors"
                            >
                                <Settings size={20} strokeWidth={2} />
                            </button>
                            {isAdmin && (
                                <button
                                    onClick={() => router.push('/admin')}
                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-full text-red-500 hover:text-red-400 transition-colors"
                                >
                                    <Shield size={20} strokeWidth={2} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Hero Section: Avatar & Name */}
                    <div className="flex flex-col items-center mt-6 mb-8 relative px-4">
                        <div className="relative">
                            {/* Rings */}
                            <div className="absolute -inset-1 bg-gradient-to-br from-red-500 to-red-600 rounded-full opacity-70 blur-sm" />
                            <div className="relative w-32 h-32 rounded-full p-[3px] bg-black">
                                <div className="w-full h-full rounded-full overflow-hidden relative bg-zinc-900 border-2 border-white/10">
                                    {profile.photos[0] ? (
                                        <img src={profile.photos[0]} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                            <User size={40} className="text-white/20" />
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="absolute top-1 right-1 p-1.5 bg-white text-black rounded-full shadow-lg border-2 border-black hover:scale-110 transition-transform z-10"
                                >
                                    <Edit2 size={12} />
                                </button>

                                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-black transition-all ${profileCompletionPercentage === 100
                                    ? 'bg-green-500'
                                    : profileCompletionPercentage >= 70
                                        ? 'bg-purple-600'
                                        : 'bg-orange-500'
                                    }`}>
                                    {profileCompletionPercentage}%
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col items-center gap-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-bold">
                                    {profile.full_name || 'Your Name'}
                                    {profile.birth_date && !isNaN(new Date(profile.birth_date).getTime()) && (
                                        <span className="ml-2 font-normal opacity-70">
                                            {new Date().getFullYear() - new Date(profile.birth_date).getFullYear()}
                                        </span>
                                    )}
                                </h2>
                                {isVerified && (
                                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white pb-0.5" title="Verified Member">
                                        <Check size={12} strokeWidth={4} />
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-white/50">{profile.job_title || 'BlindCharm Member'}</p>
                        </div>
                    </div>

                    {/* Action Cards Stack */}
                    <div className="px-4 space-y-4 pb-20">
                        {/* Complete Profile Card */}
                        <motion.div
                            whileTap={{ scale: 0.98 }}
                            className="bg-black border border-white/10 rounded-[32px] p-6 text-white flex flex-col items-center text-center shadow-lg shadow-white/5 relative overflow-hidden"
                        >
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 text-black font-serif text-xl relative z-10 shadow-xl">
                                B
                            </div>

                            <h3 className="text-xl font-bold mb-2 relative z-10">Complete your profile</h3>
                            <p className="text-white/60 text-sm mb-6 max-w-[220px] relative z-10 leading-relaxed">
                                You're almost there – just a few more details to start matching.
                            </p>

                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full py-4 px-6 rounded-full border-2 border-white/10 font-bold hover:bg-white hover:text-black transition-all text-sm uppercase tracking-wide relative z-10"
                            >
                                Edit profile
                            </button>

                            {/* Background decoration */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-zinc-800 rounded-full blur-2xl opacity-50 z-0" />
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-900/40 rounded-full blur-2xl opacity-50 z-0" />
                        </motion.div>

                        {/* Verification Card */}
                        <div
                            onClick={() => { setIsEditing(true); setTimeout(() => setActiveVerification('face'), 100); }}
                            className="bg-zinc-900/50 border border-white/5 rounded-[24px] p-5 flex items-center gap-5 hover:bg-zinc-900 transition-colors cursor-pointer group"
                        >
                            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                                <Shield size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-base text-white/90">Safety Centre</h3>
                                <p className="text-xs text-white/40 mt-0.5">Get verified & stay safe</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                <ArrowRight size={14} className="text-white/40" />
                            </div>
                        </div>

                        {/* Help / Tips Card */}
                        <div
                            onClick={() => router.push('/galaxy/dating-tips')}
                            className="bg-zinc-900/50 border border-white/5 rounded-[24px] p-5 flex items-center gap-5 hover:bg-zinc-900 transition-colors cursor-pointer group"
                        >
                            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                <Sparkles size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-base text-white/90">What Works</h3>
                                <p className="text-xs text-white/40 mt-0.5">Check out our expert dating tips</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                <ArrowRight size={14} className="text-white/40" />
                            </div>
                        </div>

                        {/* Admin Link (Desktop/Bottom Fallback) */}
                        {isAdmin && (
                            <div className="flex justify-center mt-8 mb-2">
                                <button
                                    onClick={() => router.push('/admin')}
                                    className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-red-500/20 rounded-full text-red-400 font-medium hover:bg-zinc-800 transition-colors"
                                >
                                    <Shield size={18} /> Open Admin Portal
                                </button>
                            </div>
                        )}

                        {/* Contact Support Section */}
                        <div className="px-6 pb-6 mt-2 text-center">
                            <button
                                onClick={() => setShowContactSupport(true)}
                                className="text-xs font-medium text-white/60 hover:text-white transition-colors uppercase tracking-widest"
                            >
                                Help & Support
                            </button>
                        </div>

                        <GalaxyContactSupport
                            isOpen={showContactSupport}
                            onClose={() => setShowContactSupport(false)}
                        />

                    </div>
                </div>
            )}

            {/* Verification Modals */}
            <AnimatePresence>
                {activeVerification === 'face' && (
                    <GalaxyFaceVerification
                        profilePhotoUrl={profile.photos[0] || undefined}
                        onClose={() => setActiveVerification(null)}
                        onVerificationComplete={(success) => {
                            if (success) {
                                toast.success('Face verified successfully!');
                                setActiveVerification(null);
                                // Ideally refresh profile or update local state
                            } else {
                                toast.error('Verification failed');
                            }
                        }}
                    />
                )}
                {activeVerification === 'college' && (
                    <GalaxyCollegeVerification
                        onClose={() => setActiveVerification(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
