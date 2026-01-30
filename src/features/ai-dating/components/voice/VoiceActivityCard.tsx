// src/components/voice/VoiceActivityCard.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Mic, 
  Send, 
  Gamepad2, 
  BookOpen, 
  MessageCircle, 
  Music,
  Clock,
  Users,
  Sparkles
} from 'lucide-react';
import { VoiceActivity, VoiceMatch } from '@/types/voice';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { Waveform } from './Waveform';

interface VoiceActivityCardProps {
  activity: VoiceActivity;
  match: VoiceMatch;
  currentUserId: string;
  onSendResponse: (audioBlob: Blob, text?: string) => void;
  onUpdateStatus: (status: VoiceActivity['status']) => void;
}

const activityConfig = {
  voice_game: {
    icon: Gamepad2,
    title: 'Voice Game',
    color: 'from-purple-500 to-pink-500',
    description: 'Play fun voice-based games together'
  },
  story_building: {
    icon: BookOpen,
    title: 'Story Building',
    color: 'from-blue-500 to-cyan-500',
    description: 'Create a story together, one line at a time'
  },
  question_exchange: {
    icon: MessageCircle,
    title: 'Question Exchange',
    color: 'from-green-500 to-teal-500',
    description: 'Ask each other deeper questions'
  },
  music_share: {
    icon: Music,
    title: 'Music Share',
    color: 'from-orange-500 to-red-500',
    description: 'Share and discuss your favorite songs'
  }
};

export const VoiceActivityCard: React.FC<VoiceActivityCardProps> = ({
  activity,
  match,
  currentUserId,
  onSendResponse,
  onUpdateStatus
}) => {
  const [showRecorder, setShowRecorder] = useState(false);
  const [textResponse, setTextResponse] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const {
    isRecording,
    recording,
    startRecording,
    stopRecording,
    clearRecording,
    audioLevel,
    recordingTime
  } = useAudioRecorder(8000);

  const config = activityConfig[activity.activity_type];
  const otherUser = match.user1_id === currentUserId ? match.user2 : match.user1;

  const handleSendVoiceResponse = () => {
    if (recording) {
      onSendResponse(recording.blob, textResponse.trim() || undefined);
      clearRecording();
      setTextResponse('');
      setShowRecorder(false);
    }
  };

  const handleSendTextResponse = () => {
    if (textResponse.trim()) {
      // Create a simple text-to-speech blob or just send text
      onSendResponse(new Blob(), textResponse.trim());
      setTextResponse('');
    }
  };

  const renderActivityContent = () => {
    switch (activity.activity_type) {
      case 'voice_game':
        return (
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">🎯 Voice Challenge</h4>
              <p className="text-white/90 text-sm mb-3">
                Take turns describing something without saying the word itself. 
                The other person has to guess what it is!
              </p>
              <div className="text-xs text-white/70">
                Current turn: {activity.activity_data?.currentTurn === currentUserId ? 'You' : otherUser?.username}
              </div>
            </div>
          </div>
        );

      case 'story_building':
        return (
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">📖 Story Building</h4>
              <p className="text-white/90 text-sm mb-3">
                Create a story together! Each person adds one sentence at a time.
              </p>
              {activity.activity_data?.story && (
                <div className="bg-white/5 rounded p-3 text-white/80 text-sm">
                  {activity.activity_data.story}
                </div>
              )}
            </div>
          </div>
        );

      case 'question_exchange':
        return (
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">❓ Question Exchange</h4>
              <p className="text-white/90 text-sm mb-3">
                Ask each other meaningful questions to get to know each other better.
              </p>
              {activity.activity_data?.currentQuestion && (
                <div className="bg-white/5 rounded p-3 text-white/80 text-sm">
                  <strong>Current Question:</strong> {activity.activity_data.currentQuestion}
                </div>
              )}
            </div>
          </div>
        );

      case 'music_share':
        return (
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">🎵 Music Share</h4>
              <p className="text-white/90 text-sm mb-3">
                Share your favorite songs and explain why they mean something to you.
              </p>
              <div className="text-xs text-white/70">
                Share a song title and tell us why it's special to you!
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      className={`bg-gradient-to-br ${config.color} rounded-2xl shadow-xl overflow-hidden`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
      </div>

      {/* Header */}
      <div className="relative p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <config.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">{config.title}</h3>
              <p className="text-white/80 text-sm">with {otherUser?.username || 'Anonymous'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-white/80 text-sm">
            <Clock className="w-4 h-4" />
            <span>{new Date(activity.created_at).toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm">
          <div className={`w-2 h-2 rounded-full mr-2 ${
            activity.status === 'active' ? 'bg-green-400 animate-pulse' :
            activity.status === 'pending' ? 'bg-yellow-400' :
            activity.status === 'completed' ? 'bg-blue-400' : 'bg-gray-400'
          }`} />
          {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
        </div>
      </div>

      {/* Activity Content */}
      <div className="px-6 pb-4">
        {renderActivityContent()}
      </div>

      {/* Response Section */}
      {activity.status === 'active' && (
        <div className="px-6 pb-6">
          {!showRecorder ? (
            <div className="space-y-3">
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowRecorder(true)}
                  className="flex-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Mic className="w-4 h-4" />
                  <span>Voice Response</span>
                </button>
              </div>
              
              {/* Text Response Option */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={textResponse}
                  onChange={(e) => setTextResponse(e.target.value)}
                  placeholder="Or type a quick response..."
                  className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                  maxLength={200}
                />
                <button
                  onClick={handleSendTextResponse}
                  disabled={!textResponse.trim()}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 disabled:opacity-50 text-white p-2 rounded-xl transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-4">
              {/* Recording Interface */}
              <div className="text-center">
                <div className="text-white/90 text-sm mb-3">
                  {isRecording ? 'Recording your response...' : 'Ready to record'}
                </div>
                
                {/* Waveform */}
                <div className="bg-white/10 rounded-lg p-3 mb-4">
                  <Waveform
                    audioUrl={recording?.url}
                    audioLevel={audioLevel}
                    isRecording={isRecording}
                    color="#ffffff"
                    height={60}
                    barCount={25}
                  />
                </div>

                {/* Recording Time */}
                <div className="text-white/70 text-sm mb-4">
                  {Math.floor(recordingTime / 1000)}.{Math.floor((recordingTime % 1000) / 100)}s / 8.0s
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center space-x-3">
                {!recording ? (
                  <>
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors ${
                        isRecording 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : 'bg-white/20 hover:bg-white/30'
                      }`}
                    >
                      {isRecording ? <Pause className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => setShowRecorder(false)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={clearRecording}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition-colors"
                    >
                      Re-record
                    </button>
                    <button
                      onClick={handleSendVoiceResponse}
                      className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-medium transition-colors flex items-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                  </>
                )}
              </div>

              {/* Optional Text Addition */}
              {recording && (
                <div className="pt-3 border-t border-white/20">
                  <input
                    type="text"
                    value={textResponse}
                    onChange={(e) => setTextResponse(e.target.value)}
                    placeholder="Add a text note (optional)..."
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                    maxLength={100}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Activity Controls */}
      {activity.status === 'pending' && (
        <div className="px-6 pb-6">
          <div className="flex space-x-3">
            <button
              onClick={() => onUpdateStatus('active')}
              className="flex-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Start Activity</span>
            </button>
            <button
              onClick={() => onUpdateStatus('cancelled')}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {activity.status === 'completed' && (
        <div className="px-6 pb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <Sparkles className="w-8 h-8 text-white mx-auto mb-2" />
            <p className="text-white font-medium">Activity Completed!</p>
            <p className="text-white/80 text-sm">Great job connecting through voice 🎉</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};