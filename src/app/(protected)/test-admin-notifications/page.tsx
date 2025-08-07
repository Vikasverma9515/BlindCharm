'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Bell, Check, X, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function TestAdminNotificationsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testNotification = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const payload = {
        title: '🧪 Test Notification',
        body: 'This is a test notification from the admin panel!',
        type: 'test',
        broadcast: true, // Send to all users
        url: '/profile'
      };

      console.log('🚀 Testing notification with payload:', payload);

      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      setResult({
        success: response.ok,
        status: response.status,
        data: data
      });

      console.log('📨 Test result:', { status: response.status, data });

    } catch (error) {
      console.error('❌ Test error:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testToSelf = async () => {
    if (!session?.user?.id) {
      setResult({
        success: false,
        error: 'No user ID found in session'
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const payload = {
        title: '👋 Personal Test',
        body: 'This notification was sent only to you!',
        type: 'personal',
        userId: session.user.id,
        url: '/profile'
      };

      console.log('🚀 Testing personal notification:', payload);

      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      setResult({
        success: response.ok,
        status: response.status,
        data: data
      });

    } catch (error) {
      console.error('❌ Personal test error:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold">Test Admin Notifications</h1>
          </div>
          
          <div className="space-y-6">
            {/* User Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Current User:</h3>
              <p className="text-sm"><strong>ID:</strong> {session?.user?.id || 'Not logged in'}</p>
              <p className="text-sm"><strong>Email:</strong> {session?.user?.email || 'N/A'}</p>
            </div>

            {/* Test Buttons */}
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={testToSelf}
                disabled={isLoading || !session?.user?.id}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                Test Personal Notification (To Me Only)
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={testNotification}
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                Test Broadcast Notification (To All Users)
              </motion.button>
            </div>

            {/* Results */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border ${
                  result.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  {result.success ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <X className="w-5 h-5 text-red-600" />
                  )}
                  <span className={`font-medium ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.success ? 'Success!' : 'Failed'}
                  </span>
                </div>

                <div className="text-sm space-y-2">
                  <p><strong>Status:</strong> {result.status}</p>
                  
                  {result.data && (
                    <>
                      <p><strong>Sent:</strong> {result.data.sent || 0}</p>
                      <p><strong>Failed:</strong> {result.data.failed || 0}</p>
                      {result.data.message && (
                        <p><strong>Message:</strong> {result.data.message}</p>
                      )}
                    </>
                  )}

                  {result.error && (
                    <p className="text-red-600"><strong>Error:</strong> {result.error}</p>
                  )}

                  <details className="mt-3">
                    <summary className="cursor-pointer font-medium">Raw Response</summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </details>
                </div>
              </motion.div>
            )}

            {/* Instructions */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">📋 Testing Instructions:</h3>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Make sure you have granted notification permission in your browser</li>
                <li>Test "Personal Notification" first - it should only send to you</li>
                <li>Check browser console for detailed logs</li>
                <li>If successful, try "Broadcast Notification" to send to all users</li>
                <li>Check the results section below for success/failure details</li>
              </ol>
            </div>

            {/* Troubleshooting */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">🔧 Troubleshooting:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• If "No subscriptions found" - make sure you've subscribed to notifications</li>
                <li>• If "500 error" - check the browser console for detailed error messages</li>
                <li>• If notifications don't appear - check browser notification settings</li>
                <li>• Database errors are handled gracefully - notifications will still send</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}