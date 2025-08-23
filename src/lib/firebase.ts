'use client'

import { initializeApp, getApps } from 'firebase/app'
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
export const auth = getAuth(app)
auth.languageCode = 'en'

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier
  }
}

export class PhoneAuthService {
  static ensureRecaptcha(containerId = 'recaptcha-container'): RecaptchaVerifier {
    if (typeof window === 'undefined') {
      throw new Error('reCAPTCHA must be initialized in the browser')
    }

    // Reuse verifier if already created
    if (window.recaptchaVerifier) {
      return window.recaptchaVerifier
    }

    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible', // ✅ invisible captcha
      callback: (token: string) => {
        console.log('✅ reCAPTCHA solved automatically:', token)
      },
      'expired-callback': () => {
        console.warn('⏰ reCAPTCHA expired, refreshing...')
      },
      'error-callback': (err: unknown) => {
        console.error('❌ reCAPTCHA error:', err)
      },
    })

    window.recaptchaVerifier = verifier
    return verifier
  }

  static async sendOTP(rawPhone: string) {
    const formatted = rawPhone.startsWith('+') ? rawPhone : `+${rawPhone}`
    try {
      const verifier = this.ensureRecaptcha()
      const confirmationResult = await signInWithPhoneNumber(auth, formatted, verifier)
      return { success: true, confirmationResult, message: 'OTP sent successfully' }
    } catch (error: any) {
      console.error('❌ Error sending OTP:', error)

      let message = 'Failed to send OTP'
      switch (error?.code) {
        case 'auth/invalid-phone-number':
          message = 'Invalid phone number format'
          break
        case 'auth/too-many-requests':
          message = 'Too many attempts. Try again later.'
          break
        case 'auth/captcha-check-failed':
          message = 'Captcha failed. Reload the page.'
          break
        case 'auth/requests-from-referer-are-blocked':
          message = 'Domain not authorized in Firebase settings.'
          break
      }
      return { success: false, error: error?.message, message }
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
        message: 'Phone verified successfully',
      }
    } catch (error: any) {
      console.error('❌ Error verifying OTP:', error)
      return { success: false, error: error?.message, message: 'Invalid OTP' }
    }
  }

  static cleanup() {
    if (typeof window !== 'undefined' && window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear()
      } catch {}
      delete window.recaptchaVerifier
    }
  }
}



// // lib/firebase.ts
// 'use client';

// import { initializeApp, getApps } from 'firebase/app';
// import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

// // KEEP analytics imports out unless you use them in a client-only place
// // import { getAnalytics } from 'firebase/analytics';

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
//   measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
// };

// const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
// export const auth = getAuth(app);

// // Optional: pick SMS language
// auth.languageCode = 'en';

// // We’ll store a single verifier on window to avoid duplicates
// declare global {
//   interface Window {
//     recaptchaVerifier?: RecaptchaVerifier;
//   }
// }

// export class PhoneAuthService {
//   static ensureRecaptcha(containerId = 'recaptcha-container'): RecaptchaVerifier {
//     if (typeof window === 'undefined') {
//       throw new Error('reCAPTCHA must be initialized in the browser');
//     }

//     // If we already have a usable verifier, reuse it
//     if (window.recaptchaVerifier) {
//       return window.recaptchaVerifier;
//     }

//     const container = document.getElementById(containerId);
//     if (!container) {
//       throw new Error(`reCAPTCHA container not found: ${containerId}`);
//     }

//     // Create a normal (visible) v2 widget. Invisible works too, but visible is easier to debug.
//     const verifier = new RecaptchaVerifier(
//       auth,
//       containerId,
//       {
//         size: 'normal',
//         callback: (token: string) => {
//           console.log('✅ reCAPTCHA solved:', token);
//         },
//         'expired-callback': () => {
//           console.log('⏰ reCAPTCHA expired');
//         },
//         'error-callback': (err: unknown) => {
//           console.error('❌ reCAPTCHA error:', err);
//         },
//       }
//     );

//     // Render immediately so Firebase can use it
//     verifier.render();

//     window.recaptchaVerifier = verifier;
//     return verifier;
//   }

//   static async sendOTP(rawPhone: string) {
//     // Normalize to +<country><number>
//     const formatted = rawPhone.startsWith('+') ? rawPhone : `+${rawPhone}`;
//     try {
//       const verifier = this.ensureRecaptcha(); // single init
//       const confirmationResult = await signInWithPhoneNumber(auth, formatted, verifier);
//       return { success: true, confirmationResult, message: 'OTP sent successfully' };
//     } catch (error: any) {
//       console.error('❌ Error sending OTP:', error);

//       // Helpful messages
//       let message = 'Failed to send OTP';
//       switch (error?.code) {
//         case 'auth/invalid-phone-number': message = 'Invalid phone number format'; break;
//         case 'auth/too-many-requests': message = 'Too many attempts. Try again later.'; break;
//         case 'auth/captcha-check-failed': message = 'Captcha failed. Reload the page and try again.'; break;
//         case 'auth/requests-from-referer-are-blocked':
//           message = 'Domain is not authorized in Firebase / API key restrictions.';
//           break;
//         case 'auth/invalid-app-credential':
//           message = 'Firebase API key / domain mismatch. Check .env and console settings.';
//           break;
//       }
//       return { success: false, error: error?.message, message };
//     }
//   }

//   static async verifyOTP(confirmationResult: any, otp: string) {
//     try {
//       const result = await confirmationResult.confirm(otp);
//       const user = result.user;
//       return {
//         success: true,
//         user,
//         phoneNumber: user.phoneNumber,
//         uid: user.uid,
//         message: 'Phone verified successfully',
//       };
//     } catch (error: any) {
//       console.error('❌ Error verifying OTP:', error);
//       return { success: false, error: error?.message, message: 'Invalid OTP' };
//     }
//   }

//   static cleanup() {
//     if (typeof window !== 'undefined' && window.recaptchaVerifier) {
//       try { window.recaptchaVerifier.clear(); } catch {}
//       delete window.recaptchaVerifier;
//     }
//   }
// }
