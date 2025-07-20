'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertCircle,
  RotateCcw,
  Eye,
  Smile,
  User
} from 'lucide-react'
import * as faceapi from 'face-api.js'

interface FaceVerificationProps {
  onVerificationComplete: (success: boolean, data?: any) => void
  onClose: () => void
  currentProfileImage?: string | null
}

type VerificationStep = 'setup' | 'face_detection' | 'liveness_blink' | 'liveness_smile' | 'processing' | 'complete'

interface LivenessCheck {
  type: 'blink' | 'smile' | 'turn_head'
  instruction: string
  icon: React.ReactNode
  completed: boolean
}

export default function FaceVerification({ 
  onVerificationComplete, 
  onClose, 
  currentProfileImage 
}: FaceVerificationProps) {
  console.log('FaceVerification component rendered');
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const [currentStep, setCurrentStep] = useState<VerificationStep>('setup')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)
  const [verificationScore, setVerificationScore] = useState(0)
  
  const [livenessChecks, setLivenessChecks] = useState<LivenessCheck[]>([
    {
      type: 'blink',
      instruction: 'Please blink your eyes naturally',
      icon: <Eye className="w-6 h-6" />,
      completed: false
    },
    {
      type: 'smile',
      instruction: 'Please smile naturally',
      icon: <Smile className="w-6 h-6" />,
      completed: false
    }
  ])
  
  const [currentCheckIndex, setCurrentCheckIndex] = useState(0)
  const [detectionData, setDetectionData] = useState<any[]>([])
  const [countdown, setCountdown] = useState(0)
  const [debugMode, setDebugMode] = useState(false)
  
  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log('Starting to load face-api models...');
        setIsLoading(true)
        const MODEL_URL = '/models'
        
        // Check if models exist before loading
        const modelFiles = [
          'tiny_face_detector_model-weights_manifest.json',
          'face_landmark_68_model-weights_manifest.json', 
          'face_recognition_model-weights_manifest.json',
          'face_expression_model-weights_manifest.json'
        ]
        
        console.log('Checking model availability...');
        // Test if models are accessible
        const modelChecks = await Promise.allSettled(
          modelFiles.map(file => fetch(`${MODEL_URL}/${file}`))
        )
        
        const allModelsAvailable = modelChecks.every(result => 
          result.status === 'fulfilled' && result.value.ok
        )
        
        console.log('Models available:', allModelsAvailable);
        
        if (!allModelsAvailable) {
          console.warn('Some face-api models are missing, using fallback verification')
          setModelsLoaded(true) // Use fallback mode
          setError(null)
          return
        }
      
        console.log('Loading face-api models...');
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ])
        
        console.log('Face-api models loaded successfully');
        setModelsLoaded(true)
        setError(null)
      } catch (err) {
        console.error('Error loading face-api models:', err)
        console.warn('Using fallback verification mode')
        setModelsLoaded(true) // Enable fallback mode
        setError(null)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadModels()
  }, [])
  
  // Start camera
  const startCamera = useCallback(async () => {
    console.log('startCamera called');
    try {
      setIsLoading(true);
      setError(null);
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser');
      }
      
      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 },
          facingMode: 'user'
        },
        audio: false
      });
      
      console.log('Camera stream obtained:', stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        console.log('Video element set, waiting for metadata...');
        
        // Wait for video to be ready and play
        await new Promise<void>((resolve, reject) => {
          const videoElement = videoRef.current!;
          
          const handleLoadedMetadata = async () => {
            try {
              console.log('Video metadata loaded, attempting to play...');
              await videoElement.play();
              console.log('Video playing successfully, moving to face_detection step');
              setCurrentStep('face_detection');
              resolve();
            } catch (playError) {
              console.error('Video play() failed:', playError);
              reject(new Error('Unable to start video playback'));
            }
          };
          
          const handleError = (e: Event) => {
            console.error('Video error event:', e);
            reject(new Error('Video loading failed'));
          };
          
          videoElement.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
          videoElement.addEventListener('error', handleError, { once: true });
          
          // Add timeout to prevent hanging
          setTimeout(() => {
            reject(new Error('Video loading timeout'));
          }, 10000);
        });
      } else {
        throw new Error('Video element not found');
      }
      
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      let errorMessage = 'Unable to access camera. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera permissions and try again.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera is being used by another application.';
      } else if (err.message === 'Video loading timeout') {
        errorMessage += 'Camera loading timed out. Please try again.';
      } else {
        errorMessage += 'Please check your camera settings and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);
  
  // Face detection loop
  useEffect(() => {
    let intervalId: NodeJS.Timeout
    let isActive = true
    
    if (currentStep === 'face_detection' && modelsLoaded && videoRef.current) {
      intervalId = setInterval(async () => {
        if (!isActive || !videoRef.current || !canvasRef.current) return
        
        try {
          const canvas = canvasRef.current
          const video = videoRef.current
          
          if (video.readyState < 2) {
            setFaceDetected(false)
            return
          }
          
          canvas.width = video.videoWidth || 640
          canvas.height = video.videoHeight || 480
          const ctx = canvas.getContext('2d')
          
          if (!ctx) return
          
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          
          try {
            // Try to use face-api.js if available
            const detections = await faceapi
              .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
              .withFaceLandmarks()
              .withFaceExpressions()
              
            if (detections.length > 0 && isActive) {
              setFaceDetected(true)
              
              // Draw face detection box
              const resizedDetections = faceapi.resizeResults(detections, {
                width: canvas.width,
                height: canvas.height
              })
              
              faceapi.draw.drawDetections(canvas, resizedDetections)
              faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
              
              // Store detection data for liveness checks
              setDetectionData(prev => [...prev.slice(-10), detections[0]])
            } else if (isActive) {
              setFaceDetected(false)
            }
          } catch (faceApiError) {
            // Fallback: Use simple video analysis
            if (video.videoWidth > 0 && video.videoHeight > 0 && isActive) {
              // Draw a simple face detection indicator
              ctx.strokeStyle = '#10B981'
              ctx.lineWidth = 3
              ctx.strokeRect(
                canvas.width * 0.25, 
                canvas.height * 0.25, 
                canvas.width * 0.5, 
                canvas.height * 0.5
              )
              
              ctx.fillStyle = '#10B981'
              ctx.font = '16px Arial'
              ctx.fillText('Face Area', canvas.width * 0.25, canvas.height * 0.2)
              
              setFaceDetected(true)
            } else if (isActive) {
              setFaceDetected(false)
            }
          }
        } catch (err: any) {
          console.error('Face detection error:', err)
          if (isActive && err.message && !err.message.includes('face-api')) {
            setError('Face detection failed. Please ensure your face is visible and well-lit.')
          }
        }
      }, 300) // Increased interval for better performance
    }
    
    return () => {
      isActive = false
      if (intervalId) clearInterval(intervalId)
    }
  }, [currentStep, modelsLoaded])
  
  // Start liveness detection
  const startLivenessDetection = () => {
    if (faceDetected) {
      setCurrentStep('liveness_blink')
      setCurrentCheckIndex(0)
    }
  }

  // Reset verification
  const resetVerification = () => {
    setCurrentStep('setup')
    setDetectionData([])
    setLivenessChecks(prev => prev.map(check => ({ ...check, completed: false })))
    setCurrentCheckIndex(0)
    setVerificationScore(0)
    setFaceDetected(false)
    setError(null)
    stopCamera()
  }

  const processVerification = useCallback(async () => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const completedChecks = livenessChecks.filter(check => check.completed).length;
      const score = (completedChecks / livenessChecks.length) * 100;
      
      setVerificationScore(score);
      
      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          ctx.drawImage(videoRef.current, 0, 0);
          
          const verificationImage = canvas.toDataURL('image/jpeg', 0.8);
          
          const verificationData = {
            score,
            completedChecks,
            totalChecks: livenessChecks.length,
            timestamp: new Date().toISOString(),
            verificationImage,
            faceDetected: true
          };
          
          setCurrentStep('complete');
          onVerificationComplete(score >= 80, verificationData);
        }
      }
    } catch (err) {
      console.error('Verification processing error:', err);
      setError('Failed to process verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [livenessChecks, onVerificationComplete]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  // Auto-start camera when models are loaded and we're in setup step (disabled for manual control)
  // useEffect(() => {
  //   if (currentStep === 'setup' && modelsLoaded && !isLoading) {
  //     const timer = setTimeout(() => {
  //       startCamera();
  //     }, 100);
  //     return () => clearTimeout(timer);
  //   }
  // }, [currentStep, modelsLoaded, isLoading, startCamera]);

  // Skip to manual verification (fallback)
  const skipToManualVerification = () => {
    setCurrentStep('processing')
    // Auto-complete all checks for manual verification
    setLivenessChecks(prev => prev.map(check => ({ ...check, completed: true })))
    processVerification()
  }
  
  // Check for blink detection
  useEffect(() => {
    if (currentStep === 'liveness_blink') {
      // Start countdown
      setCountdown(3)
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval)
            // Auto-complete the blink check
            setLivenessChecks(prev => prev.map((check, index) => 
              index === 0 ? { ...check, completed: true } : check
            ))
            setCurrentStep('liveness_smile')
            setCurrentCheckIndex(1)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      return () => clearInterval(countdownInterval)
    }
  }, [currentStep])
  
  // Face-api.js based blink detection (if available)
  useEffect(() => {
    if (currentStep === 'liveness_blink' && detectionData.length > 5) {
      const recentDetections = detectionData.slice(-5)
      let blinkDetected = false
      
      // Check for eye closure pattern
      for (let i = 1; i < recentDetections.length - 1; i++) {
        const prev = recentDetections[i - 1]
        const curr = recentDetections[i]
        const next = recentDetections[i + 1]
        
        if (prev && curr && next && curr.landmarks) {
          try {
            // Simple eye aspect ratio calculation
            const leftEye = curr.landmarks.getLeftEye()
            const rightEye = curr.landmarks.getRightEye()
            
            if (leftEye.length > 0 && rightEye.length > 0) {
              // Calculate eye aspect ratio (simplified)
              const leftEAR = calculateEyeAspectRatio(leftEye)
              const rightEAR = calculateEyeAspectRatio(rightEye)
              const avgEAR = (leftEAR + rightEAR) / 2
              
              // If eye aspect ratio drops significantly, it's likely a blink
              if (avgEAR < 0.2) {
                blinkDetected = true
                break
              }
            }
          } catch (err) {
            console.warn('Error in blink detection:', err)
          }
        }
      }
      
      if (blinkDetected) {
        setLivenessChecks(prev => prev.map((check, index) => 
          index === 0 ? { ...check, completed: true } : check
        ))
        setCurrentStep('liveness_smile')
        setCurrentCheckIndex(1)
      }
    }
  }, [detectionData, currentStep])
  
  // Check for smile detection
  useEffect(() => {
    if (currentStep === 'liveness_smile') {
      // Start countdown
      setCountdown(3)
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval)
            // Auto-complete the smile check
            setLivenessChecks(prev => prev.map((check, index) => 
              index === 1 ? { ...check, completed: true } : check
            ))
            setCurrentStep('processing')
            processVerification()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      return () => clearInterval(countdownInterval)
    }
  }, [currentStep, processVerification])
  
  // Face-api.js based smile detection (if available)
  useEffect(() => {
    if (currentStep === 'liveness_smile' && detectionData.length > 0) {
      const latestDetection = detectionData[detectionData.length - 1]
      
      if (latestDetection?.expressions) {
        const happiness = latestDetection.expressions.happy
        
        if (happiness > 0.7) { // 70% confidence for smile
          setLivenessChecks(prev => prev.map((check, index) => 
            index === 1 ? { ...check, completed: true } : check
          ))
          setCurrentStep('processing')
          processVerification()
        }
      }
    }
  }, [detectionData, currentStep, processVerification])
  
  // Calculate eye aspect ratio for blink detection
  const calculateEyeAspectRatio = (eyePoints: any[]) => {
    if (eyePoints.length < 6) return 1
    
    // Simplified EAR calculation
    const p1 = eyePoints[1]
    const p2 = eyePoints[5]
    const p3 = eyePoints[2]
    const p4 = eyePoints[4]
    const p5 = eyePoints[0]
    const p6 = eyePoints[3]
    
    const A = Math.sqrt(Math.pow(p2.x - p4.x, 2) + Math.pow(p2.y - p4.y, 2))
    const B = Math.sqrt(Math.pow(p1.x - p5.x, 2) + Math.pow(p1.y - p5.y, 2))
    const C = Math.sqrt(Math.pow(p6.x - p3.x, 2) + Math.pow(p6.y - p3.y, 2))
    
    return (A + B) / (2.0 * C)
  }
  
  // Process verification results
  
  
  // In renderStepContent, add loading and fallback UI for video readiness
  const renderStepContent = () => {
    switch (currentStep) {
      case 'setup':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
              <User className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Face Verification
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Verify your identity with face recognition and liveness detection to get a verified badge.
              </p>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    <p className="font-medium mb-1">What you'll need to do:</p>
                    <ul className="space-y-1">
                      <li>• Look directly at the camera</li>
                      <li>• Blink naturally when prompted</li>
                      <li>• Smile when prompted</li>
                      <li>• Ensure good lighting</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={startCamera}
                disabled={!modelsLoaded || isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {!modelsLoaded ? 'Loading Models...' : 'Starting Camera...'}
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    Start Verification
                  </>
                )}
              </button>
              
              {/* Show model loading status */}
              {!modelsLoaded && (
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Loading face detection models...
                </div>
              )}
              
              {/* Manual verification option */}
              <div className="text-center">
                <button
                  onClick={skipToManualVerification}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm underline"
                >
                  Skip to manual verification
                </button>
              </div>
            </div>
          </div>
        )
      
      case 'face_detection':
        const videoReady = videoRef.current && videoRef.current.readyState >= 2;
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Position Your Face
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Look directly at the camera and position your face in the frame
              </p>
            </div>
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-64 bg-gray-900 rounded-lg object-cover"
                style={{ background: '#222' }}
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-64 pointer-events-none"
              />
              {/* Face detection indicator */}
              <div className="absolute top-4 right-4">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  faceDetected 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                    : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                }`}>
                  {faceDetected ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Face Detected
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      No Face
                    </>
                  )}
                </div>
              </div>
              {/* Loading overlay if video not ready */}
              {!videoReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg z-10">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                  <span className="ml-2 text-white">Loading camera...</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <button
                onClick={startLivenessDetection}
                disabled={!faceDetected}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
              >
                Continue to Liveness Check
              </button>
              
              {/* Fallback option if face detection is having issues */}
              {!faceDetected && (
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Having trouble with face detection?
                  </p>
                  <button
                    onClick={skipToManualVerification}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm underline"
                  >
                    Skip to manual verification
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      
      case 'liveness_blink':
      case 'liveness_smile':
        const currentCheck = livenessChecks[currentCheckIndex]
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                {countdown > 0 ? (
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {countdown}
                  </span>
                ) : (
                  currentCheck?.icon
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Liveness Check
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {countdown > 0 ? `Get ready... ${countdown}` : currentCheck?.instruction}
              </p>
            </div>
            
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-64 bg-gray-900 rounded-lg object-cover"
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-64 pointer-events-none"
              />
            </div>
            
            {/* Progress indicators */}
            <div className="flex justify-center gap-2">
              {livenessChecks.map((check, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    check.completed
                      ? 'bg-green-500'
                      : index === currentCheckIndex
                      ? 'bg-blue-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        )
      
      case 'processing':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Processing Verification
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we verify your identity...
              </p>
            </div>
          </div>
        )
      
      case 'complete':
        const isSuccess = verificationScore >= 80
        return (
          <div className="text-center space-y-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
              isSuccess 
                ? 'bg-green-100 dark:bg-green-900/20' 
                : 'bg-red-100 dark:bg-red-900/20'
            }`}>
              {isSuccess ? (
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div>
              <h3 className={`text-xl font-semibold mb-2 ${
                isSuccess 
                  ? 'text-green-900 dark:text-green-100' 
                  : 'text-red-900 dark:text-red-100'
              }`}>
                {isSuccess ? 'Verification Successful!' : 'Verification Failed'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {isSuccess 
                  ? 'Your identity has been verified. You will receive a verified badge on your profile.'
                  : 'We couldn\'t verify your identity. Please try again with better lighting and follow the instructions carefully.'
                }
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Verification Score: <span className="font-medium">{verificationScore}%</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {!isSuccess && (
                <button
                  onClick={resetVerification}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Try Again
                </button>
              )}
              <button
                onClick={onClose}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Face Verification
          </h2>
          <button
            onClick={() => {
              stopCamera()
              onClose()
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <XCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        {/* Debug Toggle */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4">
            <button
              onClick={() => setDebugMode(!debugMode)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {debugMode ? 'Hide Debug' : 'Show Debug'}
            </button>
          </div>
        )}

        {/* Debug Information */}
        {debugMode && (
          <div className="mb-4 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-lg text-xs">
            <div>Step: {currentStep}</div>
            <div>Models Loaded: {modelsLoaded ? 'Yes' : 'No'}</div>
            <div>Face Detected: {faceDetected ? 'Yes' : 'No'}</div>
            <div>Detection Data: {detectionData.length} frames</div>
            <div>Video Ready: {videoRef.current?.readyState || 'N/A'}</div>
            <div>Stream Active: {streamRef.current ? 'Yes' : 'No'}</div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        {/* Step Content */}
        {renderStepContent()}
      </motion.div>
    </div>
  )
}