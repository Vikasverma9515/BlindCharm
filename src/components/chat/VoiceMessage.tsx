// components/VoiceMessage.tsx - Better audio handling
'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Loader2, RefreshCw } from 'lucide-react';

interface VoiceMessageProps {
  audioUrl: string;
  duration?: number;
  isOwn: boolean;
  isLoading?: boolean;
}

export default function VoiceMessage({ audioUrl, duration = 0, isOwn, isLoading = false }: VoiceMessageProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    console.log('🎵 VoiceMessage mounted:', { audioUrl: audioUrl.substring(0, 50) + '...', duration, isOwn });
    
    if (!audioUrl) {
      setError(true);
      setErrorDetails('No audio URL');
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedData = () => {
      console.log('✅ Audio loaded successfully');
      setAudioLoaded(true);
      setError(false);
      setRetryCount(0);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (e: Event) => {
      console.error('❌ Audio playback error:', e);
      console.error('Audio element state:', {
        networkState: audio.networkState,
        readyState: audio.readyState,
        errorCode: audio.error?.code,
        errorMessage: audio.error?.message
      });
      
      setError(true);
      setAudioLoaded(false);
      
      if (audio.error) {
        switch (audio.error.code) {
          case 1: 
            setErrorDetails('Playback aborted');
            break;
          case 2: 
            setErrorDetails('Network error');
            break;
          case 3: 
            setErrorDetails('Decode error');
            break;
          case 4: 
            setErrorDetails('Format not supported');
            break;
          default:
            setErrorDetails('Playback error');
        }
      }

      // Auto-retry for network errors
      if (audio.error?.code === 2 && retryCount < 2) {
        console.log('🔄 Auto-retrying...');
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          setError(false);
          audio.load();
        }, 1000);
      }
    };

    const handleCanPlay = () => {
      console.log('✅ Audio can play');
      setAudioLoaded(true);
      setError(false);
    };

    // Better audio setup
    audio.preload = 'metadata';
    audio.volume = 1.0;
    
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    // Load audio
    audio.load();

    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [audioUrl, retryCount]);

  const togglePlay = async () => {
    if (!audioRef.current || !audioLoaded) return;

    try {
      if (isPlaying) {
        await audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // Reset to beginning if at end
        if (audioRef.current.currentTime >= audioRef.current.duration) {
          audioRef.current.currentTime = 0;
        }
        
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Playback control error:', error);
      setError(true);
      setErrorDetails('Playback failed');
    }
  };

  const retryLoad = () => {
    console.log('🔄 Manual retry...');
    setError(false);
    setRetryCount(prev => prev + 1);
    if (audioRef.current) {
      audioRef.current.load();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (!duration || duration === 0) return 0;
    return (currentTime / duration) * 100;
  };

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-3 p-3 rounded-2xl max-w-xs ${
        isOwn ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-900'
      }`}>
        <Loader2 className="w-8 h-8 animate-spin" />
        <div className="flex-1">
          <div className="text-sm font-medium">Sending voice message...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center space-x-3 p-3 rounded-2xl max-w-xs ${
        isOwn ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-900'
      }`}>
        <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
          <span className="text-xs">!</span>
        </div>
        <div className="flex-1">
          <div className="text-sm">Voice message unavailable</div>
          <div className="text-xs opacity-75">{errorDetails}</div>
          <button 
            onClick={retryLoad}
            className="text-xs underline mt-1 flex items-center gap-1 opacity-75 hover:opacity-100"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-3 p-3 rounded-2xl max-w-xs ${
      isOwn ? 'bg-red-500 text-white' : 'bg-white border border-gray-200 text-gray-900'
    }`}>
      <button
        onClick={togglePlay}
        disabled={!audioLoaded}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          isOwn 
            ? 'bg-white/20 hover:bg-white/30 text-white' 
            : 'bg-red-500 hover:bg-red-600 text-white'
        } ${!audioLoaded ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {!audioLoaded ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className={`h-1 rounded-full overflow-hidden mb-1 ${
          isOwn ? 'bg-white/30' : 'bg-gray-300'
        }`}>
          <div
            className={`h-full transition-all duration-100 ${
              isOwn ? 'bg-white' : 'bg-red-500'
            }`}
            style={{ width: `${getProgress()}%` }}
          />
        </div>

        <div className="flex justify-between text-xs opacity-75">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
            <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
      />
    </div>
  );
}




// // components/VoiceMessage.tsx
// 'use client';

// import { useState, useRef, useEffect } from 'react';
// import { Play, Pause, Loader2, RefreshCw } from 'lucide-react';

// interface VoiceMessageProps {
//   audioUrl: string;
//   duration?: number;
//   isOwn: boolean;
//   isLoading?: boolean;
// }

// export default function VoiceMessage({ audioUrl, duration = 0, isOwn, isLoading = false }: VoiceMessageProps) {
//   const audioRef = useRef<HTMLAudioElement>(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [audioLoaded, setAudioLoaded] = useState(false);
//   const [error, setError] = useState(false);
//   const [errorDetails, setErrorDetails] = useState('');
//   const [retryCount, setRetryCount] = useState(0);

//   useEffect(() => {
//     console.log('🎵 VoiceMessage mounted:', { audioUrl, duration, isOwn });
    
//     if (!audioUrl) {
//       console.error('❌ No audioUrl provided');
//       setError(true);
//       setErrorDetails('No audio URL');
//       return;
//     }

//     const audio = audioRef.current;
//     if (!audio) return;

//     const handleLoadedData = () => {
//       console.log('✅ Audio loaded successfully');
//       setAudioLoaded(true);
//       setError(false);
//       setRetryCount(0);
//     };

//     const handleTimeUpdate = () => {
//       setCurrentTime(audio.currentTime);
//     };

//     const handleEnded = () => {
//       setIsPlaying(false);
//       setCurrentTime(0);
//     };

//     const handleError = async (e: Event) => {
//       console.error('❌ Audio error:', e);
//       console.error('Audio URL:', audioUrl);
//       console.error('Audio element:', audio);
//       console.error('Audio networkState:', audio.networkState);
//       console.error('Audio readyState:', audio.readyState);
//       console.error('Audio error code:', audio.error?.code);
//       console.error('Audio error message:', audio.error?.message);
      
//       setError(true);
//       setAudioLoaded(false);
      
//       // Set specific error message
//       if (audio.error) {
//         switch (audio.error.code) {
//           case 1: // MEDIA_ERR_ABORTED
//             setErrorDetails('Playback aborted');
//             break;
//           case 2: // MEDIA_ERR_NETWORK
//             setErrorDetails('Network error');
//             break;
//           case 3: // MEDIA_ERR_DECODE
//             setErrorDetails('Decode error');
//             break;
//           case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
//             setErrorDetails('Format not supported');
//             break;
//           default:
//             setErrorDetails('Unknown error');
//         }
//       }

//       // Auto-retry once for network errors
//       if (audio.error?.code === 2 && retryCount < 2) {
//         console.log('🔄 Auto-retrying audio load...');
//         setTimeout(() => {
//           setRetryCount(prev => prev + 1);
//           setError(false);
//           audio.load();
//         }, 1000);
//       }
//     };

//     const handleCanPlay = () => {
//       console.log('✅ Audio can play');
//       setAudioLoaded(true);
//       setError(false);
//     };

//     const handleLoadStart = () => {
//       console.log('📡 Audio loading started...');
//     };

//     // Remove crossOrigin for now as it might cause issues
//     // audio.crossOrigin = 'anonymous';
    
//     audio.addEventListener('loadeddata', handleLoadedData);
//     audio.addEventListener('timeupdate', handleTimeUpdate);
//     audio.addEventListener('ended', handleEnded);
//     audio.addEventListener('error', handleError);
//     audio.addEventListener('canplay', handleCanPlay);
//     audio.addEventListener('loadstart', handleLoadStart);

//     // Force load with a delay to ensure DOM is ready
//     setTimeout(() => {
//       audio.load();
//     }, 100);

//     return () => {
//       audio.removeEventListener('loadeddata', handleLoadedData);
//       audio.removeEventListener('timeupdate', handleTimeUpdate);
//       audio.removeEventListener('ended', handleEnded);
//       audio.removeEventListener('error', handleError);
//       audio.removeEventListener('canplay', handleCanPlay);
//       audio.removeEventListener('loadstart', handleLoadStart);
//     };
//   }, [audioUrl, retryCount]);

//   const togglePlay = async () => {
//     if (!audioRef.current || !audioLoaded) return;

//     try {
//       if (isPlaying) {
//         await audioRef.current.pause();
//         setIsPlaying(false);
//       } else {
//         await audioRef.current.play();
//         setIsPlaying(true);
//       }
//     } catch (error) {
//       console.error('Playback error:', error);
//       setError(true);
//       setErrorDetails('Playback failed');
//     }
//   };

//   const retryLoad = () => {
//     console.log('🔄 Manual retry...');
//     setError(false);
//     setRetryCount(prev => prev + 1);
//     if (audioRef.current) {
//       audioRef.current.load();
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className={`flex items-center space-x-3 p-3 rounded-2xl max-w-xs ${
//         isOwn ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-900'
//       }`}>
//         <Loader2 className="w-8 h-8 animate-spin" />
//         <div className="flex-1">
//           <div className="text-sm font-medium">Sending voice message...</div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className={`flex items-center space-x-3 p-3 rounded-2xl max-w-xs ${
//         isOwn ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-900'
//       }`}>
//         <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
//           <span className="text-xs">!</span>
//         </div>
//         <div className="flex-1">
//           <div className="text-sm">Voice message unavailable</div>
//           <div className="text-xs opacity-75">{errorDetails}</div>
//           <button 
//             onClick={retryLoad}
//             className="text-xs underline mt-1 flex items-center gap-1 opacity-75 hover:opacity-100"
//           >
//             <RefreshCw className="w-3 h-3" />
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`flex items-center space-x-3 p-3 rounded-2xl max-w-xs ${
//       isOwn ? 'bg-red-500 text-white' : 'bg-white border border-gray-200 text-gray-900'
//     }`}>
//       <button
//         onClick={togglePlay}
//         disabled={!audioLoaded}
//         className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
//           isOwn 
//             ? 'bg-white/20 hover:bg-white/30 text-white' 
//             : 'bg-red-500 hover:bg-red-600 text-white'
//         } ${!audioLoaded ? 'opacity-50 cursor-not-allowed' : ''}`}
//       >
//         {!audioLoaded ? (
//           <Loader2 className="w-4 h-4 animate-spin" />
//         ) : isPlaying ? (
//           <Pause className="w-4 h-4" />
//         ) : isPlaying ? (
//           <Pause className="w-4 h-4" />
//         ) : (
//           <Play className="w-4 h-4 ml-0.5" />
//         )}
//       </button>
//        <div className="flex-1 min-w-0">
//         {/* Progress bar */}
//         <div className={`h-1 rounded-full overflow-hidden mb-1 ${
//           isOwn ? 'bg-white/30' : 'bg-gray-300'
//         }`}>
//           <div
//             className={`h-full transition-all duration-100 ${
//               isOwn ? 'bg-white' : 'bg-red-500'
//             }`}
//             style={{
//               width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`
//             }}
//           />
//         </div>

//         {/* Duration display */}
//         <div className="flex justify-between text-xs opacity-75">
//           <span>{formatTime(currentTime)}</span>
//           <span>{formatTime(duration)}</span>
//         </div>
//       </div>

//       <audio
//         ref={audioRef}
//         src={audioUrl}
//         preload="metadata"
//       />
//     </div>
//   );

//   function formatTime(seconds: number): string {
//     const mins = Math.floor(seconds / 60);
//     const secs = Math.floor(seconds % 60);
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   }
// }   