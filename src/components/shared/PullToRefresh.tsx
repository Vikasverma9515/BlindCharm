'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: React.ReactNode;
    threshold?: number; // Distance to pull to trigger refresh
    isPullable?: boolean; // Can be used to disable pull (e.g. if not at top of scroll)
}

export default function PullToRefresh({
    onRefresh,
    children,
    threshold = 100,
    isPullable = true
}: PullToRefreshProps) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const y = useMotionValue(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Transforms for the loading indicator
    const rotate = useTransform(y, [0, threshold], [0, 180]);
    const opacity = useTransform(y, [0, threshold / 2, threshold], [0, 0.5, 1]);
    const scale = useTransform(y, [0, threshold], [0.5, 1]);

    const handleDragEnd = async (event: any, info: any) => {
        setIsDragging(false);
        const pulledDistance = y.get();

        if (pulledDistance > threshold && !isRefreshing) {
            setIsRefreshing(true);

            // Snap to open position
            animate(y, threshold - 20, { type: "spring", stiffness: 300, damping: 30 });

            try {
                // Haptic feedback if available
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(50);
                }

                await onRefresh();
            } finally {
                setIsRefreshing(false);
                // Snap back to 0
                animate(y, 0, { type: "spring", stiffness: 300, damping: 30 });
            }
        }
        // If threshold not met, Framer Motion automatically snaps back due to dragConstraints
    };

    return (
        <div ref={containerRef} className="relative h-full w-full overflow-hidden">
            {/* Loading Indicator Layer - Behind content but visible when pulled */}
            <div className="absolute top-0 left-0 right-0 flex justify-center pt-8 z-0 pointer-events-none">
                <motion.div
                    style={{ opacity, scale, y: useTransform(y, val => val / 2) }}
                    className="relative flex items-center justify-center w-12 h-12"
                >
                    {/* Mini Galaxy Loader */}
                    <div className="absolute inset-0 rounded-full bg-purple-900/30 blur-md" />

                    {/* Orbiting Rings */}
                    <motion.div
                        style={{ rotate }}
                        className="absolute inset-0 rounded-full border-2 border-purple-500/50 border-t-purple-300 border-r-transparent"
                    />
                    <motion.div
                        style={{ rotate: useTransform(rotate, r => r * -1.5) }}
                        className="absolute inset-2 rounded-full border-2 border-rose-500/50 border-b-rose-300 border-l-transparent"
                    />

                    {/* Core */}
                    <div className="z-10 w-4 h-4 rounded-full bg-gradient-to-tr from-purple-400 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                </motion.div>
            </div>

            {/* Content Layer - Draggable */}
            <motion.div
                className="h-full w-full relative z-10 bg-inherit"
                style={{ y }}
                drag={isPullable && !isRefreshing ? "y" : false}
                dragConstraints={{ top: 0, bottom: 0 }} // Constraints keep it "anchored"
                dragElastic={{ top: 0.6, bottom: 0 }} // Allow pulling down (top) with resistance, strict bottom
                onDragStart={() => setIsDragging(true)}
                onDragEnd={handleDragEnd}
            >
                {children}
            </motion.div>
        </div>
    );
}
