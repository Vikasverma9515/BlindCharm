// 'use client';

// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { ArrowLeft, Bell, Crown } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { useSession } from 'next-auth/react';
// import Link from 'next/link';
// import { supabase } from '@/lib/supabase';
// import NotificationSettings from '@/components/notifications/NotificationSettings';

// export default function NotificationSettingsPage() {
//   const router = useRouter();
//   const { data: session } = useSession();
//   const [userIsAdmin, setUserIsAdmin] = useState(false);
  
//   // Check if user is admin
//   const isAdmin = userIsAdmin || 
//                   session?.user?.email === 'admin@blindcharm.com' || 
//                   session?.user?.email === 'Blindcharm@gmail.com';

//   useEffect(() => {
//     if (session?.user?.id) {
//       fetchAdminStatus();
//     }
//   }, [session?.user?.id]);

//   const fetchAdminStatus = async () => {
//     if (!session?.user?.id) return;
    
//     try {
//       const { data, error } = await supabase
//         .from('users')
//         .select('is_admin')
//         .eq('id', session.user.id)
//         .single();

//       if (error) {
//         console.error('Error fetching admin status:', error);
//         return;
//       }

//       setUserIsAdmin(data?.is_admin || false);
//     } catch (error) {
//       console.error('Error fetching admin status:', error);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-4">
//       <div className="max-w-2xl mx-auto">
//         {/* Header */}
//         <div className="flex items-center gap-4 mb-6">
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={() => router.back()}
//             className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
//           >
//             <ArrowLeft className="w-5 h-5" />
//           </motion.button>
          
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
//               <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//                 Notification Settings
//               </h1>
//               <p className="text-gray-500 dark:text-gray-400">
//                 Manage your push notifications
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Notification Settings Component */}
//         <NotificationSettings />

//         {/* Only show admin panel link for admins */}
//         {isAdmin && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="mt-6"
//           >
//             <Link href="/profile">
//               <div className="p-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white hover:from-purple-600 hover:to-blue-600 transition-all duration-200 cursor-pointer">
//                 <div className="flex items-center gap-3">
//                   <Crown className="w-6 h-6" />
//                   <div>
//                     <h3 className="font-semibold">Admin Notification Center</h3>
//                     <p className="text-sm text-purple-100">
//                       Send notifications to all users, view statistics, and manage templates
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </Link>
//           </motion.div>
//         )}

//         {/* Information Section */}
//         <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
//           <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
//             About Push Notifications
//           </h3>
          
//           <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
//             <div>
//               <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">
//                 What you'll be notified about:
//               </h4>
//               <ul className="list-disc list-inside space-y-1 ml-4">
//                 <li>New matches found</li>
//                 <li>Messages from your matches</li>
//                 <li>Lobby activity and updates</li>
//                 <li>Special announcements</li>
//               </ul>
//             </div>
            
//             <div>
//               <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">
//                 Privacy & Control:
//               </h4>
//               <ul className="list-disc list-inside space-y-1 ml-4">
//                 <li>You can disable notifications anytime</li>
//                 <li>Notifications work even when the app is closed</li>
//                 <li>Your notification preferences are saved securely</li>
//                 <li>No personal data is sent with notifications</li>
//               </ul>
//             </div>
            
//             <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
//               <p className="text-blue-800 dark:text-blue-200 text-xs">
//                 <strong>Tip:</strong> Enable notifications to never miss a match or message. 
//                 You can always adjust these settings later.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Crown, Shield, MessageSquare, Users, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-ambient-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header Section with Background */}
      <div className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
        <div className="absolute inset-0 bg-black/10 dark:bg-black/20" />
        
        <div className="relative z-10 px-4 pt-12 pb-8">
          <div className="max-w-2xl mx-auto">
            {/* Back Button and Header */}
            <div className="flex items-center gap-4 mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.back()}
                className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">
                    Notification Settings
                  </h1>
                  <p className="text-white/80 text-sm">
                    Manage your push notifications
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 -mt-4 relative z-20">
        {/* Notification Settings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-soft overflow-hidden mb-6"
        >
          <NotificationSettings />
        </motion.div>

        {/* Admin Panel Link */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Link href="/profile">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 bg-purple-500 rounded-3xl text-white hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/5" />
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Admin Notification Center</h3>
                    <p className="text-white/80 text-sm">
                      Send notifications to all users, view statistics, and manage templates
                    </p>
                  </div>
                  {/* <div className="opacity-20">
                    <Sparkles className="w-8 h-8" />
                  </div> */}
                </div>
              </motion.div>
            </Link>
          </motion.div>
        )}

        {/* Information Cards */}
        <div className="space-y-4 mb-8">
          {/* What you'll be notified about */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-soft p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                What you'll be notified about
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: Users, text: "New matches found", color: "text-green-600" },
                { icon: MessageSquare, text: "Messages from matches", color: "text-blue-600" },
                { icon: Bell, text: "Lobby activity updates", color: "text-purple-600" },
                { icon: Sparkles, text: "Special announcements", color: "text-amber-600" }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Privacy & Control */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-soft p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                Privacy & Control
              </h3>
            </div>
            
            <div className="space-y-3">
              {[
                "You can disable notifications anytime",
                "Notifications work even when the app is closed",
                "Your preferences are saved securely",
                "No personal data is sent with notifications"
              ].map((text, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Tip Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl border border-blue-200 dark:border-blue-800 p-6"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                  💡 Pro Tip
                </h4>
                <p className="text-blue-800 dark:text-blue-300 text-sm leading-relaxed">
                  Enable notifications to never miss a match or message. You can always adjust these settings later 
                  to fine-tune your experience.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-8" />
      </div>
    </div>
  );
}