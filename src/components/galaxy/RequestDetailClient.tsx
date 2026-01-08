'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CardPreview from '@/components/profile/CardPreview';
import { respondToRequestAction } from '@/app/galaxy/actions';
import { ArrowLeft, Check, X, Loader2, Heart } from 'lucide-react';
import Link from 'next/link';

interface RequestDetailClientProps {
    profile: any;
    matchId: string;
}

export default function RequestDetailClient({ profile, matchId }: RequestDetailClientProps) {
    const router = useRouter();
    const [status, setStatus] = useState<'idle' | 'accepting' | 'rejecting'>('idle');

    const handleAction = async (action: 'accept' | 'reject') => {
        if (status !== 'idle') return;
        setStatus(action === 'accept' ? 'accepting' : 'rejecting');

        try {
            await respondToRequestAction(matchId, action);
            if (action === 'accept') {
                router.push(`/galaxy/chat/${matchId}`);
            } else {
                router.push('/galaxy/chat');
            }
            router.refresh();
        } catch (error) {
            console.error('Action failed:', error);
            setStatus('idle');
            // Optimistically we could toast here
        }
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 z-50 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                <Link href="/galaxy/chat" className="p-2 rounded-full bg-black/40 backdrop-blur text-white hover:bg-black/60 transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Incoming Request</span>
                </div>
                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Main Card Area */}
            <div className="flex-1 relative overflow-hidden">
                <CardPreview
                    profile={profile}
                    theme="modern"
                    color="#ec4899" // Pink brand color
                    mood="romantic"
                    border="none"
                />

                {/* Action Buttons Overlay - Matching SwipeDeck Style */}
                <div className="absolute bottom-32 left-0 right-0 px-8 z-[100] flex items-center justify-center gap-8 pointer-events-none pb-safe">
                    {/* Pass Button - Large & Red Accent */}
                    <button
                        onClick={() => handleAction('reject')}
                        disabled={status !== 'idle'}
                        className="pointer-events-auto w-16 h-16 rounded-full bg-neutral-900/80 backdrop-blur-md border-2 border-red-500/50 flex items-center justify-center transition-all duration-300 shadow-xl shadow-red-500/10 group hover:bg-red-500 hover:border-red-500 active:scale-95 hover:scale-110 hover:shadow-red-500/40 disabled:opacity-50"
                    >
                        {status === 'rejecting' ? (
                            <Loader2 className="animate-spin text-red-500 group-hover:text-white" size={28} />
                        ) : (
                            <X size={28} className="text-red-500 group-hover:text-white transition-colors duration-300" strokeWidth={3} />
                        )}
                    </button>

                    {/* Vibe Label - Visual Consistency */}
                    <div className="pointer-events-auto h-12 px-6 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center gap-2 shadow-lg -mb-2">
                        <span className="text-sm font-medium text-white/90 tracking-wide">Incoming</span>
                    </div>

                    {/* Like/Accept Button - Large & Vibrant Gradient */}
                    <button
                        onClick={() => handleAction('accept')}
                        disabled={status !== 'idle'}
                        className="pointer-events-auto w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-red-600 shadow-xl shadow-rose-500/30 border-2 border-white/20 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-rose-500/50 active:scale-95 hover:from-rose-400 hover:to-red-500 disabled:opacity-50 disabled:grayscale"
                    >
                        {status === 'accepting' ? (
                            <Loader2 className="animate-spin text-white" size={28} />
                        ) : (
                            <Heart size={28} fill="currentColor" strokeWidth={2} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
