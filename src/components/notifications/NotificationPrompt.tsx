'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Heart, MessageCircle } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/hooks/useAuth';

interface NotificationPromptProps {
  onClose?: () => void;
  autoShow?: boolean;
}

const NotificationPrompt: React.FC<NotificationPromptProps> = ({ 
  onClose, 
  autoShow = true 
}) => {
  const { user } = useAuth();
  const {
    isSupported,
    isSubscribed,
    permission,
    subscribe,
    isLoading
  } = usePushNotifications();

  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already been prompted or has notifications enabled
    const hasBeenPrompted = localStorage.getItem('notification-prompt-shown');
    const isDismissed = localStorage.getItem('notification-prompt-dismissed');
    
    if (autoShow && 
        isSupported && 
        !isSubscribed && 
        permission.default && 
        !hasBeenPrompted && 
        !isDismissed &&
        user) {
      // Show prompt after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [autoShow, isSupported, isSubscribed, permission.default, user]);

  const handleEnable = async () => {
    const success = await subscribe();
    if (success) {
      localStorage.setItem('notification-prompt-shown', 'true');
      setIsVisible(false);
      onClose?.();
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('notification-prompt-dismissed', 'true');
    setHasBeenDismissed(true);
    setIsVisible(false);
    onClose?.();
  };

  const handleNotNow = () => {
    localStorage.setItem('notification-prompt-shown', 'true');
    setIsVisible(false);
    onClose?.();
  };

  if (!isSupported || isSubscribed || hasBeenDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleNotNow}
          />
          
          {/* Prompt Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md z-50"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Header */}
              <div className="relative p-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                <button
                  onClick={handleDismiss}
                  className="absolute top-4 right-4 p-1 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Bell className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold">
                    Stay Connected!
                  </h2>
                </div>
                
                <p className="text-white/90 text-sm">
                  Get notified instantly when you have new matches and messages
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                      <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        New Matches
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Be the first to know when someone likes you back
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Messages
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Never miss a message from your matches
                      </p>
                    </div>
                  </div>
                </div>

                {/* Privacy Note */}
                <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg mb-6">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Privacy:</strong> We only send notifications for important updates. 
                    You can disable them anytime in settings.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEnable}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Enabling...
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4" />
                        Enable Notifications
                      </>
                    )}
                  </motion.button>
                  
                  <button
                    onClick={handleNotNow}
                    className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 py-2 px-4 rounded-xl transition-colors font-medium"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPrompt;