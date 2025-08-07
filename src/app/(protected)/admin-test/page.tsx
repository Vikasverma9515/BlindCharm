'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Crown, Check, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';


export default function AdminTestPage() {
  const { data: session } = useSession();
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const adminEmails = [
    'admin@blindcharm.com',
    'Blindcharm@gmail.com'
  ];

  const isAdmin = userIsAdmin || 
                  adminEmails.includes(session?.user?.email || '');

  useEffect(() => {
    if (session?.user?.id) {
      fetchAdminStatus();
    } else {
      setLoading(false);
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
        setUserIsAdmin(false);
      } else {
        setUserIsAdmin(data?.is_admin || false);
        console.log('🔍 Admin Test - Admin status fetched:', data?.is_admin);
      }
    } catch (error) {
      console.error('Error fetching admin status:', error);
      setUserIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <Crown className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-bold">Admin Access Test</h1>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Current User Info:</h3>
              <p className="text-sm"><strong>Email:</strong> {session?.user?.email || 'Not logged in'}</p>
              <p className="text-sm"><strong>ID:</strong> {session?.user?.id || 'N/A'}</p>
              <p className="text-sm"><strong>Name:</strong> {session?.user?.name || 'N/A'}</p>
              <p className="text-sm"><strong>Database is_admin:</strong> {loading ? 'Loading...' : (userIsAdmin ? 'true' : 'false')}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Admin Check:</h3>
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <X className="w-5 h-5 text-red-500" />
                )}
                <span className={isAdmin ? 'text-green-600' : 'text-red-600'}>
                  {isAdmin ? 'Admin Access Granted' : 'No Admin Access'}
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Admin Emails:</h3>
              <ul className="text-sm space-y-1">
                {adminEmails.map(email => (
                  <li key={email} className="flex items-center gap-2">
                    {session?.user?.email === email ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-gray-400" />
                    )}
                    {email}
                  </li>
                ))}
              </ul>
            </div>

            {isAdmin && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">✅ Admin Features Available:</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Send notifications to all users</li>
                  <li>• Send notifications to specific users</li>
                  <li>• View notification statistics</li>
                  <li>• Use notification templates</li>
                  <li>• Access admin panel in profile</li>
                </ul>
              </div>
            )}

            {!isAdmin && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-medium text-yellow-800 mb-2">⚠️ To Get Admin Access:</h3>
                <p className="text-sm text-yellow-700">
                  Log in with one of the admin emails listed above, or contact the system administrator 
                  to add your email to the admin list.
                </p>
              </div>
            )}

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">🔗 Quick Links:</h3>
              <div className="space-y-2">
                <a 
                  href="/profile" 
                  className="block text-sm text-blue-600 hover:text-blue-800"
                >
                  → Go to Profile (Admin panel will show if you're admin)
                </a>
                <a 
                  href="/test-notifications" 
                  className="block text-sm text-blue-600 hover:text-blue-800"
                >
                  → Test Notifications
                </a>
                <a 
                  href="/simple-test" 
                  className="block text-sm text-blue-600 hover:text-blue-800"
                >
                  → Simple Notification Test
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}