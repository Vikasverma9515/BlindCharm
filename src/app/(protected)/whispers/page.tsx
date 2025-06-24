

// src/app/(protected)/whispers/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, X } from 'lucide-react';
import { WhisperService } from '@/lib/services/WhisperService';
import { WhisperCard } from '@/components/whispers/WhisperCard';
import { CreateWhisperForm } from '@/components/whispers/CreateWhisperForm';
import { Whisper } from '@/types/whispers';
import { supabase } from '@/lib/supabase';

export default function WhispersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white z-10 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Whispers</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="p-2 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16 pb-20 px-4">
        <div className="max-w-lg mx-auto space-y-4">
          {whispers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No whispers yet</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Share your first whisper
              </button>
            </div>
          ) : (
            whispers.map((whisper) => (
              <WhisperCard
                key={whisper.id}
                whisper={whisper}
                onLike={handleLike}
                onComment={handleComment}
              />
            ))
          )}
        </div>
      </div>

      {/* Create Whisper Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">Create Whisper</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <CreateWhisperForm
                onSubmit={async (whisper) => {
                  await handleCreateWhisper(whisper);
                  setShowCreateForm(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}