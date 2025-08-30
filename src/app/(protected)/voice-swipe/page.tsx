// src/app/(protected)/voice-swipe/page.tsx

'use client'

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Mic, 
  Heart, 
  Sparkles, 
  Volume2,
  RefreshCw,
  Settings,
  Trophy
} from 'lucide-react';
import { VoiceCard } from '@/components/voice/VoiceCard';
import { CreateVoiceCardModal } from '@/components/voice/CreateVoiceCardModal';
import { VoiceService } from '@/lib/services/VoiceService';
import { VoiceCard as VoiceCardType, VoiceMatch } from '@/types/voice';
import SimpleTopNav from '@/components/shared/SimpleTopNav';
import SimpleBottomNav from '@/components/shared/SimpleBottomNav';
import toast from 'react-hot-toast';

export default function VoiceSwipePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [cards, setCards] = useState<VoiceCardType[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [matches, setMatches] = useState<VoiceMatch[]>([]);
  const [swipeCount, setSwipeCount] = useState(0);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    
    loadCards();
    loadMatches();
  }, [session, status, router]);

  const loadCards = async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      const data = await VoiceService.getVoiceCardsForSwiping(session.user.id, 20);
      setCards(data);
      setCurrentCardIndex(0);
    } catch (error) {
      console.error('Error loading voice cards:', error);
      toast.error('Failed to load voice cards');
    } finally {
      setLoading(false);
    }
  };

  const loadMatches = async () => {
    if (!session?.user?.id) return;
    
    try {
      const data = await VoiceService.getUserMatches(session.user.id);
      setMatches(data);
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right' | 'up') => {
    const currentCard = cards[currentCardIndex];
    if (!currentCard || !session?.user?.id) return;

    try {
      const result = await VoiceService.swipeVoiceCard(
        currentCard.id,
        direction,
        session.user.id
      );

      if (result) {
        // Add to local voice matches list
        setMatches(prev => [result.voiceMatch, ...prev]);
        toast.success('🎉 It\'s a match! Opening chat...', {
          duration: 2500,
          icon: '💫'
        });
        // Navigate both users to private chat like Tinder/Bumble
        router.push(`/chat/${result.chatMatchId}`);
      } else if (direction === 'right') {
        toast.success('Voice liked! 💜', { duration: 2000 });
      }

      // Move to next card
      setCurrentCardIndex(prev => prev + 1);
      setSwipeCount(prev => prev + 1);

      // Load more cards if running low
      if (currentCardIndex >= cards.length - 3) {
        loadCards();
      }

    } catch (error) {
      console.error('Error swiping card:', error);
      toast.error('Failed to process swipe');
    }
  };

  const handleReport = async () => {
    const currentCard = cards[currentCardIndex];
    if (!currentCard || !session?.user?.id) return;

    try {
      await VoiceService.reportVoiceCard(
        currentCard.id,
        'inappropriate_content',
        'Reported via swipe interface',
        session.user.id
      );
      toast.success('Report submitted. Thank you for keeping our community safe.');
      
      // Move to next card
      setCurrentCardIndex(prev => prev + 1);
    } catch (error) {
      console.error('Error reporting card:', error);
      toast.error('Failed to submit report');
    }
  };

  const currentCard = cards[currentCardIndex];
  const hasMoreCards = currentCardIndex < cards.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
            <Volume2 className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading voice cards...</p>
        </div>
      </div>
    );
  }

  const actionButton = (
    <button
      onClick={() => setShowCreateModal(true)}
      className="p-2 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-colors"
    >
      <Plus className="w-5 h-5" />
    </button>
  );

  return (
    <>
      <SimpleTopNav pageName="Voice Swipe" actionButton={actionButton} />
      
      <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 pt-16 pb-32">
        {/* Stats Bar */}
        <div className="px-4 py-4">
          <div className="max-w-sm mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {matches.length} matches
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {swipeCount} swipes today
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Card Area */}
        <div className="px-4 flex-1 flex items-center justify-center">
          <div className="relative w-full max-w-sm h-[600px]">
            <AnimatePresence mode="wait">
              {hasMoreCards && currentCard ? (
                <motion.div
                  key={currentCard.id}
                  initial={{ scale: 0.8, opacity: 0, rotateY: 90 }}
                  animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                  exit={{ scale: 0.8, opacity: 0, rotateY: -90 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <VoiceCard
                    card={currentCard}
                    onSwipe={handleSwipe}
                    onReport={handleReport}
                    className="h-full"
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="text-center p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg">
                    <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Mic className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      No More Voice Cards
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
                      You've heard all the voices for now! Check back later for new cards or create your own.
                    </p>
                    
                    <div className="space-y-3">
                      <button
                        onClick={loadCards}
                        className="w-full flex items-center justify-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white py-3 px-6 rounded-xl font-medium transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh Cards</span>
                      </button>
                      
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="w-full flex items-center justify-center space-x-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create Voice Card</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Next Card Preview */}
            {hasMoreCards && cards[currentCardIndex + 1] && (
              <motion.div
                className="absolute inset-0 -z-10"
                initial={{ scale: 0.95, opacity: 0.5 }}
                animate={{ scale: 0.95, opacity: 0.3 }}
                style={{ transform: 'translateY(10px)' }}
              >
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-3xl" />
              </motion.div>
            )}
          </div>
        </div>

        {/* Swipe Instructions */}
        {hasMoreCards && (
          <div className="px-4 mt-6">
            <div className="max-w-sm mx-auto">
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center">
                    <span>←</span>
                  </div>
                  <span>Pass</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <div className="w-6 h-6 border-2 border-purple-300 dark:border-purple-600 rounded-full flex items-center justify-center">
                    <span>↑</span>
                  </div>
                  <span>Super Like</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <div className="w-6 h-6 border-2 border-red-300 dark:border-red-600 rounded-full flex items-center justify-center">
                    <span>→</span>
                  </div>
                  <span>Like</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Matches */}
        {matches.length > 0 && (
          <div className="px-4 mt-8">
            <div className="max-w-sm mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                Recent Matches
              </h3>
              
              <div className="space-y-3">
                {matches.slice(0, 3).map((match) => {
                  const otherUser = match.user1_id === session?.user?.id ? match.user2 : match.user1;
                  return (
                    <motion.div
                      key={match.id}
                      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-sm"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <Volume2 className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {otherUser?.username || 'Anonymous'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Voice connection • {new Date(match.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Heart className="w-5 h-5 text-red-500" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Create Voice Card Modal */}
      <CreateVoiceCardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          loadCards();
          toast.success('Voice card created successfully! 🎤');
        }}
        userId={session?.user?.id || ''}
      />

      <SimpleBottomNav />
    </>
  );
}