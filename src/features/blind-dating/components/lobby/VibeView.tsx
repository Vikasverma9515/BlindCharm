// // src/components/lobby/VibeView.tsx
// 'use client'

// import { useState } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { Brain, Heart, Zap, MessageCircle, Sparkles, Users, Trophy } from 'lucide-react'
// import { VibeMatch } from '@/types/mindmatch'
// import { LobbyParticipant } from '@/types/lobby'
// import { MindMatchService } from '@/lib/services/MindMatchService'

// interface VibeViewProps {
//   vibeMatches: VibeMatch[];
//   participants: LobbyParticipant[];
//   currentUserId: string;
//   onSendVibeWave: (userId: string) => void;
// }

// export default function VibeView({ vibeMatches, participants, currentUserId, onSendVibeWave }: VibeViewProps) {
//   const [selectedMatch, setSelectedMatch] = useState<VibeMatch | null>(null);

//   const getMatchTypeIcon = (type: string) => {
//     switch (type) {
//       case 'deep_connection': return <Brain className="w-5 h-5 text-purple-500" />;
//       case 'mind_lock': return <Zap className="w-5 h-5 text-yellow-500" />;
//       case 'vibe_sync': return <Heart className="w-5 h-5 text-pink-500" />;
//       default: return <Sparkles className="w-5 h-5 text-blue-500" />;
//     }
//   };

//   const getMatchTypeColor = (type: string) => {
//     switch (type) {
//       case 'deep_connection': return 'from-purple-500 to-indigo-600';
//       case 'mind_lock': return 'from-yellow-500 to-orange-600';
//       case 'vibe_sync': return 'from-pink-500 to-rose-600';
//       default: return 'from-blue-500 to-cyan-600';
//     }
//   };

//   const getMatchTypeDescription = (type: string) => {
//     switch (type) {
//       case 'deep_connection': return 'Your minds are perfectly aligned! 🧠✨';
//       case 'mind_lock': return 'You both think exactly alike! ⚡💭';
//       case 'vibe_sync': return 'Your vibes are totally in sync! 💕🎵';
//       default: return 'You have great compatibility! 🌟';
//     }
//   };

//   if (vibeMatches.length === 0) {
//     return (
//       <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-6 border border-gray-100">
//         <div className="text-center">
//           <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
//             <Users className="w-8 h-8 text-white" />
//           </div>
          
//           <h3 className="text-xl font-semibold text-gray-700 mb-2">No Vibe Matches Yet</h3>
//           <p className="text-gray-500 mb-4">Play MindMatch Arena to find your mental matches!</p>
          
//           <div className="bg-white rounded-2xl p-4 border border-gray-100">
//             <p className="text-sm text-gray-600">
//               🎮 Answer prompts and find people who think like you<br/>
//               🧠 Get matched based on your mindset and values<br/>
//               💫 Send VibeWaves to start conversations
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 border border-purple-100">
//       <div className="flex items-center gap-3 mb-6">
//         <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
//           <Brain className="w-5 h-5 text-white" />
//         </div>
//         <div>
//           <h3 className="text-xl font-semibold text-gray-800">VibeView</h3>
//           <p className="text-sm text-gray-600">{vibeMatches.length} mental matches found</p>
//         </div>
//       </div>

//       <div className="space-y-3">
//         {vibeMatches.map((match) => {
//           const otherUserId = match.user1_id === currentUserId ? match.user2_id : match.user1_id;
//           const otherUser = participants.find(p => p.user_id === otherUserId);
          
//           if (!otherUser) return null;

//           return (
//             <motion.div
//               key={match.id}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer"
//               onClick={() => setSelectedMatch(match)}
//             >
//               <div className="flex items-center gap-4">
//                 {/* User Avatar */}
//                 <div className="relative">
//                   {otherUser.user?.profile_picture ? (
//                     <img 
//                       src={otherUser.user.profile_picture}
//                       alt={otherUser.user.username || 'User'}
//                       className={`w-12 h-12 rounded-full object-cover ring-2 ring-purple-200 ${
//                         otherUser.blur_profile ? 'blur-[1px] opacity-85' : ''
//                       }`}
//                     />
//                   ) : (
//                     <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white font-bold ${
//                       otherUser.blur_profile ? 'blur-[1px] opacity-85' : ''
//                     }`}>
//                       {otherUser.user?.username?.[0]?.toUpperCase() || 'U'}
//                     </div>
//                   )}
                  
//                   {/* Match type badge */}
//                   <div className={`absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r ${getMatchTypeColor(match.match_type)} rounded-full flex items-center justify-center shadow-lg`}>
//                     {getMatchTypeIcon(match.match_type)}
//                   </div>
//                 </div>

//                 {/* Match Info */}
//                 <div className="flex-1">
//                   <div className="flex items-center gap-2 mb-1">
//                     <p className="font-semibold text-gray-800">
//                       {otherUser.user?.username || 'Mystery User'}
//                     </p>
//                     <div className="flex items-center gap-1 bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs">
//                       <Trophy className="w-3 h-3" />
//                       <span>{Math.round(match.compatibility_score)}%</span>
//                     </div>
//                   </div>
                  
//                   <p className="text-sm text-gray-600 mb-2">
//                     {match.shared_answers}/{match.total_answers} answers matched
//                   </p>
                  
//                   <p className="text-xs text-gray-500 capitalize">
//                     {getMatchTypeDescription(match.match_type)}
//                   </p>
//                 </div>

//                 {/* Action Button */}
//                 <button
//                   onClick={async (e) => {
//                     e.stopPropagation();
//                     try {
//                       await MindMatchService.sendVibeWave(match.id, currentUserId, otherUserId);
//                       onSendVibeWave(otherUserId);
//                     } catch (error) {
//                       console.error('Error sending vibe wave:', error);
//                     }
//                   }}
//                   className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg"
//                 >
//                   <div className="flex items-center gap-2">
//                     <Sparkles className="w-4 h-4" />
//                     <span>VibeWave</span>
//                   </div>
//                 </button>
//               </div>
//             </motion.div>
//           );
//         })}
//       </div>

//       {/* Match Details Modal */}
//       <AnimatePresence>
//         {selectedMatch && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
//             onClick={() => setSelectedMatch(null)}
//           >
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
//               onClick={(e) => e.stopPropagation()}
//             >
//               {(() => {
//                 const otherUserId = selectedMatch.user1_id === currentUserId ? selectedMatch.user2_id : selectedMatch.user1_id;
//                 const otherUser = participants.find(p => p.user_id === otherUserId);
                
//                 return (
//                   <div className="text-center">
//                     <div className={`w-20 h-20 bg-gradient-to-r ${getMatchTypeColor(selectedMatch.match_type)} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
//                       {getMatchTypeIcon(selectedMatch.match_type)}
//                     </div>
                    
//                     <h3 className="text-2xl font-bold text-gray-800 mb-2">
//                       {selectedMatch.match_type.replace('_', ' ').toUpperCase()}
//                     </h3>
                    
//                     <p className="text-gray-600 mb-4">
//                       You and <span className="font-semibold text-purple-600">{otherUser?.user?.username}</span> are mentally aligned!
//                     </p>
                    
//                     <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 mb-6">
//                       <div className="grid grid-cols-2 gap-4 text-center">
//                         <div>
//                           <p className="text-2xl font-bold text-purple-600">{Math.round(selectedMatch.compatibility_score)}%</p>
//                           <p className="text-sm text-gray-600">Compatibility</p>
//                         </div>
//                         <div>
//                           <p className="text-2xl font-bold text-pink-600">{selectedMatch.shared_answers}/{selectedMatch.total_answers}</p>
//                           <p className="text-sm text-gray-600">Shared Answers</p>
//                         </div>
//                       </div>
//                     </div>
                    
//                     <div className="flex gap-3">
//                       <button
//                         onClick={() => setSelectedMatch(null)}
//                         className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition-colors"
//                       >
//                         Close
//                       </button>
//                       <button
//                         onClick={async () => {
//                           try {
//                             await MindMatchService.sendVibeWave(selectedMatch.id, currentUserId, otherUserId);
//                             onSendVibeWave(otherUserId);
//                             setSelectedMatch(null);
//                           } catch (error) {
//                             console.error('Error sending vibe wave:', error);
//                           }
//                         }}
//                         className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
//                       >
//                         Send VibeWave 💫
//                       </button>
//                     </div>
//                   </div>
//                 );
//               })()}
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }