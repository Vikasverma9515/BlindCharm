// src/types/lobby.ts

export interface User {
  id: string;
  username: string;
  full_name?: string;
  gender: 'male' | 'female' | 'other';
  dob?: string;
  bio?: string | null;
  interests?: string[] | null;
  profile_picture: string | null;
  current_lobby_id?: string | null;
  is_in_lobby?: boolean;
  is_admin?: boolean;
  created_at?: string;
  updated_at?: string;
  additional_photo_1?: string | null;
  additional_photo_2?: string | null;
}

export interface Message {
  id: string;
  lobby_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: User;
}

export interface LobbyParticipant {
  id: string;
  lobby_id: string;
  user_id: string;
  status: string;
  joined_at: string;
  user: User;
  blur_profile?: boolean;
}

export interface Lobby {
  id: string;
  name: string;
  theme: string;
  description: string;
  image_url?: string | null;
  participant_count: number;
  male_count: number;
  female_count: number;
  status: 'waiting' | 'matching' | 'closed';
  cycle_id: string | null;
  created_at: string;
  ends_at: string | null;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  lobby_id: string;
  cycle_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  reveal_requested_by: string[];
  created_at: string;
}

export interface Question {
  id: string;
  girl_id: string;
  lobby_id: string;
  question_text: string;
  question_type: 'mcq' | 'written';
  options?: string[];
  correct_answer?: string;
  created_at: string;
  updated_at: string;
}

export interface Answer {
  id: string;
  question_id: string;
  boy_id: string;
  lobby_id: string;
  answer_text: string;
  option_index?: number;
  points_awarded: number;
  is_reviewed: boolean;
  created_at: string;
  updated_at: string;
  boy: User;
}