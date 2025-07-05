// src/components/whispers/WhisperCard.tsx

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Lock, 
  Moon, 
  Sun, 
  CloudRain, 
  Zap, 
  Sparkles,
  Shield,
  Cloud,
  Smile,
  BookOpen,
  Theater
} from 'lucide-react';
import { Whisper } from '@/types/whispers';
import { WhisperService } from '@/lib/services/WhisperService';
import { WhisperComments } from './WhisperComments';
import { Card, CardContent } from '@/components/ui/card';

interface WhisperCardProps {
  whisper: Whisper;
  onLike: (whisperId: string) => void;
  onComment: (whisperId: string, comment: string) => void;
}

export function WhisperCard({ whisper, onLike, onComment }: WhisperCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    // Check if user has liked this whisper
    const checkLikeStatus = async () => {
      if (session?.user?.id) {
        try {
          const liked = await WhisperService.checkUserLike(whisper.id, session.user.id);
          setIsLiked(liked);
        } catch (error) {
          console.error('Error checking like status:', error);
        }
      }
    };

    checkLikeStatus();
  }, [whisper.id, session?.user?.id]);

  // Update like state when whisper data changes (after like/unlike)
  useEffect(() => {
    if (session?.user?.id && !isLoading) {
      const checkLikeStatus = async () => {
        try {
          const liked = await WhisperService.checkUserLike(whisper.id, session.user.id);
          setIsLiked(liked);
        } catch (error) {
          console.error('Error checking like status:', error);
        }
      };
      checkLikeStatus();
    }
  }, [whisper.likes_count, whisper.id, session?.user?.id, isLoading]);

  const handleLike = async () => {
    if (!session?.user?.id || isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Call the parent handler which will update the whisper data
      await onLike(whisper.id);
      
      // The real-time subscription will update the counts automatically
      // and the useEffect will update the like state
    } catch (error) {
      console.error('Error liking whisper:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Check out this whisper',
      text: whisper.content.length > 100 
        ? whisper.content.substring(0, 100) + '...' 
        : whisper.content,
      url: window.location.href
    };

    try {
      // Check if Web Share API is supported
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(
          `${shareData.text}\n\n${shareData.url}`
        );
        
        // Show success notification using a simple approach
        showNotification('Whisper copied to clipboard!', 'success');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      showNotification('Failed to share whisper', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = `fixed top-4 right-4 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300`;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateY(0)';
      notification.style.opacity = '1';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateY(-20px)';
      notification.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  const getMoodIcon = (mood: string) => {
    const iconProps = "w-4 h-4";
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
    const iconProps = "w-3 h-3";
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

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Get mood-based accent color (minimal approach)
  const getMoodAccent = (mood: string) => {
    const accents: Record<string, string> = {
      mysterious: 'border-l-purple-500',
      happy: 'border-l-amber-500',
      sad: 'border-l-blue-500',
      exciting: 'border-l-pink-500',
      love: 'border-l-rose-500',
      funny: 'border-l-green-500',
    };
    return accents[mood] || 'border-l-gray-400';
  };

  // Get mood-based category background
  const getMoodCategoryBg = (mood: string) => {
    const backgrounds: Record<string, string> = {
      mysterious: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
      happy: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
      sad: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      exciting: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400',
      love: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
      funny: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    };
    return backgrounds[mood] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  // Get mood-based content highlight
  const getMoodContentBg = (mood: string) => {
    const backgrounds: Record<string, string> = {
      mysterious: 'bg-purple-50 dark:bg-purple-900/10 border-l-purple-300 dark:border-l-purple-600',
      happy: 'bg-amber-50 dark:bg-amber-900/10 border-l-amber-300 dark:border-l-amber-600',
      sad: 'bg-blue-50 dark:bg-blue-900/10 border-l-blue-300 dark:border-l-blue-600',
      exciting: 'bg-pink-50 dark:bg-pink-900/10 border-l-pink-300 dark:border-l-pink-600',
      love: 'bg-rose-50 dark:bg-rose-900/10 border-l-rose-300 dark:border-l-rose-600',
      funny: 'bg-green-50 dark:bg-green-900/10 border-l-green-300 dark:border-l-green-600',
    };
    return backgrounds[mood] || 'bg-gray-50 dark:bg-gray-800/50 border-l-gray-300 dark:border-l-gray-600';
  };

  const moodAccent = getMoodAccent(whisper.mood);
  const categoryBg = getMoodCategoryBg(whisper.mood);
  const contentBg = getMoodContentBg(whisper.mood);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className={`border-l-8 ${moodAccent} hover:shadow-md transition-shadow duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700`}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {whisper.is_anonymous ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Lock className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-900">Anonymous</span>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className="text-gray-600">{getMoodIcon(whisper.mood)}</span>
                      <span className="capitalize">{whisper.mood}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={whisper.user?.profile_picture || '/default-avatar.png'}
                      alt={whisper.user?.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm border">
                      <span className="text-gray-600">{getMoodIcon(whisper.mood)}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-900">
                      {whisper.user?.username}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <span className="capitalize">{whisper.mood}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <span className="text-xs text-gray-400">
              {formatTimeAgo(whisper.created_at)}
            </span>
          </div>

          {/* Content - Highlighted */}
          <div className="mb-6">
            <div className={`${contentBg} rounded-lg p-5 border-l-3 relative`}>
              <div className="absolute top-3 left-3 text-gray-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                </svg>
              </div>
              <p className="text-gray-900 leading-relaxed text-base font-medium pl-6">
                {whisper.content}
              </p>
            </div>
          </div>

          {/* Category Tag */}
          <div className="mb-4">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${categoryBg} text-xs font-medium rounded-full`}>
              {getCategoryIcon(whisper.category)}
              {whisper.category.replace('-', ' ')}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
            <button
              onClick={handleLike}
              disabled={isLoading}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                isLiked 
                  ? 'text-red-500' 
                  : 'text-gray-500 hover:text-red-500'
              } ${isLoading ? 'opacity-50' : ''}`}
            >
              <Heart 
                className="w-4 h-4" 
                fill={isLiked ? 'currentColor' : 'none'} 
              />
              <span>{whisper.likes_count}</span>
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{whisper.comments_count}</span>
            </button>
            
            <button 
              onClick={handleShare}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-500 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </CardContent>

        {/* Comments section */}
        {showComments && (
          <div className="border-t border-gray-100 bg-gray-50">
            <WhisperComments
              whisperId={whisper.id}
              onComment={onComment}
            />
          </div>
        )}
      </Card>
    </motion.div>
  );
}