'use client'

import { useState, useEffect } from 'react'
import { PhoneAuthService } from '@/lib/firebase'
import { supabase } from '@/lib/supabase'
import { signIn } from 'next-auth/react'
import { Phone, Shield, Loader2 } from 'lucide-react'
import { auth } from '@/lib/firebase'

interface PhoneAuthProps {
  onSuccess?: (phoneNumber: string) => void
  onError?: (error: string) => void
}

export default function PhoneAuth({ onSuccess, onError }: PhoneAuthProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<any>(null)
  const [error, setError] = useState('')

  // Debug Firebase configuration
  useEffect(() => {
    console.log('🔥 Firebase Configuration Debug:')
    console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + '...')
    console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
    console.log('Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)
    console.log('Firebase Auth:', auth)
  }, [])

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter a valid phone number')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Initialize reCAPTCHA
      // PhoneAuthService.initRecaptcha()
      
      const result = await PhoneAuthService.sendOTP(phoneNumber)
      
      if (result.success) {
        setConfirmationResult(result.confirmationResult)
        setStep('otp')
      } else {
        setError(result.message || 'Failed to send OTP')
        onError?.(result.message || 'Failed to send OTP')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP')
      onError?.(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  // const handleVerifyOTP = async () => {
  //   if (!otp.trim() || otp.length !== 6) {
  //     setError('Please enter a valid 6-digit OTP')
  //     return
  //   }

  //   setLoading(true)
  //   setError('')

  //   try {
  //     const result = await PhoneAuthService.verifyOTP(confirmationResult, otp)
      
  //     if (result.success) {
  //       // Phone verified successfully
  //       // Now create/update user in Supabase
  //       await createOrUpdateSupabaseUser(result.phoneNumber, result.uid)
        
  //       onSuccess?.(result.phoneNumber)
  //     } else {
  //       setError(result.message || 'Invalid OTP')
  //       onError?.(result.message || 'Invalid OTP')
  //     }
  //   } catch (err: any) {
  //     setError(err.message || 'Failed to verify OTP')
  //     onError?.(err.message || 'Failed to verify OTP')
  //   } finally {
  //     setLoading(false)
  //   }
  // }
  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('🔐 Verifying OTP...')
      const result = await PhoneAuthService.verifyOTP(confirmationResult, otp)
      
      if (result.success) {
        console.log('✅ OTP verified successfully!')
        
        // Create/update user in Supabase
        const supabaseUser = await createOrUpdateSupabaseUser(result.phoneNumber, result.uid)
        
        // Sign in with NextAuth using phone provider
        console.log('🔑 Signing in with NextAuth...')
        const signInResult = await signIn('phone', {
          phone: result.phoneNumber,
          firebaseUid: result.uid,
          redirect: false
        })

        console.log('NextAuth sign in result:', signInResult)

        if (signInResult?.error) {
          throw new Error(signInResult.error)
        }

        // Store Firebase token for later use
        const token = await result.user.getIdToken()
        localStorage.setItem('firebaseToken', token)
        localStorage.setItem('userPhone', result.phoneNumber)
        
        console.log('🎉 Phone authentication completed successfully!')
        onSuccess?.(result.phoneNumber)
      } else {
        setError(result.message || 'Invalid OTP')
        onError?.(result.message || 'Invalid OTP')
      }
    } catch (err: any) {
      console.error('❌ Phone verification error:', err)
      setError(err.message || 'Failed to verify OTP')
      onError?.(err.message || 'Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  const createOrUpdateSupabaseUser = async (phoneNumber: string, firebaseUid: string) => {
  try {
    console.log('Creating/updating user:', { phoneNumber, firebaseUid })
    
    // First check if user exists by phone number
    const { data: existingUserByPhone, error: phoneError } = await supabase
      .from('users')
      .select('*')
      .eq('phone_number', phoneNumber)
      .maybeSingle()

    if (phoneError) {
      console.error('Phone fetch error:', phoneError)
    }

    if (existingUserByPhone) {
      console.log('User exists by phone, updating Firebase UID:', existingUserByPhone.id)
      // Update existing user with Firebase UID
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ 
          firebase_uid: firebaseUid,
          is_phone_verified: true,
          phone_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('phone_number', phoneNumber)
        .select()
        .single()

      if (updateError) {
        console.error('Update error:', updateError)
        throw updateError
      }
      console.log('User updated successfully:', updatedUser)
      return updatedUser
    }

    // Check if user exists by firebase_uid
    const { data: existingUserByFirebase, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .maybeSingle()

    if (fetchError) {
      console.error('Firebase UID fetch error:', fetchError)
    }

    if (existingUserByFirebase) {
      console.log('User exists by Firebase UID, updating phone:', existingUserByFirebase.id)
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ 
          phone_number: phoneNumber,
          is_phone_verified: true,
          phone_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('firebase_uid', firebaseUid)
        .select()
        .single()

      if (updateError) {
        console.error('Update error:', updateError)
        throw updateError
      }
      console.log('User updated successfully:', updatedUser)
      return updatedUser
    }

    // No existing user found, create new one
    console.log('Creating new user...')
    
    // Generate unique username
    const baseUsername = `user_${phoneNumber.slice(-4)}`
    let username = baseUsername
    let counter = 1
    
    // Check if username exists and generate a unique one
    while (true) {
      const { data: existingUsername } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .maybeSingle()
      
      if (!existingUsername) {
        break // Username is available
      }
      
      username = `${baseUsername}_${counter}`
      counter++
    }

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        firebase_uid: firebaseUid,
        phone_number: phoneNumber,
        username: username,
        email: `${firebaseUid}@phone.blindcharm.com`,
        is_phone_verified: true,
        phone_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (createError) {
      console.error('Create error:', createError)
      throw createError
    }
    console.log('User created successfully:', newUser)
    return newUser

  } catch (error) {
    console.error('Error in createOrUpdateSupabaseUser:', error)
    throw error
  }
}
//   const createOrUpdateSupabaseUser = async (phoneNumber: string, firebaseUid: string) => {
//   try {
//     console.log('Creating/updating user:', { phoneNumber, firebaseUid })
    
//     // Try to find existing user by firebase_uid
//     const { data: existingUser, error: fetchError } = await supabase
//       .from('users')
//       .select('*')
//       .eq('firebase_uid', firebaseUid)
//       .maybeSingle()

//     if (fetchError) {
//       console.error('Fetch error:', fetchError)
//     }

//     if (existingUser) {
//       console.log('User exists, updating:', existingUser.id)
//       // Update existing user
//       const { data: updatedUser, error: updateError } = await supabase
//         .from('users')
//         .update({ 
//           // Update phone-related fields
//           phone_number: phoneNumber,
//           is_phone_verified: true,
//           phone_verified_at: new Date().toISOString(),
//           updated_at: new Date().toISOString()
//         })
//         .eq('firebase_uid', firebaseUid)
//         .select()
//         .single()

//       if (updateError) {
//         console.error('Update error:', updateError)
//         throw updateError
//       }
//       console.log('User updated successfully:', updatedUser)
//       return updatedUser
//     } else {
//       console.log('Creating new user...')
//       // Create new user with only the required fields
//       const { data: newUser, error: createError } = await supabase
//         .from('users')
//         .insert({
//           // id will be auto-generated now
//           firebase_uid: firebaseUid,
//           phone_number: phoneNumber,
//           username: `user_${phoneNumber.slice(-4)}`,
//           email: `${firebaseUid}@phone.blindcharm.com`,
//           is_phone_verified: true,
//           phone_verified_at: new Date().toISOString(),
//           // created_at has default NOW() so it's automatic
//           updated_at: new Date().toISOString()
//         })
//         .select()
//         .single()

//       if (createError) {
//         console.error('Create error:', createError)
//         throw createError
//       }
//       console.log('User created successfully:', newUser)
//       return newUser
//     }
//   } catch (error) {
//     console.error('Error in createOrUpdateSupabaseUser:', error)
//     throw error
//   }
// }

  const handleBack = () => {
    setStep('phone')
    setOtp('')
    setError('')
  }

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    // Add country code if not present
    if (digits.length > 0 && !digits.startsWith('91')) {
      return '+91' + digits
    }
    
    return '+' + digits
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* reCAPTCHA container (must exist for Firebase to send OTP) */}
      {/* <div id="recaptcha-container" style={{ minHeight: 78 }} /> */}
      
      {step === 'phone' ? (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 dark:bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-black dark:text-white" />
            </div>
            <h2 className="text-2xl font-bold dark:text-white text-white">
              Verify Your Phone
            </h2>
            <p className="dark:text-gray-100 text-gray-300 mt-2">
              We'll send you a verification code to confirm your number
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium dark:text-white text-white mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                placeholder="+91 XXXXXXXXXX"
                className="w-full px-4 py-3 border text-white border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={handleSendOTP}
              disabled={loading || !phoneNumber.trim()}
              className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending OTP...
                </div>
              ) : (
                'Send OTP'
              )}
            </button>
          </div>
          <div id="recaptcha-container"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-white dark:text-white">
              Enter Verification Code
            </h2>
            <p className="text-gray-200 dark:text-gray-400 mt-2">
              We sent a 6-digit code to {phoneNumber}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 dark:text-gray-300 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white text-center text-2xl tracking-widest"
                maxLength={6}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  'Verify Code'
                )}
              </button>

              <button
                onClick={handleBack}
                disabled={loading}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Change Phone Number
              </button>
            </div>
          </div>
        </div>
      )}
      {/* <div id="recaptcha-container" style={{ minHeight: 78 }} /> */}
      <div id="recaptcha-container" />
      <div className="w-full max-w-md mx-auto mt-4 text-center">
          <p className="text-xs text-white dark:text-gray-200">
            By creating an account, you agree to our{' '}
            <a href="/terms" className="text-lime-400 dark:text-red-400 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-lime-400 dark:text-red-400 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
    </div>
  )
}