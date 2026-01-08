'use client'

import { useState, useEffect } from 'react'
import { PhoneAuthService } from '@/lib/firebase'
import { supabase } from '@/lib/supabase'
import { signIn } from 'next-auth/react'
import { Phone, Shield, Loader2, ChevronRight } from 'lucide-react'
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

        // Sync galaxy_profile
        await supabase.from('galaxy_profiles').upsert({
          user_id: updatedUser.id,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

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

        // Sync galaxy_profile
        await supabase.from('galaxy_profiles').upsert({
          user_id: updatedUser.id,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

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

      // Sync galaxy_profile
      await supabase.from('galaxy_profiles').upsert({
        user_id: newUser.id,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

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
    <div className="w-full max-w-md mx-auto font-sans" style={{ fontFamily: 'var(--font-outfit)' }}>
      {/* reCAPTCHA container */}
      <div id="recaptcha-container" className="flex justify-center mb-4"></div>

      {step === 'phone' ? (
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>What's your <br /> phone number?</h2>
          </div>

          <div className="space-y-10">
            {/* Phone Input */}
            <div className="flex items-center gap-4 border-b-2 border-white/20 pb-4 focus-within:border-white transition-colors group relative top-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl text-white">🇮🇳</span>
                <span className="text-3xl font-medium text-white">+91</span>
              </div>
              <input
                type="tel"
                value={phoneNumber.replace(/^\+91/, '')}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setPhoneNumber('+91' + val);
                }}
                placeholder="99999 99999"
                className="w-full bg-transparent text-3xl font-medium text-white placeholder-white/20 outline-none h-10"
                disabled={loading}
                autoFocus
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 font-medium">{error}</p>
            )}

            <p className="text-xs text-white/40 leading-relaxed pt-2">
              BlindCharm will send you a text with a verification code. Message and data rates may apply.
            </p>

            <button
              onClick={handleSendOTP}
              disabled={loading || phoneNumber.length < 13} // +91 + 10 digits
              className="w-full py-4 mt-8 bg-purple-600 active:bg-purple-700 disabled:opacity-50 disabled:bg-zinc-800 text-white rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Next <ChevronRight size={20} /></>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>Enter Code</h2>
            <p className="text-white/60 text-sm">
              Sent to <span className="text-white font-medium">{phoneNumber}</span>
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex justify-between gap-2 relative">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-12 h-14 border-b-2 border-white/20 flex items-center justify-center relative">
                  <span className="text-3xl font-medium">{otp[i] || ''}</span>
                  {otp.length === i && (
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white animate-pulse" />
                  )}
                </div>
              ))}
              <input
                type="tel"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-text"
                autoFocus
                maxLength={6}
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 font-medium">{error}</p>
            )}

            <div className="pt-4 space-y-4">
              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full py-4 bg-purple-600 active:bg-purple-700 disabled:opacity-50 disabled:bg-zinc-800 text-white rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Verify Code'
                )}
              </button>

              <button
                onClick={handleBack}
                disabled={loading}
                className="w-full py-2 text-white/40 text-sm hover:text-white transition-colors"
                style={{ fontFamily: 'var(--font-outfit)' }}
              >
                Change Phone Number
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}