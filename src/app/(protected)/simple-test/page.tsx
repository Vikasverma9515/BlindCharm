'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Send, Check, X } from 'lucide-react';

export default function SimpleTestPage() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [message, setMessage] = useState('');

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      setMessage(`Permission: ${result}`);
    } else {
      setMessage('Notifications not supported');
    }
  };

  const sendBrowserNotification = () => {
    if (permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a simple browser notification test',
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png'
      });
      setMessage('Browser notification sent!');
    } else {
      setMessage('Permission not granted');
    }
  };

  const testServiceWorker = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw-custom.js');
        setMessage('Service worker registered successfully');
        console.log('SW registered:', registration);
      } else {
        setMessage('Service worker not supported');
      }
    } catch (error) {
      setMessage(`Service worker error: ${error}`);
      console.error('SW error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Simple Notification Test
          </h1>
          
          <div className="space-y-4">
            <div className="p-3 bg-gray-100 rounded">
              <p className="text-sm">
                <strong>Permission:</strong> {permission}
              </p>
              <p className="text-sm">
                <strong>Support:</strong> {'Notification' in window ? 'Yes' : 'No'}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={requestPermission}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-medium"
            >
              Request Permission
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={sendBrowserNotification}
              disabled={permission !== 'granted'}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded font-medium"
            >
              Send Browser Notification
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={testServiceWorker}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded font-medium"
            >
              Test Service Worker
            </motion.button>

            {message && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">{message}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}