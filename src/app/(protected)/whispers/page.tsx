// src/app/(protected)/whispers/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { WhisperService } from '@/lib/services/WhisperService';
import { WhisperCard } from '@/components/whispers/WhisperCard';
import { WhisperDrawer } from '@/components/whispers/WhisperDrawer';
import { Whisper } from '@/types/whispers';
import SimpleTopNav from '@/components/shared/SimpleTopNav';
import SimpleBottomNav from '@/components/shared/SimpleBottomNav';

export default function WhispersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [whispers, setWhispers] = useState<Whisper[]>([]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    loadWhispers();

    // Set up periodic refresh every 3 seconds
    const refreshInterval = setInterval(() => {
      loadWhispers();
    }, 3000);

    // Cleanup interval on unmount
    return () => {
      clearInterval(refreshInterval);
    };
  }, [session, status, router]);

  const loadWhispers = async () => {
    try {
      const data = await WhisperService.getWhispers();
      setWhispers(data);
    } catch (error) {
      console.error('Error loading whispers:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleCreateWhisper = async (whisper: Partial<Whisper>) => {
    try {
      await WhisperService.createWhisper(whisper);
      loadWhispers();
    } catch (error) {
      console.error('Error creating whisper:', error);
    }
  };

  const handleLike = async (whisperId: string) => {
    if (!session?.user?.id) return;

    try {
      const updatedWhisper = await WhisperService.toggleLike(whisperId, session.user.id);
      // Update the specific whisper in state with calculated counts
      setWhispers(prev => prev.map(w => 
        w.id === whisperId ? updatedWhisper : w
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async (whisperId: string, _comment: string) => {
    // Immediately refresh to show updated counts
    loadWhispers();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mb-4 mx-auto animate-spin">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading whispers...</p>
        </div>
      </div>
    );
  }

  const actionButton = (
    <WhisperDrawer onSubmit={handleCreateWhisper}>
      <button className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors">
        <Plus className="w-5 h-5" />
      </button>
    </WhisperDrawer>
  );

  return (
    <>
      <SimpleTopNav pageName="Whispers" actionButton={actionButton} />
      
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Header - Desktop only */}
        <div className="hidden md:block bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Whispers</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Share your thoughts anonymously</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto px-4 py-4 pb-32">
          {whispers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-slate-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-slate-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No whispers yet</h3>
              <p className="text-slate-600 dark:text-gray-400 text-center mb-6 max-w-sm">
                Be the first to share your thoughts anonymously with the community!
              </p>
              <WhisperDrawer onSubmit={handleCreateWhisper}>
                <button className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors shadow-sm">
                  Share Your First Whisper
                </button>
              </WhisperDrawer>
            </div>
          ) : (
            <div className="space-y-4">
              {whispers.map((whisper) => (
                <WhisperCard
                  key={whisper.id}
                  whisper={whisper}
                  onLike={handleLike}
                  onComment={handleComment}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-6 z-30">
        <WhisperDrawer onSubmit={handleCreateWhisper}>
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        </WhisperDrawer>
      </div>
      
      <SimpleBottomNav />
    </>
  );
}