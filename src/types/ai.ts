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