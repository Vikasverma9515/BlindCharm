// src/components/whispers/CreateWhisperForm.tsx

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Lock, Unlock } from 'lucide-react';
import { Whisper } from '@/types/whispers';

interface CreateWhisperFormProps {
  onSubmit: (whisper: Partial<Whisper>) => void;
}

export function CreateWhisperForm({ onSubmit }: CreateWhisperFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [selectedMood, setSelectedMood] = useState('mysterious');
  const [selectedCategory, setSelectedCategory] = useState('confession');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const moods = [
    { id: 'mysterious', emoji: '🤫', label: 'Mysterious' },
    { id: 'happy', emoji: '😊', label: 'Happy' },
    { id: 'sad', emoji: '😢', label: 'Sad' },
    { id: 'exciting', emoji: '🎉', label: 'Exciting' },
    { id: 'love', emoji: '❤️', label: 'Love' },
    { id: 'funny', emoji: '😂', label: 'Funny' },
  ];

  const categories = [
    'confession',
    'secret',
    'dream',
    'crush',
    'funny',
    'life-story',
  ];

  const backgroundThemes: Record<string, string> = {
    mysterious: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
    happy: 'bg-gradient-to-r from-yellow-300 to-orange-500 text-white',
    sad: 'bg-gradient-to-r from-blue-400 to-blue-600 text-white',
    exciting: 'bg-gradient-to-r from-red-500 to-pink-500 text-white',
    love: 'bg-gradient-to-r from-pink-400 to-red-500 text-white',
    funny: 'bg-gradient-to-r from-green-400 to-blue-500 text-white',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !session?.user?.id || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const whisper: Partial<Whisper> = {
        user_id: session.user.id,
        content: content.trim(),
        is_anonymous: isAnonymous,
        mood: selectedMood,
        category: selectedCategory,
        background_theme: backgroundThemes[selectedMood],
        likes_count: 0,
        comments_count: 0,
      };

      await onSubmit(whisper);
      setContent('');
      setIsAnonymous(true);
      setSelectedMood('mysterious');
      setSelectedCategory('confession');
    } catch (error) {
      console.error('Error submitting whisper:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Share a Whisper</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your secret whisper..."
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={4}
            maxLength={500}
            required
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {content.length}/500
          </div>
        </div>

        {/* Mood Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mood
          </label>
          <div className="flex flex-wrap gap-2">
            {moods.map((mood) => (
              <button
                key={mood.id}
                type="button"
                onClick={() => setSelectedMood(mood.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full border transition-colors ${
                  selectedMood === mood.id
                    ? 'bg-purple-100 border-purple-500 text-purple-700'
                    : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                }`}
                title={mood.label}
              >
                <span>{mood.emoji}</span>
                <span className="text-sm">{mood.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category and Anonymous Toggle */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                isAnonymous
                  ? 'bg-gray-100 border-gray-300 text-gray-700'
                  : 'bg-blue-100 border-blue-500 text-blue-700'
              }`}
            >
              {isAnonymous ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              <span className="text-sm">
                {isAnonymous ? 'Anonymous' : 'Public'}
              </span>
            </button>
          </div>
        </div>

        {/* Preview */}
        {content.trim() && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview
            </label>
            <div className={`p-4 rounded-lg ${backgroundThemes[selectedMood]}`}>
              <div className="flex items-center space-x-2 mb-2 opacity-75">
                {isAnonymous ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span className="text-sm">Anonymous</span>
                  </>
                ) : (
                  <span className="text-sm">{session?.user?.name || 'You'}</span>
                )}
                <span className="text-sm">•</span>
                <span className="text-sm">{moods.find(m => m.id === selectedMood)?.emoji}</span>
              </div>
              <p className="text-lg">{content}</p>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Sharing...' : 'Share Whisper'}
          </button>
        </div>
      </form>
    </div>
  );
}

