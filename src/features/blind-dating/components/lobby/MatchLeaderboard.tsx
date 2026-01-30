// // src/components/lobby/MatchLeaderboard.tsx
// 'use client'

// import { useState, useEffect } from 'react'
// import { motion } from 'framer-motion'
// import { Trophy, Crown, Medal, Sparkles, Brain, Heart, Zap } from 'lucide-react'
// import { LobbyParticipant,User } from '@/types/lobby'
// import { VibeMatch } from '@/types/mindmatch'
// import { MindMatchService } from '@/lib/services/MindMatchService'
// import { supabase } from '@/lib/supabase'

// interface LeaderboardEntry {
//   user: LobbyParticipant;
//   vibeMatches: number;
//   averageCompatibility: number;
//   totalAnswers: number;
//   charmCoins: number;
//   rank: number;
// }

// interface MatchLeaderboardProps {
//   lobbyId: string;
//   participants: LobbyParticipant[];
//   vibeMatches: VibeMatch[];
//   currentUserId: string;
// }

// export default function MatchLeaderboard({ lobbyId, participants, vibeMatches, currentUserId }: MatchLeaderboardProps) {
//   const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
//   const [loading, setLoading] = useState(false);

//   // Load leaderboard data
//   useEffect(() => {
//     loadLeaderboard();
//   }, [lobbyId, vibeMatches]);
//     .subscribe();

//   return () => {
//     subscription.unsubscribe();
//   };
// }, [lobbyId]);
//   // // Load leaderboard data
//   // useEffect(() => {
//   //   loadLeaderboard();
//   // }, [lobbyId, vibeMatches]);

//   // const loadLeaderboard = async () => {
//   //   setLoading(true);
//   //   try {
//   //     const leaderboard = await MindMatchService.getLobbyLeaderboard(lobbyId);
      
//   //     // Transform to LeaderboardEntry format
//   //     const transformedData: LeaderboardEntry[] = leaderboard.map((entry, index) => {
//   //       const participant = participants.find(p => p.user_id === entry.user.id);
//   //       const lobbyParticipant: LobbyParticipant = {
//   //   id: participant?.id || entry.user.id,
//   //   user_id: entry.user.id,
//   //   lobby_id: lobbyId, // Add the lobby_id
//   //   user: {
//   //     id: entry.user.id,
//   //     username: entry.user.username,
//   //     profile_picture: entry.user.profile_picture
//   //   },
//   //   blur_profile: participant?.blur_profile || false
//   // };
//   //       // return {
//   //       //   user: participant || {
//   //       //     id: entry.user.id,
//   //       //     user_id: entry.user.id,
//   //       //     user: entry.user,
//   //       //     blur_profile: false
//   //       //   },
//   //       //   vibeMatches: entry.matches,
//   //       //   averageCompatibility: entry.averageCompatibility,
//   //       //   totalAnswers: entry.matches * 5, // Assuming 5 questions per session
//   //       //   charmCoins: entry.matches * 10 + Math.floor(entry.averageCompatibility / 10) * 5,
//   //       //   rank: index + 1
//   //       // };
//   //       return {
//   //   user: lobbyParticipant,
//   //   vibeMatches: entry.matches,
//   //   averageCompatibility: entry.averageCompatibility,
//   //   totalAnswers: entry.matches * 5,
//   //   charmCoins: entry.matches * 10 + Math.floor(entry.averageCompatibility / 10) * 5,
//   //   rank: index + 1
//   // };
//   //     });

//   //     setLeaderboardData(transformedData);
//   //   } catch (error) {
//   //     console.error('Error loading leaderboard:', error);
//   //     // Fallback to local calculation
//   //     calculateLocalLeaderboard();
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };
  
// const loadLeaderboard = async () => {
//   setLoading(true);
//   try {
//     const leaderboard = await MindMatchService.getLobbyLeaderboard(lobbyId);
    
//     // Transform to LeaderboardEntry format
//     const transformedData: LeaderboardEntry[] = leaderboard.map((entry, index) => {
//       const participant = participants.find(p => p.user_id === entry.user.id);
      
//       // Create a complete User object with all required fields
//       const user: User = {
//         id: entry.user.id,
//         username: entry.user.username,
//         gender: participant?.user?.gender || 'other', // Set default gender if not available
//         profile_picture: entry.user.profile_picture,
//         // Add other required User fields with defaults
//         full_name: participant?.user?.full_name || '',
//         bio: participant?.user?.bio || null,
//         interests: participant?.user?.interests || null,
//         created_at: participant?.user?.created_at || new Date().toISOString(),
//         updated_at: participant?.user?.updated_at || new Date().toISOString()
//       };

//       // Create a complete LobbyParticipant object
//       const lobbyParticipant: LobbyParticipant = {
//         id: participant?.id || entry.user.id,
//         user_id: entry.user.id,
//         lobby_id: lobbyId,
//         status: participant?.status || 'active',
//         joined_at: participant?.joined_at || new Date().toISOString(),
//         user: user,
//         blur_profile: participant?.blur_profile || false
//       };

//       return {
//         user: lobbyParticipant,
//         vibeMatches: entry.matches,
//         averageCompatibility: entry.averageCompatibility,
//         totalAnswers: entry.matches * 5,
//         charmCoins: entry.matches * 10 + Math.floor(entry.averageCompatibility / 10) * 5,
//         rank: index + 1
//       };
//     });

//     setLeaderboardData(transformedData);
//   } catch (error) {
//     console.error('Error loading leaderboard:', error);
//     calculateLocalLeaderboard();
//   } finally {
//     setLoading(false);
//   }
// };
//   // const calculateLocalLeaderboard = () => {
//   //   const data: LeaderboardEntry[] = participants.map(participant => {
//   //     const userMatches = vibeMatches.filter(
//   //       match => match.user1_id === participant.user_id || match.user2_id === participant.user_id
//   //     );
      
//   //     const averageCompatibility = userMatches.length > 0 
//   //       ? userMatches.reduce((sum, match) => sum + match.compatibility_score, 0) / userMatches.length
//   //       : 0;
      
//   //     const totalAnswers = userMatches.reduce((sum, match) => sum + match.total_answers, 0);
//   //     const charmCoins = userMatches.length * 10 + Math.floor(averageCompatibility / 10) * 5;

//   //     return {
//   //       user: participant,
//   //       vibeMatches: userMatches.length,
//   //       averageCompatibility,
//   //       totalAnswers,
//   //       charmCoins,
//   //       rank: 0 // Will be set after sorting
//   //     };
//   //   }).sort((a, b) => {
//   //     // Sort by vibe matches first, then by average compatibility
//   //     if (b.vibeMatches !== a.vibeMatches) {
//   //       return b.vibeMatches - a.vibeMatches;
//   //     }
//   //     return b.averageCompatibility - a.averageCompatibility;
//   //   }).map((entry, index) => ({
//   //     ...entry,
//   //     rank: index + 1
//   //   }));

//   //   setLeaderboardData(data);
//   // };

//   const calculateLocalLeaderboard = () => {
//   const data: LeaderboardEntry[] = participants.map(participant => {
//     const userMatches = vibeMatches.filter(
//       match => match.user1_id === participant.user_id || match.user2_id === participant.user_id
//     );
    
//     const averageCompatibility = userMatches.length > 0 
//       ? userMatches.reduce((sum, match) => sum + match.compatibility_score, 0) / userMatches.length
//       : 0;
    
//     const totalAnswers = userMatches.reduce((sum, match) => sum + match.total_answers, 0);
//     const charmCoins = userMatches.length * 10 + Math.floor(averageCompatibility / 10) * 5;

//     return {
//       user: {
//         ...participant,
//         lobby_id: lobbyId // Ensure lobby_id is included
//       },
//       vibeMatches: userMatches.length,
//       averageCompatibility,
//       totalAnswers,
//       charmCoins,
//       rank: 0
//     };
//   }).sort((a, b) => {
//     if (b.vibeMatches !== a.vibeMatches) {
//       return b.vibeMatches - a.vibeMatches;
//     }
//     return b.averageCompatibility - a.averageCompatibility;
//   }).map((entry, index) => ({
//     ...entry,
//     rank: index + 1
//   }));

//   setLeaderboardData(data);
// };

//   const getRankIcon = (rank: number) => {
//     switch (rank) {
//       case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
//       case 2: return <Medal className="w-5 h-5 text-gray-400" />;
//       case 3: return <Medal className="w-5 h-5 text-amber-600" />;
//       default: return <Trophy className="w-4 h-4 text-gray-400" />;
//     }
//   };

//   const getRankColor = (rank: number) => {
//     switch (rank) {
//       case 1: return 'from-yellow-400 to-yellow-600';
//       case 2: return 'from-gray-300 to-gray-500';
//       case 3: return 'from-amber-400 to-amber-600';
//       default: return 'from-gray-200 to-gray-400';
//     }
//   };

//   const getVibeMatchIcon = (count: number) => {
//     if (count >= 5) return <Brain className="w-4 h-4 text-purple-500" />;
//     if (count >= 3) return <Zap className="w-4 h-4 text-yellow-500" />;
//     if (count >= 1) return <Heart className="w-4 h-4 text-pink-500" />;
//     return <Sparkles className="w-4 h-4 text-gray-400" />;
//   };

//   if (leaderboardData.length === 0 || leaderboardData.every(entry => entry.vibeMatches === 0)) {
//     return (
//       <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border border-amber-100">
//         <div className="text-center">
//           <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
//             <Trophy className="w-8 h-8 text-white" />
//           </div>
          
//           <h3 className="text-xl font-semibold text-gray-700 mb-2">Match Leaderboard</h3>
//           <p className="text-gray-500 mb-4">No matches yet - be the first to play!</p>
          
//           <div className="bg-white rounded-2xl p-4 border border-amber-100">
//             <p className="text-sm text-gray-600">
//               🏆 Most vibe-matched users get featured<br/>
//               💰 Earn CharmCoins for each match<br/>
//               👑 Top players get profile boosts
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border border-amber-100">
//       <div className="flex items-center gap-3 mb-6">
//         <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
//           <Trophy className="w-5 h-5 text-white" />
//         </div>
//         <div>
//           <h3 className="text-xl font-semibold text-gray-800">Match Leaderboard</h3>
//           <p className="text-sm text-gray-600">Top vibe-matched users today</p>
//         </div>
//       </div>

//       <div className="space-y-3">
//         {leaderboardData.slice(0, 5).map((entry, index) => {
//           const isCurrentUser = entry.user.user_id === currentUserId;
          
//           return (
//             <motion.div
//               key={entry.user.id}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.1 }}
//               className={`bg-white rounded-2xl p-4 border transition-all duration-300 ${
//                 isCurrentUser 
//                   ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 shadow-md' 
//                   : 'border-gray-100 hover:shadow-md'
//               }`}
//             >
//               <div className="flex items-center gap-4">
//                 {/* Rank Badge */}
//                 <div className={`w-10 h-10 bg-gradient-to-r ${getRankColor(entry.rank)} rounded-full flex items-center justify-center shadow-lg`}>
//                   {entry.rank <= 3 ? (
//                     getRankIcon(entry.rank)
//                   ) : (
//                     <span className="text-white font-bold text-sm">#{entry.rank}</span>
//                   )}
//                 </div>

//                 {/* User Avatar */}
//                 <div className="relative">
//                   {entry.user.user?.profile_picture ? (
//                     <img 
//                       src={entry.user.user.profile_picture}
//                       alt={entry.user.user.username || 'User'}
//                       className={`w-12 h-12 rounded-full object-cover ring-2 ring-amber-200 ${
//                         entry.user.blur_profile ? 'blur-[1px] opacity-85' : ''
//                       }`}
//                     />
//                   ) : (
//                     <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white font-bold ${
//                       entry.user.blur_profile ? 'blur-[1px] opacity-85' : ''
//                     }`}>
//                       {entry.user.user?.username?.[0]?.toUpperCase() || 'U'}
//                     </div>
//                   )}
                  
//                   {/* Vibe match indicator */}
//                   <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-amber-200">
//                     {getVibeMatchIcon(entry.vibeMatches)}
//                   </div>
//                 </div>

//                 {/* User Info */}
//                 <div className="flex-1">
//                   <div className="flex items-center gap-2 mb-1">
//                     <p className={`font-semibold ${isCurrentUser ? 'text-amber-700' : 'text-gray-800'}`}>
//                       {entry.user.user?.username || 'Anonymous'}
//                       {isCurrentUser && <span className="text-amber-600 ml-1">(You)</span>}
//                     </p>
//                   </div>
                  
//                   <div className="flex items-center gap-4 text-sm">
//                     <div className="flex items-center gap-1">
//                       <Heart className="w-4 h-4 text-pink-500" />
//                       <span className="text-gray-600">{entry.vibeMatches} matches</span>
//                     </div>
                    
//                     {entry.averageCompatibility > 0 && (
//                       <div className="flex items-center gap-1">
//                         <Brain className="w-4 h-4 text-purple-500" />
//                         <span className="text-gray-600">{Math.round(entry.averageCompatibility)}% avg</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* CharmCoins */}
//                 <div className="text-right">
//                   <div className="flex items-center gap-1 justify-end mb-1">
//                     <Sparkles className="w-4 h-4 text-amber-500" />
//                     <span className="font-bold text-amber-600">{entry.charmCoins}</span>
//                   </div>
//                   <p className="text-xs text-gray-500">CharmCoins</p>
//                 </div>
//               </div>
//             </motion.div>
//           );
//         })}
//       </div>

//       {/* Current user's rank if not in top 5 */}
//       {leaderboardData.length > 5 && (
//         (() => {
//           const currentUserEntry = leaderboardData.find(entry => entry.user.user_id === currentUserId);
//           if (currentUserEntry && currentUserEntry.rank > 5) {
//             return (
//               <div className="mt-4 pt-4 border-t border-amber-200">
//                 <motion.div
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200"
//                 >
//                   <div className="flex items-center gap-4">
//                     <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
//                       <span className="text-white font-bold text-sm">#{currentUserEntry.rank}</span>
//                     </div>
                    
//                     <div className="flex-1">
//                       <p className="font-semibold text-amber-700">Your Rank</p>
//                       <p className="text-sm text-gray-600">
//                         {currentUserEntry.vibeMatches} matches • {Math.round(currentUserEntry.averageCompatibility)}% avg
//                       </p>
//                     </div>
                    
//                     <div className="flex items-center gap-1">
//                       <Sparkles className="w-4 h-4 text-amber-500" />
//                       <span className="font-bold text-amber-600">{currentUserEntry.charmCoins}</span>
//                     </div>
//                   </div>
//                 </motion.div>
//               </div>
//             );
//           }
//           return null;
//         })()
//       )}

//       {/* Footer */}
//       <div className="mt-6 pt-4 border-t border-amber-200">
//         <div className="text-center">
//           <p className="text-xs text-gray-500">
//             🏆 Rankings update in real-time • 💰 Earn more by playing MindMatch Arena
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }