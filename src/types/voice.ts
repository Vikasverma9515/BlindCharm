// src/types/voice.ts

export interface VoicePrompt {
  id: string;
  prompt_text: string;
  category: string;
  difficulty_level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VoiceCard {
  id: string;
  user_id: string;
  prompt_id: string;
  audio_url: string;
  audio_duration: number;
  mood_tags: string[];
  quote?: string;
  vibe_description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Joined data
  prompt?: VoicePrompt;
  user?: {
    id: string;
    username?: string;
    full_name?: string;
  };
}

export interface VoiceCardSwipe {
  id: string;
  swiper_id: string;
  voice_card_id: string;
  swipe_direction: 'left' | 'right' | 'up';
  created_at: string;
}

export interface VoiceMatch {
  id: string;
  user1_id: string;
  user2_id: string;
  voice_card1_id: string;
  voice_card2_id: string;
  match_type: 'voice_connection' | 'vibe_sync' | 'deep_resonance';
  is_active: boolean;
  created_at: string;
  
  // Joined data
  user1?: {
    id: string;
    username?: string;
    full_name?: string;
  };
  user2?: {
    id: string;
    username?: string;
    full_name?: string;
  };
  voice_card1?: VoiceCard;
  voice_card2?: VoiceCard;
}

export interface VoiceActivity {
  id: string;
  match_id: string;
  activity_type: 'voice_game' | 'story_building' | 'question_exchange' | 'music_share';
  activity_data: Record<string, any>;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface VoiceCardReport {
  id: string;
  reporter_id: string;
  voice_card_id: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
}

// Audio recording types
export interface AudioRecording {
  blob: Blob;
  url: string;
  duration: number;
}

export interface WaveformData {
  peaks: number[];
  duration: number;
}

// Voice card creation form data
export interface VoiceCardFormData {
  prompt_id: string;
  audio_blob: Blob;
  mood_tags: string[];
  quote?: string;
  vibe_description?: string;
}

// Swipe card data for the interface
export interface SwipeableVoiceCard extends VoiceCard {
  distance?: number;
  rotation?: number;
  opacity?: number;
  isVisible?: boolean;
}