// 'use client'

// import { useState, useRef, useEffect } from 'react';
// import { Mic, Square, Play, Pause, RotateCcw } from 'lucide-react';
// import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';

// interface VoiceRecorderProps {
//   onComplete: (audioBlob: Blob, duration: number, customLine: string) => void;
//   onCancel: () => void;
//   maxDuration?: number;
// }

// export default function VoiceRecorder({ onComplete, onCancel, maxDuration = 15 }: VoiceRecorderProps) {
//   const [customLine, setCustomLine] = useState('');
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
//   const [audioUrl, setAudioUrl] = useState<string | null>(null);
//   const [recordingTime, setRecordingTime] = useState(0);
//   const audioRef = useRef<HTMLAudioElement>(null);
//   const recordingTimerRef = useRef<NodeJS.Timeout>();

//   const { isRecording, isProcessing, startRecording, stopRecording, cancelRecording } = useVoiceRecorder();

//   // Recording timer
//   useEffect(() => {
//     if (isRecording) {
//       setRecordingTime(0);
//       recordingTimerRef.current = setInterval(() => {
//         setRecordingTime(prev => {
//           if (prev >= maxDuration - 1) {
//             handleStopRecording();
//             return prev;
//           }
//           return prev + 1;
//         });
//       }, 1000);
//     } else {
//       if (recordingTimerRef.current) {
//         clearInterval(recordingTimerRef.current);
//       }
//     }

//     return () => {
//       if (recordingTimerRef.current) {
//         clearInterval(recordingTimerRef.current);
//       }
//     };
//   }, [isRecording, maxDuration]);

//   const handleStartRecording = async () => {
//     try {
//       await startRecording();
//     } catch (error) {
//       console.error('Failed to start recording:', error);
//       alert('Failed to access microphone');
//     }
//   };

//   const handleStopRecording = async () => {
//     try {
//       const { blob, duration } = await stopRecording();
//       setRecordedAudio(blob);
//       const url = URL.createObjectURL(blob);
//       setAudioUrl(url);
//     } catch (error) {
//       console.error('Failed to stop recording:', error);
//       alert('Recording failed. Please try again.');
//     }
//   };

//   const handleRetake = () => {
//     if (audioUrl) {
//       URL.revokeObjectURL(audioUrl);
//     }
//     setRecordedAudio(null);
//     setAudioUrl(null);
//     setRecordingTime(0);
//     setIsPlaying(false);
//   };

//   const handlePlayPause = () => {
//     const audio = audioRef.current;
//     if (!audio || !audioUrl) return;

//     if (isPlaying) {
//       audio.pause();
//     } else {
//       audio.play();
//     }
//     setIsPlaying(!isPlaying);
//   };

// //   const handleSubmit = () => {
// //     if (!recordedAudio || !customLine.trim()) return;
    
// //     const duration = recordingTime * 1000; // Convert to milliseconds
// //     onComplete(recordedAudio, duration);
// //   };
// const handleSubmit = () => {
//   if (!recordedAudio || !customLine.trim()) return;
  
//   const duration = recordingTime * 1000; // Convert to milliseconds
//   onComplete(recordedAudio, duration, customLine); // Pass custom line
// };


//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   return (
//     <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 max-w-md mx-auto">
//       <div className="text-center mb-6">
//         <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
//           Create Voice Swipe
//         </h2>
//         <p className="text-gray-600 dark:text-gray-400">
//           Record your voice and add a custom line
//         </p>
//       </div>

//       {/* Custom Line Input */}
//       <div className="mb-6">
//         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//           Write something interesting:
//         </label>
//         <textarea
//           value={customLine}
//           onChange={(e) => setCustomLine(e.target.value)}
//           placeholder="Tell them something that will make them want to hear your voice..."
//           className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
//           rows={3}
//           maxLength={150}
//         />
//         <div className="text-right text-xs text-gray-500 mt-1">
//           {customLine.length}/150
//         </div>
//       </div>

//       {/* Recording Section */}
//       <div className="mb-6">
//         {!recordedAudio ? (
//           <div className="text-center">
//             {!isRecording ? (
//               <button
//                 onClick={handleStartRecording}
//                 disabled={isProcessing}
//                 className="w-20 h-20 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors disabled:opacity-50"
//               >
//                 <Mic className="w-8 h-8 text-white" />
//               </button>
//             ) : (
//               <button
//                 onClick={handleStopRecording}
//                 className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse"
//               >
//                 <Square className="w-8 h-8 text-white" />
//               </button>
//             )}

//             {isRecording && (
//               <div className="text-center">
//                 <div className="text-2xl font-mono text-red-500 mb-2">
//                   {formatTime(recordingTime)}
//                 </div>
//                 <div className="text-sm text-gray-500">
//                   Max {maxDuration}s • Release to stop
//                 </div>
//               </div>
//             )}

//             {!isRecording && !isProcessing && (
//               <p className="text-gray-500 text-sm">
//                 Tap and hold to record ({maxDuration}s max)
//               </p>
//             )}
//                         {isProcessing && (
//               <div className="flex items-center justify-center space-x-2 text-gray-500">
//                 <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
//                 <span>Processing...</span>
//               </div>
//             )}
//           </div>
//         ) : (
//           <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
//             <audio
//               ref={audioRef}
//               src={audioUrl || undefined}
//               onEnded={() => setIsPlaying(false)}
//               preload="metadata"
//             />
            
//             <div className="flex items-center justify-between mb-4">
//               <button
//                 onClick={handlePlayPause}
//                 className="w-12 h-12 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center justify-center transition-colors"
//               >
//                 {isPlaying ? (
//                   <Pause className="w-5 h-5 text-white" />
//                 ) : (
//                   <Play className="w-5 h-5 text-white ml-0.5" />
//                 )}
//               </button>

//               <div className="flex-1 mx-4">
//                 <div className="bg-gray-300 dark:bg-gray-600 rounded-full h-2">
//                   <div className="bg-purple-500 h-full rounded-full transition-all duration-300" />
//                 </div>
//                 <div className="text-center text-sm text-gray-500 mt-1">
//                   {formatTime(recordingTime)}
//                 </div>
//               </div>

//               <button
//                 onClick={handleRetake}
//                 className="w-12 h-12 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 rounded-full flex items-center justify-center transition-colors"
//               >
//                 <RotateCcw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
//               </button>
//             </div>

//             <div className="text-center text-green-600 dark:text-green-400 text-sm font-medium">
//               ✓ Recording saved ({formatTime(recordingTime)})
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Action Buttons */}
//       <div className="flex space-x-3">
//         <button
//           onClick={onCancel}
//           className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
//         >
//           Cancel
//         </button>
        
//         <button
//           onClick={handleSubmit}
//           disabled={!recordedAudio || !customLine.trim()}
//           className="flex-1 py-3 px-4 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-xl font-medium transition-colors disabled:cursor-not-allowed"
//         >
//           Create Voice Swipe
//         </button>
//       </div>
//     </div>
//   );
// }