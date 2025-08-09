'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Users, Bell, Image, Link, Loader2, Check, AlertCircle } from 'lucide-react';
import { NotificationService } from '@/lib/notifications';

interface BroadcastNotificationsProps {
  className?: string;
}

const BroadcastNotifications: React.FC<BroadcastNotificationsProps> = ({ className = '' }) => {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    url: '',
    image: '',
    type: 'broadcast' as const,
    requireInteraction: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    sent?: number;
    failed?: number;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.body.trim()) {
      setResult({
        success: false,
        message: 'Title and message are required'
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await NotificationService.sendBroadcastNotification(
        formData.title,
        formData.body,
        formData.url || undefined,
        formData.image || undefined
      );

      setResult({
        success: true,
        message: 'Broadcast notification sent successfully!',
        sent: response.sent,
        failed: response.failed
      });

      // Reset form
      setFormData({
        title: '',
        body: '',
        url: '',
        image: '',
        type: 'broadcast',
        requireInteraction: false
      });

    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Failed to send broadcast notification'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const presetMessages = [
    {
      title: '🎉 New Feature Alert!',
      body: 'Check out our latest feature that makes finding matches even easier!',
      url: '/lobby'
    },
    {
      title: '💕 Weekend Special',
      body: 'More people are online this weekend. Perfect time to find your match!',
      url: '/lobby'
    },
    {
      title: '🔥 Dont Miss Out!',
      body: 'Your area is buzzing with activity. Jump in now!',
      url: '/lobby'
    }
  ];

  const handlePresetSelect = (preset: typeof presetMessages[0]) => {
    setFormData(prev => ({
      ...prev,
      title: preset.title,
      body: preset.body,
      url: preset.url
    }));
  };

  return (
    <div className={`max-w-2xl mx-auto space-y-6 ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Broadcast Notifications
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Send notifications to all users with push notifications enabled
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSendBroadcast} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notification Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter notification title..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              maxLength={50}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.title.length}/50 characters
            </p>
          </div>

          {/* Body */}
          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message
            </label>
            <textarea
              id="body"
              name="body"
              value={formData.body}
              onChange={handleInputChange}
              placeholder="Enter notification message..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              maxLength={120}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.body.length}/120 characters
            </p>
          </div>

          {/* URL */}
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Link className="w-4 h-4 inline mr-1" />
              Action URL (optional)
            </label>
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              placeholder="https://example.com or /lobby"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Image URL */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Image className="w-4 h-4 inline mr-1" />
              Image URL (optional)
            </label>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Require Interaction */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="requireInteraction"
              name="requireInteraction"
              checked={formData.requireInteraction}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="requireInteraction" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Require user interaction (notification stays until clicked)
            </label>
          </div>

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading || !formData.title.trim() || !formData.body.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {isLoading ? 'Sending...' : 'Send Broadcast'}
          </motion.button>
        </form>
      </div>

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
            result.success
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <Check className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            )}
            <div>
              <p className={`font-medium ${
                result.success
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {result.message}
              </p>
              {result.success && result.sent !== undefined && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  Successfully sent to {result.sent} users
                  {result.failed && result.failed > 0 && `, ${result.failed} failed`}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Preset Messages */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-white">Quick Templates</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Click to use a preset message
          </p>
        </div>
        <div className="p-4 space-y-2">
          {presetMessages.map((preset, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handlePresetSelect(preset)}
              className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <p className="font-medium text-gray-900 dark:text-white text-sm">
                {preset.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {preset.body}
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BroadcastNotifications;