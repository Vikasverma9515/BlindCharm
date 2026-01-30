'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GraduationCap,
    Mail,
    CheckCircle,
    AlertCircle,
    Loader2,
    Shield,
    Clock,
    Send,
    X
} from 'lucide-react';

interface VerificationStatus {
    collegeEmail?: string;
    collegeName?: string;
    isVerified: boolean;
    verifiedAt?: string;
}

interface GalaxyCollegeVerificationProps {
    onClose: () => void;
}

export default function GalaxyCollegeVerification({ onClose }: GalaxyCollegeVerificationProps) {
    const [step, setStep] = useState<'input' | 'verify' | 'success'>('input');
    const [collegeEmail, setCollegeEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
        isVerified: false
    });
    const [timeLeft, setTimeLeft] = useState(600);

    useEffect(() => {
        fetchVerificationStatus();
    }, []);

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (step === 'verify' && timeLeft > 0) {
            timer = setTimeout(() => {
                setTimeLeft(prev => {
                    const newTime = prev - 1;
                    if (newTime <= 0) {
                        setError('Verification code has expired. Please request a new one.');
                        return 0;
                    }
                    return newTime;
                });
            }, 1000);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [step, timeLeft]);

    const fetchVerificationStatus = async () => {
        try {
            const response = await fetch('/api/college-verification/status');
            const result = await response.json();

            if (result.success) {
                setVerificationStatus(result.data);
                if (result.data.isVerified) {
                    setStep('success');
                }
            }
        } catch (error) {
            console.error('Error fetching verification status:', error);
        }
    };

    const handleInitiateVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/college-verification/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ collegeEmail }),
            });

            const result = await response.json();

            if (result.success) {
                setSuccess(result.message);
                setStep('verify');
                setTimeLeft(600);
                setError('');
            } else {
                setError(result.error);
            }
        } catch (error) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();

        if (timeLeft <= 0) {
            setError('Verification code has expired. Please request a new one.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/college-verification/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ collegeEmail, otp }),
            });

            const result = await response.json();

            if (result.success) {
                setSuccess(result.message);
                setStep('success');
                await fetchVerificationStatus();
            } else {
                setError(result.error);
            }
        } catch (error) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleResendOTP = () => {
        setStep('input');
        setOtp('');
        setError('');
        setSuccess('');
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
                    {step === 'success' || verificationStatus.isVerified ? (
                        <div className="text-center space-y-6">
                            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/50 relative">
                                <div className="absolute inset-0 rounded-full bg-green-500/20 blur-xl animate-pulse" />
                                <CheckCircle className="w-12 h-12 text-green-400 relative z-10" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">College Verified!</h3>
                                <p className="text-white/60 mb-1">{verificationStatus.collegeName || 'University'}</p>
                                <p className="text-white/40 text-sm">{verificationStatus.collegeEmail}</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center gap-3 text-left">
                                <Shield className="w-8 h-8 text-green-400" />
                                <p className="text-sm text-white/80">Your profile now displays the verified student badge.</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-200 transition-all"
                            >
                                Done
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                                    <GraduationCap className="w-8 h-8 text-purple-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Student Verification</h3>
                                <p className="text-white/60 text-sm">Unlock exclusive student features and badges.</p>
                            </div>

                            <AnimatePresence mode="wait">
                                {step === 'input' && (
                                    <motion.form
                                        key="input"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        onSubmit={handleInitiateVerification}
                                        className="space-y-4"
                                    >
                                        <div>
                                            <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">
                                                College Email
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    value={collegeEmail}
                                                    onChange={(e) => setCollegeEmail(e.target.value)}
                                                    placeholder="you@university.edu"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-white placeholder:text-white/20 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                                    required
                                                    disabled={loading}
                                                />
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                            </div>
                                        </div>

                                        {error && (
                                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                                                <AlertCircle size={16} /> {error}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={loading || !collegeEmail}
                                            className="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                                            Send Code
                                        </button>
                                    </motion.form>
                                )}

                                {step === 'verify' && (
                                    <motion.form
                                        key="verify"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        onSubmit={handleVerifyOTP}
                                        className="space-y-6"
                                    >
                                        <div className="text-center">
                                            <p className="text-white/80 text-sm mb-1">Code sent to</p>
                                            <p className="text-purple-400 font-medium">{collegeEmail}</p>
                                        </div>

                                        <div>
                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                placeholder="000000"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-center text-3xl font-mono tracking-[0.5em] text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                                maxLength={6}
                                                required
                                                disabled={loading}
                                            />
                                            <div className="text-center mt-2 text-xs text-white/40">
                                                {timeLeft > 0 ? (
                                                    <span>Expires in {formatTime(timeLeft)}</span>
                                                ) : (
                                                    <span className="text-red-400">Expired</span>
                                                )}
                                            </div>
                                        </div>

                                        {error && (
                                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                                                <AlertCircle size={16} /> {error}
                                            </div>
                                        )}

                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={handleResendOTP}
                                                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl font-medium transition-all"
                                                disabled={loading}
                                            >
                                                Resend
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading || otp.length !== 6}
                                                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {loading ? <Loader2 className="animate-spin" /> : <CheckCircle size={18} />}
                                                Verify
                                            </button>
                                        </div>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
