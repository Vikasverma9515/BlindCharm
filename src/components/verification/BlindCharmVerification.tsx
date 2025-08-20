// components/BlindCharmVerification.tsx
'use client';

import { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { CheckCircle, XCircle, Shield, Camera, User, AlertTriangle, RotateCcw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { VerificationResult } from '@/types/verification';
import { VerificationService } from '@/lib/Verification/verificationService';

type VerificationStep = 'intro' | 'verifying' | 'processing' | 'success' | 'failed';

export default function BlindCharmVerification() {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [step, setStep] = useState<VerificationStep>('intro');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);
  
  // Face detection states
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detections, setDetections] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  let detectionInterval: NodeJS.Timeout | null = null;

  useEffect(() => {
    if (user) {
      checkVerificationStatus();
    }
    
    return () => {
      // Cleanup
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [user]);

  const checkVerificationStatus = async () => {
    if (!user) return;
    
    const verified = await VerificationService.isUserVerified(user.id);
    setIsAlreadyVerified(verified);
  };

  // Start video
  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((currentStream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = currentStream;
          setStream(currentStream);
          setError('');
        }
      })
      .catch((err) => {
        console.log(err);
        setError('Unable to access camera. Please ensure camera permissions are granted.');
      });
  };

  // Load models
  const loadModels = () => {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models"),
      faceapi.nets.ageGenderNet.loadFromUri("/models")
    ])
    .then(() => {
      console.log('Models loaded successfully');
      setModelsLoaded(true);
      faceMyDetect();
    })
    .catch((err) => {
      console.error('Error loading models:', err);
      setError('Failed to load face detection models. Please refresh the page.');
    });
  };

  const faceMyDetect = () => {
    setIsDetecting(true);
    
    detectionInterval = setInterval(async () => {
      if (videoRef.current && canvasRef.current && modelsLoaded) {
        try {
          const detections = await faceapi
            .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions()
            .withAgeAndGender();

          const canvas = canvasRef.current;
          const displaySize = { width: 640, height: 480 };
          
          faceapi.matchDimensions(canvas, displaySize);

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }

          if (detections.length > 0) {
            const resized = faceapi.resizeResults(detections, displaySize);

            faceapi.draw.drawDetections(canvas, resized);
            faceapi.draw.drawFaceLandmarks(canvas, resized);
            faceapi.draw.drawFaceExpressions(canvas, resized);

            setDetections(prev => [...prev.slice(-9), ...detections]);
          }
        } catch (error) {
          console.error('Detection error:', error);
        }
      }
    }, 1000);
  };

  const stopDetection = () => {
    if (detectionInterval) {
      clearInterval(detectionInterval);
      detectionInterval = null;
    }
    setIsDetecting(false);
  };

  const startVerification = () => {
    setStep('verifying');
    startVideo();
    if (videoRef.current) {
      loadModels();
    }
  };

  const handleVerification = () => {
    if (detections.length < 5) {
      setError('Not enough face data collected. Please wait for more detections.');
      return;
    }

    setIsVerifying(true);
    setStep('processing');
    
    setTimeout(() => {
      processVerification();
    }, 2000);
  };

  const processVerification = async () => {
    try {
      const validDetections = detections.filter(d => 
        d.detection.score > 0.7 && d.genderProbability > 0.6
      );

      if (validDetections.length < 3) {
        setStep('failed');
        setResult({
          isReal: false,
          gender: 'unknown',
          confidence: 0
        });
        return;
      }

      const avgConfidence = validDetections.reduce((sum, d) => sum + d.detection.score, 0) / validDetections.length;
      const avgGenderConf = validDetections.reduce((sum, d) => sum + d.genderProbability, 0) / validDetections.length;
      const avgAge = Math.round(validDetections.reduce((sum, d) => sum + d.age, 0) / validDetections.length);

      const genderCounts = validDetections.reduce((acc, d) => {
        acc[d.gender] = (acc[d.gender] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const detectedGender = Object.entries(genderCounts).reduce((a, b) => 
        genderCounts[a[0]] > genderCounts[b[0]] ? a : b
      )[0] as 'male' | 'female';

      const verificationResult: VerificationResult = {
        isReal: avgConfidence > 0.7 && avgGenderConf > 0.6,
        gender: detectedGender,
        confidence: Math.min(avgConfidence, avgGenderConf),
        age: avgAge,
        faceDescriptor: validDetections[validDetections.length - 1].descriptor ? 
          Array.from(validDetections[validDetections.length - 1].descriptor) : undefined
      };

      setResult(verificationResult);

      // Stop camera
      stopDetection();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Save to database
      if (user) {
        const response = await fetch('/api/user-info');
        const { ip, userAgent } = await response.json();

        const saveResult = await VerificationService.saveVerificationAttempt(
          user.id,
          verificationResult,
          ip,
          userAgent
        );

        if (saveResult.success && verificationResult.isReal && verificationResult.confidence > 0.7) {
          setStep('success');
        } else {
          setStep('failed');
        }
      }
    } catch (error) {
      console.error('Verification processing error:', error);
      setStep('failed');
    } finally {
      setIsSubmitting(false);
      setIsVerifying(false);
    }
  };

  const resetVerification = () => {
    setDetections([]);
    setError('');
    setIsVerifying(false);
    setStep('intro');
    setResult(null);
  };

  if (isAlreadyVerified) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Already Verified!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your identity has already been verified. You're all set to use BlindCharm!
        </p>
        <button
          onClick={() => window.history.back()}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-2xl font-semibold transition-colors"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Identity Verification
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Help us keep BlindCharm safe and authentic for everyone
          </p>
        </div>

        {/* Step Content */}
        {step === 'intro' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Why We Need Verification
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Safety First</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ensures all users are real people, creating a safer environment
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-pink-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Better Matches</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Helps our algorithm create more accurate personality matches
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Trust Badge</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get a verified badge that increases your profile credibility
                  </p>
                </div>
              </div>

              <button
                onClick={startVerification}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105"
              >
                Start Verification
              </button>
            </div>
          </div>
        )}

        {step === 'verifying' && (
          <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-2xl">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Face Verification
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Look directly at the camera and wait for face detection
              </p>
            </div>

            {/* Video Container */}
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
                <canvas
                  ref={canvasRef}
                  width="640"
                  height="480"
                  className="absolute top-0 left-0 w-full h-full"
                  style={{ transform: 'scaleX(-1)' }}
                />
                
                {/* Status Overlay */}
                <div className="absolute top-4 left-4 right-4">
                  <div className="flex justify-between items-start">
                    <div className="bg-black/70 backdrop-blur-sm rounded-xl px-4 py-3">
                      <div className="flex items-center space-x-2 text-white text-sm">
                        <div className={`w-3 h-3 rounded-full ${modelsLoaded ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`}></div>
                        <span>{modelsLoaded ? 'Models Ready' : 'Loading Models...'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-white text-sm mt-1">
                        <div className={`w-3 h-3 rounded-full ${isDetecting ? 'bg-blue-400 animate-pulse' : 'bg-gray-400'}`}></div>
                        <span>Detections: {detections.length}</span>
                      </div>
                    </div>

                    {detections.length > 0 && (
                      <div className="bg-green-500/90 backdrop-blur-sm rounded-xl px-4 py-2">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-white" />
                          <span className="text-white text-sm font-medium">Face Detected!</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleVerification}
                disabled={!modelsLoaded || detections.length < 5 || isVerifying}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>
                  {!modelsLoaded 
                    ? 'Loading Models...' 
                    : isVerifying 
                      ? 'Verifying...' 
                      : detections.length < 5 
                        ? `Collecting Face Data... (${detections.length}/5)`
                        : 'Verify My Identity'
                  }
                </span>
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={resetVerification}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition-colors"
                >
                  Back to Intro
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            {detections.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Face Data Collection
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {detections.length}/5
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((detections.length / 5) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'processing' && (
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Shield className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Processing Verification...
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please wait while we analyze your verification data.
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          </div>
        )}

        {step === 'success' && result && (
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              Verification Successful!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Welcome to BlindCharm! Your profile is now verified.
            </p>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Detected Gender:</span>
                  <p className="font-semibold text-gray-900 dark:text-white capitalize">
                    {result.gender}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Confidence:</span>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {Math.round(result.confidence * 100)}%
                  </p>
                </div>
                {result.age && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Age Range:</span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {result.age} years
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Verified:</span>
                  <p className="font-semibold text-green-600 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Yes
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => window.location.href = '/profile'}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-2xl font-bold text-lg transition-all"
            >
              Continue to Profile
            </button>
          </div>
        )}

        {step === 'failed' && (
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Verification Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We couldn't verify your identity. This might be due to poor lighting, camera quality, or other technical issues.
            </p>
            
            {result && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 mb-6">
                <p className="text-sm text-red-700 dark:text-red-300">
                  Confidence Score: {Math.round(result.confidence * 100)}%
                  <br />
                  {result.confidence < 0.7 && "Please ensure better lighting and face visibility."}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={resetVerification}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-2xl font-semibold transition-all"
              >
                Try Again
              </button>
              <button
                onClick={() => window.history.back()}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-2xl font-semibold transition-colors"
              >
                Skip for Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}