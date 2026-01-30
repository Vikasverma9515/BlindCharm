'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function NotificationPrompter() {
    const { permission, requestPermission, subscribe, isSupported } = usePushNotifications();
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Only show if supported and permission is default (not yet granted or denied)
        // And if we haven't shown it recently (optional, but good UX)
        if (isSupported && permission.default) {
            const hasSeenPrompt = localStorage.getItem('notification_prompt_seen');
            if (!hasSeenPrompt) {
                // Delay slightly to not overwhelm on immediate load
                const timer = setTimeout(() => setShowPrompt(true), 3000);
                return () => clearTimeout(timer);
            }
        }
    }, [isSupported, permission.default]);

    const handleEnable = async () => {
        // First request permission
        const granted = await requestPermission();
        if (granted) {
            // If granted, attempt to subscribe immediately
            await subscribe();
        }
        setShowPrompt(false);
        localStorage.setItem('notification_prompt_seen', 'true');
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('notification_prompt_seen', 'true');
    };

    return (
        <AnimatePresence>
            {showPrompt && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none p-4 pb-20 sm:pb-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
                        onClick={handleDismiss}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ y: 100, opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 100, opacity: 0, scale: 0.95 }}
                        className="bg-zinc-900 border border-white/10 p-6 rounded-3xl shadow-2xl w-full max-w-sm pointer-events-auto relative overflow-hidden"
                    >
                        {/* Glow effect */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-purple-500/20 rounded-full blur-[50px] pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-4 border border-white/5">
                                <Bell className="text-purple-400" size={32} />
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">
                                Never Miss a Connection
                            </h3>
                            <p className="text-white/60 text-sm mb-6 leading-relaxed">
                                Enable notifications to get instant alerts for new matches and messages. Without this, you might miss your moment.
                            </p>

                            <div className="flex flex-col w-full gap-3">
                                <button
                                    onClick={handleEnable}
                                    className="w-full py-3.5 bg-white text-black rounded-xl font-bold text-sm tracking-wide hover:scale-[1.02] transition-transform active:scale-[0.98]"
                                >
                                    Enable Notifications
                                </button>
                                <button
                                    onClick={handleDismiss}
                                    className="w-full py-3.5 bg-white/5 text-white/60 rounded-xl font-medium text-sm hover:bg-white/10 transition-colors"
                                >
                                    Maybe Later
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
