// src/components/voice/Waveform.tsx

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface WaveformProps {
  audioUrl?: string;
  audioLevel?: number;
  isPlaying?: boolean;
  isRecording?: boolean;
  className?: string;
  color?: string;
  barCount?: number;
  height?: number;
}

export const Waveform: React.FC<WaveformProps> = ({
  audioUrl,
  audioLevel = 0,
  isPlaying = false,
  isRecording = false,
  className = '',
  color = '#ef4444',
  barCount = 40,
  height = 60
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  // Generate static waveform data for recorded audio
  useEffect(() => {
    if (audioUrl && !isRecording) {
      generateWaveformData(audioUrl);
    }
  }, [audioUrl, isRecording]);

  // Generate waveform data from audio file
  const generateWaveformData = async (url: string) => {
    try {
      const audioContext = new AudioContext();
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const channelData = audioBuffer.getChannelData(0);
      const samples = barCount;
      const blockSize = Math.floor(channelData.length / samples);
      const waveform: number[] = [];
      
      for (let i = 0; i < samples; i++) {
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(channelData[i * blockSize + j]);
        }
        waveform.push(sum / blockSize);
      }
      
      // Normalize the data
      const max = Math.max(...waveform);
      const normalizedWaveform = waveform.map(val => (val / max) * 0.8 + 0.1);
      
      setWaveformData(normalizedWaveform);
      audioContext.close();
    } catch (error) {
      console.error('Error generating waveform:', error);
      // Fallback to random data
      setWaveformData(Array.from({ length: barCount }, () => Math.random() * 0.8 + 0.1));
    }
  };

  // Draw waveform on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const { width, height: canvasHeight } = canvas;
      ctx.clearRect(0, 0, width, canvasHeight);

      const barWidth = width / barCount;
      const centerY = canvasHeight / 2;

      for (let i = 0; i < barCount; i++) {
        let barHeight: number;

        if (isRecording) {
          // For recording, use audio level with some randomness
          const baseHeight = audioLevel * canvasHeight * 0.8;
          const randomFactor = 0.3 + Math.random() * 0.7;
          barHeight = Math.max(2, baseHeight * randomFactor);
        } else if (waveformData.length > 0) {
          // For playback, use static waveform data
          barHeight = waveformData[i] * canvasHeight * 0.8;
        } else {
          // Fallback to minimal bars
          barHeight = 2;
        }

        const x = i * barWidth + barWidth * 0.1;
        const barWidthActual = barWidth * 0.8;

        // Create gradient
        const gradient = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, color + '80');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, centerY - barHeight / 2, barWidthActual, barHeight);
      }

      if (isRecording || isPlaying) {
        animationFrameRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioLevel, isRecording, isPlaying, waveformData, color, barCount]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={300}
        height={height}
        className="w-full h-full"
        style={{ height: `${height}px` }}
      />
      
      {/* Recording pulse effect */}
      {isRecording && (
        <motion.div
          className="absolute inset-0 rounded-lg"
          style={{
            background: `linear-gradient(45deg, ${color}20, transparent)`
          }}
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.02, 1]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </div>
  );
};

// Simple animated bars for loading states
export const WaveformSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-gray-300 rounded-full"
          style={{ height: Math.random() * 30 + 10 }}
          animate={{
            scaleY: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};