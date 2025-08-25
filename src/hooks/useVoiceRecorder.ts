// hooks/useVoiceRecorder.ts - SIMPLE & NATURAL VERSION
import { useState, useRef, useCallback, useEffect } from 'react';

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  // AGGRESSIVE CLEANUP - STOP EVERYTHING
  const stopEverything = useCallback(() => {
    console.log('🚨 STOPPING EVERYTHING...');
    
    // Stop MediaRecorder first
    if (mediaRecorderRef.current) {
      try {
        console.log('🛑 MediaRecorder state:', mediaRecorderRef.current.state);
        if (mediaRecorderRef.current.state === 'recording' || mediaRecorderRef.current.state === 'paused') {
          mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current = null;
      } catch (error) {
        console.error('Error stopping MediaRecorder:', error);
        mediaRecorderRef.current = null;
      }
    }
    
    // FORCE STOP ALL AUDIO TRACKS
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      console.log('🛑 Stopping', tracks.length, 'tracks');
      
      tracks.forEach((track, index) => {
        console.log(`🛑 Stopping track ${index}:`, track.kind, track.readyState);
        if (track.readyState === 'live') {
          track.stop();
        }
        track.enabled = false;
      });
      
      streamRef.current = null;
    }
    
    chunksRef.current = [];
    setIsRecording(false);
    setIsProcessing(false);
    
    console.log('✅ Everything stopped and cleaned up');
  }, []);

  const startRecording = useCallback(async () => {
    if (isRecording || isProcessing) {
      console.log('⚠️ Already busy');
      return;
    }

    try {
      console.log('🎤 Starting NATURAL voice recording...');
      
      // Stop everything first
      stopEverything();
      
      // NATURAL AUDIO SETTINGS - NO PROCESSING
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,    // NO echo cancellation
          noiseSuppression: false,    // NO noise suppression  
          autoGainControl: false,     // NO auto gain
          sampleRate: 44100,          // CD QUALITY
          channelCount: 1,            // Mono
        } 
      });

      console.log('🎙️ Got natural audio stream');
      streamRef.current = stream;
      chunksRef.current = [];
      startTimeRef.current = Date.now();

      // USE SIMPLEST POSSIBLE RECORDING
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('❌ MediaRecorder error:', event);
        stopEverything();
      };

      // Start with NO time slicing - record continuously
      mediaRecorder.start();
      setIsRecording(true);

      console.log('✅ Natural recording started');
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      stopEverything();
      throw new Error('Failed to access microphone');
    }
  }, [isRecording, isProcessing, stopEverything]);

  const stopRecording = useCallback((): Promise<{ blob: Blob; duration: number }> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current || !isRecording) {
        stopEverything();
        reject(new Error('No active recording'));
        return;
      }

      console.log('🛑 Stopping natural recording...');
      setIsRecording(false);
      setIsProcessing(true);

      const mediaRecorder = mediaRecorderRef.current;
      const startTime = startTimeRef.current;

      mediaRecorder.onstop = () => {
        console.log('📦 MediaRecorder stopped, processing chunks...');
        
        try {
          const duration = Math.round((Date.now() - startTime) / 1000);
          const chunks = [...chunksRef.current];
          
          console.log('📊 Got', chunks.length, 'chunks for', duration, 'seconds');
          
          if (chunks.length === 0) {
            stopEverything();
            reject(new Error('No audio data recorded'));
            return;
          }

          // Create blob with NATURAL format
          const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
          
          console.log('✅ Natural audio blob created:', {
            size: blob.size,
            type: blob.type,
            duration: duration
          });

          // STOP EVERYTHING IMMEDIATELY
          stopEverything();

          if (blob.size < 1000) {
            reject(new Error('Recording too short'));
            return;
          }

          resolve({ blob, duration: Math.max(duration, 1) });

        } catch (error) {
          console.error('❌ Error processing:', error);
          stopEverything();
          reject(error);
        }
      };

      // STOP THE RECORDER
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      } else {
        console.log('MediaRecorder not recording, state:', mediaRecorder.state);
        stopEverything();
        reject(new Error('MediaRecorder not recording'));
      }
    });
  }, [isRecording, stopEverything]);

  const cancelRecording = useCallback(() => {
    console.log('❌ Cancelling recording...');
    stopEverything();
  }, [stopEverything]);

  // CLEANUP ON COMPONENT UNMOUNT
  useEffect(() => {
    return () => {
      console.log('🧹 Component unmounting - final cleanup');
      stopEverything();
    };
  }, [stopEverything]);

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
// // hooks/useVoiceRecorder.ts - Better audio quality
// import { useState, useRef, useCallback, useEffect } from 'react';

// export function useVoiceRecorder() {
//   const [isRecording, setIsRecording] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const streamRef = useRef<MediaStream | null>(null);
//   const chunksRef = useRef<Blob[]>([]);
//   const startTimeRef = useRef<number>(0);

//   const forceCleanup = useCallback(() => {
//     console.log('🧹 FORCE cleaning up recorder...');
    
//     if (mediaRecorderRef.current) {
//       try {
//         if (mediaRecorderRef.current.state === 'recording') {
//           mediaRecorderRef.current.stop();
//         }
//       } catch (error) {
//         console.error('Error stopping MediaRecorder:', error);
//       }
//       mediaRecorderRef.current = null;
//     }
    
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach(track => {
//         console.log('🛑 Stopping track:', track.kind, track.readyState);
//         track.stop();
//         track.enabled = false;
//       });
//       streamRef.current = null;
//     }
    
//     chunksRef.current = [];
//     setIsRecording(false);
//     setIsProcessing(false);
    
//     console.log('✅ Cleanup completed');
//   }, []);

//   const startRecording = useCallback(async () => {
//     if (isRecording || isProcessing) {
//       console.log('⚠️ Already busy, ignoring');
//       return;
//     }

//     try {
//       console.log('🎤 Starting voice recording...');
      
//       forceCleanup();
      
//       // BETTER AUDIO SETTINGS - Balance between quality and file size
//       const stream = await navigator.mediaDevices.getUserMedia({ 
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true,
//           sampleRate: 22050,  // Good quality (half of CD quality)
//           channelCount: 1,    // Mono is fine for voice
//         } 
//       });

//       console.log('🎙️ Got audio stream with', stream.getTracks().length, 'tracks');
//       streamRef.current = stream;
//       chunksRef.current = [];
//       startTimeRef.current = Date.now();

//       // Try different codecs in order of preference
//       let mimeType = 'audio/webm;codecs=opus';
//       let bitRate = 32000; // 32kbps - good for voice

//       if (!MediaRecorder.isTypeSupported(mimeType)) {
//         mimeType = 'audio/webm';
//         if (!MediaRecorder.isTypeSupported(mimeType)) {
//           mimeType = 'audio/mp4';
//           bitRate = 48000; // MP4 needs higher bitrate
//         }
//       }

//       console.log('🎵 Using codec:', mimeType, 'at', bitRate, 'bps');

//       const mediaRecorder = new MediaRecorder(stream, {
//         mimeType: mimeType,
//         audioBitsPerSecond: bitRate // Much better quality
//       });

//       mediaRecorderRef.current = mediaRecorder;

//       mediaRecorder.ondataavailable = (event) => {
//         if (event.data && event.data.size > 0) {
//           console.log('📊 Got chunk:', event.data.size, 'bytes');
//           chunksRef.current.push(event.data);
//         }
//       };

//       mediaRecorder.onerror = (event) => {
//         console.error('❌ MediaRecorder error:', event);
//         forceCleanup();
//       };

//       // Collect data every 500ms for better quality
//       mediaRecorder.start(500);
//       setIsRecording(true);

//       console.log('✅ Recording started with quality settings');
//     } catch (error) {
//       console.error('❌ Failed to start recording:', error);
//       forceCleanup();
//       throw new Error('Failed to access microphone');
//     }
//   }, [isRecording, isProcessing, forceCleanup]);

//   const stopRecording = useCallback((): Promise<{ blob: Blob; duration: number }> => {
//     return new Promise((resolve, reject) => {
//       if (!mediaRecorderRef.current || !isRecording) {
//         forceCleanup();
//         reject(new Error('No active recording'));
//         return;
//       }

//       console.log('🛑 Stopping recording...');
//       setIsRecording(false);
//       setIsProcessing(true);

//       const mediaRecorder = mediaRecorderRef.current;
//       const startTime = startTimeRef.current;

//       const timeout = setTimeout(() => {
//         console.error('❌ Stop timeout, force cleanup');
//         forceCleanup();
//         reject(new Error('Recording stop timeout'));
//       }, 3000);

//       mediaRecorder.onstop = () => {
//         clearTimeout(timeout);
        
//         try {
//           const duration = Math.round((Date.now() - startTime) / 1000);
//           const chunks = [...chunksRef.current];
          
//           console.log('📦 Processing', chunks.length, 'chunks,', duration, 'seconds');
          
//           if (chunks.length === 0) {
//             forceCleanup();
//             reject(new Error('No audio data recorded'));
//             return;
//           }

//           // Create blob with original MIME type for best compatibility
//           const blob = new Blob(chunks, { 
//             type: mediaRecorder.mimeType || 'audio/webm;codecs=opus' 
//           });
          
//           console.log('✅ Created blob:', {
//             size: blob.size, 
//             type: blob.type,
//             sizePerSecond: Math.round(blob.size / duration),
//             duration: duration
//           });
          
//           forceCleanup();

//           if (blob.size < 1000) { // 1KB minimum
//             reject(new Error('Recording too short'));
//             return;
//           }

//           resolve({
//             blob,
//             duration: Math.max(duration, 1)
//           });

//         } catch (error) {
//           console.error('❌ Error processing:', error);
//           forceCleanup();
//           reject(error);
//         }
//       };

//       if (mediaRecorder.state === 'recording') {
//         mediaRecorder.stop();
//       } else {
//         clearTimeout(timeout);
//         forceCleanup();
//         reject(new Error('MediaRecorder not recording'));
//       }
//     });
//   }, [isRecording, forceCleanup]);

//   const cancelRecording = useCallback(() => {
//     console.log('❌ Cancelling recording...');
//     forceCleanup();
//   }, [forceCleanup]);

//   useEffect(() => {
//     return () => {
//       console.log('🧹 Component unmounting, cleanup');
//       forceCleanup();
//     };
//   }, [forceCleanup]);

//   return {
//     isRecording,
//     isProcessing,
//     startRecording,
//     stopRecording,
//     cancelRecording,
//   };
// }