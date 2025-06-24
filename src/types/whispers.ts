// src/types/whispers.ts

export interface Whisper {
  id: string;
  user_id: string;
  content: string;
  is_anonymous: boolean;
  mood: string;
  category: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  background_theme: string;
  user?: {
    username: string;
    profile_picture: string;
  };
}

export interface WhisperComment {
  id: string;
  whisper_id: string;
  user_id: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
  user?: {
    username: string;
    profile_picture: string;
  };
}

export interface WhisperReaction {
  id: string;
  whisper_id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
}