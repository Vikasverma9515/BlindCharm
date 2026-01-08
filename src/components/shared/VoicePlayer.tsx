import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';

interface VoicePlayerProps {
    audioUrl: string;
    className?: string;
    onPlay?: () => void;
}

const VoicePlayer: React.FC<VoicePlayerProps> = ({ audioUrl, className = '', onPlay }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const wavesurfer = useRef<WaveSurfer | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    useEffect(() => {
        if (!containerRef.current) return;

        wavesurfer.current = WaveSurfer.create({
            container: containerRef.current,
            waveColor: 'rgba(255, 255, 255, 0.3)',
            progressColor: '#ec4899', // Pink-500
            cursorColor: 'transparent',
            barWidth: 2,
            barGap: 1,
            barRadius: 2,
            height: 30,
            normalize: true,
        });

        wavesurfer.current.load(audioUrl);

        wavesurfer.current.on('ready', () => {
            setDuration(wavesurfer.current?.getDuration() || 0);
        });

        wavesurfer.current.on('audioprocess', () => {
            setCurrentTime(wavesurfer.current?.getCurrentTime() || 0);
        });

        wavesurfer.current.on('finish', () => {
            setIsPlaying(false);
        });

        return () => {
            wavesurfer.current?.destroy();
        };
    }, [audioUrl]);

    const togglePlay = () => {
        if (wavesurfer.current) {
            if (isPlaying) {
                wavesurfer.current.pause();
            } else {
                wavesurfer.current.play();
                if (onPlay) onPlay();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 ${className}`}>
            <button
                onClick={togglePlay}
                className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-black hover:scale-105 transition-transform"
            >
                {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
            </button>

            <div className="flex-1 min-w-[100px]" ref={containerRef} />

            <span className="text-xs text-white/70 font-medium tabular-nums">
                {isPlaying ? formatTime(currentTime) : formatTime(duration)}
            </span>
        </div>
    );
};

export default VoicePlayer;
