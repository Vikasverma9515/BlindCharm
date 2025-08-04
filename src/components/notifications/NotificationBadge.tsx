// components/NotificationBadge.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useNotifications } from './NotificationProvider';

export default function NotificationBadge() {
  const { isEnabled } = useNotifications();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch unread notifications count
    const fetchUnreadCount = async () => {
      // Implement this based on your backend
    };

    if (isEnabled) {
      fetchUnreadCount();
    }
  }, [isEnabled]);

  return (
    <div className="relative">
      <Bell className="w-6 h-6" />
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
          >
            {unreadCount}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}