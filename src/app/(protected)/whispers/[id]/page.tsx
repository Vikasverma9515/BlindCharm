// src/app/(protected)/whispers/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { WhisperService } from '@/lib/services/WhisperService';
import { WhisperCard } from '@/components/whispers/WhisperCard';
import { Whisper } from '@/types/whispers';
import { 
  Loader2, 
  Plus, 
  MessageSquare, 
  TrendingUp, 
  Filter,
  Search
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import SimpleTopNav from '@/components/shared/SimpleTopNav';
import SimpleBottomNav from '@/components/shared/SimpleBottomNav';

interface PageProps {
  params: {
    id: string;
  };
}

export default function WhisperDetailPage({ params }: PageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [whispers, setWhispers] = useState<Whisper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    loadWhispers();
  }, [session]);

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



  const handleLike = async (whisperId: string) => {
    if (!session?.user?.id) return;

    try {
      await WhisperService.addReaction({
        whisper_id: whisperId,
        user_id: session.user.id,
        reaction_type: 'like'
      });
      loadWhispers();
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleComment = async (whisperId: string, comment: string) => {
    loadWhispers(); // Refresh whispers to update comment count
  };

  // Filter whispers based on search and filter
  const filteredWhispers = whispers.filter(whisper => {
    const matchesSearch = whisper.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         whisper.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         whisper.mood.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
                         whisper.category === selectedFilter ||
                         whisper.mood === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <>
        <SimpleTopNav />
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mb-4 mx-auto animate-spin">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <p className="text-gray-600">Loading whispers...</p>
          </div>
        </div>
        <SimpleBottomNav />
      </>
    );
  }

  return (
    <>
      <SimpleTopNav />
      
      <div className="min-h-screen bg-slate-50 pb-32">
        {/* Header Section */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <MessageSquare className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Whispers</h1>
                  <p className="text-sm text-slate-600">Share your thoughts anonymously</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                  <TrendingUp className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search whispers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-100 border-0 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {['all', 'confession', 'secret', 'dream', 'crush', 'funny', 'life-story'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedFilter === filter
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Whispers Feed */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <AnimatePresence>
            {filteredWhispers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="p-4 bg-slate-200 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No whispers found</h3>
                <p className="text-slate-600 mb-6">
                  {searchQuery ? 'Try adjusting your search terms' : 'Check out the main whispers page to see all whispers!'}
                </p>
                <Button 
                  onClick={() => router.push('/whispers')}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6 py-3 shadow-sm"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  View All Whispers
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {filteredWhispers.map((whisper, index) => (
                  <motion.div
                    key={whisper.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <WhisperCard
                      whisper={whisper}
                      onLike={handleLike}
                      onComment={handleComment}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating Action Button */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-24 right-6 z-30"
        >
          <Button
            size="lg"
            onClick={() => router.push('/whispers')}
            className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg p-0"
          >
            <MessageSquare className="w-6 h-6" />
          </Button>
        </motion.div>
      </div>

      <SimpleBottomNav />
    </>
  );
}

