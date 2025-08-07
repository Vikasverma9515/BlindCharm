'use client';

import React from 'react';

export default function DebugVapidPage() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">VAPID Key Debug</h1>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Public VAPID Key:</h3>
              <p className="text-sm bg-gray-100 p-2 rounded break-all">
                {publicKey || 'Not found'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Length: {publicKey?.length || 0} characters
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Key Validation:</h3>
              <ul className="text-sm space-y-1">
                <li className={publicKey ? 'text-green-600' : 'text-red-600'}>
                  ✓ Key exists: {publicKey ? 'Yes' : 'No'}
                </li>
                <li className={publicKey?.length === 88 ? 'text-green-600' : 'text-red-600'}>
                  ✓ Correct length (88 chars): {publicKey?.length === 88 ? 'Yes' : 'No'}
                </li>
                <li className={publicKey?.startsWith('B') ? 'text-green-600' : 'text-red-600'}>
                  ✓ Starts with 'B': {publicKey?.startsWith('B') ? 'Yes' : 'No'}
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Browser Support Check:</h3>
              <ul className="text-sm space-y-1">
                <li className={'serviceWorker' in navigator ? 'text-green-600' : 'text-red-600'}>
                  ✓ Service Worker: {'serviceWorker' in navigator ? 'Supported' : 'Not supported'}
                </li>
                <li className={'PushManager' in window ? 'text-green-600' : 'text-red-600'}>
                  ✓ Push Manager: {'PushManager' in window ? 'Supported' : 'Not supported'}
                </li>
                <li className={'Notification' in window ? 'text-green-600' : 'text-red-600'}>
                  ✓ Notifications: {'Notification' in window ? 'Supported' : 'Not supported'}
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Current Permission:</h3>
              <p className="text-sm">
                {typeof window !== 'undefined' && 'Notification' in window 
                  ? Notification.permission 
                  : 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}