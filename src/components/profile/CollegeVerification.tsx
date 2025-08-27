// components/profile/CollegeVerification.tsx
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
  Send
} from 'lucide-react';

interface VerificationStatus {
  collegeEmail?: string;
  collegeName?: string;
  isVerified: boolean;
  verifiedAt?: string;
}

export default function CollegeVerification() {
  const [step, setStep] = useState<'input' | 'verify' | 'success'>('input');
  const [collegeEmail, setCollegeEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    isVerified: false
  });
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  // Fetch current verification status
  useEffect(() => {
    fetchVerificationStatus();
  }, []);

    // Countdown timer for OTP expiry
//   useEffect(() => {
//     let timer: NodeJS.Timeout;
//     if (step === 'verify' && timeLeft > 0) {
//       timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
//     }
//     return () => clearTimeout(timer);
//   }, [step, timeLeft]);

useEffect(() => {
  let timer: NodeJS.Timeout;
  
  if (step === 'verify' && timeLeft > 0) {
    timer = setTimeout(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        
        // When time reaches 0, show expired message
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

//   const handleInitiateVerification = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       const response = await fetch('/api/college-verification/initiate', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ collegeEmail }),
//       });

//       const result = await response.json();

//       if (result.success) {
//         setSuccess(result.message);
//         setStep('verify');
//         setTimeLeft(600); // Reset timer
//       } else {
//         setError(result.error);
//       }
//     } catch (error) {
//       setError('Something went wrong. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };
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
      
      // Reset timer to full 10 minutes (600 seconds)
      setTimeLeft(600);
      
      // Clear any previous error
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


//   const handleVerifyOTP = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const response = await fetch('/api/college-verification/verify', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ collegeEmail, otp }),
//       });

//       const result = await response.json();

//       if (result.success) {
//         setSuccess(result.message);
//         setStep('success');
//         await fetchVerificationStatus(); // Refresh status
//       } else {
//         setError(result.error);
//       }
//     } catch (error) {
//       setError('Something went wrong. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

const handleVerifyOTP = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Check if time has expired on frontend
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
      await fetchVerificationStatus(); // Refresh status
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

  if (verificationStatus.isVerified) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              College Verified
            </h3>
            <p className="text-green-600 dark:text-green-300 text-sm">
              {verificationStatus.collegeName}
            </p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
            <Mail className="w-4 h-4" />
            <span>{verificationStatus.collegeEmail}</span>
          </div>
          {verificationStatus.verifiedAt && (
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-2">
              <Clock className="w-4 h-4" />
              <span>
                Verified on {new Date(verificationStatus.verifiedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
          <Shield className="w-4 h-4" />
          <span>Your profile now shows a verified college badge</span>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            College Verification
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Verify your college email to get a trusted badge
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <form onSubmit={handleInitiateVerification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  College Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={collegeEmail}
                    onChange={(e) => setCollegeEmail(e.target.value)}
                    placeholder="your.name@university.edu"
                    className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                    disabled={loading}
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Use your official college email (.edu, .ac.in domains)
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-lg"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{success}</span>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading || !collegeEmail}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending verification email...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Verification Code
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {step === 'verify' && (
          <motion.div
            key="verify"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Check your email
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We sent a 6-digit code to <strong>{collegeEmail}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  maxLength={6}
                  required
                  disabled={loading}
                />
              </div>

              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                {timeLeft > 0 ? (
                  <span>Code expires in {formatTime(timeLeft)}</span>
                ) : (
                  <span className="text-red-500">Code has expired</span>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </motion.div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={loading}
                >
                  Resend Code
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6 || timeLeft <= 0}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Verify
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Why verify your college?
        </h5>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Get a trusted verification badge on your profile</li>
          <li>• Build trust with other users</li>
          <li>• Access to college-specific features and events</li>
          <li>• Higher priority in matching algorithm</li>
        </ul>
      </div>
    </div>
  );
}