// // components/chat/VoiceChallenge/ChallengeRecorder.tsx
// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { Mic, Square, Send, X } from 'lucide-react';
// import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';

// interface ChallengeRecorderProps {
//   prompt: string;
//   timeLimit: number;
//   onComplete: (audioBlob: Blob, duration: number) => void;
//   onCancel: () => void;
// }

// export default function ChallengeRecorder({ 
//   prompt, 
//   timeLimit, 
//   onComplete, 
//   onCancel 
// }: ChallengeRecorderProps) {
//   const [timeRemaining, setTimeRemaining] = useState(timeLimit);
//   const [hasStarted, setHasStarted] = useState(false);
//   const timerRef = useRef<NodeJS.Timeout | null>(null);
  
//   const { isRecording, isProcessing, startRecording, stopRecording, cancelRecording } = useVoiceRecorder();

//   useEffect(() => {
//     if (isRecording && hasStarted) {
//       timerRef.current = setInterval(() => {
//         setTimeRemaining(prev => {
//           if (prev <= 1) {
//             handleComplete();
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000);
//     }

//     return () => {
//       if (timerRef.current) {
//         clearInterval(timerRef.current);
//       }
//     };
//   }, [isRecording, hasStarted]);

//   const handleStartRecording = async () => {
//     try {
//       setHasStarted(true);
//       await startRecording();
//     } catch (error) {
//       console.error('Failed to start recording:', error);
//       alert('Failed to access microphone');
//     }
//   };

//   const handleComplete = async () => {
//     try {
//       const { blob, duration } = await stopRecording();
//       onComplete(blob, duration);
//     } catch (error) {
//       console.error('Failed to complete recording:', error);
//     }
//   };

//   const handleCancel = () => {
//     cancelRecording();
//     onCancel();
//   };

//   return (
//     <div className="bg-purple-600 rounded-2xl p-6 my-3 text-white ">
//       <div className="text-center mb-4">
//         <h3 className="text-lg font-semibold mb-2"> Recording Challenge</h3>
//         <p className="text-sm opacity-90 mb-4">{prompt}</p>
        
//         <div className="text-3xl font-bold mb-2">
//           {timeRemaining}s
//         </div>
        
//         <div className="w-full bg-white/20 rounded-full h-2 mb-4">
//           <div 
//             className="bg-white h-2 rounded-full transition-all duration-1000"
//             style={{ width: `${((timeLimit - timeRemaining) / timeLimit) * 100}%` }}
//           />
//         </div>
//       </div>

//       {!hasStarted ? (
//         <div className="flex justify-center gap-3">
//           <button
//             onClick={handleCancel}
//             className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2"
//           >
//             <X className="w-4 h-4" />
//             Cancel
//           </button>
//           <button
//             onClick={handleStartRecording}
//             disabled={isProcessing}
//             className="px-6 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
//           >
//             <Mic className="w-4 h-4" />
//             Start Recording
//           </button>
//         </div>
//       ) : (
//         <div className="flex justify-center gap-3">
//           <button
//             onClick={handleCancel}
//             className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleComplete}
//             disabled={isProcessing}
//             className="px-6 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
//           >
//             {isRecording ? (
//               <>
//                 <Square className="w-4 h-4" />
//                 Finish Recording
//               </>
//             ) : (
//               <>
//                 <Send className="w-4 h-4" />
//                 Send Challenge
//               </>
//             )}
//           </button>
//         </div>
//       )}

//       {isRecording && (
//         <div className="flex justify-center mt-4">
//           <div className="flex items-center gap-2 text-sm opacity-90">
//             <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
//             Recording in progress...
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// components/chat/VoiceChallenge/ChallengeRecorder.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, Square, Send, X } from 'lucide-react';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';

interface ChallengeRecorderProps {
  prompt: string;
  timeLimit: number;
  onComplete: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
}

export default function ChallengeRecorder({ 
  prompt, 
  timeLimit, 
  onComplete, 
  onCancel 
}: ChallengeRecorderProps) {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [hasStarted, setHasStarted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { isRecording, isProcessing, startRecording, stopRecording, cancelRecording } = useVoiceRecorder();

  useEffect(() => {
    if (isRecording && hasStarted) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, hasStarted]);

  const handleStartRecording = async () => {
    try {
      setHasStarted(true);
      await startRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to access microphone');
    }
  };

  const handleComplete = async () => {
    try {
      const { blob, duration } = await stopRecording();
      onComplete(blob, duration);
    } catch (error) {
      console.error('Failed to complete recording:', error);
    }
  };

  const handleCancel = () => {
    cancelRecording();
    onCancel();
  };

  return (
    <div className="bg-purple-600 rounded-xl p-3 my-2 text-white max-w-sm">
      <div className="text-center mb-3">
        <h3 className="text-sm font-semibold mb-1">Recording Challenge</h3>
        <p className="text-xs opacity-90 mb-2">{prompt}</p>
        
        <div className="text-xl font-bold mb-2">
          {timeRemaining}s
        </div>
        
        <div className="w-full bg-white/20 rounded-full h-1.5 mb-3">
          <div 
            className="bg-white h-1.5 rounded-full transition-all duration-1000"
            style={{ width: `${((timeLimit - timeRemaining) / timeLimit) * 100}%` }}
          />
        </div>
      </div>

      {!hasStarted ? (
        <div className="flex justify-center gap-2">
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-md transition-colors flex items-center gap-1 text-xs"
          >
            <X className="w-3 h-3" />
            Cancel
          </button>
          <button
            onClick={handleStartRecording}
            disabled={isProcessing}
            className="px-4 py-1.5 bg-white text-purple-600 font-medium rounded-md hover:bg-gray-100 transition-colors flex items-center gap-1 text-xs"
          >
            <Mic className="w-3 h-3" />
            Start Recording
          </button>
        </div>
      ) : (
        <div className="flex justify-center gap-2">
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-md transition-colors text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            disabled={isProcessing}
            className="px-4 py-1.5 bg-white text-purple-600 font-medium rounded-md hover:bg-gray-100 transition-colors flex items-center gap-1 text-xs"
          >
            {isRecording ? (
              <>
                <Square className="w-3 h-3" />
                Finish
              </>
            ) : (
              <>
                <Send className="w-3 h-3" />
                Send
              </>
            )}
          </button>
        </div>
      )}

      {isRecording && (
        <div className="flex justify-center mt-2">
          <div className="flex items-center gap-1 text-xs opacity-90">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            Recording...
          </div>
        </div>
      )}
    </div>
  );
}