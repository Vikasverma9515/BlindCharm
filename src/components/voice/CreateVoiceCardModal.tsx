// src/components/voice/CreateVoiceCardModal.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Tag, MessageSquare } from 'lucide-react';
import { VoiceRecorder } from './VoiceRecorder';
import { VoiceService } from '@/lib/services/VoiceService';
import { VoicePrompt, VoiceCardFormData } from '@/types/voice';

interface CreateVoiceCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

const MOOD_TAGS = [
  'Chill', 'Excited', 'Thoughtful', 'Playful', 'Mysterious', 'Confident',
  'Dreamy', 'Energetic', 'Calm', 'Adventurous', 'Romantic', 'Funny',
  'Deep', 'Creative', 'Spontaneous', 'Cozy', 'Bold', 'Gentle'
];

const VIBE_SUGGESTIONS = [
  'Late night thoughts',
  'Coffee shop vibes',
  'Road trip energy',
  'Rainy day mood',
  'Weekend warrior',
  'Midnight philosopher',
  'Morning person',
  'Creative soul',
  'Adventure seeker',
  'Hopeless romantic'
];

export const CreateVoiceCardModal: React.FC<CreateVoiceCardModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userId
}) => {
  const [step, setStep] = useState<'prompt' | 'record' | 'customize'>('prompt');
  const [selectedPrompt, setSelectedPrompt] = useState<VoicePrompt | null>(null);
  const [prompts, setPrompts] = useState<VoicePrompt[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [selectedMoodTags, setSelectedMoodTags] = useState<string[]>([]);
  const [quote, setQuote] = useState('');
  const [vibeDescription, setVibeDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPrompts();
      // Reset state when modal opens
      setStep('prompt');
      setSelectedPrompt(null);
      setAudioBlob(null);
      setSelectedMoodTags([]);
      setQuote('');
      setVibeDescription('');
      setError(null);
    }
  }, [isOpen]);

  const loadPrompts = async () => {
    try {
      const data = await VoiceService.getActivePrompts();
      setPrompts(data);
    } catch (err) {
      console.error('Error loading prompts:', err);
      setError('Failed to load prompts');
    }
  };

  const handlePromptSelect = (prompt: VoicePrompt) => {
    setSelectedPrompt(prompt);
    setStep('record');
  };

  const handleRecordingComplete = (blob: Blob, duration: number) => {
    setAudioBlob(blob);
    setAudioDuration(duration);
    setStep('customize');
  };

  const handleMoodTagToggle = (tag: string) => {
    setSelectedMoodTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag].slice(0, 5) // Max 5 tags
    );
  };

  const handleSubmit = async () => {
    if (!selectedPrompt || !audioBlob) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formData: VoiceCardFormData = {
        prompt_id: selectedPrompt.id,
        audio_blob: audioBlob,
        mood_tags: selectedMoodTags,
        quote: quote.trim() || undefined,
        vibe_description: vibeDescription.trim() || undefined
      };

      await VoiceService.createVoiceCard(formData, userId);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating voice card:', err);
      setError('Failed to create voice card. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step === 'record') {
      setStep('prompt');
      setSelectedPrompt(null);
    } else if (step === 'customize') {
      setStep('record');
      setAudioBlob(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Create Voice Card
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Step {step === 'prompt' ? '1' : step === 'record' ? '2' : '3'} of 3
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            {step === 'prompt' && (
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Choose Your Prompt
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Pick a question that sparks your interest
                  </p>
                </div>

                <div className="space-y-3">
                  {prompts.map((prompt) => (
                    <motion.button
                      key={prompt.id}
                      onClick={() => handlePromptSelect(prompt)}
                      className="w-full p-4 text-left bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-gray-900 dark:text-gray-100 font-medium mb-1">
                            {prompt.prompt_text}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                              {prompt.category}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Level {prompt.difficulty_level}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {step === 'record' && selectedPrompt && (
              <div className="p-6">
                <VoiceRecorder
                  prompt={selectedPrompt}
                  onRecordingComplete={handleRecordingComplete}
                  onCancel={handleBack}
                  maxDuration={8000}
                />
              </div>
            )}

            {step === 'customize' && (
              <div className="p-6 space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Tag className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Customize Your Card
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Add some personality to help others connect with you
                  </p>
                </div>

                {/* Mood Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Mood Tags (optional, max 5)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {MOOD_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleMoodTagToggle(tag)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedMoodTags.includes(tag)
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quote */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Add a Quote (optional)
                  </label>
                  <textarea
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    placeholder="Share a favorite quote or something meaningful..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={2}
                    maxLength={150}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {quote.length}/150 characters
                  </p>
                </div>

                {/* Vibe Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Vibe (optional)
                  </label>
                  <input
                    type="text"
                    value={vibeDescription}
                    onChange={(e) => setVibeDescription(e.target.value)}
                    placeholder="Describe your current vibe..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    maxLength={50}
                  />
                  
                  {/* Vibe Suggestions */}
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick suggestions:</p>
                    <div className="flex flex-wrap gap-1">
                      {VIBE_SUGGESTIONS.slice(0, 6).map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => setVibeDescription(suggestion)}
                          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex space-x-3">
              {step !== 'prompt' && (
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Back
                </button>
              )}
              
              {step === 'customize' && (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      <span>Create Voice Card</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};