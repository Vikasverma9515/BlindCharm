// // components/chat/VoiceChallenge/EnhancedChallengeCard.tsx
// 'use client';

// import { Mic, Clock, Zap, Check, X, User } from 'lucide-react';
// import { VoiceChallenge } from '@/hooks/useMatchChat';

// interface EnhancedChallengeCardProps {
//   challenge: VoiceChallenge;
//   currentUserId: string;
//   matchUserId: string;
//   onAccept: () => void;
//   onSkip: () => void;
// }

// export default function EnhancedChallengeCard({ 
//   challenge, 
//   currentUserId, 
//   matchUserId,
//   onAccept, 
//   onSkip 
// }: EnhancedChallengeCardProps) {
  
//   // Determine which user is which
//   const isCurrentUserUser1 = challenge.created_by === currentUserId; // Simplified logic
//   const currentUserStatus = isCurrentUserUser1 ? challenge.user1_status : challenge.user2_status;
//   const otherUserStatus = isCurrentUserUser1 ? challenge.user2_status : challenge.user1_status;

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'accepted':
//         return <Check className="w-4 h-4 text-green-400" />;
//       case 'skipped':
//         return <X className="w-4 h-4 text-red-400" />;
//       case 'completed':
//         return <Check className="w-4 h-4 text-blue-400" />;
//       default:
//         return <Clock className="w-4 h-4 text-yellow-400" />;
//     }
//   };

//   const getStatusText = (status: string) => {
//     switch (status) {
//       case 'accepted': return 'Recording...';
//       case 'skipped': return 'Passed';
//       case 'completed': return 'Completed';
//       default: return 'Deciding...';
//     }
//   };

//   return (
//     <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 my-3 text-white shadow-lg">
//       {/* Header */}
//       <div className="flex items-center gap-2 mb-3">
//         <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
//           <Zap className="w-4 h-4 text-white" />
//         </div>
//         <span className="text-sm font-medium opacity-90">Voice Challenge</span>
//       </div>
      
//       {/* Challenge Prompt */}
//       <h3 className="text-lg font-semibold mb-3 leading-relaxed">
//         {challenge.challenge_prompt}
//       </h3>
      
//       {/* User Status Display */}
//       <div className="flex items-center justify-between mb-4 bg-white/10 rounded-lg p-2">
//         <div className="flex items-center gap-2">
//           <User className="w-4 h-4" />
//           <span className="text-sm">You:</span>
//           {getStatusIcon(currentUserStatus)}
//           <span className="text-xs">{getStatusText(currentUserStatus)}</span>
//         </div>
        
//         <div className="flex items-center gap-2">
//           <User className="w-4 h-4" />
//           <span className="text-sm">Match:</span>
//           {getStatusIcon(otherUserStatus)}
//           <span className="text-xs">{getStatusText(otherUserStatus)}</span>
//         </div>
//       </div>
      
//       {/* Actions - only show if current user hasn't responded */}
//       {currentUserStatus === 'pending' && (
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-1 text-sm opacity-90">
//             <Clock className="w-4 h-4" />
//             <span>{challenge.time_limit}s max</span>
//           </div>
          
//           <div className="flex gap-2">
//             <button
//               onClick={onSkip}
//               className="px-3 py-1.5 text-sm bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
//             >
//               Pass
//             </button>
//             <button
//               onClick={onAccept}
//               className="px-4 py-1.5 text-sm bg-white text-purple-600 font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1"
//             >
//               <Mic className="w-4 h-4" />
//               Accept
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Status Messages */}
//       {currentUserStatus === 'accepted' && (
//         <div className="text-center">
//           <p className="text-sm opacity-90">🎤 Ready to record! Tap the mic when ready.</p>
//         </div>
//       )}

//       {currentUserStatus === 'skipped' && (
//         <div className="text-center">
//           <p className="text-sm opacity-90">
//             {otherUserStatus === 'pending' 
//               ? '⏳ Waiting for your match to decide...' 
//               : otherUserStatus === 'skipped'
//                 ? '😅 Both of you passed on this one!'
//                 : '🎤 Your match is recording their response!'
//             }
//           </p>
//         </div>
//       )}

//       {currentUserStatus === 'completed' && (
//         <div className="text-center">
//           <p className="text-sm opacity-90">
//             {otherUserStatus === 'completed' 
//               ? '🎉 Both completed the challenge!' 
//               : otherUserStatus === 'skipped'
//                 ? '👏 You completed it! Your match passed.'
//                 : '⏳ Waiting for your match to respond...'
//             }
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }