// src/components/whispers/WhisperComments.tsx

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { WhisperService } from '@/lib/services/WhisperService';
import { WhisperComment } from '@/types/whispers';

interface WhisperCommentsProps {
  whisperId: string;
  onComment: (whisperId: string, comment: string) => void;
}

export function WhisperComments({ whisperId, onComment }: WhisperCommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<WhisperComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);

  useEffect(() => {
    loadComments();
  }, [whisperId]);

  const loadComments = async () => {
    try {
      const data = await WhisperService.getComments(whisperId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !session?.user?.id) return;

    try {
      const newCommentData = await WhisperService.addComment({
        whisper_id: whisperId,
        user_id: session.user.id,
        content: newComment,
        is_anonymous: isAnonymous
      });

      setNewComment('');
      
      // Add the new comment to local state immediately
      setComments(prev => [...prev, newCommentData]);
      
      // Notify parent to refresh whisper data (for count update)
      onComment(whisperId, newComment);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 space-y-4 transition-colors duration-300">
      {/* Comments list */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-3">
            {!comment.is_anonymous && comment.user && (
              <img
                src={comment.user.profile_picture || '/default-avatar.png'}
                alt={comment.user.username}
                className="w-8 h-8 rounded-full"
              />
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {comment.is_anonymous ? 'Anonymous' : comment.user?.username}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(comment.created_at).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300 text-base"
          rows={2}
          style={{ fontSize: '16px' }}
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded text-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Post anonymously</span>
          </label>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-400 hover:bg-indigo-500 text-white rounded-lg transition-colors duration-300"
          >
            Comment
          </button>
        </div>
      </form>
    </div>
  );
}