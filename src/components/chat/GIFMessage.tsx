'use client';

import { useRef, useState, useEffect } from 'react';

interface GIFMessageProps {
    src: string;
    isOwnMessage: boolean;
}

export default function GIFMessage({ src, isOwnMessage }: GIFMessageProps) {
    const [isPlaying, setIsPlaying] = useState(true); // Play once on mount
    const [gifSrc, setGifSrc] = useState(src);
    const [staticSrc, setStaticSrc] = useState('');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const hasPlayedOnce = useRef(false);

    // Extract static frame from GIF for paused state
    useEffect(() => {
        if (!src) return;

        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.src = src;

        img.onload = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Set canvas size to match image
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw first frame
            ctx.drawImage(img, 0, 0);

            // Get static image as data URL
            const staticImage = canvas.toDataURL('image/png');
            setStaticSrc(staticImage);

            // After GIF plays once (assume ~3 seconds for average GIF)
            setTimeout(() => {
                if (!hasPlayedOnce.current) {
                    setIsPlaying(false);
                    hasPlayedOnce.current = true;
                }
            }, 3000);
        };

        img.onerror = () => {
            // If CORS fails, just use the GIF source
            console.warn('Could not extract static frame from GIF (CORS)');
        };
    }, [src]);

    const handleMouseEnter = () => {
        if (hasPlayedOnce.current) {
            setIsPlaying(true);
            // Add timestamp to force reload and replay
            setGifSrc(`${src}?t=${Date.now()}`);
        }
    };

    const handleMouseLeave = () => {
        if (hasPlayedOnce.current) {
            setIsPlaying(false);
        }
    };

    const handleClick = () => {
        if (hasPlayedOnce.current) {
            setIsPlaying(true);
            // Add timestamp to force reload and replay
            setGifSrc(`${src}?t=${Date.now()}`);

            // Auto-pause after playing once
            setTimeout(() => {
                setIsPlaying(false);
            }, 3000);
        }
    };

    return (
        <div
            className="rounded-xl overflow-hidden max-w-[250px] cursor-pointer relative group"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            {/* Hidden canvas for extracting static frame */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Show GIF when playing, static image when paused */}
            {isPlaying ? (
                <img
                    ref={imgRef}
                    src={gifSrc}
                    alt="GIF"
                    className="w-full h-auto"
                />
            ) : staticSrc ? (
                <img
                    src={staticSrc}
                    alt="GIF (paused)"
                    className="w-full h-auto"
                />
            ) : (
                <img
                    src={src}
                    alt="GIF"
                    className="w-full h-auto"
                />
            )}

            {/* Play indicator when paused */}
            {!isPlaying && hasPlayedOnce.current && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <svg
                            className="w-6 h-6 text-white ml-1"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
}
