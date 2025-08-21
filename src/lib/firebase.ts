// // Firebase configuration for phone authentication
// import { initializeApp, getApps } from 'firebase/app'
// import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
// import { getAnalytics } from "firebase/analytics";

// // const firebaseConfig = {
// //   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
// //   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
// //   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
// //   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
// //   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
// //   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
// //   measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
// // }
// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
//   measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
// };


// // Initialize Firebase only if not already initialized
// const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
// export const auth = getAuth(app)

// // Phone authentication functions
// export class PhoneAuthService {
//   private static recaptchaVerifier: RecaptchaVerifier | null = null

//   static initRecaptcha(containerId: string = 'recaptcha-container') {
//     if (typeof window === 'undefined') return null
    
//     try {
//       // Clear any existing reCAPTCHA
//       if (this.recaptchaVerifier) {
//         this.recaptchaVerifier.clear()
//         this.recaptchaVerifier = null
//       }

//       // Make sure the container exists
//       const container = document.getElementById(containerId)
//       if (!container) {
//         console.error('reCAPTCHA container not found:', containerId)
//         return null
//       }

//       this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
//         size: 'normal', // Changed from 'invisible' to 'normal' for testing
//         callback: (response: any) => {
//           console.log('✅ reCAPTCHA solved:', response)
//         },
//         'expired-callback': () => {
//           console.log('⏰ reCAPTCHA expired')
//         },
//         'error-callback': (error: any) => {
//           console.error('❌ reCAPTCHA error:', error)
//         }
//       })
      
//       console.log('🔒 reCAPTCHA initialized successfully')
//       return this.recaptchaVerifier
//     } catch (error) {
//       console.error('❌ Error initializing reCAPTCHA:', error)
//       return null
//     }
//   }

//   static async sendOTP(phoneNumber: string) {
//     try {
//       console.log('🔥 Starting OTP send process for:', phoneNumber)

//       // Format phone number (ensure it starts with country code)
//       const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`
//       console.log('📱 Formatted phone:', formattedPhone)

//       // Initialize reCAPTCHA
//       console.log('🔒 Initializing reCAPTCHA...')
//       const recaptcha = this.initRecaptcha()
      
//       if (!recaptcha) {
//         throw new Error('Failed to initialize reCAPTCHA')
//       }

//       console.log('📤 Sending OTP via Firebase...')
//       const confirmationResult = await signInWithPhoneNumber(
//         auth, 
//         formattedPhone, 
//         recaptcha
//       )
      
//       console.log('✅ OTP sent successfully!')
//       return {
//         success: true,
//         confirmationResult,
//         message: 'OTP sent successfully'
//       }
//     } catch (error: any) {
//       console.error('❌ Error sending OTP:', error)
      
//       // Provide more specific error messages
//       let errorMessage = 'Failed to send OTP'
//       if (error.code === 'auth/invalid-phone-number') {
//         errorMessage = 'Invalid phone number format'
//       } else if (error.code === 'auth/too-many-requests') {
//         errorMessage = 'Too many requests. Please try again later'
//       } else if (error.code === 'auth/invalid-app-credential') {
//         errorMessage = 'Firebase configuration error. Please contact support'
//       }
      
//       return {
//         success: false,
//         error: error.message,
//         message: errorMessage
//       }
//     }
//   }

//   static async verifyOTP(confirmationResult: any, otp: string) {
//     try {
//       const result = await confirmationResult.confirm(otp)
//       const user = result.user
      
//       return {
//         success: true,
//         user,
//         phoneNumber: user.phoneNumber,
//         uid: user.uid,
//         message: 'Phone verified successfully'
//       }
//     } catch (error: any) {
//       console.error('Error verifying OTP:', error)
//       return {
//         success: false,
//         error: error.message,
//         message: 'Invalid OTP'
//       }
//     }
//   }

//   static cleanup() {
//     if (this.recaptchaVerifier) {
//       this.recaptchaVerifier.clear()
//       this.recaptchaVerifier = null
//     }
//   }
// }


// lib/firebase.ts
'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

// KEEP analytics imports out unless you use them in a client-only place
// import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Optional: pick SMS language
auth.languageCode = 'en';

// We’ll store a single verifier on window to avoid duplicates
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export class PhoneAuthService {
  static ensureRecaptcha(containerId = 'recaptcha-container'): RecaptchaVerifier {
    if (typeof window === 'undefined') {
      throw new Error('reCAPTCHA must be initialized in the browser');
    }

    // If we already have a usable verifier, reuse it
    if (window.recaptchaVerifier) {
      return window.recaptchaVerifier;
    }

    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`reCAPTCHA container not found: ${containerId}`);
    }

    // Create a normal (visible) v2 widget. Invisible works too, but visible is easier to debug.
    const verifier = new RecaptchaVerifier(
      auth,
      containerId,
      {
        size: 'normal',
        callback: (token: string) => {
          console.log('✅ reCAPTCHA solved:', token);
        },
        'expired-callback': () => {
          console.log('⏰ reCAPTCHA expired');
        },
        'error-callback': (err: unknown) => {
          console.error('❌ reCAPTCHA error:', err);
        },
      }
    );

    // Render immediately so Firebase can use it
    verifier.render();

    window.recaptchaVerifier = verifier;
    return verifier;
  }

  static async sendOTP(rawPhone: string) {
    // Normalize to +<country><number>
    const formatted = rawPhone.startsWith('+') ? rawPhone : `+${rawPhone}`;
    try {
      const verifier = this.ensureRecaptcha(); // single init
      const confirmationResult = await signInWithPhoneNumber(auth, formatted, verifier);
      return { success: true, confirmationResult, message: 'OTP sent successfully' };
    } catch (error: any) {
      console.error('❌ Error sending OTP:', error);

      // Helpful messages
      let message = 'Failed to send OTP';
      switch (error?.code) {
        case 'auth/invalid-phone-number': message = 'Invalid phone number format'; break;
        case 'auth/too-many-requests': message = 'Too many attempts. Try again later.'; break;
        case 'auth/captcha-check-failed': message = 'Captcha failed. Reload the page and try again.'; break;
        case 'auth/requests-from-referer-are-blocked':
          message = 'Domain is not authorized in Firebase / API key restrictions.';
          break;
        case 'auth/invalid-app-credential':
          message = 'Firebase API key / domain mismatch. Check .env and console settings.';
          break;
      }
      return { success: false, error: error?.message, message };
    }
  }

  static async verifyOTP(confirmationResult: any, otp: string) {
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      return {
        success: true,
        user,
        phoneNumber: user.phoneNumber,
        uid: user.uid,
        message: 'Phone verified successfully',
      };
    } catch (error: any) {
      console.error('❌ Error verifying OTP:', error);
      return { success: false, error: error?.message, message: 'Invalid OTP' };
    }
  }

  static cleanup() {
    if (typeof window !== 'undefined' && window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch {}
      delete window.recaptchaVerifier;
    }
  }
}
