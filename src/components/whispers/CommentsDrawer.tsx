'use client'

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  MessageCircle, 
  Send, 
  Lock, 
  User, 
  Heart,
  Loader2,
  X
} from 'lucide-react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { WhisperService } from '@/lib/services/WhisperService';
import { Whisper, WhisperComment } from '@/types/whispers';

interface CommentsDrawerProps {
  children: React.ReactNode;
  whisperId: string;
  commentsCount: number;
  onComment: (whisperId: string, comment: string) => void;
}

export function CommentsDrawer({ children, whisperId, commentsCount, onComment }: CommentsDrawerProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<WhisperComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && whisperId) {
      loadComments();
    }
  }, [open, whisperId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await WhisperService.getComments(whisperId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !session?.user?.id || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const comment = {
        whisper_id: whisperId,
        user_id: session.user.id,
        content: newComment.trim(),
        is_anonymous: isAnonymous
      };

      await WhisperService.addComment(comment);
      await loadComments(); // Reload comments
      onComment(whisperId, newComment.trim()); // Update parent
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
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

  // Helper function to get user avatar
  const getUserAvatar = (user: any) => {
    return user?.image || user?.profile_picture || '/default-avatar.png';
  };

  // Helper function to get current session user avatar
  const getSessionUserAvatar = () => {
    if (!session?.user) return '/default-avatar.png';
    return (session.user as any).image || 
           (session.user as any).profile_picture || 
           '/default-avatar.png';
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="flex items-center justify-between">
              <DrawerTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <MessageCircle className="w-5 h-5 text-red-500" />
                Comments ({commentsCount})
              </DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="sm" className="p-1">
                  <X className="w-5 h-5" />
                </Button>
              </DrawerClose>
            </div>
            <DrawerDescription className="text-gray-600 dark:text-gray-400">
              Share your thoughts on this whisper
            </DrawerDescription>
          </DrawerHeader>
          
          {/* Comments List */}
          <div className="flex-1 overflow-y-auto max-h-[50vh] p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No comments yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Be the first to comment!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    {comment.is_anonymous ? (
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                        <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </div>
                    ) : (
                      <img
                        src={getUserAvatar(comment.user)}
                        alt={comment.user?.username || 'User'}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-gray-200 dark:border-gray-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/default-avatar.png';
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {comment.is_anonymous ? 'Anonymous' : comment.user?.username}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimeAgo(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comment Input */}
          <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
            {session ? (
              <div className="space-y-3">
                {/* Anonymous Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Check for available image properties */}
                    {getSessionUserAvatar() !== '/default-avatar.png' ? (
                      <img
                        src={getSessionUserAvatar()}
                        alt={session.user?.name || 'User'}
                        className="w-6 h-6 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/default-avatar.png';
                        }}
                      />
                    ) : (
                      <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-gray-500" />
                      </div>
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {isAnonymous ? 'Commenting as Anonymous' : `Commenting as ${session.user?.name || 'You'}`}
                    </span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                      isAnonymous
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                    }`}
                  >
                    {isAnonymous ? (
                      <>
                        <Lock className="w-3 h-3" />
                        Anonymous
                      </>
                    ) : (
                      <>
                        <User className="w-3 h-3" />
                        Public
                      </>
                    )}
                  </button>
                </div>

                {/* Comment Input */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      rows={2}
                      maxLength={500}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmitComment();
                        }
                      }}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-400">{newComment.length}/500</span>
                    </div>
                  </div>
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || isSubmitting}
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 h-auto self-end mb-5"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400 mb-3">
                  Please log in to comment
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                  className="text-sm"
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}