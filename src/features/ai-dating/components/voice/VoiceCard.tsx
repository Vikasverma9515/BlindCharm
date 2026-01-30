// src/components/voice/VoiceCard.tsx

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  Heart, 
  X, 
  ArrowUp,
  MoreHorizontal,
  Flag,
  Clock
} from 'lucide-react';
import { VoiceCard as VoiceCardType } from '@/types/voice';
import { Waveform } from './Waveform';

interface VoiceCardProps {
  card: VoiceCardType;
  onSwipe: (direction: 'left' | 'right' | 'up') => void;
  onReport?: () => void;
  className?: string;
  isSwipeable?: boolean;
}

export const VoiceCard: React.FC<VoiceCardProps> = ({
  card,
  onSwipe,
  onReport,
  className = '',
  isSwipeable = true
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayPause = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(card.audio_url);
      
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });
      
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatDuration = (seconds: number) => {
    return `${Math.floor(seconds)}s`;
  };

  const getGradientColors = () => {
    const gradients = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-teal-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-pink-500 to-rose-500'
    ];
    
    // Use card ID to consistently pick a gradient
    const index = card.id.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  return (
    <motion.div
      className={`relative w-full max-w-sm mx-auto bg-gradient-to-br ${getGradientColors()} rounded-3xl shadow-2xl overflow-hidden ${className}`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      whileHover={isSwipeable ? { scale: 1.02 } : {}}
      drag={isSwipeable ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        if (!isSwipeable) return;
        
        const threshold = 100;
        if (info.offset.x > threshold) {
          onSwipe('right');
        } else if (info.offset.x < -threshold) {
          onSwipe('left');
        }
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
                             radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)`
          }}
        />
      </div>

      {/* Header */}
      <div className="relative p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Volume2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-white/90 text-sm font-medium">
                {card.user?.username || 'Anonymous'}
              </span>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 mb-3">
              <p className="text-white text-sm font-medium leading-relaxed">
                {card.prompt?.prompt_text}
              </p>
            </div>
          </div>

          {/* Menu Button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Menu Dropdown */}
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-16 right-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-10"
          >
            <button
              onClick={() => {
                onReport?.();
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
            >
              <Flag className="w-4 h-4" />
              <span>Report</span>
            </button>
          </motion.div>
        )}

        {/* Quote */}
        {card.quote && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 mb-3">
            <p className="text-white/90 text-sm italic">"{card.quote}"</p>
          </div>
        )}

        {/* Mood Tags */}
        {card.mood_tags && card.mood_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {card.mood_tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Audio Player */}
      <div className="px-6 pb-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          {/* Waveform */}
          <div className="mb-4">
            <Waveform
              audioUrl={card.audio_url}
              isPlaying={isPlaying}
              color="#ffffff"
              height={60}
              className="w-full"
            />
          </div>

          {/* Audio Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePlayPause}
              className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <div className="flex items-center space-x-2 text-white/80 text-sm">
              <Clock className="w-4 h-4" />
              <span>
                {formatDuration(currentTime)} / {formatDuration(card.audio_duration)}
              </span>
            </div>
          </div>
        </div>

        {/* Vibe Description */}
        {card.vibe_description && (
          <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
            <p className="text-white/90 text-sm">
              <span className="text-white/70">Vibe: </span>
              {card.vibe_description}
            </p>
          </div>
        )}
      </div>

      {/* Swipe Actions (only show if swipeable) */}
      {isSwipeable && (
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex justify-center space-x-4">
            <motion.button
              onClick={() => onSwipe('left')}
              className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6" />
            </motion.button>

            <motion.button
              onClick={() => onSwipe('up')}
              className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowUp className="w-6 h-6" />
            </motion.button>

            <motion.button
              onClick={() => onSwipe('right')}
              className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Swipe Hints */}
          <div className="flex justify-between mt-2 px-2">
            <span className="text-white/60 text-xs">Pass</span>
            <span className="text-white/60 text-xs">Super</span>
            <span className="text-white/60 text-xs">Like</span>
          </div>
        </div>
      )}

      {/* Swipe Indicators */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0 }}
      >
        <div className="text-6xl font-bold text-white/80">
          {/* This will be animated during swipe gestures */}
        </div>
      </motion.div>
    </motion.div>
  );
};