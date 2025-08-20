// components/SimpleFaceVerification.tsx
'use client';

import { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, CheckCircle, XCircle, AlertTriangle, RotateCcw } from 'lucide-react';
import { VerificationResult } from '@/types/verification';

interface SimpleFaceVerificationProps {
  onVerificationComplete: (result: VerificationResult) => void;
  onCancel?: () => void;
}

export default function SimpleFaceVerification({ 
  onVerificationComplete, 
  onCancel 
}: SimpleFaceVerificationProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detections, setDetections] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  let detectionInterval: NodeJS.Timeout | null = null;

  // Load from useEffect
  useEffect(() => {
    startVideo();
    if (videoRef.current) {
      loadModels();
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
  }, []);

  // Open face webcam
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

  // Load models from Face API
  const loadModels = () => {
    Promise.all([
      // Load from public/models directory
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models"),
      faceapi.nets.ageGenderNet.loadFromUri("/models") // For gender detection
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

          // Draw face in webcam
          const canvas = canvasRef.current;
          const displaySize = { width: 640, height: 480 };
          
          // Match canvas dimensions
          faceapi.matchDimensions(canvas, displaySize);

          // Clear canvas
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }

          if (detections.length > 0) {
            const resized = faceapi.resizeResults(detections, displaySize);

            // Draw detections
            faceapi.draw.drawDetections(canvas, resized);
            faceapi.draw.drawFaceLandmarks(canvas, resized);
            faceapi.draw.drawFaceExpressions(canvas, resized);

            // Store detections for verification
            setDetections(prev => [...prev.slice(-9), ...detections]); // Keep last 10
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

  const handleVerification = () => {
    if (detections.length < 5) {
      setError('Not enough face data collected. Please wait for more detections.');
      return;
    }

    setIsVerifying(true);
    
    // Process verification after a short delay
    setTimeout(() => {
      processVerification();
    }, 2000);
  };

  const processVerification = () => {
    try {
      // Filter good quality detections
      const validDetections = detections.filter(d => 
        d.detection.score > 0.7 && d.genderProbability > 0.6
      );

      if (validDetections.length < 3) {
        setError('Verification failed. Please ensure your face is clearly visible and try again.');
        setIsVerifying(false);
        return;
      }

      // Calculate averages
      const avgConfidence = validDetections.reduce((sum, d) => sum + d.detection.score, 0) / validDetections.length;
      const avgGenderConf = validDetections.reduce((sum, d) => sum + d.genderProbability, 0) / validDetections.length;
      const avgAge = Math.round(validDetections.reduce((sum, d) => sum + d.age, 0) / validDetections.length);

      // Most common gender
      const genderCounts = validDetections.reduce((acc, d) => {
        acc[d.gender] = (acc[d.gender] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const detectedGender = Object.entries(genderCounts).reduce((a, b) => 
        genderCounts[a[0]] > genderCounts[b[0]] ? a : b
      )[0] as 'male' | 'female';

      const result: VerificationResult = {
        isReal: avgConfidence > 0.7 && avgGenderConf > 0.6,
        gender: detectedGender,
        confidence: Math.min(avgConfidence, avgGenderConf),
        age: avgAge,
        faceDescriptor: validDetections[validDetections.length - 1].descriptor ? 
          Array.from(validDetections[validDetections.length - 1].descriptor) : undefined
      };

      console.log('Verification result:', result);
      
      // Stop everything
      stopDetection();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      onVerificationComplete(result);
    } catch (error) {
      console.error('Verification processing error:', error);
      setError('Verification processing failed. Please try again.');
      setIsVerifying(false);
    }
  };

  const resetVerification = () => {
    setDetections([]);
    setError('');
    setIsVerifying(false);
    if (!isDetecting && modelsLoaded) {
      faceMyDetect();
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-2xl">
      {/* Header */}
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

          {/* Verification Overlay */}
          {isVerifying && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-900 font-semibold">Verifying your identity...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Instructions */}
      {detections.length < 5 && !error && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Instructions:
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Position your face in the center of the camera</li>
            <li>• Ensure good lighting on your face</li>
            <li>• Look directly at the camera</li>
            <li>• Wait for at least 5 face detections</li>
            <li>• Keep your face still and visible</li>
          </ul>
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
            disabled={isVerifying}
            className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          <button
            onClick={() => {
              stopDetection();
              if (stream) {
                stream.getTracks().forEach(track => track.stop());
              }
              onCancel?.();
            }}
            disabled={isVerifying}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {detections.length > 0 && detections.length < 10 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Face Data Collection
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {detections.length}/10
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((detections.length / 10) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Debug Info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <strong>Debug:</strong> Models: {modelsLoaded ? 'OK' : 'Loading'} | 
            Detecting: {isDetecting ? 'Yes' : 'No'} | 
            Detections: {detections.length} |
            {detections.length > 0 && ` Last Score: ${(detections[detections.length - 1]?.detection?.score * 100)?.toFixed(1)}%`}
          </p>
        </div>
      )}
    </div>
  );
}