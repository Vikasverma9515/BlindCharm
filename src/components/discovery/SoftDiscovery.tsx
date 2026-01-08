'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import IntentInput from './IntentInput';

interface SoftDiscoveryProps {
    onIntentSubmit: (intent: string) => void;
    onSkip: () => void;
}

export default function SoftDiscovery({ onIntentSubmit, onSkip }: SoftDiscoveryProps) {
    // Mock profiles for the blurred background stack
    const mockProfiles = [
        { color: 'bg-purple-500', rotate: -6, scale: 0.9 },
        { color: 'bg-blue-500', rotate: 6, scale: 0.95 },
        { color: 'bg-cyan-500', rotate: -2, scale: 1 },
    ];

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0A0A0A]">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-900/20 rounded-full blur-[120px]" />
            </div>

            {/* Logo Area */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-8 left-0 right-0 text-center z-20"
            >
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    BlindCharm
                </h1>
            </motion.div>

            {/* Blurred Card Stack */}
            <div className="relative w-full max-w-xs aspect-[3/4] mb-12 flex items-center justify-center">
                {mockProfiles.map((profile, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: profile.scale }}
                        transition={{ delay: index * 0.1, duration: 0.8 }}
                        className={`absolute inset-0 rounded-3xl ${profile.color} opacity-20 blur-xl`}
                        style={{
                            transform: `rotate(${profile.rotate}deg) scale(${profile.scale})`,
                        }}
                    />
                ))}

                {/* Central "Mystery" Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="absolute inset-4 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-blue-500/10" />
                    <div className="text-center p-6">
                        <div className="w-16 h-16 bg-white/10 rounded-full mx-auto mb-4 animate-pulse" />
                        <div className="h-2 w-24 bg-white/10 rounded-full mx-auto mb-2" />
                        <div className="h-2 w-16 bg-white/10 rounded-full mx-auto" />
                    </div>
                </motion.div>
            </div>

            {/* Input Section */}
            <div className="w-full relative z-30 -mt-20">
                <IntentInput onSubmit={onIntentSubmit} onSkip={onSkip} />
            </div>
        </div>
    );
}
