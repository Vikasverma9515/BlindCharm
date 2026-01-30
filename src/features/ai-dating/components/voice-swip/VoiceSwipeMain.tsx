// 'use client'

// import { useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';
// import { Mic, Heart, Users, Loader2, Plus } from 'lucide-react';
// import { VoiceSwipeService, VoiceSwipe } from '@/lib/services/VoiceSwipeService';
// import VoiceSwipeCard from './VoiceSwipeCard';
// import VoiceRecorder from './VoiceRecorder';
// import LikesReceivedTab from './LikesReceivedTab';
// import { motion, AnimatePresence } from 'framer-motion';
// import { supabase } from '@/lib/auth';

// interface VoiceSwipeMainProps {
//   lobbyId: string;
// }

// export default function VoiceSwipeMain({ lobbyId }: VoiceSwipeMainProps) {
//   const { data: session } = useSession();
//   const [activeTab, setActiveTab] = useState<'swipe' | 'likes' | 'create'>('swipe');
//   const [voiceSwipes, setVoiceSwipes] = useState<VoiceSwipe[]>([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [swiping, setSwiping] = useState(false);
//   const [hasUserVoiceSwipe, setHasUserVoiceSwipe] = useState(false);
//   const [showCreateRecorder, setShowCreateRecorder] = useState(false);

//   useEffect(() => {
//     if (session?.user?.id) {
//       loadVoiceSwipes();
//       checkUserVoiceSwipe();
//     }
//   }, [session?.user?.id, lobbyId]);

//   const loadVoiceSwipes = async () => {
//     if (!session?.user?.id) return;

//     try {
//       setLoading(true);
//       const swipes = await VoiceSwipeService.getVoiceSwipesToSwipe(lobbyId, session.user.id);
//       setVoiceSwipes(swipes);
//       setCurrentIndex(0);
//     } catch (error) {
//       console.error('Error loading voice swipes:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//     const checkUserVoiceSwipe = async () => {
//     if (!session?.user?.id) return;

//     try {
//       const { data, error } = await supabase
//         .from('voice_swipes')
//         .select('id')
//         .eq('user_id', session.user.id)
//         .eq('lobby_id', lobbyId)
//         .eq('is_active', true)
//         .limit(1)
//         .single();

//       setHasUserVoiceSwipe(!error && !!data);
//     } catch (error) {
//       console.error('Error checking user voice swipe:', error);
//       setHasUserVoiceSwipe(false);
//     }
//   };

//   const handleSwipe = async (action: 'like' | 'skip') => {
//     if (!session?.user?.id || swiping || currentIndex >= voiceSwipes.length) return;

//     const currentVoiceSwipe = voiceSwipes[currentIndex];
//     if (!currentVoiceSwipe) return;

//     try {
//       setSwiping(true);
      
//       const result = await VoiceSwipeService.swipeOnVoice(
//         session.user.id,
//         currentVoiceSwipe.id,
//         action,
//         lobbyId
//       );

//       // Move to next card
//       setCurrentIndex(prev => prev + 1);

//       // If it's a match, show notification and redirect
//       if (result.voiceMatch) {
//         alert('🎉 It\'s a match! You both liked each other\'s voices!');
//         // The service handles the redirect to chat
//       }

//       // Load more swipes if running low
//       if (currentIndex >= voiceSwipes.length - 2) {
//         const moreSwipes = await VoiceSwipeService.getVoiceSwipesToSwipe(
//           lobbyId, 
//           session.user.id, 
//           10
//         );
//         setVoiceSwipes(prev => [...prev, ...moreSwipes]);
//       }
//     } catch (error) {
//       console.error('Error swiping:', error);
//       alert('Failed to process swipe. Please try again.');
//     } finally {
//       setSwiping(false);
//     }
//   };

//  // Update in VoiceSwipeMain
// const handleCreateVoiceSwipe = async (audioBlob: Blob, duration: number, customLine: string) => {
//   if (!session?.user?.id) return;

//   try {
//     await VoiceSwipeService.createVoiceSwipe(
//       lobbyId,
//       session.user.id,
//       audioBlob,
//       customLine,
//       duration
//     );

//     setHasUserVoiceSwipe(true);
//     setShowCreateRecorder(false);
//     setActiveTab('swipe');
    
//     loadVoiceSwipes();
    
//     alert('🎤 Voice swipe created successfully!');
//   } catch (error) {
//     console.error('Error creating voice swipe:', error);
//     alert('Failed to create voice swipe. Please try again.');
//   }
// };

// // Update the VoiceRecorder usage
// <VoiceRecorder
//   onComplete={handleCreateVoiceSwipe}
//   onCancel={() => setActiveTab('swipe')}
// />

//   const getCurrentSwipe = () => {
//     return voiceSwipes[currentIndex] || null;
//   };

//   const getUpcomingSwipes = () => {
//     return voiceSwipes.slice(currentIndex + 1, currentIndex + 3);
//   };

//   if (loading && voiceSwipes.length === 0) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
//         <div className="text-center">
//           <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
//           <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
//             Loading voice swipes...
//           </h2>
//           <p className="text-gray-600 dark:text-gray-400">
//             Finding voices for you to discover
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900">
//       {/* Header */}
//       <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
//         <div className="max-w-md mx-auto px-4 py-3">
//           <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">
//             Voice Swipe
//           </h1>
          
//           {/* Tab Navigation */}
//           <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
//             <button
//               onClick={() => setActiveTab('swipe')}
//               className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
//                 activeTab === 'swipe'
//                   ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
//                   : 'text-gray-600 dark:text-gray-300'
//               }`}
//             >
//               <Mic className="w-4 h-4 inline-block mr-1" />
//               Discover
//             </button>
            
//             <button
//               onClick={() => setActiveTab('likes')}
//               className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
//                 activeTab === 'likes'
//                   ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
//                   : 'text-gray-600 dark:text-gray-300'
//               }`}
//             >
//               <Heart className="w-4 h-4 inline-block mr-1" />
//               Likes
//             </button>
            
//             <button
//               onClick={() => setActiveTab('create')}
//               className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
//                 activeTab === 'create'
//                   ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
//                   : 'text-gray-600 dark:text-gray-300'
//               }`}
//             >
//               <Plus className="w-4 h-4 inline-block mr-1" />
//               Create
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Tab Content */}
//       <div className="max-w-md mx-auto px-4 py-6">
//         {activeTab === 'swipe' && (
//           <>
//             {!hasUserVoiceSwipe ? (
//               <div className="text-center py-12">
//                 <Mic className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
//                   Create your voice first
//                 </h3>
//                 <p className="text-gray-600 dark:text-gray-400 mb-6">
//                   You need to create a voice swipe before you can discover others
//                 </p>
//                 <button
//                   onClick={() => setActiveTab('create')}
//                   className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
//                 >
//                   Create Voice Swipe
//                 </button>
//               </div>
//             ) : voiceSwipes.length === 0 || currentIndex >= voiceSwipes.length ? (
//               <div className="text-center py-12">
//                 <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
//                   No more voices
//                 </h3>
//                 <p className="text-gray-600 dark:text-gray-400 mb-6">
//                   You've heard all available voices. Check back later for more!
//                 </p>
//                 <button
//                   onClick={loadVoiceSwipes}
//                   className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
//                 >
//                   Refresh
//                 </button>
//               </div>
//             ) : (
//               <div className="relative h-[600px]">
//                 <AnimatePresence>
//                   {/* Current Card */}
//                   {getCurrentSwipe() && (
//                     <motion.div
//                       key={`current-${currentIndex}`}
//                       className="absolute inset-0"
//                       initial={{ scale: 0.9, opacity: 0 }}
//                       animate={{ scale: 1, opacity: 1 }}
//                       exit={{ scale: 0.9, opacity: 0 }}
//                       transition={{ duration: 0.3 }}
//                     >
//                       <VoiceSwipeCard
//                         voiceSwipe={getCurrentSwipe()!}
//                         onSwipe={handleSwipe}
//                         isActive={true}
//                       />
//                     </motion.div>
//                   )}

//                   {/* Upcoming Cards (Stack Effect) */}
//                   {getUpcomingSwipes().map((swipe, index) => (
//                     <motion.div
//                       key={`upcoming-${currentIndex + index + 1}`}
//                       className="absolute inset-0"
//                       initial={{ scale: 0.85 - (index * 0.05), y: 10 + (index * 5) }}
//                       animate={{ scale: 0.85 - (index * 0.05), y: 10 + (index * 5) }}
//                       style={{ zIndex: -index - 1 }}
//                     >
//                       <VoiceSwipeCard
//                         voiceSwipe={swipe}
//                         onSwipe={() => {}}
//                         isActive={false}
//                       />
//                     </motion.div>
//                   ))}
//                 </AnimatePresence>

//                 {/* Loading Overlay */}
//                 {swiping && (
//                   <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-50">
//                     <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
//                   </div>
//                 )}
//               </div>
//             )}
//           </>
//         )}

//         {activeTab === 'likes' && (
//           <LikesReceivedTab lobbyId={lobbyId} />
//         )}

//         {activeTab === 'create' && (
//           <>
//             {hasUserVoiceSwipe ? (
//               <div className="text-center py-12">
//                 <Mic className="w-16 h-16 text-green-500 mx-auto mb-4" />
//                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
//                   Voice swipe active
//                 </h3>
//                 <p className="text-gray-600 dark:text-gray-400 mb-6">
//                   Your voice is live and others can discover it
//                 </p>
//                 <button
//                   onClick={() => setShowCreateRecorder(true)}
//                   className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
//                 >
//                   Create New Voice
//                 </button>
//               </div>
//             ) : (
//               <VoiceRecorder
//                 onComplete={(blob, duration) => {
//                   // We need custom line from the recorder component
//                   // This will be handled in the VoiceRecorder component
//                 }}
//                 onCancel={() => setActiveTab('swipe')}
//               />
//             )}
//           </>
//         )}
//       </div>

//       {/* Create New Voice Modal */}
//       <AnimatePresence>
//         {showCreateRecorder && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
//           >
//             <motion.div
//               initial={{ scale: 0.9 }}
//               animate={{ scale: 1 }}
//               exit={{ scale: 0.9 }}
//               className="w-full max-w-md"
//             >
//               <VoiceRecorder
//                 onComplete={(blob, duration) => {
//                   // This needs to be updated to handle the custom line
//                   // For now, we'll use a placeholder
//                 }}
//                 onCancel={() => setShowCreateRecorder(false)}
//               />
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }