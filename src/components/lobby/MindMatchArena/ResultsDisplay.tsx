// // // src/components/lobby/MindMatchArena/MatchResults.tsx
// // import { motion, AnimatePresence } from 'framer-motion';
// // import { VibeMatch } from '@/types/mindmatch';
// // interface MatchResultsProps {
// //   matches: VibeMatch[];
// //   currentUserId: string;
// //   onPlayAgain: () => void;
// // }

// // export default function MatchResults({ matches, currentUserId, onPlayAgain }: MatchResultsProps) {
// //   const userMatches = matches.filter(
// //     match => match.user1_id === currentUserId || match.user2_id === currentUserId
// //   );

// //   return (
// //     <motion.div
// //       initial={{ opacity: 0, scale: 0.95 }}
// //       animate={{ opacity: 1, scale: 1 }}
// //       exit={{ opacity: 0, scale: 0.95 }}
// //       className="bg-white rounded-xl p-6 shadow-lg"
// //     >
// //       <h2 className="text-2xl font-bold mb-6">Your Matches!</h2>

// //       {userMatches.length > 0 ? (
// //         <div className="space-y-4">
// //           {userMatches.map(match => (
// //             <div
// //               key={match.id}
// //               className="bg-gradient-to-r from-purple-50 to-pink-50 
// //                        rounded-lg p-4 flex items-center justify-between"
// //             >
// //               <div>
// //                 <h3 className="font-semibold">
// //                   {match.user1_id === currentUserId 
// //                     ? match.user2?.username 
// //                     : match.user1?.username}
// //                 </h3>
// //                 <p className="text-sm text-gray-600">
// //                   {match.shared_answers}/{match.total_answers} answers matched
// //                 </p>
// //               </div>
// //               <div className="text-right">
// //                 <div className="text-2xl font-bold text-purple-600">
// //                   {Math.round(match.compatibility_score)}%
// //                 </div>
// //                 <div className="text-sm text-purple-500">
// //                   {match.match_type.replace('_', ' ')}
// //                 </div>
// //               </div>
// //             </div>
// //           ))}
// //         </div>
// //       ) : (
// //         <div className="text-center text-gray-500">
// //           No matches this round. Try again!
// //         </div>
// //       )}

// //       <button
// //         onClick={onPlayAgain}
// //         className="mt-6 w-full bg-purple-600 text-white py-3 rounded-lg
// //                  hover:bg-purple-700 transition-colors duration-200"
// //       >
// //         Play Again
// //       </button>
// //     </motion.div>
// //   );
// // }


// // src/components/lobby/MindMatch/Arena/ResultsDisplay.tsx
// import { useEffect, useState } from 'react';
// import { motion } from 'framer-motion';
// import { Trophy, Heart } from 'lucide-react';
// import { MindMatchService } from '@/lib/services/MindMatchService';
// import type { VibeMatch } from '@/types/mindmatch';

// interface ResultsDisplayProps {
//   lobbyId: string;
//   roundId: string;
//   currentUserId: string;
//   onPlayAgain: () => void;
// }

// export default function ResultsDisplay({
//   lobbyId,
//   roundId,
//   currentUserId,
//   onPlayAgain
// }: ResultsDisplayProps) {
//   const [matches, setMatches] = useState<VibeMatch[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadMatches();
//   }, []);

//   const loadMatches = async () => {
//     const matchData = await MindMatchService.getCurrentRoundMatches(lobbyId, roundId);
//     setMatches(matchData.filter(match => 
//       match.user1_id === currentUserId || match.user2_id === currentUserId
//     ));
//     setLoading(false);
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -20 }}
//       className="bg-white rounded-3xl p-6 shadow-soft border border-purple-100"
//     >
//       <div className="text-center mb-6">
//         <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
//           <Trophy className="w-8 h-8 text-white" />
//         </div>
        
//         <h2 className="text-2xl font-bold text-gray-800 mb-2">
//           Round Complete!
//         </h2>
//         <p className="text-gray-600">
//           {matches.length > 0 
//             ? `You found ${matches.length} vibe ${matches.length === 1 ? 'match' : 'matches'}!`
//             : 'No matches this round - try again!'}
//         </p>
//       </div>

//       {matches.length > 0 && (
//         <div className="space-y-4 mb-6">
//           {matches.map(match => (
//             <motion.div
//               key={match.id}
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4"
//             >
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <Heart className="w-5 h-5 text-pink-500" />
//                   <div>
//                     <p className="font-medium text-gray-800">
//                       {match.match_type.replace('_', ' ')}
//                     </p>
//                     <p className="text-sm text-gray-600">
//                       {match.shared_answers}/{match.total_answers} answers matched
//                     </p>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-2xl font-bold text-purple-600">
//                     {Math.round(match.compatibility_score)}%
//                   </p>
//                   <p className="text-sm text-purple-500">
//                     {match.match_strength}
//                   </p>
//                 </div>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       )}

//       <button
//         onClick={onPlayAgain}
//         className="w-full py-3 px-6 rounded-xl font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
//       >
//         Play Again
//       </button>
//     </motion.div>
//   );
// }