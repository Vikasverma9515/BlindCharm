'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'

export default function FirebaseTest() {
  const [config, setConfig] = useState<any>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    try {
      // Test Firebase configuration
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
      }

      console.log('🔥 Firebase Configuration Test:')
      console.log('Config:', firebaseConfig)
      console.log('Auth object:', auth)
      console.log('Auth app:', auth.app)
      console.log('Auth app name:', auth.app.name)

      setConfig(firebaseConfig)

      // Test if all required fields are present
      const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId']
      const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig])
      
      if (missingFields.length > 0) {
        setError(`Missing Firebase config fields: ${missingFields.join(', ')}`)
      }

    } catch (err: any) {
      console.error('Firebase test error:', err)
      setError(err.message)
    }
  }, [])

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">🔥 Firebase Configuration Test</h3>
      
      {error && (
        <div className="p-2 bg-red-100 border border-red-300 rounded mb-2">
          <p className="text-red-700 text-sm">❌ Error: {error}</p>
        </div>
      )}

      {config && (
        <div className="space-y-2 text-sm">
          <div>✅ API Key: {config.apiKey?.substring(0, 10)}...</div>
          <div>✅ Project ID: {config.projectId}</div>
          <div>✅ Auth Domain: {config.authDomain}</div>
          <div>✅ App ID: {config.appId?.substring(0, 20)}...</div>
          <div>✅ Firebase Auth: {auth ? 'Initialized' : 'Not initialized'}</div>
        </div>
      )}
    </div>
  )
}