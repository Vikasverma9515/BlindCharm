// src/app/(protected)/voice-matches/page.tsx

'use client'

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, 
  Play, 
  Pause, 
  MessageCircle, 
  Gamepad2, 
  Music, 
  BookOpen,
  Sparkles,
  Clock,
  Heart,
  Users
} from 'lucide-react';
import { VoiceService } from '@/lib/services/VoiceService';
import { VoiceMatch, VoiceActivity } from '@/types/voice';
import { Waveform } from '@/features/ai-dating/components/voice/Waveform';
import SimpleTopNav from '@/components/shared/SimpleTopNav';
import SimpleBottomNav from '@/components/shared/SimpleBottomNav';
import toast from 'react-hot-toast';

interface VoiceMatchCardProps {
  match: VoiceMatch;
  currentUserId: string;
  onStartActivity: (matchId: string, activityType: VoiceActivity['activity_type']) => void;
}

const VoiceMatchCard: React.FC<VoiceMatchCardProps> = ({ match, currentUserId, onStartActivity }) => {
  const [isPlaying, setIsPlaying] = useState<'card1' | 'card2' | null>(null);
  const [showActivities, setShowActivities] = useState(false);
  
  const otherUser = match.user1_id === currentUserId ? match.user2 : match.user1;
  const myCard = match.user1_id === currentUserId ? match.voice_card1 : match.voice_card2;
  const theirCard = match.user1_id === currentUserId ? match.voice_card2 : match.voice_card1;

  const handlePlayAudio = (cardType: 'card1' | 'card2', audioUrl: string) => {
    if (isPlaying === cardType) {
      setIsPlaying(null);
      // Stop audio logic here
    } else {
      setIsPlaying(cardType);
      // Play audio logic here
      const audio = new Audio(audioUrl);
      audio.play();
      audio.addEventListener('ended', () => setIsPlaying(null));
    }
  };

  const activities = [
    {
      type: 'voice_game' as const,
      icon: Gamepad2,
      title: 'Voice Games',
      description: 'Play fun voice-based games together',
      color: 'from-purple-500 to-pink-500'
    },
    {
      type: 'story_building' as const,
      icon: BookOpen,
      title: 'Story Building',
      description: 'Create a story together, one line at a time',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      type: 'question_exchange' as const,
      icon: MessageCircle,
      title: 'Question Exchange',
      description: 'Ask each other deeper questions',
      color: 'from-green-500 to-teal-500'
    },
    {
      type: 'music_share' as const,
      icon: Music,
      title: 'Music Share',
      description: 'Share and discuss your favorite songs',
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-purple-500 to-pink-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">
                Voice Connection
              </h3>
              <p className="text-white/80 text-sm">
                with {otherUser?.username || 'Anonymous'}
              </p>
            </div>
          </div>
          <div className="text-white/80 text-sm">
            {new Date(match.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Voice Cards */}
      <div className="p-6 space-y-4">
        {/* Their Voice Card */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-purple-500" />
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {otherUser?.username || 'Anonymous'}
              </span>
            </div>
            <button
              onClick={() => handlePlayAudio('card2', theirCard?.audio_url || '')}
              className="w-8 h-8 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center justify-center text-white transition-colors"
            >
              {isPlaying === 'card2' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            "{theirCard?.prompt?.prompt_text}"
          </p>
          
          <div className="bg-white dark:bg-gray-600 rounded-lg p-2">
            <Waveform
              audioUrl={theirCard?.audio_url}
              isPlaying={isPlaying === 'card2'}
              color="#8b5cf6"
              height={40}
              barCount={20}
            />
          </div>

          {theirCard?.mood_tags && theirCard.mood_tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {theirCard.mood_tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* My Voice Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Your response
              </span>
            </div>
            <button
              onClick={() => handlePlayAudio('card1', myCard?.audio_url || '')}
              className="w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white transition-colors"
            >
              {isPlaying === 'card1' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            "{myCard?.prompt?.prompt_text}"
          </p>
          
          <div className="bg-white dark:bg-gray-600 rounded-lg p-2">
            <Waveform
              audioUrl={myCard?.audio_url}
              isPlaying={isPlaying === 'card1'}
              color="#3b82f6"
              height={40}
              barCount={20}
            />
          </div>

          {myCard?.mood_tags && myCard.mood_tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {myCard.mood_tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activities Section */}
      <div className="px-6 pb-6">
        <button
          onClick={() => setShowActivities(!showActivities)}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-xl font-medium transition-all duration-300"
        >
          <Sparkles className="w-4 h-4" />
          <span>Start Voice Activity</span>
        </button>

        <AnimatePresence>
          {showActivities && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 grid grid-cols-2 gap-3"
            >
              {activities.map((activity) => (
                <motion.button
                  key={activity.type}
                  onClick={() => onStartActivity(match.id, activity.type)}
                  className={`p-4 bg-gradient-to-br ${activity.color} rounded-xl text-white text-left hover:scale-105 transition-transform`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <activity.icon className="w-6 h-6 mb-2" />
                  <h4 className="font-semibold text-sm mb-1">{activity.title}</h4>
                  <p className="text-xs text-white/80">{activity.description}</p>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default function VoiceMatchesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [matches, setMatches] = useState<VoiceMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    
    loadMatches();
  }, [session, status, router]);

  const loadMatches = async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      const data = await VoiceService.getUserMatches(session.user.id);
      setMatches(data);
    } catch (error) {
      console.error('Error loading matches:', error);
      toast.error('Failed to load voice matches');
    } finally {
      setLoading(false);
    }
  };

  const handleStartActivity = async (matchId: string, activityType: VoiceActivity['activity_type']) => {
    try {
      await VoiceService.createVoiceActivity(matchId, activityType);
      toast.success(`${activityType.replace('_', ' ')} activity started! 🎉`);
      
      // Navigate to activity page (we'll create this later)
      // router.push(`/voice-activity/${matchId}/${activityType}`);
      
      // For now, just show a success message
      toast.success('Activity feature coming soon! 🚀');
    } catch (error) {
      console.error('Error starting activity:', error);
      toast.error('Failed to start activity');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading your voice matches...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SimpleTopNav pageName="Voice Matches" />
      
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 pb-32">
        {/* Header */}
        <div className="px-4 py-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Voice Matches
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Connect through voice with people who liked your audio
            </p>
          </div>
        </div>

        {/* Matches List */}
        <div className="px-4">
          <div className="max-w-2xl mx-auto">
            {matches.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No Voice Matches Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                  Keep swiping on voice cards to find people who connect with your voice!
                </p>
                <button
                  onClick={() => router.push('/voice-swipe')}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  Start Voice Swiping
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {matches.map((match) => (
                  <VoiceMatchCard
                    key={match.id}
                    match={match}
                    currentUserId={session?.user?.id || ''}
                    onStartActivity={handleStartActivity}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        {matches.length > 0 && (
          <div className="px-4 mt-8">
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Sparkles className="w-5 h-5 text-purple-500 mr-2" />
                Your Voice Stats
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">{matches.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Matches</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-500">
                    {matches.filter(m => m.match_type === 'voice_connection').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Voice Connections</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {matches.filter(m => new Date(m.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">This Week</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <SimpleBottomNav />
    </>
  );
}