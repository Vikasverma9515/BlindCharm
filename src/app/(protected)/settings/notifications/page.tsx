'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import NotificationSettings from '@/components/notifications/NotificationSettings';

export default function NotificationSettingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  
  // Check if user is admin
  const isAdmin = userIsAdmin || 
                  session?.user?.email === 'admin@blindcharm.com' || 
                  session?.user?.email === 'Blindcharm@gmail.com';

  useEffect(() => {
    if (session?.user?.id) {
      fetchAdminStatus();
    }
  }, [session?.user?.id]);

  const fetchAdminStatus = async () => {
    if (!session?.user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching admin status:', error);
        return;
      }

      setUserIsAdmin(data?.is_admin || false);
    } catch (error) {
      console.error('Error fetching admin status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl mx-auto">
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
              <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Notification Settings
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Manage your push notifications
              </p>
            </div>
          </div>
        </div>

        {/* Notification Settings Component */}
        <NotificationSettings />

        {/* Only show admin panel link for admins */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <Link href="/profile">
              <div className="p-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white hover:from-purple-600 hover:to-blue-600 transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Crown className="w-6 h-6" />
                  <div>
                    <h3 className="font-semibold">Admin Notification Center</h3>
                    <p className="text-sm text-purple-100">
                      Send notifications to all users, view statistics, and manage templates
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Information Section */}
        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            About Push Notifications
          </h3>
          
          <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                What you'll be notified about:
              </h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>New matches found</li>
                <li>Messages from your matches</li>
                <li>Lobby activity and updates</li>
                <li>Special announcements</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                Privacy & Control:
              </h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>You can disable notifications anytime</li>
                <li>Notifications work even when the app is closed</li>
                <li>Your notification preferences are saved securely</li>
                <li>No personal data is sent with notifications</li>
              </ul>
            </div>
            
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-blue-800 dark:text-blue-200 text-xs">
                <strong>Tip:</strong> Enable notifications to never miss a match or message. 
                You can always adjust these settings later.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}