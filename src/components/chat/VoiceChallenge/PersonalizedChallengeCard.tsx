// Create a new component: components/chat/VoiceChallenge/PersonalizedChallengeCard.tsx
'use client';

import { Mic, Clock, Zap, Heart } from 'lucide-react';

interface PersonalizedChallengeCardProps {
  challenge: {
    id: string;
    challenge_prompt: string;
    time_limit: number;
    challenge_from: string;
  };
  currentUserId: string;
  senderName: string;
  onAccept: () => void;
  onSkip: () => void;
}

export default function PersonalizedChallengeCard({ 
  challenge, 
  currentUserId, 
  senderName,
  onAccept, 
  onSkip 
}: PersonalizedChallengeCardProps) {
  
  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 my-3 text-white shadow-lg border-2 border-white/20">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <Heart className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <span className="text-sm font-medium opacity-90">Challenge from</span>
          <div className="font-bold text-base">{senderName} 💕</div>
        </div>
      </div>
      
      {/* Challenge Prompt */}
      <div className="bg-white/10 rounded-xl p-3 mb-4">
        <h3 className="text-lg font-semibold leading-relaxed">
          {challenge.challenge_prompt}
        </h3>
      </div>
      
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm opacity-90">
          <Clock className="w-4 h-4" />
          <span>{challenge.time_limit}s max</span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onSkip}
            className="px-3 py-1.5 text-sm bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            Maybe later
          </button>
          <button
            onClick={onAccept}
            className="px-4 py-1.5 text-sm bg-white text-purple-600 font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1"
          >
            <Mic className="w-4 h-4" />
            Accept Challenge
          </button>
        </div>
      </div>
    </div>
  );
}