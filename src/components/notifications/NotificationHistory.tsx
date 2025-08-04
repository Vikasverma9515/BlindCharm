// components/NotificationHistory.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  created_at: string;
  read: boolean;
}

export default function NotificationHistory() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNotifications(data);
    }
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    
    fetchNotifications();
  };

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border ${
            notification.read
              ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              : 'bg-white dark:bg-gray-700 border-blue-200 dark:border-blue-800'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 mt-1" />
              <div>
                <h3 className="font-medium">{notification.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {notification.body}
                </p>
                <span className="text-xs text-gray-500 mt-1">
                  {new Date(notification.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            {!notification.read && (
              <button
                onClick={() => markAsRead(notification.id)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}