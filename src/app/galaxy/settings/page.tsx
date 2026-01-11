'use client';

import { LogOut, ChevronLeft, Trash2, Pause, Shield, Bell, FileText, Heart, Lock, User, Mail, Smartphone, ChevronRight, Check } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { togglePauseActivityAction } from '@/app/galaxy/actions';
import GalaxyFaceVerification from '@/components/galaxy/profile/GalaxyFaceVerification';
import BlockedUsersModal from '@/components/galaxy/settings/BlockedUsersModal';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function SettingsPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [isPaused, setIsPaused] = useState(false);
    const [isTogglingPause, setIsTogglingPause] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [isFaceVerified, setIsFaceVerified] = useState(false);
    const [showFaceVerification, setShowFaceVerification] = useState(false);
    const [showBlockList, setShowBlockList] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

    const { isSubscribed, subscribe, unsubscribe } = usePushNotifications();

    // Load current pause state and user info
    useEffect(() => {
        const loadUserData = async () => {
            if (!session?.user?.id) return;

            console.log('Loading user data, session:', session);

            try {
                // Load pause state from galaxy_profiles
                const { data: profileData, error: profileError } = await supabase
                    .from('galaxy_profiles')
                    .select('is_paused, photos')
                    .eq('user_id', session.user.id)
                    .single();

                if (!profileError && profileData) {
                    setIsPaused(profileData.is_paused || false);
                    // Get main photo from galaxy_profiles
                    if (profileData.photos && profileData.photos.length > 0) {
                        setProfilePhoto(profileData.photos[0]);
                    }
                }

                // Load phone and email from users table
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('phone_number, email, face_verified, profile_picture')
                    .eq('id', session.user.id)
                    .single();

                console.log('User data from DB:', userData, 'Error:', userError);

                if (!userError && userData) {
                    setPhoneNumber(userData.phone_number);
                    setEmail(userData.email);
                    // setIsEmailVerified(userData.is_email_verified || false); // Column doesn't exist
                    setIsFaceVerified(userData.face_verified || false);

                    // Fallback to users.profile_picture if no photos in galaxy_profiles
                    if (!profileData?.photos?.[0] && userData.profile_picture) {
                        setProfilePhoto(userData.profile_picture);
                    }
                } else {
                    // Fallback: Try to get phone from session
                    const sessionPhone = (session.user as any).phone || (session.user as any).phoneNumber;
                    const sessionEmail = session.user.email;

                    console.log('Using session fallback - phone:', sessionPhone, 'email:', sessionEmail);

                    if (sessionPhone) setPhoneNumber(sessionPhone);
                    if (sessionEmail) {
                        setEmail(sessionEmail);
                        // Assume verified if in session
                        setIsEmailVerified(true);
                    }
                }
            } catch (e) {
                console.error('Failed to load user data:', e);
                // Final fallback: use session data
                const sessionPhone = (session.user as any).phone || (session.user as any).phoneNumber;
                const sessionEmail = session.user.email;
                if (sessionPhone) setPhoneNumber(sessionPhone);
                if (sessionEmail) setEmail(sessionEmail);
            }
        };
        loadUserData();
    }, [session]);

    const handleDeleteProfile = async () => {
        if (!session?.user?.id) return;
        if (!confirm("Are you sure you want to delete your Galaxy Profile? This cannot be undone.")) return;

        try {
            const { error } = await supabase
                .from('galaxy_profiles')
                .delete()
                .eq('user_id', session.user.id);

            if (error) throw error;

            toast.success("Galaxy Profile deleted");
            router.push('/galaxy/profile');
        } catch (e) {
            console.error("Delete profile error:", e);
            toast.error("Failed to delete profile");
        }
    };

    const handleTogglePause = async (newPauseState: boolean) => {
        if (isTogglingPause) return;
        setIsTogglingPause(true);
        try {
            await togglePauseActivityAction(newPauseState);
            setIsPaused(newPauseState);
            toast.success(newPauseState ? 'Activity paused - Your profile is now hidden' : 'Activity resumed - Your profile is now visible');
        } catch (e) {
            console.error('Failed to toggle pause:', e);
            toast.error('Failed to update pause status');
        } finally {
            setIsTogglingPause(false);
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

    const SettingItem = ({ icon: Icon, label, value, onClick, isDestructive, showToggle, toggleValue, onToggle }: any) => (
        <div
            onClick={onClick}
            className={`flex items-center justify-between p-4 border-b border-white/5 last:border-0 ${onClick ? 'cursor-pointer hover:bg-white/5 transition-colors' : ''}`}
        >
            <div className="flex items-center gap-3">
                {Icon && <Icon size={20} className={isDestructive ? "text-red-500" : "text-white/60"} />}
                <span className={`text-base font-medium ${isDestructive ? "text-red-500" : ""}`}>{label}</span>
            </div>

            <div className="flex items-center gap-2">
                {value && <span className="text-white/40 text-sm">{value}</span>}
                {showToggle && (
                    <div
                        className={`w-11 h-6 rounded-full relative transition-colors ${toggleValue ? 'bg-purple-600' : 'bg-white/20'}`}
                        onClick={(e) => { e.stopPropagation(); onToggle && onToggle(!toggleValue); }}
                    >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${toggleValue ? 'left-6' : 'left-1'}`} />
                    </div>
                )}
                {!showToggle && onClick && <ChevronRight size={16} className="text-white/20" />}
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
            <div className="shrink-0 z-30 bg-black/80 backdrop-blur-md px-6 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)] flex items-center gap-4 border-b border-white/5">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-lg font-bold">Account Settings</h1>
            </div>

            <div className="flex-1 overflow-y-auto pb-0 px-4 pt-4 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

                {/* 1. Status */}
                <SettingSection title="Status">
                    <SettingItem
                        icon={Pause}
                        label="Pause Activity"
                        showToggle
                        toggleValue={isPaused}
                        onToggle={handleTogglePause}
                    />
                </SettingSection>

                {/* 2. Account */}
                <SettingSection title="Account">
                    {phoneNumber && (
                        <SettingItem icon={Smartphone} label="Phone Number" value={phoneNumber} />
                    )}
                    {/* {isEmailVerified && email && (
                        <SettingItem icon={Mail} label="Email" value={email} />
                    )} */}
                </SettingSection>

                {/* 3. Safety */}
                <SettingSection title="Safety">
                    <SettingItem
                        icon={User}
                        label={isFaceVerified ? "Face Verified" : "Selfie Verification"}
                        value={isFaceVerified ? (
                            <div className="flex items-center gap-1 text-green-500">
                                <span>Verified</span>
                                <Check size={14} strokeWidth={3} />
                            </div>
                        ) : undefined}
                        onClick={() => {
                            if (isFaceVerified) {
                                toast.success("You are already verified!");
                                return;
                            }
                            setShowFaceVerification(true);
                        }}
                    />
                    <SettingItem icon={Lock} label="Block List" onClick={() => setShowBlockList(true)} />
                </SettingSection>

                {/* 4. Notifications */}
                <SettingSection title="Notifications">
                    <SettingItem
                        icon={Bell}
                        label="Push Notifications"
                        showToggle
                        toggleValue={isSubscribed}
                        onToggle={async (val: boolean) => {
                            if (val) {
                                const success = await subscribe();
                                if (success) toast.success('Notifications enabled');
                                else toast.error('Failed to enable notifications. Check permissions.');
                            } else {
                                const success = await unsubscribe();
                                if (success) toast.success('Notifications disabled');
                            }
                        }}
                    />
                    <SettingItem icon={Mail} label="Email Subscriptions" onClick={() => { }} />
                </SettingSection>

                {/* 5. Legal */}
                <SettingSection title="Legal">
                    <SettingItem icon={FileText} label="Terms of Service" onClick={() => router.push('/terms')} />
                    <SettingItem icon={FileText} label="Privacy Policy" onClick={() => router.push('/privacy')} />
                </SettingSection>

                {/* 6. Community */}
                <SettingSection title="Community">
                    <SettingItem icon={Shield} label="Safety Center" onClick={() => router.push('/safety')} />
                    <SettingItem icon={Heart} label="Dating Tips" onClick={() => router.push('/dating-tips')} />
                    <SettingItem icon={FileText} label="Community Guidelines" onClick={() => router.push('/community-guidelines')} />
                </SettingSection>

                {/* 7. Danger Zone */}
                <div className="mb-8">
                    <h3 className="uppercase text-xs font-bold text-red-500/60 tracking-wider mb-2 px-4">Danger Zone</h3>
                    <div className="bg-zinc-900 rounded-3xl overflow-hidden border border-red-500/10">
                        <SettingItem
                            icon={LogOut}
                            label="Sign Out"
                            onClick={() => signOut({ callbackUrl: '/' })}
                        />
                        <SettingItem
                            icon={Trash2}
                            label="Delete Account"
                            isDestructive
                            onClick={handleDeleteProfile}
                        />
                    </div>
                    <div className="px-4 py-4 text-center">
                        <p className="text-xs text-white/20">BlindCharm v2.2.0 • Galaxy Beta</p>
                    </div>
                </div>

            </div>

            {/* Face Verification Modal */}
            <AnimatePresence>
                {showFaceVerification && (
                    <GalaxyFaceVerification
                        profilePhotoUrl={profilePhoto || undefined}
                        onClose={() => setShowFaceVerification(false)}
                        onVerificationComplete={async (success) => {
                            if (success) {
                                toast.success('Face verified successfully!');
                                setIsFaceVerified(true);
                                setShowFaceVerification(false);
                                // Reload user data
                                if (session?.user?.id) {
                                    const { data } = await supabase
                                        .from('users')
                                        .select('face_verified')
                                        .eq('id', session.user.id)
                                        .single();
                                    if (data) setIsFaceVerified(data.face_verified || false);
                                }
                            } else {
                                toast.error('Verification failed');
                            }
                        }}
                    />
                )}
                {showBlockList && (
                    <BlockedUsersModal onClose={() => setShowBlockList(false)} />
                )}
            </AnimatePresence>
        </motion.div>
    );
}
