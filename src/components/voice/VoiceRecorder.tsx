// src/components/voice/VoiceRecorder.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  RotateCcw, 
  Check,
  MicOff,
  Volume2
} from 'lucide-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { Waveform } from './Waveform';
import { VoicePrompt } from '@/types/voice';

interface VoiceRecorderProps {
  prompt: VoicePrompt;
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
  maxDuration?: number;
  className?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  prompt,
  onRecordingComplete,
  onCancel,
  maxDuration = 8000,
  className = ''
}) => {
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [playbackAudio, setPlaybackAudio] = useState<HTMLAudioElement | null>(null);

  const {
    isRecording,
    isPaused,
    recordingTime,
    audioLevel,
    recording,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
    error
  } = useAudioRecorder(maxDuration);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const remainingMs = ms % 1000;
    return `${seconds}.${Math.floor(remainingMs / 100)}s`;
  };

  const handlePlayback = () => {
    if (!recording) return;

    if (isPlayingBack) {
      playbackAudio?.pause();
      setIsPlayingBack(false);
    } else {
      const audio = new Audio(recording.url);
      setPlaybackAudio(audio);
      
      audio.addEventListener('ended', () => {
        setIsPlayingBack(false);
      });
      
      audio.play();
      setIsPlayingBack(true);
    }
  };

  const handleConfirm = () => {
    if (recording) {
      onRecordingComplete(recording.blob, recording.duration);
    }
  };

  const progressPercentage = (recordingTime / maxDuration) * 100;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl ${className}`}>
      {/* Prompt Display */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium mb-3">
          {prompt.category}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {prompt.prompt_text}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Record your response (max {maxDuration / 1000}s)
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <MicOff className="w-4 h-4 text-red-500 mr-2" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Recording Interface */}
      <div className="space-y-6">
        {/* Waveform Visualization */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
          <Waveform
            audioUrl={recording?.url}
            audioLevel={audioLevel}
            isRecording={isRecording && !isPaused}
            isPlaying={isPlayingBack}
            color="#8b5cf6"
            height={80}
            className="w-full"
          />
        </div>

        {/* Recording Controls */}
        <div className="flex items-center justify-center space-x-4">
          {!recording ? (
            // Recording Phase
            <>
              <motion.button
                onClick={isRecording ? (isPaused ? resumeRecording : pauseRecording) : startRecording}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg ${
                  isRecording 
                    ? 'bg-orange-500 hover:bg-orange-600' 
                    : 'bg-red-500 hover:bg-red-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!!error}
              >
                {isRecording ? (
                  isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </motion.button>

              {isRecording && (
                <motion.button
                  onClick={stopRecording}
                  className="w-12 h-12 rounded-full bg-gray-500 hover:bg-gray-600 text-white flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <Square className="w-5 h-5" />
                </motion.button>
              )}
            </>
          ) : (
            // Playback Phase
            <>
              <motion.button
                onClick={handlePlayback}
                className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isPlayingBack ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </motion.button>

              <motion.button
                onClick={clearRecording}
                className="w-12 h-12 rounded-full bg-gray-500 hover:bg-gray-600 text-white flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw className="w-5 h-5" />
              </motion.button>

              <motion.button
                onClick={handleConfirm}
                className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Check className="w-5 h-5" />
              </motion.button>
            </>
          )}
        </div>

        {/* Recording Info */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Volume2 className="w-4 h-4" />
              <span>{formatTime(recordingTime)}</span>
            </div>
            <div className="text-gray-400">
              / {formatTime(maxDuration)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-purple-500 h-2 rounded-full"
              style={{ width: `${progressPercentage}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {recording && (
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
              Recording complete! Review and confirm to continue.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          
          {recording && (
            <button
              onClick={handleConfirm}
              className="flex-1 py-3 px-4 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors"
            >
              Use This Recording
            </button>
          )}
        </div>
      </div>

      {/* Recording Status Indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <motion.div
              className="w-2 h-2 bg-white rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};