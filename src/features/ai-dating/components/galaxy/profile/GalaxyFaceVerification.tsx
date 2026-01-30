'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera,
    CheckCircle,
    XCircle,
    Loader2,
    AlertCircle,
    RotateCcw,
    User,
    Shield,
    Sparkles,
    X
} from 'lucide-react';
import { toast } from 'sonner';

interface GalaxyFaceVerificationProps {
    profilePhotoUrl?: string;
    onVerificationComplete: (success: boolean) => void;
    onClose: () => void;
}

export default function GalaxyFaceVerification({
    profilePhotoUrl,
    onVerificationComplete,
    onClose
}: GalaxyFaceVerificationProps) {
    const { data: session } = useSession();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [step, setStep] = useState<'start' | 'camera' | 'captured' | 'processing' | 'result'>('start');
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
            stopCamera();
        };
    }, []);

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    const startCamera = async () => {
        setError('');
        setStep('camera');

        try {
            const currentStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });

            setStream(currentStream);

            if (videoRef.current) {
                videoRef.current.srcObject = currentStream;
            }
        } catch (err) {
            console.error('Camera error:', err);
            setError('Unable to access camera. Please check permissions.');
        }
    };

    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        // Set consistent dimensions
        canvas.width = 640;
        canvas.height = 480;

        // Draw video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to high quality JPEG
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        setCapturedImage(dataUrl);
        setStep('captured');
        stopCamera();
    }, []);

    const submitVerification = async () => {
        if (!capturedImage || !session?.user?.id || !profilePhotoUrl) {
            setError('Missing required data for verification');
            return;
        }

        setStep('processing');
        setError('');

        try {
            // Convert images to blobs
            const livePhotoBlob = await fetch(capturedImage).then(r => r.blob());
            const profilePhotoBlob = await fetch(profilePhotoUrl).then(r => r.blob());

            const formData = new FormData();
            formData.append('profilePhoto', profilePhotoBlob, 'profile.jpg');
            formData.append('livePhoto', livePhotoBlob, 'live.jpg');
            formData.append('userId', session.user.id);

            const response = await fetch('/api/verify-face-aws', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Verification failed');
            }

            setVerificationResult({
                success: result.success,
                confidence: result.confidence,
                message: result.message
            });

            setStep('result');

            if (result.success) {
                setTimeout(() => {
                    onVerificationComplete(true);
                }, 2000);
            }

        } catch (err: any) {
            console.error('Verification error:', err);
            setError(err.message || 'Verification failed. Please try again.');
            setStep('result');
            setVerificationResult({
                success: false,
                confidence: 0,
                message: err.message || 'Verification failed'
            });
        }
    };

    const renderContent = () => {
        switch (step) {
            case 'start':
                return (
                    <div className="text-center space-y-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto border border-white/10 relative">
                            <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
                            <User className="w-12 h-12 text-cyan-400 relative z-10" />
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">Face Verification</h3>
                            <p className="text-white/60 mb-6">
                                We'll compare your live photo with your profile picture to verify your identity.
                            </p>

                            {!profilePhotoUrl ? (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-6">
                                    Please upload a profile photo first before verifying.
                                </div>
                            ) : (
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 text-left">
                                    <div className="flex items-start gap-3">
                                        <Sparkles className="w-5 h-5 text-cyan-400 mt-0.5" />
                                        <div className="text-sm text-white/80">
                                            <p className="font-bold mb-2 text-white">Instructions:</p>
                                            <ul className="space-y-2">
                                                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-cyan-400 rounded-full" /> Ensure good lighting</li>
                                                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-cyan-400 rounded-full" /> Remove glasses/masks</li>
                                                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-cyan-400 rounded-full" /> Look directly at camera</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={startCamera}
                            disabled={!profilePhotoUrl}
                            className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Camera className="w-5 h-5" />
                            Start Camera
                        </button>
                    </div>
                );

            case 'camera':
                return (
                    <div className="space-y-6">
                        <div className="relative aspect-[3/4] bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            />
                            <canvas ref={canvasRef} className="hidden" />

                            {/* Overlay Guide */}
                            <div className="absolute inset-0 border-[3px] border-white/20 rounded-[40%] m-12 pointer-events-none" />
                        </div>

                        <button
                            onClick={capturePhoto}
                            className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                        >
                            <Camera className="w-5 h-5" />
                            Take Photo
                        </button>
                    </div>
                );

            case 'captured':
                return (
                    <div className="space-y-6">
                        <div className="relative aspect-[3/4] bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                            {capturedImage && (
                                <img
                                    src={capturedImage}
                                    alt="Captured"
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => {
                                    setCapturedImage(null);
                                    startCamera();
                                }}
                                className="bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl font-medium transition-all"
                            >
                                Retake
                            </button>
                            <button
                                onClick={submitVerification}
                                className="bg-cyan-500 hover:bg-cyan-400 text-black py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="w-5 h-5" />
                                Verify
                            </button>
                        </div>
                    </div>
                );

            case 'processing':
                return (
                    <div className="text-center space-y-8 py-12">
                        <div className="relative w-24 h-24 mx-auto">
                            <div className="absolute inset-0 rounded-full border-4 border-white/10" />
                            <div className="absolute inset-0 rounded-full border-4 border-t-cyan-500 animate-spin" />
                            <Loader2 className="absolute inset-0 m-auto w-8 h-8 text-cyan-500 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Verifying...</h3>
                            <p className="text-white/60">Analyzing your cosmic signature</p>
                        </div>
                    </div>
                );

            case 'result':
                const isSuccess = verificationResult?.success;
                return (
                    <div className="text-center space-y-8 py-8">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto border-4 ${isSuccess
                                ? 'bg-green-500/20 border-green-500 text-green-400'
                                : 'bg-red-500/20 border-red-500 text-red-400'
                            }`}>
                            {isSuccess ? <CheckCircle className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                                {isSuccess ? 'Verified!' : 'Verification Failed'}
                            </h3>
                            <p className="text-white/60 mb-2">
                                {verificationResult?.message}
                            </p>
                            {verificationResult?.confidence && verificationResult.confidence > 0 && (
                                <div className="inline-block px-3 py-1 rounded-full bg-white/5 text-xs text-white/40">
                                    Confidence: {verificationResult.confidence.toFixed(1)}%
                                </div>
                            )}
                        </div>

                        {!isSuccess && (
                            <button
                                onClick={() => {
                                    setCapturedImage(null);
                                    setVerificationResult(null);
                                    startCamera();
                                }}
                                className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-200 transition-all"
                            >
                                Try Again
                            </button>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors z-50"
                >
                    <X size={20} />
                </button>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {renderContent()}
                </div>
            </motion.div>
        </div>
    );
}
