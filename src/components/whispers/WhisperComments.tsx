// // src/components/whispers/WhisperComments.tsx

// import { useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';
// import { WhisperService } from '@/lib/services/WhisperService';
// import { WhisperComment } from '@/types/whispers';

// interface WhisperCommentsProps {
//   whisperId: string;
//   onComment: (whisperId: string, comment: string) => void;
// }

// export function WhisperComments({ whisperId, onComment }: WhisperCommentsProps) {
//   const { data: session } = useSession();
//   const [comments, setComments] = useState<WhisperComment[]>([]);
//   const [newComment, setNewComment] = useState('');
//   const [isAnonymous, setIsAnonymous] = useState(true);

//   useEffect(() => {
//     loadComments();
//   }, [whisperId]);

//   const loadComments = async () => {
//     try {
//       const data = await WhisperService.getComments(whisperId);
//       setComments(data);
//     } catch (error) {
//       console.error('Error loading comments:', error);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newComment.trim() || !session?.user?.id) return;

//     try {
//       const newCommentData = await WhisperService.addComment({
//         whisper_id: whisperId,
//         user_id: session.user.id,
//         content: newComment,
//         is_anonymous: isAnonymous
//       });

//       setNewComment('');
      
//       // Add the new comment to local state immediately
//       setComments(prev => [...prev, newCommentData]);
      
//       // Notify parent to refresh whisper data (for count update)
//       onComment(whisperId, newComment);
//     } catch (error) {
//       console.error('Error adding comment:', error);
//     }
//   };

//   return (
//     <div className="bg-white dark:bg-gray-800 rounded-xl p-4 space-y-4 transition-colors duration-300">
//       {/* Comments list */}
//       <div className="space-y-4">
//         {comments.map((comment) => (
//           <div key={comment.id} className="flex space-x-3">
//             {!comment.is_anonymous && comment.user && (
//               <img
//                 src={comment.user.profile_picture || '/default-avatar.png'}
//                 alt={comment.user.username}
//                 className="w-8 h-8 rounded-full"
//               />
//             )}
//             <div>
//               <div className="flex items-center space-x-2">
//                 <span className="font-medium text-gray-900 dark:text-gray-100">
//                   {comment.is_anonymous ? 'Anonymous' : comment.user?.username}
//                 </span>
//                 <span className="text-sm text-gray-500 dark:text-gray-400">
//                   {new Date(comment.created_at).toLocaleTimeString()}
//                 </span>
//               </div>
//               <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Comment form */}
//       <form onSubmit={handleSubmit} className="space-y-2">
//         <textarea
//           value={newComment}
//           onChange={(e) => setNewComment(e.target.value)}
//           placeholder="Write a comment..."
//           className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300 text-base"
//           rows={2}
//           style={{ fontSize: '16px' }}
//         />
//         <div className="flex items-center justify-between">
//           <label className="flex items-center space-x-2">
//             <input
//               type="checkbox"
//               checked={isAnonymous}
//               onChange={(e) => setIsAnonymous(e.target.checked)}
//               className="rounded text-blue-500"
//             />
//             <span className="text-sm text-gray-700 dark:text-gray-300">Post anonymously</span>
//           </label>
//           <button
//             type="submit"
//             className="px-4 py-2 bg-indigo-400 hover:bg-indigo-500 text-white rounded-lg transition-colors duration-300"
//           >
//             Comment
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { 
  MessageCircle, 
  Send, 
  Lock, 
  User, 
  Heart,
  Loader2,
  X,
  ChevronDown
} from 'lucide-react';
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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [comments, setComments] = useState<WhisperComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && whisperId) {
      loadComments();
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      
      // Focus textarea after drawer animation
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [open, whisperId]);

  const loadComments = async () => {
    if (!whisperId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await WhisperService.getComments(whisperId);
      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
      setError('Failed to load comments');
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !session?.user?.id || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    
    try {
      const comment = {
        whisper_id: whisperId,
        user_id: session.user.id,
        content: newComment.trim(),
        is_anonymous: isAnonymous
      };

      await WhisperService.addComment(comment);
      await loadComments();
      onComment(whisperId, newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      const now = new Date();
      const date = new Date(dateString);
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = newHeight + 'px';
  };

  const closeDrawer = () => {
    setOpen(false);
    setNewComment('');
    setError(null);
  };

  // Anonymous avatar component
  const AnonymousAvatar = ({ size = "w-10 h-10" }: { size?: string }) => (
    <div className={`${size} bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0`}>
      <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
    </div>
  );

  return (
    <>
      {/* Trigger */}
      <div onClick={() => setOpen(true)} style={{ cursor: 'pointer' }}>
        {children}
      </div>

      {/* Custom Drawer Portal */}
      {open && (
        <div 
          className="fixed inset-0 flex flex-col justify-end"
          style={{ 
            zIndex: 9999, // Very high z-index
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)'
          }}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0"
            onClick={closeDrawer}
          />
          
          {/* Drawer Content */}
          <div 
            className="relative bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl transform transition-all duration-300 ease-out"
            style={{ 
              height: '80vh',
              maxHeight: '80vh',
              zIndex: 10000
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-full">
                  <MessageCircle className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                    Comments
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeDrawer}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-4 mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Comments List */}
            <div 
              className="flex-1 overflow-y-auto px-4 py-3"
              style={{ maxHeight: 'calc(80vh - 200px)' }}
            >
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                    <p className="text-sm text-gray-500">Loading comments...</p>
                  </div>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No comments yet
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400">
                    Be the first to share your thoughts!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment, index) => (
                    <div key={comment.id || index} className="flex gap-3">
                      <AnonymousAvatar />
                      <div className="flex-1 min-w-0">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                              {comment.is_anonymous ? 'Anonymous' : (comment.user?.username || 'Anonymous')}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTimeAgo(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comment Input - Fixed at bottom */}
            <div 
              className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4"
              style={{ position: 'sticky', bottom: 0 }}
            >
              {session ? (
                <div className="space-y-3">
                  {/* Anonymous Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AnonymousAvatar size="w-8 h-8" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        Anonymous
                      </span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setIsAnonymous(!isAnonymous)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        isAnonymous
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                          : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
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
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={newComment}
                      onChange={handleTextareaChange}
                      placeholder="Share your thoughts..."
                      className="w-full p-3 pr-12 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                      rows={2}
                      maxLength={500}
                      style={{ minHeight: '60px' }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmitComment();
                        }
                      }}
                    />
                    <button
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || isSubmitting}
                      className={`absolute right-2 bottom-2 p-2 rounded-full transition-all duration-200 ${
                        newComment.trim() && !isSubmitting
                          ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>{newComment.length}/500</span>
                    <span>Press Enter to send</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <AnonymousAvatar size="w-12 h-12" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4 mt-3">
                    Sign in to join the conversation
                  </p>
                  <button 
                    onClick={closeDrawer}
                    className="px-6 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}