// // src/components/lobby/HotAnswersFeed.tsx
// 'use client'

// import { useState, useEffect } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { Flame, Heart, MessageCircle, TrendingUp, Users, Sparkles } from 'lucide-react'
// import { LobbyParticipant } from '@/types/lobby'
// import { MindMatchService } from '@/lib/services/MindMatchService'
// import { supabase } from '@/lib/supabase'
// interface HotAnswer {
//   id: string;
//   user: LobbyParticipant;
//   question: string;
//   answer: string;
//   category: string;
//   reactions: number;
//   userReacted: boolean;
//   timestamp: string;
// }

// interface HotAnswersFeedProps {
//   lobbyId: string;
//   participants: LobbyParticipant[];
//   currentUserId: string;
//   onReactToAnswer: (answerId: string) => void;
// }

// // Sample hot answers for demonstration
// const SAMPLE_HOT_ANSWERS: HotAnswer[] = [
//   {
//     id: '1',
//     user: {} as LobbyParticipant, // Will be filled from participants
//     question: 'Love at first sight?',
//     answer: 'Yes, absolutely! ✨ When you know, you know!',
//     category: 'romance',
//     reactions: 12,
//     userReacted: false,
//     timestamp: '2 min ago'
//   },
//   {
//     id: '2',
//     user: {} as LobbyParticipant,
//     question: 'Your crush disappears for 2 days with no text. You...',
//     answer: 'Ask directly 💬 Communication is key in any relationship!',
//     category: 'conflict_resolution',
//     reactions: 8,
//     userReacted: true,
//     timestamp: '5 min ago'
//   },
//   {
//     id: '3',
//     user: {} as LobbyParticipant,
//     question: 'Perfect date vibes?',
//     answer: 'Friends first 🫶 Building a foundation of friendship makes love stronger',
//     category: 'dating_style',
//     reactions: 15,
//     userReacted: false,
//     timestamp: '8 min ago'
//   }
// ];



// export default function HotAnswersFeed({ lobbyId, participants, currentUserId, onReactToAnswer }: HotAnswersFeedProps) {
//   const [hotAnswers, setHotAnswers] = useState<HotAnswer[]>([]);
//   const [loading, setLoading] = useState(false);
// // In HotAnswersFeed.tsx
// useEffect(() => {
//   loadHotAnswers();

//   // Subscribe to answers and reactions
//   const subscription = supabase
//     .channel('hot_answers_changes')
//     .on(
//       'postgres_changes',
//       {
//         event: '*',
//         schema: 'public',
//         table: 'mindmatch_answers',
//         filter: `session.lobby_id=eq.${lobbyId}`
//       },
//       () => {
//         loadHotAnswers();
//       }
//     )
//     .on(
//       'postgres_changes',
//       {
//         event: '*',
//         schema: 'public',
//         table: 'match_reactions'
//       },
//       () => {
//         loadHotAnswers();
//       }
//     )
//     .subscribe();

//   return () => {
//     subscription.unsubscribe();
//   };
// }, [lobbyId]);
//   // Load hot answers on component mount
//   useEffect(() => {
//     loadHotAnswers();
//   }, [lobbyId]);

//   const loadHotAnswers = async () => {
//     setLoading(true);
//     try {
//       const answers = await MindMatchService.getHotAnswers(lobbyId, 10);
      
//       // Transform to HotAnswer format
//       const transformedAnswers: HotAnswer[] = answers.map(answer => ({
//         id: answer.id,
//         user: participants.find(p => p.user_id === answer.user_id) || participants[0],
//         question: answer.prompt?.question || 'Unknown question',
//         answer: answer.answer_text || answer.prompt?.options?.[answer.answer_option_index] || 'No answer',
//         category: answer.prompt?.category || 'general',
//         reactions: answer.reactions?.length || 0,
//         userReacted: answer.reactions?.some((r: any) => r.user_id === currentUserId) || false,
//         timestamp: new Date(answer.answered_at).toLocaleString()
//       })).filter(answer => answer.user && answer.user.user_id !== currentUserId);

//       setHotAnswers(transformedAnswers);
//     } catch (error) {
//       console.error('Error loading hot answers:', error);
//       // Fallback to sample data
//       const sampleAnswers = SAMPLE_HOT_ANSWERS.map((answer, index) => ({
//         ...answer,
//         user: participants[index % participants.length] || participants[0]
//       })).filter(answer => answer.user && answer.user.user_id !== currentUserId);
//       setHotAnswers(sampleAnswers);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleReaction = async (answerId: string) => {
//     try {
//       await MindMatchService.reactToAnswer(answerId, currentUserId, 'heart');
      
//       setHotAnswers(prev => prev.map(answer => {
//         if (answer.id === answerId) {
//           const newUserReacted = !answer.userReacted;
//           return {
//             ...answer,
//             userReacted: newUserReacted,
//             reactions: newUserReacted ? answer.reactions + 1 : answer.reactions - 1
//           };
//         }
//         return answer;
//       }));
      
//       onReactToAnswer(answerId);
      
//       // Add haptic feedback
//       if (navigator.vibrate) {
//         navigator.vibrate(50);
//       }
//     } catch (error) {
//       console.error('Error reacting to answer:', error);
//     }
//   };

//   const getCategoryColor = (category: string) => {
//     switch (category) {
//       case 'romance': return 'bg-pink-100 text-pink-600';
//       case 'conflict_resolution': return 'bg-blue-100 text-blue-600';
//       case 'dating_style': return 'bg-purple-100 text-purple-600';
//       case 'communication': return 'bg-green-100 text-green-600';
//       default: return 'bg-gray-100 text-gray-600';
//     }
//   };

//   const getCategoryIcon = (category: string) => {
//     switch (category) {
//       case 'romance': return '💕';
//       case 'conflict_resolution': return '🤝';
//       case 'dating_style': return '💫';
//       case 'communication': return '💬';
//       default: return '✨';
//     }
//   };

//   if (hotAnswers.length === 0) {
//     return (
//       <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-6 border border-orange-100">
//         <div className="text-center">
//           <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
//             <Flame className="w-8 h-8 text-white" />
//           </div>
          
//           <h3 className="text-xl font-semibold text-gray-700 mb-2">Hot Answers Feed</h3>
//           <p className="text-gray-500 mb-4">No trending answers yet</p>
          
//           <div className="bg-white rounded-2xl p-4 border border-orange-100">
//             <p className="text-sm text-gray-600">
//               🔥 Most reacted answers appear here<br/>
//               💬 Share your thoughts and get featured<br/>
//               ❤️ React to answers you love
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-6 border border-orange-100">
//       <div className="flex items-center gap-3 mb-6">
//         <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
//           <Flame className="w-5 h-5 text-white" />
//         </div>
//         <div>
//           <h3 className="text-xl font-semibold text-gray-800">Hot Answers Feed</h3>
//           <p className="text-sm text-gray-600">Most reacted answers from the lobby</p>
//         </div>
//       </div>

//       <div className="space-y-4">
//         <AnimatePresence>
//           {hotAnswers.map((answer, index) => (
//             <motion.div
//               key={answer.id}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               transition={{ delay: index * 0.1 }}
//               className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
//             >
//               {/* Header */}
//               <div className="flex items-center gap-3 mb-3">
//                 {/* User Avatar */}
//                 {answer.user?.user?.profile_picture ? (
//                   <img 
//                     src={answer.user.user.profile_picture}
//                     alt={answer.user.user.username || 'User'}
//                     className={`w-10 h-10 rounded-full object-cover ring-2 ring-orange-200 ${
//                       answer.user.blur_profile ? 'blur-[1px] opacity-85' : ''
//                     }`}
//                   />
//                 ) : (
//                   <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center text-white font-bold text-sm ${
//                     answer.user?.blur_profile ? 'blur-[1px] opacity-85' : ''
//                   }`}>
//                     {answer.user?.user?.username?.[0]?.toUpperCase() || 'U'}
//                   </div>
//                 )}

//                 {/* User Info */}
//                 <div className="flex-1">
//                   <div className="flex items-center gap-2">
//                     <p className="font-medium text-gray-800 text-sm">
//                       {answer.user?.user?.username || 'Anonymous'}
//                     </p>
//                     <div className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(answer.category)}`}>
//                       {getCategoryIcon(answer.category)} {answer.category.replace('_', ' ')}
//                     </div>
//                   </div>
//                   <p className="text-xs text-gray-500">{answer.timestamp}</p>
//                 </div>

//                 {/* Trending indicator */}
//                 <div className="flex items-center gap-1 bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs">
//                   <TrendingUp className="w-3 h-3" />
//                   <span>Hot</span>
//                 </div>
//               </div>

//               {/* Question */}
//               <div className="mb-3">
//                 <p className="text-sm text-gray-600 font-medium mb-1">"{answer.question}"</p>
//               </div>

//               {/* Answer */}
//               <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-3 mb-3">
//                 <p className="text-gray-800 font-medium">{answer.answer}</p>
//               </div>

//               {/* Actions */}
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-4">
//                   <button
//                     onClick={() => handleReaction(answer.id)}
//                     className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
//                       answer.userReacted
//                         ? 'bg-red-100 text-red-600 shadow-md'
//                         : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
//                     }`}
//                   >
//                     <Heart className={`w-4 h-4 ${answer.userReacted ? 'fill-current' : ''}`} />
//                     <span>{answer.reactions}</span>
//                   </button>

//                   <button className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-500 transition-all duration-300">
//                     <MessageCircle className="w-4 h-4" />
//                     <span>Reply</span>
//                   </button>
//                 </div>

//                 <div className="flex items-center gap-1 text-xs text-gray-500">
//                   <Users className="w-3 h-3" />
//                   <span>{Math.floor(Math.random() * 5) + 2} people relate</span>
//                 </div>
//               </div>
//             </motion.div>
//           ))}
//         </AnimatePresence>
//       </div>

//       {/* Load More */}
//       <div className="text-center mt-6">
//         <button className="text-orange-600 hover:text-orange-700 text-sm font-medium underline">
//           Load more hot answers
//         </button>
//       </div>

//       {/* Footer */}
//       <div className="mt-6 pt-4 border-t border-orange-200">
//         <div className="text-center">
//           <p className="text-xs text-gray-500">
//             🔥 Answers with 5+ reactions become trending • 💫 Share your thoughts to get featured
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }