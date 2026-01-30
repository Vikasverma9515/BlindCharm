// // // src/components/lobby/MindMatchArena/WaitingRoom.tsx
// // import { motion, AnimatePresence } from 'framer-motion';
// // import { LobbyParticipant } from '@/types/lobby';
// // interface WaitingRoomProps {
// //   participants: LobbyParticipant[];
// //   nextResetTime: Date;
// //   onStart: () => void;
// // }

// // export default function WaitingRoom({ participants, nextResetTime, onStart }: WaitingRoomProps) {
// //   const formatTimeLeft = () => {
// //     const now = new Date();
// //     const diff = nextResetTime.getTime() - now.getTime();
// //     const minutes = Math.floor(diff / 60000);
// //     const seconds = Math.floor((diff % 60000) / 1000);
// //     return `${minutes}:${seconds.toString().padStart(2, '0')}`;
// //   };

// //   return (
// //     <motion.div
// //       initial={{ opacity: 0, y: 20 }}
// //       animate={{ opacity: 1, y: 0 }}
// //       exit={{ opacity: 0, y: -20 }}
// //       className="bg-white rounded-xl p-6 shadow-lg"
// //     >
// //       <h2 className="text-2xl font-bold mb-6">MindMatch Arena</h2>
      
// //       <div className="text-center mb-6">
// //         <p className="text-gray-600">Next round starts in</p>
// //         <div className="text-3xl font-bold text-purple-600">
// //           {formatTimeLeft()}
// //         </div>
// //       </div>

// //       <div className="mb-6">
// //         <h3 className="font-semibold mb-2">Players Ready ({participants.length})</h3>
// //         <div className="flex flex-wrap gap-2">
// //           {participants.map(participant => (
// //             <div
// //               key={participant.id}
// //               className="bg-gray-50 px-3 py-1 rounded-full text-sm"
// //             >
// //               {participant.user.username}
// //             </div>
// //           ))}
// //         </div>
// //       </div>

// //       <button
// //         onClick={onStart}
// //         disabled={participants.length < 2}
// //         className="w-full bg-purple-600 text-white py-3 rounded-lg
// //                  hover:bg-purple-700 transition-colors duration-200
// //                  disabled:bg-gray-300 disabled:cursor-not-allowed"
// //       >
// //         {participants.length < 2 
// //           ? 'Need at least 2 players'
// //           : 'Start Round!'}
// //       </button>
// //     </motion.div>
// //   );
// // }

// // src/components/lobby/MindMatch/Arena/WaitingRoom.tsx
// import { motion } from 'framer-motion';
// import { Brain, Users } from 'lucide-react';
// import { LobbyParticipant } from '@/types/lobby';

// interface WaitingRoomProps {
//   participants: LobbyParticipant[];
//   onStart: () => void;
//   isLoading: boolean;
// }

// export default function WaitingRoom({
//   participants,
//   onStart,
//   isLoading
// }: WaitingRoomProps) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -20 }}
//       className="bg-white rounded-3xl p-6 shadow-soft border border-purple-100"
//     >
//       <div className="text-center">
//         <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
//           <Brain className="w-8 h-8 text-white" />
//         </div>
        
//         <h2 className="text-2xl font-bold text-gray-800 mb-2">
//           MindMatch Arena
//         </h2>
//         <p className="text-gray-600 mb-6">
//           Answer questions to find your vibe matches!
//         </p>

//         <div className="bg-purple-50 rounded-xl p-4 mb-6">
//           <div className="flex items-center justify-center gap-2 mb-2">
//             <Users className="w-5 h-5 text-purple-600" />
//             <span className="font-medium text-purple-700">
//               {participants.length} Players Ready
//             </span>
//           </div>
//           <p className="text-sm text-purple-600">
//             Match with people who share your vibes!
//           </p>
//         </div>

//         <button
//           onClick={onStart}
//           disabled={isLoading || participants.length < 2}
//           className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
//             isLoading || participants.length < 2
//               ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
//               : 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg'
//           }`}
//         >
//           {isLoading
//             ? 'Starting...'
//             : participants.length < 2
//             ? 'Need more players'
//             : 'Start MindMatch!'}
//         </button>
//       </div>
//     </motion.div>
//   );
// }