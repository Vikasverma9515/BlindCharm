import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.blindcharm.app',
  appName: 'BlindCharm',
  webDir: 'public',
  server: {
    // ⚠️ CRITICAL: Replace with your production URL for the App Store (e.g., https://blindcharm.com)
    // For local testing on emulator, use http://10.0.2.2:3000 (Android) or http://localhost:3000 (iOS)
    url: process.env.NODE_ENV === 'production' ? 'https://blindcharm.vercel.app' : 'http://localhost:3000',
    cleartext: true, // Allow http for development
    androidScheme: 'https'
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
