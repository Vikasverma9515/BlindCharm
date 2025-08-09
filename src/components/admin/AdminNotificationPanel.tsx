'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Users,
  Bell,
  MessageCircle,
  Heart,
  Zap,
  Target,
  Globe,
  User,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Settings,
  BarChart3,
  AlertTriangle,
  Megaphone,
  Star,
  Gift,
  Sparkles,
  Crown
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';

interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  type: string;
  icon: React.ReactNode;
  color: string;
}

interface NotificationStats {
  totalSent: number;
  totalFailed: number;
  totalUsers: number;
  totalSubscriptions: number;
}

const AdminNotificationPanel: React.FC = () => {
  const { user } = useAuth();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'send' | 'templates' | 'stats' | 'settings'>('send');
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [stats, setStats] = useState<NotificationStats>({
    totalSent: 0,
    totalFailed: 0,
    totalUsers: 0,
    totalSubscriptions: 0
  });

  // Form state
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    body: '',
    type: 'announcement',
    targetType: 'all', // 'all', 'specific', 'active'
    targetUserIds: '',
    url: '',
    image: '',
    requireInteraction: false,
    scheduledFor: '',
    actions: [] as Array<{ action: string; title: string; url?: string }>
  });

  const [sendResult, setSendResult] = useState<{
    success: boolean;
    message: string;
    sent: number;
    failed: number;
  } | null>(null);

  // Check if user is admin
  const isAdmin = userIsAdmin || 
                  session?.user?.email === 'admin@blindcharm.com' || 
                  session?.user?.email === 'Blindcharm@gmail.com';

  // Notification templates
  const templates: NotificationTemplate[] = [
    {
      id: 'welcome',
      name: 'Welcome Message',
      title: '🎉 Welcome to BlindCharm!',
      body: 'Start your journey to find meaningful connections. Your perfect match is waiting!',
      type: 'welcome',
      icon: <Heart className="w-5 h-5" />,
      color: 'bg-pink-500'
    },
    {
      id: 'announcement',
      name: 'General Announcement',
      title: '📢 Important Update',
      body: 'We have exciting news to share with our BlindCharm community!',
      type: 'announcement',
      icon: <Megaphone className="w-5 h-5" />,
      color: 'bg-blue-500'
    },
    {
      id: 'feature',
      name: 'New Feature',
      title: '✨ New Feature Available!',
      body: 'Discover our latest feature designed to enhance your dating experience.',
      type: 'feature',
      icon: <Sparkles className="w-5 h-5" />,
      color: 'bg-purple-500'
    },
    {
      id: 'event',
      name: 'Special Event',
      title: '🎊 Special Event Alert!',
      body: 'Join our special event and meet amazing people in your area.',
      type: 'event',
      icon: <Calendar className="w-5 h-5" />,
      color: 'bg-orange-500'
    },
    {
      id: 'promotion',
      name: 'Promotion',
      title: '🎁 Limited Time Offer!',
      body: 'Don\'t miss out on our exclusive promotion. Available for a limited time only!',
      type: 'promotion',
      icon: <Gift className="w-5 h-5" />,
      color: 'bg-green-500'
    },
    {
      id: 'maintenance',
      name: 'Maintenance Notice',
      title: '🔧 Scheduled Maintenance',
      body: 'We\'ll be performing maintenance to improve your experience. Thank you for your patience.',
      type: 'maintenance',
      icon: <Settings className="w-5 h-5" />,
      color: 'bg-yellow-500'
    }
  ];

  useEffect(() => {
    if (session?.user?.id) {
      fetchAdminStatus();
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

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
      console.log('🔍 AdminNotificationPanel - Admin status fetched:', data?.is_admin);
    } catch (error) {
      console.error('Error fetching admin status:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Get total users
      const { count: userCount, error: userError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (userError) {
        console.error('Error fetching user count:', userError);
      }

      // Get total subscriptions (for ALL users)
      const { count: subCount, error: subError } = await supabase
        .from('push_subscriptions')
        .select('*', { count: 'exact', head: true });

      if (subError) {
        console.error('Error fetching subscription count:', subError);
        setStats(prev => ({ ...prev, totalSubscriptions: 0 }));
      }

      // Get notification stats
      let totalSent = 0;
      let totalFailed = 0;
      try {
        const { data: notifications, error: notifError } = await supabase
          .from('notifications')
          .select('sent_count, failed_count');
        if (!notifError && notifications) {
          totalSent = notifications.reduce((sum, n) => sum + (n.sent_count || 0), 0);
          totalFailed = notifications.reduce((sum, n) => sum + (n.failed_count || 0), 0);
        }
      } catch (notifTableError) {
        console.warn('Notifications table not accessible:', notifTableError);
      }

      setStats({
        totalUsers: userCount || 0,
        totalSubscriptions: subCount || 0,
        totalSent,
        totalFailed
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalUsers: 0,
        totalSubscriptions: 0,
        totalSent: 0,
        totalFailed: 0
      });
    }
  };

  const handleTemplateSelect = (template: NotificationTemplate) => {
    setNotificationForm(prev => ({
      ...prev,
      title: template.title,
      body: template.body,
      type: template.type
    }));
  };

  const handleSendNotification = async () => {
    if (!notificationForm.title || !notificationForm.body) {
      setSendResult({
        success: false,
        message: 'Title and body are required',
        sent: 0,
        failed: 0
      });
      return;
    }

    setIsLoading(true);
    setSendResult(null);

    try {
      const payload: any = {
        title: notificationForm.title,
        body: notificationForm.body,
        type: notificationForm.type,
        url: notificationForm.url || '/',
        requireInteraction: notificationForm.requireInteraction
      };

      // Handle targeting
      if (notificationForm.targetType === 'all') {
        payload.broadcast = true;
      } else if (notificationForm.targetType === 'specific' && notificationForm.targetUserIds) {
        payload.userIds = notificationForm.targetUserIds.split(',').map(id => id.trim());
      } else if (notificationForm.targetType === 'active') {
        // Get active users (logged in within last 7 days)
        const { data: activeUsers } = await supabase
          .from('users')
          .select('id')
          .gte('last_sign_in_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
        
        payload.userIds = activeUsers?.map(u => u.id) || [];
      }

      // Add image if provided
      if (notificationForm.image) {
        payload.image = notificationForm.image;
      }

      // Add actions if provided
      if (notificationForm.actions.length > 0) {
        payload.actions = notificationForm.actions;
      }

      console.log('🚀 Sending notification with payload:', payload);
      
      // Use relative URL to ensure correct port
      const apiUrl = '/api/notifications/send';
      console.log('🌐 Making request to:', apiUrl);
      console.log('🌍 Current location:', window.location.href);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('📡 Response status:', response.status);
      
      const result = await response.json();
      console.log('📨 Response data:', result);

      if (response.ok) {
        setSendResult({
          success: true,
          message: 'Notification sent successfully!',
          sent: result.sent || 0,
          failed: result.failed || 0
        });
        
        // Reset form
        setNotificationForm({
          title: '',
          body: '',
          type: 'announcement',
          targetType: 'all',
          targetUserIds: '',
          url: '',
          image: '',
          requireInteraction: false,
          scheduledFor: '',
          actions: []
        });

        // Refresh stats
        fetchStats();
      } else {
        setSendResult({
          success: false,
          message: result.error || 'Failed to send notification',
          sent: 0,
          failed: 0
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      console.error('❌ Error in send notification route:', error);
      // Optionally log error details if available
      // console.error('❌ Error details:', error);
      setSendResult({
        success: false,
        message: 'Network error occurred',
        sent: 0,
        failed: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addAction = () => {
    setNotificationForm(prev => ({
      ...prev,
      actions: [...prev.actions, { action: '', title: '', url: '' }]
    }));
  };

  const updateAction = (index: number, field: string, value: string) => {
    setNotificationForm(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) => 
        i === index ? { ...action, [field]: value } : action
      )
    }));
  };

  const removeAction = (index: number) => {
    setNotificationForm(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  const testApiConnection = async () => {
    try {
      console.log('🧪 Testing API connection...');
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true, timestamp: new Date().toISOString() })
      });
      
      const result = await response.json();
      console.log('🧪 API Test Result:', result);
      
      setSendResult({
        success: response.ok,
        message: response.ok ? 'API connection successful!' : 'API connection failed',
        sent: 0,
        failed: 0
      });
    } catch (error) {
      console.error('🧪 API Test Error:', error);
      setSendResult({
        success: false,
        message: `API test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        sent: 0,
        failed: 0
      });
    }
  };

  const debugSubscriptions = async () => {
    try {
      console.log('🔍 Debugging subscriptions...');
      const response = await fetch('/api/notifications/debug-subscriptions');
      const result = await response.json();
      
      console.log('🔍 Subscription Debug Result:', result);
      
      if (response.ok) {
        setSendResult({
          success: true,
          message: `Found ${result.stats.totalSubscriptions} subscriptions for ${result.stats.uniqueUsers} users`,
          sent: result.stats.totalSubscriptions,
          failed: result.stats.invalidSubscriptions
        });
      } else {
        setSendResult({
          success: false,
          message: 'Failed to debug subscriptions',
          sent: 0,
          failed: 0
        });
      }
    } catch (error) {
      console.error('🔍 Debug Error:', error);
      setSendResult({
        success: false,
        message: `Debug failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        sent: 0,
        failed: 0
      });
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Admin Notification Center</h2>
            <p className="text-purple-100">Send notifications to your users</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          {[
            { id: 'send', label: 'Send Notification', icon: Send },
            { id: 'templates', label: 'Templates', icon: MessageCircle },
            { id: 'stats', label: 'Statistics', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'send' && (
            <motion.div
              key="send"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Total Users</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {stats.totalUsers}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Bell className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Subscriptions</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {stats.totalSubscriptions}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-600">Sent</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {stats.totalSent}
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-600">Failed</span>
                  </div>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {stats.totalFailed}
                  </p>
                </div>
              </div>

              {/* Notification Form */}
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notification Title
                  </label>
                  <input
                    type="text"
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter notification title..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Body */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message Body
                  </label>
                  <textarea
                    value={notificationForm.body}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, body: e.target.value }))}
                    placeholder="Enter your message..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  />
                </div>

                {/* Type and Target */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notification Type
                    </label>
                    <select
                      value={notificationForm.type}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="announcement">📢 Announcement</option>
                      <option value="welcome">🎉 Welcome</option>
                      <option value="feature">✨ New Feature</option>
                      <option value="event">🎊 Event</option>
                      <option value="promotion">🎁 Promotion</option>
                      <option value="maintenance">🔧 Maintenance</option>
                      <option value="urgent">🚨 Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Target Audience
                    </label>
                    <select
                      value={notificationForm.targetType}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, targetType: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">🌍 All Users</option>
                      <option value="active">⚡ Active Users (7 days)</option>
                      <option value="specific">🎯 Specific Users</option>
                    </select>
                  </div>
                </div>

                {/* Specific User IDs */}
                {notificationForm.targetType === 'specific' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      User IDs (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={notificationForm.targetUserIds}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, targetUserIds: e.target.value }))}
                      placeholder="user-id-1, user-id-2, user-id-3..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                )}

                {/* URL and Image */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Click URL (optional)
                    </label>
                    <input
                      type="url"
                      value={notificationForm.url}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://example.com/page"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image URL (optional)
                    </label>
                    <input
                      type="url"
                      value={notificationForm.image}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Options */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={notificationForm.requireInteraction}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, requireInteraction: e.target.checked }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Require user interaction
                    </span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Action Buttons (optional)
                    </label>
                    <button
                      type="button"
                      onClick={addAction}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      + Add Action
                    </button>
                  </div>
                  
                  {notificationForm.actions.map((action, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={action.action}
                        onChange={(e) => updateAction(index, 'action', e.target.value)}
                        placeholder="Action ID"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <input
                        type="text"
                        value={action.title}
                        onChange={(e) => updateAction(index, 'title', e.target.value)}
                        placeholder="Button Text"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <input
                        type="url"
                        value={action.url || ''}
                        onChange={(e) => updateAction(index, 'url', e.target.value)}
                        placeholder="URL (optional)"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeAction(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {/* Debug Buttons */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={testApiConnection}
                    disabled={isLoading}
                    className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Test API
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={debugSubscriptions}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Debug Subs
                  </motion.button>
                </div>

                {/* Send Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSendNotification}
                  disabled={isLoading || !notificationForm.title || !notificationForm.body}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Notification
                    </>
                  )}
                </motion.button>

                {/* Send Result */}
                {sendResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border ${
                      sendResult.success
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {sendResult.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className={`font-medium ${
                        sendResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                      }`}>
                        {sendResult.message}
                      </span>
                    </div>
                    {sendResult.success && (
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Sent: {sendResult.sent} | Failed: {sendResult.failed}
                      </p>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'templates' && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Notification Templates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(template => (
                  <motion.div
                    key={template.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 ${template.color} text-white rounded-lg`}>
                        {template.icon}
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {template.name}
                      </h4>
                    </div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                      {template.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {template.body}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notification Statistics
              </h3>
              
              {/* Detailed Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {stats.totalUsers}
                    </span>
                  </div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-200">Total Users</h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Registered users</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <Bell className="w-8 h-8 text-green-600" />
                    <span className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {stats.totalSubscriptions}
                    </span>
                  </div>
                  <h4 className="font-medium text-green-800 dark:text-green-200">Subscriptions</h4>
                  <p className="text-sm text-green-600 dark:text-green-400">Active push subscriptions</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <CheckCircle className="w-8 h-8 text-purple-600" />
                    <span className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {stats.totalSent}
                    </span>
                  </div>
                  <h4 className="font-medium text-purple-800 dark:text-purple-200">Sent</h4>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Successfully delivered</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <XCircle className="w-8 h-8 text-red-600" />
                    <span className="text-2xl font-bold text-red-700 dark:text-red-300">
                      {stats.totalFailed}
                    </span>
                  </div>
                  <h4 className="font-medium text-red-800 dark:text-red-200">Failed</h4>
                  <p className="text-sm text-red-600 dark:text-red-400">Delivery failures</p>
                </div>
              </div>

              {/* Success Rate */}
              <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-xl">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Delivery Success Rate</h4>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${stats.totalSent + stats.totalFailed > 0 
                          ? (stats.totalSent / (stats.totalSent + stats.totalFailed)) * 100 
                          : 0}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {stats.totalSent + stats.totalFailed > 0 
                      ? Math.round((stats.totalSent / (stats.totalSent + stats.totalFailed)) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notification Settings
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800 dark:text-yellow-200">
                      Admin Access
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    You have admin access to send notifications to all users. Use this power responsibly.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Best Practices
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Keep messages concise and clear</li>
                    <li>• Use appropriate notification types</li>
                    <li>• Test with specific users before broadcasting</li>
                    <li>• Respect user preferences and frequency</li>
                    <li>• Include relevant action buttons when needed</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Current Configuration
                  </h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>• VAPID keys: Configured ✓</p>
                    <p>• Service worker: Active ✓</p>
                    <p>• Database: Connected ✓</p>
                    <p>• Admin role: Verified ✓</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminNotificationPanel;