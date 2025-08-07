'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Send, Check, X, Loader2 } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/hooks/useAuth';

export default function TestNotificationsPage() {
  const { user } = useAuth();
  const {
    permission,
    isSupported,
    isSubscribed,
    isLoading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification
  } = usePushNotifications();

  const [testResult, setTestResult] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleTestNotification = async () => {
    setIsSending(true);
    setTestResult(null);
    
    try {
      await sendTestNotification();
      setTestResult('Test notification sent successfully!');
    } catch (error) {
      setTestResult('Failed to send test notification');
    } finally {
      setIsSending(false);
    }
  };

  const handleManualTest = async () => {
    if (!user) return;
    
    setIsSending(true);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: '🧪 Manual Test',
          body: 'This is a manual test notification!',
          type: 'test',
          url: '/test-notifications'
        })
      });
      
      const result = await response.json();
      console.log('Manual test result:', result);
      
      if (response.ok) {
        setTestResult('Manual test notification sent successfully!');
      } else {
        setTestResult(`Failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Manual test error:', error);
      setTestResult('Failed to send manual test notification');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Test Push Notifications
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Debug and test your notification system
              </p>
            </div>
          </div>

          {/* Status Information */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Browser Support
                </h3>
                <div className="flex items-center gap-2">
                  {isSupported ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                  <span className={isSupported ? 'text-green-600' : 'text-red-600'}>
                    {isSupported ? 'Supported' : 'Not Supported'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Permission Status
                </h3>
                <div className="flex items-center gap-2">
                  {permission.granted ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : permission.denied ? (
                    <X className="w-4 h-4 text-red-500" />
                  ) : (
                    <Bell className="w-4 h-4 text-yellow-500" />
                  )}
                  <span className={
                    permission.granted ? 'text-green-600' : 
                    permission.denied ? 'text-red-600' : 'text-yellow-600'
                  }>
                    {permission.granted ? 'Granted' : 
                     permission.denied ? 'Denied' : 'Default'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Subscription Status
                </h3>
                <div className="flex items-center gap-2">
                  {isSubscribed ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                  <span className={isSubscribed ? 'text-green-600' : 'text-red-600'}>
                    {isSubscribed ? 'Subscribed' : 'Not Subscribed'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  User Status
                </h3>
                <div className="flex items-center gap-2">
                  {user ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                  <span className={user ? 'text-green-600' : 'text-red-600'}>
                    {user ? 'Authenticated' : 'Not Authenticated'}
                  </span>
                </div>
              </div>
            </div>

            {user && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>User ID:</strong> {user.id}
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Email:</strong> {user.email}
                </p>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 mb-6">
              <p className="text-red-800 dark:text-red-200 text-sm">
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            {!permission.granted && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={requestPermission}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                Request Permission
              </motion.button>
            )}

            {permission.granted && !isSubscribed && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={subscribe}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                Subscribe to Notifications
              </motion.button>
            )}

            {isSubscribed && (
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleTestNotification}
                  disabled={isSending}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send Test Notification (Hook)
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleManualTest}
                  disabled={isSending}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send Manual Test (API)
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={unsubscribe}
                  disabled={isLoading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  Unsubscribe
                </motion.button>
              </div>
            )}
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`mt-6 p-4 rounded-lg ${
              testResult.includes('successfully') 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <p className={`text-sm ${
                testResult.includes('successfully')
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {testResult}
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Testing Instructions:
            </h3>
            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
              <li>Make sure you're logged in</li>
              <li>Request notification permission if not granted</li>
              <li>Subscribe to notifications</li>
              <li>Send a test notification</li>
              <li>Check browser console for debugging info</li>
              <li>Check if notification appears on your device</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}