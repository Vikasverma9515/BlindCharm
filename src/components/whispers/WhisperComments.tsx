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
    <div className="bg-white p-4 space-y-4">
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
                <span className="font-medium">
                  {comment.is_anonymous ? 'Anonymous' : comment.user?.username}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(comment.created_at).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-gray-700">{comment.content}</p>
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
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded text-blue-500"
            />
            <span className="text-sm text-gray-700">Post anonymously</span>
          </label>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Comment
          </button>
        </div>
      </form>
    </div>
  );
}