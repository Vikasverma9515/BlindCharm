'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import BroadcastNotifications from '@/components/admin/BroadcastNotifications';

export default function AdminNotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Simple admin check - you might want to implement proper role-based access
  const isAdmin = user?.email === 'admin@blindcharm.com' || user?.user_metadata?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-4 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You don't have permission to access this page.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Go Home
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Admin - Push Notifications
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Send notifications to all users
              </p>
            </div>
          </div>
        </div>

        {/* Broadcast Notifications Component */}
        <BroadcastNotifications />

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Active Users
            </h3>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {/* You can fetch this from your database */}
              ---
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Users with push notifications enabled
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Notifications Sent Today
            </h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              ---
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Including matches and messages
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Success Rate
            </h3>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              ---%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Successful delivery rate
            </p>
          </div>
        </div>

        {/* Usage Guidelines */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Notification Guidelines
          </h3>
          
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Keep messages concise and engaging (under 120 characters)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Use emojis to make notifications more appealing</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Include clear call-to-action URLs when relevant</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-500 font-bold">✗</span>
              <span>Don't send too many notifications in a short period</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-500 font-bold">✗</span>
              <span>Avoid promotional content that might be considered spam</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}