// 'use client';

// import { useState, useRef, useCallback, useEffect } from 'react';
// import { useSession } from 'next-auth/react';
// import { Camera, CheckCircle, XCircle, Loader2, RefreshCw, AlertCircle } from 'lucide-react';

// interface FaceVerificationProps {
//   profilePhotoUrl: string;
//   onVerificationComplete: (verified: boolean) => void;
// }

// export default function FaceVerification({ 
//   profilePhotoUrl, 
//   onVerificationComplete 
// }: FaceVerificationProps) {
//   const { data: session } = useSession();
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const streamRef = useRef<MediaStream | null>(null);

//   const [isStreaming, setIsStreaming] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [capturedImage, setCapturedImage] = useState<string | null>(null);
//   const [cameraError, setCameraError] = useState<string | null>(null);
//   const [isVideoReady, setIsVideoReady] = useState(false);
//   const [verificationResult, setVerificationResult] = useState<{
//     success: boolean;
//     confidence: number;
//     message: string;
//   } | null>(null);

//   // Clean up camera stream on component unmount
//   useEffect(() => {
//     return () => {
//       stopCamera();
//     };
//   }, []);

//   // Check if camera/getUserMedia is supported
//   const isCameraSupported = () => {
//     return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
//   };

//   // Start camera stream with detailed error handling
//   const startCamera = useCallback(async () => {
//     console.log('🎥 Starting camera...');

//     // Reset states
//     setCameraError(null);
//     setIsVideoReady(false);
//     setVerificationResult(null);
//     setCapturedImage(null);

//     // Check if camera is supported
//     if (!isCameraSupported()) {
//       setCameraError('Camera is not supported in this browser. Please use Chrome, Firefox, or Safari.');
//       return;
//     }

//     try {
//       // Stop any existing stream first
//       if (streamRef.current) {
//         streamRef.current.getTracks().forEach(track => track.stop());
//       }

//       console.log('📱 Requesting camera access...');

//       // Request camera access with multiple fallback options
//       let stream: MediaStream;

//       try {
//         // Try with ideal constraints first
//         stream = await navigator.mediaDevices.getUserMedia({ 
//           video: { 
//             width: { ideal: 640, min: 320 },
//             height: { ideal: 480, min: 240 },
//             facingMode: 'user',
//             frameRate: { ideal: 30, min: 15 }
//           },
//           audio: false
//         });
//       } catch (error) {
//         console.warn('⚠️ Ideal constraints failed, trying basic constraints...', error);

//         // Fallback to basic constraints
//         stream = await navigator.mediaDevices.getUserMedia({ 
//           video: { 
//             facingMode: 'user'
//           },
//           audio: false
//         });
//       }

//       if (!stream) {
//         throw new Error('Failed to get camera stream');
//       }

//       console.log('✅ Camera stream obtained:', stream.getVideoTracks()[0].getSettings());

//       // Store the stream reference
//       streamRef.current = stream;

//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         setIsStreaming(true);

//         // Wait for video to be ready
//         videoRef.current.onloadedmetadata = () => {
//           console.log('📹 Video metadata loaded');
//           setIsVideoReady(true);
//         };

//         videoRef.current.oncanplay = () => {
//           console.log('🎬 Video can play');
//           setIsVideoReady(true);
//         };

//         videoRef.current.onerror = (error) => {
//           console.error('❌ Video element error:', error);
//           setCameraError('Video playback error. Please try again.');
//         };

//         // Force play the video
//         try {
//           await videoRef.current.play();
//           console.log('▶️ Video playing');
//         } catch (playError) {
//           console.error('❌ Video play error:', playError);
//           setCameraError('Could not start video playback. Please try again.');
//         }
//       }

//     } catch (error) {
//       console.error('❌ Camera error:', error);

//       let errorMessage = 'Camera access failed. ';

//       if (error instanceof Error) {
//         switch (error.name) {
//           case 'NotAllowedError':
//             errorMessage += 'Please allow camera access in your browser and try again.';
//             break;
//           case 'NotFoundError':
//             errorMessage += 'No camera found. Please connect a camera and try again.';
//             break;
//           case 'NotReadableError':
//             errorMessage += 'Camera is already in use by another application.';
//             break;
//           case 'OverconstrainedError':
//             errorMessage += 'Camera does not support the required features.';
//             break;
//           case 'SecurityError':
//             errorMessage += 'Camera access blocked due to security restrictions.';
//             break;
//           default:
//             errorMessage += error.message || 'Unknown camera error.';
//         }
//       } else {
//         errorMessage += 'Please check your camera permissions and try again.';
//       }

//       setCameraError(errorMessage);
//       setIsStreaming(false);
//     }
//   }, []);

//   // Stop camera stream
//   const stopCamera = useCallback(() => {
//     console.log('🛑 Stopping camera...');

//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach(track => {
//         console.log('🔌 Stopping track:', track.kind, track.label);
//         track.stop();
//       });
//       streamRef.current = null;
//     }

//     if (videoRef.current) {
//       videoRef.current.srcObject = null;
//     }

//     setIsStreaming(false);
//     setIsVideoReady(false);
//   }, []);

//   // Capture photo from video stream
//   const capturePhoto = useCallback(() => {
//     console.log('📸 Capturing photo...');

//     if (!videoRef.current || !canvasRef.current) {
//       console.error('❌ Video or canvas not available');
//       return;
//     }

//     const canvas = canvasRef.current;
//     const video = videoRef.current;
//     const ctx = canvas.getContext('2d');

//     if (!ctx) {
//       console.error('❌ Canvas context not available');
//       return;
//     }

//     try {
//       // Set canvas dimensions to match video
//       canvas.width = video.videoWidth || 640;
//       canvas.height = video.videoHeight || 480;

//       console.log('📐 Canvas dimensions:', canvas.width, 'x', canvas.height);

//       // Draw video frame to canvas
//       ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

//       // Convert canvas to data URL with high quality
//       const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

//       if (dataUrl && dataUrl.length > 1000) { // Basic check for valid image
//         setCapturedImage(dataUrl);
//         stopCamera();
//         console.log('✅ Photo captured successfully');
//       } else {
//         console.error('❌ Invalid photo captured');
//         setCameraError('Failed to capture photo. Please try again.');
//       }
//     } catch (error) {
//       console.error('❌ Photo capture error:', error);
//       setCameraError('Failed to capture photo. Please try again.');
//     }
//   }, [stopCamera]);

//   // Submit verification
//   const submitVerification = useCallback(async () => {
//     if (!capturedImage || !session?.user?.id) {
//       console.error('❌ Missing captured image or user ID');
//       return;
//     }

//     console.log('🔍 Starting verification...');
//     setIsLoading(true);
//     setVerificationResult(null);

//     try {
//       // Convert data URLs to File objects
//       console.log('📝 Converting images...');
//       const livePhotoBlob = await fetch(capturedImage).then(r => r.blob());
//       const profilePhotoBlob = await fetch(profilePhotoUrl).then(r => r.blob());

//       console.log('📦 Creating form data...');
//       const formData = new FormData();
//       formData.append('profilePhoto', profilePhotoBlob, 'profile.jpg');
//       formData.append('livePhoto', livePhotoBlob, 'live.jpg');
//       formData.append('userId', session.user.id);

//       console.log('🌐 Sending verification request...');
//       const response = await fetch('/api/verify-face', {
//         method: 'POST',
//         body: formData
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({ error: 'Network error' }));
//         throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
//       }

//       const result = await response.json();
//       console.log('📊 Verification result:', result);

//       setVerificationResult({
//         success: result.success,
//         confidence: result.confidence,
//         message: result.message
//       });

//       // Call parent callback after a short delay to show the result
//       setTimeout(() => {
//         onVerificationComplete(result.success);
//       }, 2000);

//     } catch (error) {
//       console.error('❌ Verification failed:', error);
//       setVerificationResult({
//         success: false,
//         confidence: 0,
//         message: error instanceof Error ? error.message : 'Verification failed. Please try again.'
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   }, [capturedImage, session?.user?.id, profilePhotoUrl, onVerificationComplete]);

//   // Reset verification
//   const resetVerification = () => {
//     setCapturedImage(null);
//     setVerificationResult(null);
//     setCameraError(null);
//   };

//   // Start over completely
//   const startOver = () => {
//     resetVerification();
//     startCamera();
//   };

//   return (
//     <div className="max-w-md mx-auto p-6">
//       {/* Instructions */}
//       <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
//         <p className="text-blue-900 dark:text-blue-300 text-sm font-medium">
//           📸 Look directly at the camera and ensure good lighting
//         </p>
//       </div>

//       {/* Camera Error Display */}
//       {cameraError && (
//         <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
//           <div className="flex items-start">
//             <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
//             <div>
//               <p className="text-red-800 dark:text-red-300 text-sm font-medium mb-1">
//                 Camera Error
//               </p>
//               <p className="text-red-700 dark:text-red-400 text-xs">
//                 {cameraError}
//               </p>
//               <button
//                 onClick={startCamera}
//                 className="mt-2 text-xs text-red-800 dark:text-red-300 underline hover:no-underline"
//               >
//                 Try Again
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Camera Section */}
//       <div className="mb-6">
//         {/* Initial Start Button */}
//         {!isStreaming && !capturedImage && !cameraError && (
//           <div className="text-center">
//             <button
//               onClick={startCamera}
//               className="bg-blue-500 text-white px-8 py-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center mx-auto text-lg font-semibold"
//             >
//               <Camera className="w-6 h-6 mr-3" />
//               Start Camera
//             </button>
//           </div>
//         )}

//         {/* Video Stream */}
//         {isStreaming && (
//           <div className="text-center">
//             <div className="relative">
//               <video
//                 ref={videoRef}
//                 autoPlay
//                 playsInline
//                 muted
//                 className="w-full max-w-sm mx-auto rounded-lg border-2 border-gray-300 dark:border-gray-600 mb-4 bg-gray-100 dark:bg-gray-800"
//               />

//               {/* Loading overlay while video is loading */}
//               {!isVideoReady && (
//                 <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
//                   <div className="text-center">
//                     <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
//                     <p className="text-sm text-gray-600 dark:text-gray-400">Loading camera...</p>
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div className="space-y-3">
//               <button
//                 onClick={capturePhoto}
//                 disabled={!isVideoReady}
//                 className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 📷 Take Photo
//               </button>
//               <button
//                 onClick={stopCamera}
//                 className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm block mx-auto"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Captured Image */}
//         {capturedImage && !verificationResult && (
//           <div className="text-center">
//             <img 
//               src={capturedImage} 
//               alt="Captured" 
//               className="w-full max-w-sm mx-auto rounded-lg border-2 border-gray-300 dark:border-gray-600 mb-4"
//             />
//             <div className="space-y-3">
//               <button
//                 onClick={submitVerification}
//                 disabled={isLoading}
//                 className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center mx-auto text-lg font-semibold"
//               >
//                 {isLoading ? (
//                   <>
//                     <Loader2 className="w-5 h-5 mr-3 animate-spin" />
//                     Verifying...
//                   </>
//                 ) : (
//                   '✅ Verify Face'
//                 )}
//               </button>
//               <button
//                 onClick={resetVerification}
//                 className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
//               >
//                 Take Another Photo
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Verification Result */}
//       {verificationResult && (
//         <div className={`p-4 rounded-lg text-center mb-4 ${
//           verificationResult.success 
//             ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800' 
//             : 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800'
//         }`}>
//           <div className="flex items-center justify-center mb-2">
//             {verificationResult.success ? (
//               <CheckCircle className="w-8 h-8 text-green-600 mr-2" />
//             ) : (
//               <XCircle className="w-8 h-8 text-red-600 mr-2" />
//             )}
//             <p className={`font-bold text-lg ${
//               verificationResult.success 
//                 ? 'text-green-800 dark:text-green-300' 
//                 : 'text-red-800 dark:text-red-300'
//             }`}>
//               {verificationResult.success ? 'Verification Successful!' : 'Verification Failed'}
//             </p>
//           </div>
//           <p className={`text-sm ${
//             verificationResult.success 
//               ? 'text-green-700 dark:text-green-400' 
//               : 'text-red-700 dark:text-red-400'
//           }`}>
//             {verificationResult.message}
//           </p>
//                     {verificationResult.confidence > 0 && (
//             <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
//               Match Confidence: {verificationResult.confidence.toFixed(1)}%
//             </p>
//           )}

//           {/* Try Again Button for Failed Verification */}
//           {!verificationResult.success && (
//             <button
//               onClick={startOver}
//               className="mt-3 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center mx-auto"
//             >
//               <RefreshCw className="w-4 h-4 mr-2" />
//               Try Again
//             </button>
//           )}
//         </div>
//       )}

//       {/* Debug Information (remove in production) */}
//       {process.env.NODE_ENV === 'development' && (
//         <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">
//           <p className="font-mono text-gray-600 dark:text-gray-400">
//             Debug Info:
//           </p>
//           <ul className="text-gray-500 dark:text-gray-500 mt-1 space-y-1">
//             <li>Camera Supported: {isCameraSupported() ? '✅' : '❌'}</li>
//             <li>Streaming: {isStreaming ? '✅' : '❌'}</li>
//             <li>Video Ready: {isVideoReady ? '✅' : '❌'}</li>
//             <li>Image Captured: {capturedImage ? '✅' : '❌'}</li>
//             <li>Session: {session?.user?.id ? '✅' : '❌'}</li>
//           </ul>
//         </div>
//       )}

//       {/* Hidden canvas for image processing */}
//       <canvas ref={canvasRef} className="hidden" />

//       {/* Browser Support Information */}
//       {!isCameraSupported() && (
//         <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
//           <div className="flex items-start">
//             <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
//             <div>
//               <p className="text-yellow-800 dark:text-yellow-300 text-sm font-medium mb-1">
//                 Browser Not Supported
//               </p>
//               <p className="text-yellow-700 dark:text-yellow-400 text-xs">
//                 Your browser doesn't support camera access. Please use Chrome, Firefox, Safari, or Edge.
//               </p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Troubleshooting Tips */}
//       <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
//         <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
//           💡 Troubleshooting Tips:
//         </h4>
//         <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
//           <li>• Make sure you're using HTTPS (camera requires secure connection)</li>
//           <li>• Allow camera permissions when prompted</li>
//           <li>• Close other applications that might be using your camera</li>
//           <li>• Try refreshing the page if camera doesn't work</li>
//           <li>• Ensure good lighting for better verification results</li>
//           <li>• Remove sunglasses, hats, or face coverings</li>
//         </ul>
//       </div>
//     </div>
//   );
// }


'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Camera, CheckCircle, XCircle, Loader2, RefreshCw, AlertCircle } from 'lucide-react';

interface FaceVerificationProps {
  profilePhotoUrl: string;
  onVerificationComplete: (verified: boolean) => void;
}

export default function FaceVerification({
  profilePhotoUrl,
  onVerificationComplete
}: FaceVerificationProps) {
  const { data: session } = useSession();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [step, setStep] = useState<'start' | 'camera' | 'captured' | 'result'>('start');
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    confidence: number;
    message: string;
  } | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Start video - EXACT copy from working BlindCharm component
  const startVideo = () => {
    console.log('🎥 Starting camera...');
    setError('');
    setStep('camera');

    navigator.mediaDevices.getUserMedia({ video: true })
      .then((currentStream) => {
        console.log('📹 Got stream:', currentStream);
        if (videoRef.current) {
          videoRef.current.srcObject = currentStream;
          setStream(currentStream);
          setError('');
        }
      })
      .catch((err) => {
        console.error('❌ Camera error:', err);
        setError('Unable to access camera. Please ensure camera permissions are granted.');
      });
  };

  // Stop camera
  const stopCamera = () => {
    console.log('🛑 Stopping camera...');
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Capture photo
  // const capturePhoto = useCallback(() => {
  //   console.log('📸 Capturing photo...');

  //   if (!videoRef.current || !canvasRef.current) {
  //     setError('Camera not ready. Please try again.');
  //     return;
  //   }

  //   const canvas = canvasRef.current;
  //   const video = videoRef.current;
  //   const ctx = canvas.getContext('2d');

  //   if (!ctx) {
  //     setError('Canvas error. Please try again.');
  //     return;
  //   }

  //   try {
  //     // Set canvas size to match video
  //     canvas.width = video.videoWidth || 640;
  //     canvas.height = video.videoHeight || 480;

  //     // Draw video frame to canvas
  //     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  //     // Convert to data URL
  //     const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

  //     if (dataUrl && dataUrl.length > 1000) {
  //       setCapturedImage(dataUrl);
  //       setStep('captured');
  //       stopCamera();
  //       console.log('✅ Photo captured successfully');
  //     } else {
  //       setError('Failed to capture photo. Please try again.');
  //     }
  //   } catch (error) {
  //     console.error('❌ Photo capture error:', error);
  //     setError('Failed to capture photo. Please try again.');
  //   }
  // }, []);
  // Update your capturePhoto function to ensure better image quality and face positioning:
  const capturePhoto = useCallback(() => {
    console.log('📸 Capturing photo...');

    if (!videoRef.current || !canvasRef.current) {
      setError('Camera not ready. Please try again.');
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setError('Canvas error. Please try again.');
      return;
    }

    try {
      // Use consistent dimensions that work well with Azure Face API
      const width = 640;
      const height = 480;

      canvas.width = width;
      canvas.height = height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw video frame to canvas (don't mirror for face detection)
      ctx.drawImage(video, 0, 0, width, height);

      // Convert to data URL with high quality
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

      if (dataUrl && dataUrl.length > 1000) {
        setCapturedImage(dataUrl);
        setStep('captured');
        stopCamera();
        console.log('✅ Photo captured successfully');
        console.log('📐 Image dimensions: 640x480');
      } else {
        setError('Failed to capture photo. Please try again.');
      }
    } catch (error) {
      console.error('❌ Photo capture error:', error);
      setError('Failed to capture photo. Please try again.');
    }
  }, []);

  // Submit verification
  // const submitVerification = useCallback(async () => {
  //   if (!capturedImage || !session?.user?.id) return;

  //   console.log('🔍 Starting verification...');
  //   setIsLoading(true);
  //   setVerificationResult(null);

  //   try {
  //     const livePhotoBlob = await fetch(capturedImage).then(r => r.blob());
  //     const profilePhotoBlob = await fetch(profilePhotoUrl).then(r => r.blob());

  //     const formData = new FormData();
  //     formData.append('profilePhoto', profilePhotoBlob, 'profile.jpg');
  //     formData.append('livePhoto', livePhotoBlob, 'live.jpg');
  //     formData.append('userId', session.user.id);

  //     const response = await fetch('/api/verify-face', {
  //       method: 'POST',
  //       body: formData
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json().catch(() => ({ error: 'Network error' }));
  //       throw new Error(errorData.error || `HTTP ${response.status}`);
  //     }

  //     const result = await response.json();

  //     setVerificationResult({
  //       success: result.success,
  //       confidence: result.confidence,
  //       message: result.message
  //     });

  //     setStep('result');

  //     // Call parent callback
  //     setTimeout(() => {
  //       onVerificationComplete(result.success);
  //     }, 2000);

  //   } catch (error) {
  //     console.error('❌ Verification failed:', error);
  //     setVerificationResult({
  //       success: false,
  //       confidence: 0,
  //       message: error instanceof Error ? error.message : 'Verification failed. Please try again.'
  //     });
  //     setStep('result');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [capturedImage, session?.user?.id, profilePhotoUrl, onVerificationComplete]);

  // In your submitVerification function, add this debugging section:
  const submitVerification = useCallback(async () => {
    if (!capturedImage || !session?.user?.id) return;

    console.log('🔍 Starting verification...');
    setIsLoading(true);
    setVerificationResult(null);

    try {
      // ADD THIS DEBUGGING SECTION
      console.log('📷 Profile photo URL:', profilePhotoUrl);
      console.log('📸 Captured image length:', capturedImage.length);
      console.log('📸 Captured image preview:', capturedImage.substring(0, 50) + '...');

      // Test if both images are accessible
      const livePhotoBlob = await fetch(capturedImage).then(r => r.blob());
      const profilePhotoBlob = await fetch(profilePhotoUrl).then(r => r.blob());

      console.log('📦 Live photo blob size:', livePhotoBlob.size, 'type:', livePhotoBlob.type);
      console.log('📦 Profile photo blob size:', profilePhotoBlob.size, 'type:', profilePhotoBlob.type);

      // Check if blobs are valid
      if (livePhotoBlob.size === 0) {
        throw new Error('Captured image is empty');
      }
      if (profilePhotoBlob.size === 0) {
        throw new Error('Profile image is empty or inaccessible');
      }

      const formData = new FormData();
      formData.append('profilePhoto', profilePhotoBlob, 'profile.jpg');
      formData.append('livePhoto', livePhotoBlob, 'live.jpg');
      formData.append('userId', session.user.id);

      console.log('🌐 Sending verification request...');
      const response = await fetch('/api/verify-face-aws', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      console.log('📊 API Response:', result);

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      setVerificationResult({
        success: result.success,
        confidence: result.confidence,
        message: result.message
      });

      setStep('result');

      setTimeout(() => {
        onVerificationComplete(result.success);
      }, 2000);

    } catch (error) {
      console.error('❌ Verification failed:', error);
      setVerificationResult({
        success: false,
        confidence: 0,
        message: error instanceof Error ? error.message : 'Verification failed. Please try again.'
      });
      setStep('result');
    } finally {
      setIsLoading(false);
    }
  }, [capturedImage, session?.user?.id, profilePhotoUrl, onVerificationComplete]);

  // Reset everything
  const resetVerification = () => {
    setCapturedImage(null);
    setVerificationResult(null);
    setError('');
    setStep('start');
    stopCamera();
  };

  // Start over from camera
  const retakePhoto = () => {
    setCapturedImage(null);
    setError('');
    startVideo();
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-2xl">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Face Verification
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Take a live photo to verify your identity
        </p>
      </div>

      {/* Start Step */}
      {step === 'start' && (
        <div className="text-center">
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
            <p className="text-blue-900 dark:text-blue-300 text-sm font-medium">
              📸 Look directly at the camera and ensure good lighting
            </p>
          </div>

          <button
            onClick={startVideo}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-8 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center mx-auto"
          >
            <Camera className="w-6 h-6 mr-3" />
            Start Camera
          </button>
        </div>
      )}

      {/* Camera Step - EXACT copy from working component */}
      {step === 'camera' && (
        <div>
          {/* Video Container - EXACT styling from working component */}
          <div className="relative mb-6">
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden">
              <video
                crossOrigin="anonymous"
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-96 object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />

              {/* Status Overlay - EXACT copy from working component */}
              <div className="absolute top-4 left-4 right-4">
                <div className="flex justify-between items-start">
                  <div className="bg-black/70 backdrop-blur-sm rounded-xl px-4 py-3">
                    <div className="flex items-center space-x-2 text-white text-sm">
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <span>Camera Ready</span>
                    </div>
                  </div>

                  <div className="bg-green-500/90 backdrop-blur-sm rounded-xl px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-medium">Ready to Capture!</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={capturePhoto}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center space-x-2"
            >
              <Camera className="w-5 h-5" />
              <span>📷 Take Photo</span>
            </button>

            <button
              onClick={resetVerification}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Captured Step */}
      {step === 'captured' && capturedImage && (
        <div className="text-center">
          <div className="mb-6">
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="w-full max-w-sm mx-auto rounded-2xl border-2 border-gray-300 dark:border-gray-600"
            />
          </div>

          <div className="space-y-3">
            <button
              onClick={submitVerification}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>✅ Verify Face</span>
                </>
              )}
            </button>

            <div className="flex space-x-3">
              <button
                onClick={retakePhoto}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                Retake Photo
              </button>
              <button
                onClick={resetVerification}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Captured Step - Add debugging */}
      {step === 'captured' && capturedImage && (
        <div className="text-center">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Captured Photo:</h3>
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full max-w-sm mx-auto rounded-2xl border-2 border-gray-300 dark:border-gray-600 mb-4"
            />

            {/* ADD THIS: Profile photo for comparison */}
            <h3 className="text-lg font-semibold mb-2 mt-4">Profile Photo:</h3>
            <img
              src={profilePhotoUrl}
              alt="Profile"
              className="w-full max-w-sm mx-auto rounded-2xl border-2 border-gray-300 dark:border-gray-600"
            />
          </div>

          {/* Your existing buttons */}
        </div>
      )}

      {/* Result Step */}
      {step === 'result' && verificationResult && (
        <div className="text-center">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${verificationResult.success
              ? 'bg-green-100 dark:bg-green-900/30'
              : 'bg-red-100 dark:bg-red-900/30'
            }`}>
            {verificationResult.success ? (
              <CheckCircle className="w-10 h-10 text-green-600" />
            ) : (
              <XCircle className="w-10 h-10 text-red-600" />
            )}
          </div>

          <h2 className={`text-2xl font-bold mb-4 ${verificationResult.success
              ? 'text-green-600'
              : 'text-red-600'
            }`}>
            {verificationResult.success ? 'Verification Successful!' : 'Verification Failed'}
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {verificationResult.message}
          </p>

          {verificationResult.confidence > 0 && (
            <div className={`mb-6 p-4 rounded-2xl ${verificationResult.success
                ? 'bg-green-50 dark:bg-green-900/20'
                : 'bg-red-50 dark:bg-red-900/20'
              }`}>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Match Confidence: <span className="font-semibold">{verificationResult.confidence.toFixed(1)}%</span>
              </p>
            </div>
          )}

          {!verificationResult.success && (
            <button
              onClick={resetVerification}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center mx-auto"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </button>
          )}
        </div>
      )}

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">
          <p className="font-mono text-gray-600 dark:text-gray-400 mb-2">Debug Info:</p>
          <ul className="text-gray-500 dark:text-gray-500 space-y-1">
            <li>Step: {step}</li>
            <li>Stream: {stream ? '✅' : '❌'}</li>
            <li>Video Element: {videoRef.current ? '✅' : '❌'}</li>
            <li>Canvas Element: {canvasRef.current ? '✅' : '❌'}</li>
            <li>Session: {session?.user?.id ? '✅' : '❌'}</li>
            <li>Error: {error || 'None'}</li>
          </ul>
        </div>
      )}
    </div>
  );
}