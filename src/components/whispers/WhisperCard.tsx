// src/components/whispers/WhisperCard.tsx

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Lock } from 'lucide-react';
import { Whisper } from '@/types/whispers';
import { WhisperService } from '@/lib/services/WhisperService';
import { WhisperComments } from './WhisperComments';

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-lg overflow-hidden"
    >
      {/* Whisper content with background theme */}
      <div className={`p-6 ${whisper.background_theme}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {whisper.is_anonymous ? (
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span className="text-sm">Anonymous</span>
              </div>
            ) : (
              <>
                <img
                  src={whisper.user?.profile_picture || '/default-avatar.png'}
                  alt={whisper.user?.username}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm">{whisper.user?.username}</span>
              </>
            )}
          </div>
          <span className="text-sm opacity-75">
            {new Date(whisper.created_at).toLocaleDateString()}
          </span>
        </div>

        <p className="text-lg mb-4">{whisper.content}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-sm opacity-75">
            <span>{whisper.mood}</span>
            <span>•</span>
            <span>{whisper.category}</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-6 py-4 bg-white">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLike}
            disabled={isLoading}
            className={`flex items-center space-x-2 transition-colors ${
              isLiked 
                ? 'text-red-500' 
                : 'text-gray-500 hover:text-red-500'
            } ${isLoading ? 'opacity-50' : ''}`}
          >
            <Heart 
              className="w-5 h-5" 
              fill={isLiked ? 'currentColor' : 'none'} 
            />
            <span>{whisper.likes_count}</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{whisper.comments_count}</span>
          </button>
          
          <button 
            onClick={handleShare}
            className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Comments section */}
      {showComments && (
        <WhisperComments
          whisperId={whisper.id}
          onComment={onComment}
        />
      )}
    </motion.div>
  );
}