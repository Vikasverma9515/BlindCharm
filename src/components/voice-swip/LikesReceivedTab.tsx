// 'use client'

// import { useState, useEffect } from 'react';
// import { Play, Pause, Heart, X, User, Clock, Loader2 } from 'lucide-react';
// import { VoiceSwipeService, LikeReceived } from '@/lib/services/VoiceSwipeService';
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';

// interface LikesReceivedTabProps {
//   lobbyId: string;
// }

// export default function LikesReceivedTab({ lobbyId }: LikesReceivedTabProps) {
//   const { data: session } = useSession();
//   const router = useRouter();
//   const [likes, setLikes] = useState<LikeReceived[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [playingAudio, setPlayingAudio] = useState<string | null>(null);
//   const [processingLike, setProcessingLike] = useState<string | null>(null);

//   useEffect(() => {
//     if (session?.user?.id) {
//       fetchLikesReceived();
//     }
//   }, [session?.user?.id, lobbyId]);

//   const fetchLikesReceived = async () => {
//     if (!session?.user?.id) return;

//     try {
//       setLoading(true);
//       const likesData = await VoiceSwipeService.getLikesReceived(session.user.id, lobbyId);
//       setLikes(likesData);
//     } catch (error) {
//       console.error('Error fetching likes:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLikeBack = async (likeId: string) => {
//     if (!session?.user?.id || processingLike) return;

//     try {
//       setProcessingLike(likeId);
//       const result = await VoiceSwipeService.likeBack(session.user.id, likeId, lobbyId);
      
//       if (result.voiceMatch) {
//         // Match created! Show success and redirect
//         alert('🎉 It\'s a match! Redirecting to chat...');
//         // The service will handle the redirect
//       } else {
//         // Just liked back, remove from list
//         setLikes(prev => prev.filter(like => like.id !== likeId));
//         alert('💕 Liked back!');
//       }
//     } catch (error) {
//       console.error('Error liking back:', error);
//       if (error instanceof Error && error.message.includes('voice swipe first')) {
//         alert('Please create a voice swipe first before liking back!');
//       } else {
//         alert('Failed to like back. Please try again.');
//       }
//     } finally {
//       setProcessingLike(null);
//     }
//   };

//   const handleSkip = (likeId: string) => {
//     setLikes(prev => prev.filter(like => like.id !== likeId));
//   };

//   const toggleAudio = (audioId: string, audioUrl: string) => {
//     if (playingAudio === audioId) {
//       // Pause current audio
//       const audio = document.getElementById(`audio-${audioId}`) as HTMLAudioElement;
//       audio?.pause();
//       setPlayingAudio(null);
//     } else {
//       // Stop any currently playing audio
//       if (playingAudio) {
//         const currentAudio = document.getElementById(`audio-${playingAudio}`) as HTMLAudioElement;
//         currentAudio?.pause();
//       }
      
//       // Play new audio
//       const audio = document.getElementById(`audio-${audioId}`) as HTMLAudioElement;
//       audio?.play();
//       setPlayingAudio(audioId);
//     }
//   };

//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <div className="text-center">
//           <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
//           <p className="text-gray-600 dark:text-gray-400">Loading your likes...</p>
//         </div>
//       </div>
//     );
//   }

//   if (likes.length === 0) {
//     return (
//       <div className="text-center py-12">
//         <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//         <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
//           No likes yet
//         </h3>
//         <p className="text-gray-600 dark:text-gray-400">
//           When someone likes your voice, they'll appear here
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       <div className="text-center mb-6">
//         <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
//           People Who Liked You
//         </h2>
//         <p className="text-gray-600 dark:text-gray-400">
//           {likes.length} {likes.length === 1 ? 'person likes' : 'people like'} your voice
//         </p>
//       </div>

//       {likes.map((like) => (
//         <div
//           key={like.id}
//           className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
//         >
//           <div className="flex items-start space-x-4 mb-4">
//             {like.swiper.profile_picture ? (
//               <img
//                 src={like.swiper.profile_picture}
//                 alt={like.swiper.username}
//                 className="w-12 h-12 rounded-full object-cover"
//               />
//             ) : (
//               <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
//                 <User className="w-6 h-6 text-white" />
//               </div>
//             )}
            
//             <div className="flex-1">
//               <h3 className="font-semibold text-gray-900 dark:text-white">
//                 Anonymous User
//               </h3>
//               <p className="text-sm text-gray-500 dark:text-gray-400">
//                 Liked your voice • {new Date(like.created_at).toLocaleDateString()}
//               </p>
//             </div>
//           </div>

//           {/* Their Custom Line */}
//           <div className="mb-4">
//             <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
//               <p className="text-gray-700 dark:text-gray-300 italic">
//                 "{like.voice_swipe.custom_line}"
//               </p>
//             </div>
//           </div>

//           {/* Voice Player */}
//           <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 mb-4">
//             <audio
//               id={`audio-${like.id}`}
//               src={like.voice_swipe.audio_url}
//               onEnded={() => setPlayingAudio(null)}
//               preload="metadata"
//             />
            
//             <div className="flex items-center justify-between">
//               <button
//                 onClick={() => toggleAudio(like.id, like.voice_swipe.audio_url)}
//                 className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform"
//               >
//                 {playingAudio === like.id ? (
//                   <Pause className="w-5 h-5 text-purple-500" />
//                 ) : (
//                   <Play className="w-5 h-5 text-purple-500 ml-0.5" />
//                 )}
//               </button>

//               <div className="flex-1 mx-3">
//                 <div className="bg-white/20 rounded-full h-1.5">
//                   <div className="bg-white h-full rounded-full transition-all duration-300" />
//                 </div>
//               </div>

//               <div className="flex items-center text-white/80 text-sm">
//                 <Clock className="w-4 h-4 mr-1" />
//                 <span>{formatTime(like.voice_swipe.duration / 1000)}</span>
//               </div>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex space-x-3">
//             <button
//               onClick={() => handleSkip(like.id)}
//               className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
//             >
//               <X className="w-5 h-5" />
//               <span>Skip</span>
//             </button>
            
//             <button
//               onClick={() => handleLikeBack(like.id)}
//               disabled={processingLike === like.id}
//               className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-xl font-medium transition-colors flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
//             >
//               {processingLike === like.id ? (
//                 <>
//                   <Loader2 className="w-5 h-5 animate-spin" />
//                   <span>Liking...</span>
//                 </>
//               ) : (
//                 <>
//                   <Heart className="w-5 h-5 fill-current" />
//                   <span>Like Back</span>
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }