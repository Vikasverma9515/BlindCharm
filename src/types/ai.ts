// types/ai.ts
export interface AIFriend {
  id: string
  name: string
  avatar: string
  personality: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  content: string
  isUser: boolean
  timestamp: string
  emotion?: string
}

export interface ApiMessage {
  role: 'user' | 'assistant'
  content: string
  emotion?: string
}

export interface EmotionContext {
  primary: string
  intensity: number
  keywords: string[]
  urgency: 'low' | 'medium' | 'high'
}

export interface MemoryItem {
  content: string
  type: 'interests' | 'moods' | 'personal' | 'preferences'
  relevanceScore: number
  timestamp: string
}

export interface UserIntent {
  raw_input: string
  connection_type: 'friendship' | 'collaboration' | 'emotional' | 'romantic' | 'casual'
  energy_level: 'calm' | 'playful' | 'focused' | 'deep'
  pace: 'slow' | 'no_pressure' | 'open' | 'intentional'
  boundaries: string[]
  embedding?: number[]
}

export interface StoryCard {
  user_id: string
  photo_url: string
  story_line: string
  visual_proof_tags: string[]
  voice_url?: string
  match_score?: number
  full_name?: string
  age?: number
  location?: string
  bio?: string
  about_me?: string
  photos?: string[]
  visual_cue?: string
  birth_date?: string
  pronouns?: string
  height?: string
  job_title?: string
  identity_signals?: string[]
  interest_capsules?: string[]
  connection_style?: string
  prompts?: any[]
  current_mood?: string
  theme?: string
  color?: string
  mood?: string
  border?: string
  energy_level?: string
  intent_history?: any
  avatar_url?: string
}