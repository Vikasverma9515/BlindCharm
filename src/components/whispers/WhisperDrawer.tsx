'use client'

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Sparkles, 
  Loader2, 
  Heart, 
  MessageCircle, 
  Lock, 
  Moon, 
  Sun, 
  CloudRain, 
  Zap, 
  Shield,
  Cloud,
  Smile,
  BookOpen,
  Theater,
  User
} from 'lucide-react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Whisper } from '@/types/whispers';

interface WhisperDrawerProps {
  children: React.ReactNode;
  onSubmit: (whisper: Partial<Whisper>) => void;
}

export function WhisperDrawer({ children, onSubmit }: WhisperDrawerProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [selectedMood, setSelectedMood] = useState('mysterious');
  const [selectedCategory, setSelectedCategory] = useState('confession');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Icon functions from WhisperCard
  const getMoodIcon = (mood: string) => {
    const iconProps = "w-5 h-5";
    const moodIcons: Record<string, React.ReactElement> = {
      mysterious: <Moon className={iconProps} />,
      happy: <Sun className={iconProps} />,
      sad: <CloudRain className={iconProps} />,
      exciting: <Zap className={iconProps} />,
      love: <Heart className={iconProps} />,
      funny: <Smile className={iconProps} />,
    };
    return moodIcons[mood] || <Sparkles className={iconProps} />;
  };

  const getCategoryIcon = (category: string) => {
    const iconProps = "w-4 h-4";
    const categoryIcons: Record<string, React.ReactElement> = {
      confession: <Theater className={iconProps} />,
      secret: <Shield className={iconProps} />,
      dream: <Cloud className={iconProps} />,
      crush: <Heart className={iconProps} />,
      funny: <Smile className={iconProps} />,
      'life-story': <BookOpen className={iconProps} />,
    };
    return categoryIcons[category] || <MessageCircle className={iconProps} />;
  };

  const getSmallMoodIcon = (mood: string) => {
    const iconProps = "w-3 h-3";
    const moodIcons: Record<string, React.ReactElement> = {
      mysterious: <Moon className={iconProps} />,
      happy: <Sun className={iconProps} />,
      sad: <CloudRain className={iconProps} />,
      exciting: <Zap className={iconProps} />,
      love: <Heart className={iconProps} />,
      funny: <Smile className={iconProps} />,
    };
    return moodIcons[mood] || <Sparkles className={iconProps} />;
  };

  const moods = [
    { id: 'mysterious', label: 'Mysterious' },
    { id: 'happy', label: 'Happy' },
    { id: 'sad', label: 'Sad' },
    { id: 'exciting', label: 'Exciting' },
    { id: 'love', label: 'Love' },
    { id: 'funny', label: 'Funny' },
  ];

  const categories = [
    { id: 'confession', label: 'Confession' },
    { id: 'secret', label: 'Secret' },
    { id: 'dream', label: 'Dream' },
    { id: 'crush', label: 'Crush' },
    { id: 'funny', label: 'Funny' },
    { id: 'life-story', label: 'Life Story' },
  ];

  const backgroundThemes: Record<string, string> = {
    mysterious: 'bg-slate-800 text-white',
    happy: 'bg-amber-500 text-white',
    sad: 'bg-blue-600 text-white',
    exciting: 'bg-red-500 text-white',
    love: 'bg-pink-500 text-white',
    funny: 'bg-green-500 text-white',
  };

  const handleSubmit = async () => {
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
      
      // Reset form and close drawer
      setContent('');
      setIsAnonymous(true);
      setSelectedMood('mysterious');
      setSelectedCategory('confession');
      setOpen(false);
    } catch (error) {
      console.error('Error submitting whisper:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader className="pb-4">
            <DrawerTitle className="flex items-center justify-center gap-2 text-gray-900 dark:text-gray-100">
              <Sparkles className="w-5 h-5 text-red-500" />
              Create Whisper
            </DrawerTitle>
            <DrawerDescription className="text-gray-600 dark:text-gray-400">
              Share your thoughts anonymously with the community
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="px-4 space-y-4 max-h-[45vh] overflow-y-auto">
            {/* Content Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                What&apos;s on your mind?
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your whisper..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300"
                rows={4}
                maxLength={500}
                style={{ fontSize: '16px' }}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">{content.length}/500</span>
                <button
                  type="button"
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    isAnonymous
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {isAnonymous ? (
                    <>
                      <Lock className="w-3 h-3 mr-1" />
                      Anonymous
                    </>
                  ) : (
                    <>
                      <User className="w-3 h-3 mr-1" />
                      Public
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Mood Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Choose your mood
              </label>
              <div className="grid grid-cols-3 gap-3">
                {moods.map((mood) => (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => setSelectedMood(mood.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      selectedMood === mood.id
                        ? 'bg-red-50 border-red-400 text-red-700 shadow-sm'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-gray-600">{getMoodIcon(mood.id)}</div>
                    <span className="text-xs font-medium">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Category
              </label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                      selectedCategory === category.id
                        ? 'bg-red-50 border-red-400 text-red-700 shadow-sm'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-gray-600">{getCategoryIcon(category.id)}</div>
                    <span className="text-sm font-medium">{category.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            {content.trim() && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Preview
                </label>
                <div className="p-4 rounded-xl bg-white border-2 border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      {isAnonymous ? (
                        <Lock className="w-4 h-4 text-gray-600" />
                      ) : (
                        <User className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-900">
                        {isAnonymous ? 'Anonymous' : session?.user?.name || 'You'}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <div className="text-gray-600">
                          {getSmallMoodIcon(selectedMood)}
                        </div>
                        <span className="capitalize">{selectedMood}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-800 mb-3">{content}</p>
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                      {getCategoryIcon(selectedCategory)}
                      {selectedCategory.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DrawerFooter className="border-t border-gray-200 bg-white pt-4 pb-6">
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              className="bg-red-500 hover:bg-red-600 text-white w-full py-3 text-base font-semibold mb-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Sharing Whisper...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Share Whisper
                </>
              )}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}