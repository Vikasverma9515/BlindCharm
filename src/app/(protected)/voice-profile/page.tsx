// src/app/(protected)/voice-profile/page.tsx

'use client'

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Play, 
  Pause, 
  Trash2, 
  Edit3, 
  Volume2,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Calendar
} from 'lucide-react';
import { VoiceService } from '@/lib/services/VoiceService';
import { VoiceCard as VoiceCardType } from '@/types/voice';
import { CreateVoiceCardModal } from '@/components/voice/CreateVoiceCardModal';
import { Waveform } from '@/components/voice/Waveform';
import SimpleTopNav from '@/components/shared/SimpleTopNav';
import SimpleBottomNav from '@/components/shared/SimpleBottomNav';
import toast from 'react-hot-toast';

interface VoiceCardItemProps {
  card: VoiceCardType;
  onDelete: (cardId: string) => void;
  onEdit?: (card: VoiceCardType) => void;
}

const VoiceCardItem: React.FC<VoiceCardItemProps> = ({ card, onDelete, onEdit }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  const handlePlayPause = () => {
    if (!audioRef) {
      const audio = new Audio(card.audio_url);
      setAudioRef(audio);
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
      });
      
      audio.play();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioRef.pause();
        setIsPlaying(false);
      } else {
        audioRef.play();
        setIsPlaying(true);
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this voice card?')) {
      onDelete(card.id);
    }
  };

  const getGradientColors = () => {
    const gradients = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-teal-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-pink-500 to-rose-500'
    ];
    
    const index = card.id.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  return (
    <motion.div
      className={`relative bg-gradient-to-br ${getGradientColors()} rounded-2xl shadow-lg overflow-hidden`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
      </div>

      {/* Header */}
      <div className="relative p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 mb-3">
              <p className="text-white text-sm font-medium leading-relaxed">
                {card.prompt?.prompt_text}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 text-white/80 text-xs">
              <Calendar className="w-3 h-3" />
              <span>{new Date(card.created_at).toLocaleDateString()}</span>
              <Clock className="w-3 h-3 ml-2" />
              <span>{card.audio_duration}s</span>
            </div>
          </div>

          {/* Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {/* Menu Dropdown */}
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute top-10 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-10 min-w-[120px]"
                >
                  <button
                    onClick={() => {
                      onEdit?.(card);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      handleDelete();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Quote */}
        {card.quote && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 mb-3">
            <p className="text-white/90 text-sm italic">"{card.quote}"</p>
          </div>
        )}

        {/* Mood Tags */}
        {card.mood_tags && card.mood_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {card.mood_tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Audio Player */}
      <div className="px-4 pb-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
          {/* Waveform */}
          <div className="mb-3">
            <Waveform
              audioUrl={card.audio_url}
              isPlaying={isPlaying}
              color="#ffffff"
              height={50}
              barCount={30}
              className="w-full"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePlayPause}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <div className="flex items-center space-x-4 text-white/80 text-sm">
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>0</span> {/* Views - we can implement this later */}
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>0</span> {/* Likes - we can implement this later */}
              </div>
            </div>
          </div>
        </div>

        {/* Vibe Description */}
        {card.vibe_description && (
          <div className="mt-3 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
            <p className="text-white/90 text-sm">
              <span className="text-white/70">Vibe: </span>
              {card.vibe_description}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function VoiceProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [voiceCards, setVoiceCards] = useState<VoiceCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    
    loadVoiceCards();
  }, [session, status, router]);

  const loadVoiceCards = async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      const data = await VoiceService.getUserVoiceCards(session.user.id);
      setVoiceCards(data);
    } catch (error) {
      console.error('Error loading voice cards:', error);
      toast.error('Failed to load voice cards');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!session?.user?.id) return;
    
    try {
      await VoiceService.deleteVoiceCard(cardId, session.user.id);
      setVoiceCards(prev => prev.filter(card => card.id !== cardId));
      toast.success('Voice card deleted successfully');
    } catch (error) {
      console.error('Error deleting voice card:', error);
      toast.error('Failed to delete voice card');
    }
  };

  const handleEditCard = (card: VoiceCardType) => {
    // For now, just show a toast. We can implement editing later
    toast.success('Edit feature coming soon! 🚀');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
            <Volume2 className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading your voice cards...</p>
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
      <SimpleTopNav pageName="Voice Profile" actionButton={actionButton} />
      
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 pb-32">
        {/* Header */}
        <div className="px-4 py-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Volume2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Your Voice Cards
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your voice responses and see how others connect with you
            </p>
          </div>
        </div>

        {/* Voice Cards Grid */}
        <div className="px-4">
          <div className="max-w-4xl mx-auto">
            {voiceCards.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Volume2 className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No Voice Cards Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                  Create your first voice card to start connecting with others through your voice!
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Voice Card</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {voiceCards.map((card) => (
                  <VoiceCardItem
                    key={card.id}
                    card={card}
                    onDelete={handleDeleteCard}
                    onEdit={handleEditCard}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        {voiceCards.length > 0 && (
          <div className="px-4 mt-8">
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Volume2 className="w-5 h-5 text-purple-500 mr-2" />
                Voice Stats
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">{voiceCards.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Voice Cards</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-500">
                    {voiceCards.reduce((total, card) => total + card.audio_duration, 0)}s
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Audio</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {voiceCards.filter(card => 
                      new Date(card.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    ).length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">This Week</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="px-4 mt-8">
          <div className="max-w-2xl mx-auto bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              💡 Voice Card Tips
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Be authentic - let your personality shine through your voice</li>
              <li>• Choose prompts that genuinely interest you</li>
              <li>• Use mood tags to help others understand your vibe</li>
              <li>• Keep responses engaging but concise (5-8 seconds is perfect)</li>
              <li>• Update your cards regularly to keep your profile fresh</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Create Voice Card Modal */}
      <CreateVoiceCardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          loadVoiceCards();
          toast.success('Voice card created successfully! 🎤');
        }}
        userId={session?.user?.id || ''}
      />

      <SimpleBottomNav />
    </>
  );
}