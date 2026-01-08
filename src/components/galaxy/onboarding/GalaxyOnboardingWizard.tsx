'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Camera, X } from 'lucide-react';
import { completeOnboarding } from '@/app/actions/galaxy-onboarding';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const GENDERS = ['Woman', 'Man', 'Non-binary', 'Prefer not to say'];

interface GalaxyOnboardingWizardProps {
    onComplete?: () => void;
}

export default function GalaxyOnboardingWizard({ onComplete }: GalaxyOnboardingWizardProps = {}) {
    const router = useRouter();
    const { data: session } = useSession();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        birth_date: '',
        gender: '',
        photos: [] as string[],
        interested_in: [] as string[]
    });

    // Total steps for minimal onboarding
    const TOTAL_STEPS = 5; // Name, Birthday, Gender, Photos, Preferences

    useEffect(() => {
        if (session?.user) {
            setFormData(prev => ({
                ...prev,
                full_name: session.user?.name || '',
                photos: (session.user as any)?.image ? [(session.user as any).image] : []
            }));
            // ensureUserRecord removed to avoid client-side 401
        }
    }, [session]);

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        if (step < TOTAL_STEPS - 1) {
            setStep(step + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !session?.user?.id) return;

        if (formData.photos.length >= 6) {
            toast.error("Maximum 6 photos allowed");
            return;
        }

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
            const filePath = `profile_photos/${fileName}`;

            // Use correct bucket
            const { error: uploadError } = await supabase.storage
                .from('profile-pictures')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('profile-pictures')
                .getPublicUrl(filePath);

            updateField('photos', [...formData.photos, publicUrl]);
            toast.success('Photo uploaded!');
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload photo');
        }
    };

    const handleRemovePhoto = (index: number) => {
        const newPhotos = [...formData.photos];
        newPhotos.splice(index, 1);
        updateField('photos', newPhotos);
    };

    const handleComplete = async () => {
        if (!session?.user?.id) return;
        setLoading(true);

        try {
            // Use Server Action to bypass client RLS issues
            const result = await completeOnboarding({
                full_name: formData.full_name,
                birth_date: formData.birth_date,
                gender: formData.gender,
                photos: formData.photos,
                interested_in: formData.interested_in
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success("Welcome to BlindCharm! 🌌");

            setTimeout(() => {
                if (onComplete) {
                    onComplete();
                } else {
                    router.push('/galaxy');
                }
            }, 1000);

        } catch (e: any) {
            console.error("Onboarding failed:", e);
            toast.error("Failed to complete profile: " + e.message);
            setLoading(false);
        }
    };

    // Step indicator dots
    const StepDots = () => (
        <div className="flex justify-center gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${i === step ? 'bg-purple-600 w-6' : 'bg-white/10 w-1.5'
                        }`}
                />
            ))}
        </div>
    );

    // FAB (Floating Action Button) - Bottom right like Hinge
    const NextButton = ({ disabled }: { disabled?: boolean }) => (
        <button
            onClick={handleNext}
            disabled={disabled || loading}
            className="fixed bottom-24 right-6 w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 z-50"
        >
            <ArrowRight size={24} />
        </button>
    );

    const renderNameStep = () => (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-white mb-2">
                    My name is
                </h1>
                <p className="text-sm text-white/50">
                    This is how it'll appear on your profile.
                </p>
            </div>

            <input
                type="text"
                value={formData.full_name}
                onChange={(e) => updateField('full_name', e.target.value)}
                className="w-full border-b border-white/20 focus:border-purple-500 outline-none font-sans py-2 bg-transparent text-white placeholder:text-white/20 transition-all duration-300 ease-in-out"
                style={{ fontSize: '30px' }}
                placeholder="Name"
                autoFocus
            />

            <NextButton disabled={!formData.full_name.trim()} />
        </div>
    );

    const renderBirthdayStep = () => (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-white mb-2">
                    My birthday is
                </h1>
                <p className="text-sm text-white/50">
                    Your age will be public.
                </p>
            </div>

            <input
                type="date"
                value={formData.birth_date}
                onChange={(e) => updateField('birth_date', e.target.value)}
                className="w-full border-b border-white/20 focus:border-purple-500 outline-none font-sans py-2 bg-transparent text-white transition-all duration-300 ease-in-out"
                style={{ fontSize: '30px' }}
                autoFocus
            />

            <NextButton disabled={!formData.birth_date} />
        </div>
    );

    const renderGenderStep = () => (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-white mb-2">
                    I am a
                </h1>
            </div>

            <div className="space-y-2">
                {GENDERS.map((gender) => (
                    <button
                        key={gender}
                        onClick={() => updateField('gender', gender)}
                        className={`w-full p-3.5 rounded-lg border text-left text-base font-medium transition-all ${formData.gender === gender
                            ? 'border-purple-500 bg-purple-500/20 text-white'
                            : 'border-white/10 text-white/60 hover:bg-white/5 hover:border-white/20'
                            }`}
                    >
                        {gender}
                    </button>
                ))}
            </div>

            <NextButton disabled={!formData.gender} />
        </div>
    );

    const renderPhotoStep = () => (
        <div className="flex flex-col h-full animate-in slide-in-from-right fade-in duration-300">
            <h1 className="text-3xl font-serif font-bold text-white mb-2">
                Add photos
            </h1>
            <p className="text-white/60 text-lg mb-8">
                Let's put a face to the name. Max 6 photos.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-6">
                {[0, 1, 2, 3, 4, 5].map((i) => {
                    const photo = formData.photos[i];
                    if (photo) {
                        return (
                            <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden group bg-white/5 border border-white/10">
                                <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                                {i === 0 && (
                                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-[9px] font-bold text-white uppercase tracking-wider border border-white/10">
                                        Main
                                    </div>
                                )}
                                <button
                                    onClick={() => handleRemovePhoto(i)}
                                    className="absolute top-1 right-1 p-1 bg-black/60 rounded-full hover:bg-red-500/80 transition-colors"
                                >
                                    <X size={12} className="text-white" />
                                </button>
                            </div>
                        );
                    } else if (i === formData.photos.length) {
                        return (
                            <label key={i} className="relative aspect-[3/4] rounded-xl border-2 border-dashed border-white/20 hover:border-purple-500 hover:bg-purple-500/10 transition-all flex flex-col items-center justify-center cursor-pointer group">
                                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <span className="text-white text-lg leading-none">+</span>
                                </div>
                                <span className="text-xs text-white/40 font-medium">Add</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                />
                            </label>
                        );
                    } else {
                        return (
                            <div key={i} className="aspect-[3/4] border border-dashed border-white/5 rounded-lg opacity-30" />
                        );
                    }
                })}
            </div>

            <div className="bg-white/5 rounded-lg p-3 flex gap-2 items-start mb-6">
                <div className="text-lg">💡</div>
                <div className="text-xs text-white/60 leading-relaxed">
                    <span className="text-white font-medium block mb-0.5">Tip</span>
                    Solo photos where you can see your face clearly work best.
                </div>
            </div>

            <NextButton
                disabled={formData.photos.length === 0}
            />
        </div>
    );

    const renderPreferenceStep = () => (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-white mb-2">
                    I'm interested in
                </h1>
                <p className="text-sm text-white/50">
                    Select everyone you're open to meeting.
                </p>
            </div>

            <div className="space-y-2">
                {['Women', 'Men', 'Everyone'].map((option) => {
                    // Map option to stored value
                    const storedValue = option === 'Women' ? 'female' : (option === 'Men' ? 'male' : 'everyone');
                    const isSelected = formData.interested_in.includes(storedValue);

                    return (
                        <button
                            key={option}
                            onClick={() => {
                                // For simplicity, let's treat it as single select for now as per Hinge style often (or toggle)
                                // But since backend supports array, let's toggle.
                                let newInterests = [...formData.interested_in];
                                if (option === 'Everyone') {
                                    newInterests = ['everyone'];
                                } else {
                                    // Remove 'everyone' if specific gender selected
                                    if (newInterests.includes('everyone')) newInterests = [];

                                    if (newInterests.includes(storedValue)) {
                                        newInterests = newInterests.filter(i => i !== storedValue);
                                    } else {
                                        newInterests.push(storedValue);
                                    }
                                }
                                updateField('interested_in', newInterests);
                            }}
                            className={`w-full p-3.5 rounded-lg border text-left text-base font-medium transition-all flex justify-between items-center ${isSelected
                                ? 'border-purple-500 bg-purple-500/20 text-white'
                                : 'border-white/10 text-white/60 hover:bg-white/5 hover:border-white/20'
                                }`}
                        >
                            <span>{option}</span>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-purple-500" />}
                        </button>
                    );
                })}
            </div>

            <NextButton disabled={formData.interested_in.length === 0} />
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white relative">
            {/* Step Indicators centered at top */}
            <div className="fixed top-24 left-0 right-0 z-40 flex justify-center pointer-events-none">
                <StepDots />
            </div>

            {/* Back Button - Bottom Left */}
            {step > 0 && (
                <button
                    onClick={handleBack}
                    className="fixed bottom-24 left-6 w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-white backdrop-blur-md shadow-lg hover:bg-white/20 transition-all hover:scale-105 z-50"
                >
                    <ArrowRight size={24} className="rotate-180" />
                </button>
            )}

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-md mx-auto px-6 pt-32 pb-32 flex flex-col min-h-screen"
                >
                    <div className="flex-1 flex flex-col justify-start max-w-sm mx-auto w-full">
                        {step === 0 && renderNameStep()}
                        {step === 1 && renderBirthdayStep()}
                        {step === 2 && renderGenderStep()}
                        {step === 3 && renderPhotoStep()}
                        {step === 4 && renderPreferenceStep()}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
