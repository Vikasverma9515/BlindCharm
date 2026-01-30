'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause } from 'lucide-react'
import { motion } from 'framer-motion'

interface VoiceMessageBubbleProps {
    audioUrl: string
    duration: number
    isOwnMessage: boolean
}

export default function VoiceMessageBubble({ audioUrl, duration, isOwnMessage }: VoiceMessageBubbleProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [loadError, setLoadError] = useState(false)
    const audioRef = useRef<HTMLAudioElement>(null)

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime)
        }

        const handleEnded = () => {
            setIsPlaying(false)
            setCurrentTime(0)
        }

        const handleError = () => {
            setLoadError(true)
            setIsPlaying(false)
        }

        audio.addEventListener('timeupdate', handleTimeUpdate)
        audio.addEventListener('ended', handleEnded)
        audio.addEventListener('error', handleError)

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate)
            audio.removeEventListener('ended', handleEnded)
            audio.removeEventListener('error', handleError)
        }
    }, [])

    const togglePlay = async () => {
        const audio = audioRef.current
        if (!audio) return

        if (isPlaying) {
            audio.pause()
            setIsPlaying(false)
        } else {
            try {
                await audio.play()
                setIsPlaying(true)
            } catch (error) {
                console.error('Failed to play audio:', error)
                setLoadError(true)
            }
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 max-w-[260px] ${isOwnMessage
                    ? 'bg-gradient-to-br from-purple-600 to-purple-500 text-white rounded-[20px] rounded-tr-md'
                    : 'bg-white/10 text-white rounded-[20px] rounded-tl-md'
                }`}
        >
            <audio ref={audioRef} src={audioUrl} preload="metadata" />

            {/* Play/Pause Button */}
            <button
                onClick={togglePlay}
                disabled={loadError}
                className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${isOwnMessage
                        ? 'bg-white/20 hover:bg-white/30 active:scale-95'
                        : 'bg-white/15 hover:bg-white/25 active:scale-95'
                    } ${loadError ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {loadError ? (
                    <span className="text-xs">❌</span>
                ) : isPlaying ? (
                    <Pause className="w-5 h-5" fill="currentColor" />
                ) : (
                    <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                )}
            </button>

            {/* Waveform / Progress Bar */}
            <div className="flex-1 flex flex-col gap-1.5">
                {/* Progress Bar */}
                <div className="relative h-1 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full ${isOwnMessage ? 'bg-white' : 'bg-purple-400'
                            }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.1 }}
                    />
                </div>

                {/* Duration */}
                <span className="text-xs opacity-70">
                    {isPlaying ? formatTime(currentTime) : formatTime(duration)}
                </span>
            </div>
        </div>
    )
}
