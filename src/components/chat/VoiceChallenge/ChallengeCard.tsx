// components/chat/VoiceChallenge/ChallengeCard.tsx
'use client';

import { useState } from 'react';
import { Mic, Clock, Zap } from 'lucide-react';

interface ChallengeCardProps {
  prompt: string;
  timeLimit: number;
  onAccept: () => void;
  onSkip: () => void;
}

export default function ChallengeCard({ prompt, timeLimit, onAccept, onSkip }: ChallengeCardProps) {
  return (
    <div className="bg-purple-600 rounded-2xl p-4 my-3 text-white shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-medium opacity-90">Voice Challenge</span>
      </div>
      
      <h3 className="text-lg font-semibold mb-3 leading-relaxed">
        {prompt}
      </h3>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm opacity-90">
          <Clock className="w-4 h-4" />
          <span>{timeLimit}s max</span>
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
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}