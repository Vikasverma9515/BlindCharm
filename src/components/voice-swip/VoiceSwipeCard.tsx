// 'use client'

// import { useState, useRef, useEffect } from 'react';
// import { Play, Pause, Heart, X, User, Clock } from 'lucide-react';
// import { VoiceSwipe } from '@/lib/services/VoiceSwipeService';
// import { motion } from 'framer-motion';

// interface VoiceSwipeCardProps {
//   voiceSwipe: VoiceSwipe;
//   onSwipe: (action: 'like' | 'skip') => void;
//   isActive: boolean;
// }

// export default function VoiceSwipeCard({ voiceSwipe, onSwipe, isActive }: VoiceSwipeCardProps) {
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(voiceSwipe.duration);
//   const audioRef = useRef<HTMLAudioElement>(null);
//   const [isDragging, setIsDragging] = useState(false);
//   const [dragOffset, setDragOffset] = useState(0);
//   const dragStartX = useRef(0);

//   useEffect(() => {
//     const audio = audioRef.current;
//     if (!audio) return;

//     const updateTime = () => setCurrentTime(audio.currentTime);
//     const updateDuration = () => setDuration(audio.duration || voiceSwipe.duration);
//     const onEnded = () => setIsPlaying(false);

//     audio.addEventListener('timeupdate', updateTime);
//     audio.addEventListener('loadedmetadata', updateDuration);
//     audio.addEventListener('ended', onEnded);

//     return () => {
//       audio.removeEventListener('timeupdate', updateTime);
//       audio.removeEventListener('loadedmetadata', updateDuration);
//       audio.removeEventListener('ended', onEnded);
//     };
//   }, [voiceSwipe.duration]);

//   // Calculate age from user data if available
//   const calculateAge = (dob?: string): number | null => {
//     if (!dob) return null;
//     const birthDate = new Date(dob);
//     const today = new Date();
//     let age = today.getFullYear() - birthDate.getFullYear();
//     const monthDiff = today.getMonth() - birthDate.getMonth();
//     if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
//       age--;
//     }
//     return age;
//   };

//   const togglePlayPause = () => {
//     const audio = audioRef.current;
//     if (!audio) return;

//     if (isPlaying) {
//       audio.pause();
//     } else {
//       audio.play();
//     }
//     setIsPlaying(!isPlaying);
//   };

//   const formatTime = (time: number) => {
//     const minutes = Math.floor(time / 60);
//     const seconds = Math.floor(time % 60);
//     return `${minutes}:${seconds.toString().padStart(2, '0')}`;
//   };

//   const handleMouseDown = (e: React.MouseEvent) => {
//     setIsDragging(true);
//     dragStartX.current = e.clientX;
//   };

//   const handleMouseMove = (e: React.MouseEvent) => {
//     if (!isDragging) return;
//     const offset = e.clientX - dragStartX.current;
//     setDragOffset(offset);
//   };

//   const handleMouseUp = () => {
//     if (!isDragging) return;
    
//     if (Math.abs(dragOffset) > 100) {
//       if (dragOffset > 0) {
//         onSwipe('like');
//       } else {
//         onSwipe('skip');
//       }
//     }
    
//     setIsDragging(false);
//     setDragOffset(0);
//   };

//   const handleTouchStart = (e: React.TouchEvent) => {
//     setIsDragging(true);
//     dragStartX.current = e.touches[0].clientX;
//   };

//   const handleTouchMove = (e: React.TouchEvent) => {
//     if (!isDragging) return;
//     const offset = e.touches[0].clientX - dragStartX.current;
//     setDragOffset(offset);
//   };

//   const handleTouchEnd = () => {
//     if (!isDragging) return;
    
//     if (Math.abs(dragOffset) > 100) {
//       if (dragOffset > 0) {
//         onSwipe('like');
//       } else {
//         onSwipe('skip');
//       }
//     }
    
//     setIsDragging(false);
//     setDragOffset(0);
//   };

//   const age = calculateAge((voiceSwipe.user as any)?.dob);

//   return (
//     <motion.div
//       className={`relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden ${
//         isActive ? 'z-20' : 'z-10'
//       }`}
//       style={{
//         transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.1}deg)`,
//         opacity: isDragging ? 0.8 : 1,
//       }}
//       animate={!isDragging ? { 
//         scale: isActive ? 1 : 0.95,
//         y: isActive ? 0 : 20,
//       } : {}}
//       onMouseDown={handleMouseDown}
//       onMouseMove={handleMouseMove}
//       onMouseUp={handleMouseUp}
//       onMouseLeave={handleMouseUp}
//       onTouchStart={handleTouchStart}
//       onTouchMove={handleTouchMove}
//       onTouchEnd={handleTouchEnd}
//     >
//       {/* Drag Indicators */}
//       <div 
//         className={`absolute top-4 left-4 px-3 py-1 rounded-full text-white font-semibold transition-opacity ${
//           dragOffset > 50 ? 'opacity-100 bg-green-500' : 'opacity-0'
//         }`}
//       >
//         LIKE
//       </div>
//       <div 
//         className={`absolute top-4 right-4 px-3 py-1 rounded-full text-white font-semibold transition-opacity ${
//           dragOffset < -50 ? 'opacity-100 bg-red-500' : 'opacity-0'
//         }`}
//       >
//         SKIP
//       </div>

//       <div className="p-6">
//         {/* User Info */}
//         <div className="flex items-center space-x-4 mb-6">
//           {voiceSwipe.user.profile_picture ? (
//             <img
//               src={voiceSwipe.user.profile_picture}
//               alt={voiceSwipe.user.username}
//               className="w-16 h-16 rounded-full object-cover"
//             />
//           ) : (
//             <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
//               <User className="w-8 h-8 text-white" />
//             </div>
//           )}
//           <div className="flex-1">
//             <h3 className="text-xl font-bold text-gray-900 dark:text-white">
//               Anonymous User
//               {age && <span className="text-lg font-normal ml-2">{age}</span>}
//             </h3>
//             <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
//               <Clock className="w-4 h-4" />
//               <span className="text-sm">{formatTime(voiceSwipe.duration / 1000)} voice message</span>
//             </div>
//           </div>
//         </div>

//         {/* Custom Line */}
//         <div className="mb-6">
//           <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
//             <p className="text-gray-900 dark:text-white text-lg leading-relaxed italic">
//               "{voiceSwipe.custom_line}"
//             </p>
//           </div>
//         </div>

//         {/* Voice Player */}
//         <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 mb-6">
//           <audio
//             ref={audioRef}
//             src={voiceSwipe.audio_url}
//             preload="metadata"
//           />
          
//           <div className="flex items-center justify-between">
//             <button
//               onClick={togglePlayPause}
//               className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
//             >
//               {isPlaying ? (
//                 <Pause className="w-6 h-6 text-purple-500" />
//               ) : (
//                 <Play className="w-6 h-6 text-purple-500 ml-1" />
//               )}
//             </button>

//             <div className="flex-1 mx-4">
//               <div className="bg-white/20 rounded-full h-2 overflow-hidden">
//                 <div
//                   className="bg-white h-full transition-all duration-300"
//                   style={{
//                     width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
//                   }}
//                 />
//               </div>
//               <div className="flex justify-between mt-1 text-white/80 text-sm">
//                 <span>{formatTime(currentTime)}</span>
//                 <span>{formatTime(duration)}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex justify-center space-x-6">
//           <button
//             onClick={() => onSwipe('skip')}
//             className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
//           >
//             <X className="w-8 h-8 text-gray-600 dark:text-gray-300" />
//           </button>
          
//           <button
//             onClick={() => onSwipe('like')}
//             className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
//           >
//             <Heart className="w-8 h-8 text-white fill-current" />
//           </button>
//         </div>

//         {/* Swipe Instructions */}
//         <div className="text-center mt-4 text-gray-500 dark:text-gray-400 text-sm">
//           Swipe right to like • Swipe left to skip
//         </div>
//       </div>
//     </motion.div>
//   );
// }