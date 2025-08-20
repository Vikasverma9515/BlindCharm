// Firebase configuration for phone authentication
import { initializeApp, getApps } from 'firebase/app'
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { getAnalytics } from "firebase/analytics";

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
//   measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
// }
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};


// Initialize Firebase only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const auth = getAuth(app)

// Phone authentication functions
export class PhoneAuthService {
  private static recaptchaVerifier: RecaptchaVerifier | null = null

  static initRecaptcha(containerId: string = 'recaptcha-container') {
    if (typeof window === 'undefined') return null
    
    try {
      // Clear any existing reCAPTCHA
      if (this.recaptchaVerifier) {
        this.recaptchaVerifier.clear()
        this.recaptchaVerifier = null
      }

      // Make sure the container exists
      const container = document.getElementById(containerId)
      if (!container) {
        console.error('reCAPTCHA container not found:', containerId)
        return null
      }

      this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'normal', // Changed from 'invisible' to 'normal' for testing
        callback: (response: any) => {
          console.log('✅ reCAPTCHA solved:', response)
        },
        'expired-callback': () => {
          console.log('⏰ reCAPTCHA expired')
        },
        'error-callback': (error: any) => {
          console.error('❌ reCAPTCHA error:', error)
        }
      })
      
      console.log('🔒 reCAPTCHA initialized successfully')
      return this.recaptchaVerifier
    } catch (error) {
      console.error('❌ Error initializing reCAPTCHA:', error)
      return null
    }
  }

  static async sendOTP(phoneNumber: string) {
    try {
      console.log('🔥 Starting OTP send process for:', phoneNumber)

      // Format phone number (ensure it starts with country code)
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`
      console.log('📱 Formatted phone:', formattedPhone)

      // Initialize reCAPTCHA
      console.log('🔒 Initializing reCAPTCHA...')
      const recaptcha = this.initRecaptcha()
      
      if (!recaptcha) {
        throw new Error('Failed to initialize reCAPTCHA')
      }

      console.log('📤 Sending OTP via Firebase...')
      const confirmationResult = await signInWithPhoneNumber(
        auth, 
        formattedPhone, 
        recaptcha
      )
      
      console.log('✅ OTP sent successfully!')
      return {
        success: true,
        confirmationResult,
        message: 'OTP sent successfully'
      }
    } catch (error: any) {
      console.error('❌ Error sending OTP:', error)
      
      // Provide more specific error messages
      let errorMessage = 'Failed to send OTP'
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format'
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later'
      } else if (error.code === 'auth/invalid-app-credential') {
        errorMessage = 'Firebase configuration error. Please contact support'
      }
      
      return {
        success: false,
        error: error.message,
        message: errorMessage
      }
    }
  }

  static async verifyOTP(confirmationResult: any, otp: string) {
    try {
      const result = await confirmationResult.confirm(otp)
      const user = result.user
      
      return {
        success: true,
        user,
        phoneNumber: user.phoneNumber,
        uid: user.uid,
        message: 'Phone verified successfully'
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error)
      return {
        success: false,
        error: error.message,
        message: 'Invalid OTP'
      }
    }
  }

  static cleanup() {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear()
      this.recaptchaVerifier = null
    }
  }
}