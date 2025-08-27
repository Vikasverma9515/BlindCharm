// // Create a new component: components/chat/VoiceChallenge/PersonalizedChallengeCard.tsx
// 'use client';

// import { Mic, Clock, Zap, Heart } from 'lucide-react';

// interface PersonalizedChallengeCardProps {
//   challenge: {
//     id: string;
//     challenge_prompt: string;
//     time_limit: number;
//     challenge_from: string;
//   };
//   currentUserId: string;
//   senderName: string;
//   onAccept: () => void;
//   onSkip: () => void;
// }

// export default function PersonalizedChallengeCard({ 
//   challenge, 
//   currentUserId, 
//   senderName,
//   onAccept, 
//   onSkip 
// }: PersonalizedChallengeCardProps) {
  
//   return (
//     <div className="bg-purple-600 rounded-2xl p-4 my-3 text-white shadow-lg border-2 border-white/20">
//       {/* Header */}
//       <div className="flex items-center gap-2 mb-3">
//         <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
//           <Heart className="w-4 h-4 text-white" />
//         </div>
//         <div className="flex-1">
//           <span className="text-sm font-medium opacity-90">Challenge from</span>
//           <div className="font-bold text-base">{senderName}</div>
//         </div>
//       </div>
      
//       {/* Challenge Prompt */}
//       <div className="bg-white/10 rounded-xl p-3 mb-4">
//         <h3 className="text-lg font-semibold leading-relaxed">
//           {challenge.challenge_prompt}
//         </h3>
//       </div>
      
//       {/* Actions */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-1 text-sm opacity-90">
//           <Clock className="w-4 h-4" />
//           <span>{challenge.time_limit}s max</span>
//         </div>
        
//         <div className="flex gap-2">
//           <button
//             onClick={onSkip}
//             className="px-3 py-1.5 text-sm bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
//           >
//             Maybe later
//           </button>
//           <button
//             onClick={onAccept}
//             className="px-4 py-1.5 text-sm bg-white text-purple-600 font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1"
//           >
//             <Mic className="w-4 h-4" />
//             Accept Challenge
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


// Create a new component: components/chat/VoiceChallenge/PersonalizedChallengeCard.tsx
'use client';

import { Mic, Clock, Heart } from 'lucide-react';

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
    <div className="bg-purple-600 rounded-xl p-3 my-2 text-white shadow-lg border border-white/20 max-w-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
          <Heart className="w-3 h-3 text-white" />
        </div>
        <div className="flex-1">
          <span className="text-xs opacity-80">Challenge from</span>
          <div className="font-semibold text-sm">{senderName}</div>
        </div>
      </div>
      
      {/* Challenge Prompt */}
      <div className="bg-white/10 rounded-lg p-2 mb-3">
        <p className="text-sm font-medium leading-snug">
          {challenge.challenge_prompt}
        </p>
      </div>
      
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs opacity-80">
          <Clock className="w-3 h-3" />
          <span>{challenge.time_limit}s</span>
        </div>
        
        <div className="flex gap-1.5">
          <button
            onClick={onSkip}
            className="px-2 py-1 text-xs bg-white/20 hover:bg-white/30 rounded-md transition-colors"
          >
            Skip
          </button>
          <button
            onClick={onAccept}
            className="px-3 py-1 text-xs bg-white text-purple-600 font-medium rounded-md hover:bg-gray-100 transition-colors flex items-center gap-1"
          >
            <Mic className="w-3 h-3" />
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}