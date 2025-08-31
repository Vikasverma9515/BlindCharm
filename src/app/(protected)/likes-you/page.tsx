// // src/app/(protected)/likes-you/page.tsx

// 'use client'

// import React, { useEffect, useState } from 'react';
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import { Volume2, Heart, Sparkles, Play, Pause } from 'lucide-react';
// import SimpleTopNav from '@/components/shared/SimpleTopNav';
// import SimpleBottomNav from '@/components/shared/SimpleBottomNav';
// import { VoiceService } from '@/lib/services/VoiceService';
// import toast from 'react-hot-toast';

// interface IncomingLike {
//   likeId: string;
//   created_at: string;
//   liker_id: string;
//   liker: { id: string; username?: string; full_name?: string };
//   their_card_id: string;
//   their_card: {
//     id: string;
//     audio_url: string;
//     audio_duration: number;
//     mood_tags: string[];
//     prompt?: { id: string; prompt_text: string };
//   };
// }

// export default function LikesYouPage() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const [likes, setLikes] = useState<IncomingLike[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [playingId, setPlayingId] = useState<string | null>(null);

//   useEffect(() => {
//     if (status === 'loading') return;
//     if (!session) {
//       router.push('/login');
//       return;
//     }
//     loadLikes();
//   }, [session, status]);

//   const loadLikes = async () => {
//     if (!session?.user?.id) return;
//     try {
//       setLoading(true);
//       const data = await VoiceService.getIncomingLikes(session.user.id);
//       setLikes(data);
//     } catch (e) {
//       console.error('Failed to load likes', e);
//       toast.error('Failed to load likes');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePlay = (like: IncomingLike) => {
//     if (!like.their_card?.audio_url) return;
//     if (playingId === like.likeId) {
//       setPlayingId(null);
//       return;
//     }
//     setPlayingId(like.likeId);
//     const audio = new Audio(like.their_card.audio_url);
//     audio.play();
//     audio.addEventListener('ended', () => setPlayingId(null));
//   };

//   const handleLikeBack = async (likerUserId: string) => {
//     if (!session?.user?.id) return;
//     try {
//       const result = await VoiceService.likeBack(likerUserId, session.user.id);
//       if (result) {
//         toast.success("It's a match! Opening chat...", { icon: '💫' });
//         router.push(`/chat/${result.chatMatchId}`);
//       } else {
//         toast.success('Liked back!');
//         loadLikes();
//       }
//     } catch (e) {
//       console.error('Failed to like back', e);
//       toast.error('Could not like back');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
//         <div className="text-center">
//           <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
//             <Heart className="w-8 h-8 text-white" />
//           </div>
//           <p className="text-gray-600 dark:text-gray-400">Loading likes...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <SimpleTopNav pageName="Likes You" />
//       <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 pb-32">
//         <div className="px-4">
//           <div className="max-w-2xl mx-auto">
//             {likes.length === 0 ? (
//               <div className="text-center py-20">
//                 <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
//                   <Sparkles className="w-10 h-10 text-gray-400 dark:text-gray-500" />
//                 </div>
//                 <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No likes yet</h3>
//                 <p className="text-gray-600 dark:text-gray-400 mb-6">Keep swiping and creating voice cards!</p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {likes.map((like) => (
//                   <div key={like.likeId} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow">
//                     <div className="flex items-start justify-between">
//                       <div className="flex-1 pr-4">
//                         <div className="flex items-center justify-between mb-2">
//                           <div className="flex items-center space-x-2">
//                             <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
//                               <Volume2 className="w-5 h-5 text-white" />
//                             </div>
//                             <div>
//                               <p className="font-semibold text-gray-900 dark:text-gray-100">
//                                 {like.liker?.username || 'Anonymous'}
//                               </p>
//                               <p className="text-xs text-gray-500 dark:text-gray-400">
//                                 liked your voice · {new Date(like.created_at).toLocaleDateString()}
//                               </p>
//                             </div>
//                           </div>
//                           <button
//                             onClick={() => handlePlay(like)}
//                             className="w-9 h-9 rounded-full bg-purple-500 hover:bg-purple-600 text-white flex items-center justify-center"
//                           >
//                             {playingId === like.likeId ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
//                           </button>
//                         </div>

//                         {like.their_card?.prompt?.prompt_text && (
//                           <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">"{like.their_card.prompt.prompt_text}"</p>
//                         )}

//                         {Array.isArray(like.their_card?.mood_tags) && like.their_card.mood_tags.length > 0 && (
//                           <div className="flex flex-wrap gap-1 mt-2">
//                             {like.their_card.mood_tags.map((tag, idx) => (
//                               <span key={idx} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
//                                 {tag}
//                               </span>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                       <div>
//                         <button
//                           onClick={() => handleLikeBack(like.liker_id)}
//                           className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium"
//                         >
//                           Like back
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </main>
//       <SimpleBottomNav />
//     </>
//   );
// }


// // Add this import
// import VoiceSwipeMain from "@/components/voice-swip/VoiceSwipeMain";
// import { Mic } from "lucide-react";
// import { useState } from "react";

// // Update your activeTab state to include 'voiceswipe'
// const [activeTab, setActiveTab] = useState<'chat' | 'questions' | 'mindmatch' | 'vibeview' | 'leaderboard' | 'hotfeed' | 'voiceswipe'>('chat');

// // Add the voice swipe tab in your tab navigation
// <button
//   onClick={() => setActiveTab('voiceswipe')}
//   className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
//     activeTab === 'voiceswipe'
//       ? 'bg-red-500 text-white'
//       : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
//   }`}
// >
//   <Mic className="w-4 h-4 inline-block mr-1" />
//   Voice Swipe
// </button>

// // Add the voice swipe content in your tab content section
// {activeTab === 'voiceswipe' && (
//   <div className="flex-1 overflow-hidden">
//     <VoiceSwipeMain lobbyId={lobbyId} />
//   </div>
// )}