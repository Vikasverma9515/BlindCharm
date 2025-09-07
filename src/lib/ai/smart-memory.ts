import { supabase } from '@/lib/supabase'

export interface MemoryItem {
  content: string
  type: 'interests' | 'moods' | 'personal' | 'preferences'
  relevanceScore: number
  timestamp: string
}

interface DatabaseMemoryItem {
  id: string
  user_id: string
  memory_type: string
  memory_data: {
    content: string
    timestamp: string
    updated_count?: number
  }
  relevance_score: number
  updated_at: string
  computed_score?: number
}

interface MemoryGroup {
  interests: DatabaseMemoryItem[]
  moods: DatabaseMemoryItem[]
  personal: DatabaseMemoryItem[]
  preferences: DatabaseMemoryItem[]
}

export class SmartMemoryService {
  
  static async getRelevantMemory(userId: string, currentMessage: string, limit = 3): Promise<MemoryGroup> {
    const { data, error } = await supabase
      .from('ai_user_memory')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(20) // Get recent memories to score

    if (error) {
      console.error('Error fetching memory:', error)
      return this.getEmptyMemory()
    }

    // Score memories based on relevance
    const scoredMemories = this.scoreMemoryRelevance(data || [], currentMessage)
    
    // Group by type and take top items
    const grouped = this.groupByType(scoredMemories.slice(0, limit))
    
    return grouped
  }

  static async updateMemory(userId: string, memories: MemoryItem[]): Promise<void> {
    for (const memory of memories) {
      try {
        // Check if similar memory exists
        const existing = await this.findSimilarMemory(userId, memory)
        
        if (existing) {
          // Update existing memory
          await supabase
            .from('ai_user_memory')
            .update({
              memory_data: {
                content: memory.content,
                timestamp: new Date().toISOString(),
                updated_count: (existing.memory_data.updated_count || 0) + 1
              },
              relevance_score: Math.min(existing.relevance_score + 0.1, 2.0), // Boost relevance
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id)
        } else {
          // Create new memory
          await supabase
            .from('ai_user_memory')
            .insert({
              user_id: userId,
              memory_type: memory.type,
              memory_data: {
                content: memory.content,
                timestamp: new Date().toISOString(),
                updated_count: 1
              },
              relevance_score: memory.relevanceScore || 1.0
            })
        }
      } catch (error) {
        console.error('Error updating memory:', error)
      }
    }

    // Clean old memories (keep only top 50 per type)
    await this.cleanOldMemories(userId)
  }

  private static scoreMemoryRelevance(memories: DatabaseMemoryItem[], currentMessage: string): DatabaseMemoryItem[] {
    const messageLower = currentMessage.toLowerCase()
    const messageWords = messageLower.split(' ').filter(w => w.length > 2)
    
    return memories.map(memory => {
      let score = memory.relevance_score || 1.0
      
      // Keyword matching
      const memoryContent = memory.memory_data.content.toLowerCase()
      const matchingWords = messageWords.filter(word => memoryContent.includes(word))
      score += matchingWords.length * 0.5
      
      // Recency bonus
      const daysSinceUpdate = (Date.now() - new Date(memory.updated_at).getTime()) / (1000 * 60 * 60 * 24)
      score *= Math.max(0.1, 1 - (daysSinceUpdate / 30)) // Decay over 30 days
      
      // Context relevance
      if (this.isContextuallyRelevant(memory.memory_type, currentMessage)) {
        score *= 1.5
      }

      return { ...memory, computed_score: score }
    }).sort((a, b) => (b.computed_score || 0) - (a.computed_score || 0))
  }

  private static groupByType(memories: DatabaseMemoryItem[]): MemoryGroup {
    const grouped: MemoryGroup = {
      interests: [],
      moods: [],
      personal: [],
      preferences: []
    }

    memories.forEach(memory => {
      const key = memory.memory_type as keyof MemoryGroup
      if (grouped[key]) {
        grouped[key].push(memory)
      }
    })

    return grouped
  }

  private static async findSimilarMemory(userId: string, newMemory: MemoryItem): Promise<DatabaseMemoryItem | null> {
    const { data } = await supabase
      .from('ai_user_memory')
      .select('*')
      .eq('user_id', userId)
      .eq('memory_type', newMemory.type)
      .ilike('memory_data->content', `%${newMemory.content.slice(0, 20)}%`)
      .limit(1)

    return data?.[0] || null
  }

  private static async cleanOldMemories(userId: string): Promise<void> {
    // Keep only top 50 memories per type based on relevance_score
    const types = ['interests', 'moods', 'personal', 'preferences']
    
    for (const type of types) {
      const { data } = await supabase
        .from('ai_user_memory')
        .select('id')
        .eq('user_id', userId)
        .eq('memory_type', type)
        .order('relevance_score', { ascending: false })
        .range(50, 1000) // Get items beyond top 50

      if (data && data.length > 0) {
        const idsToDelete = data.map(item => item.id)
        await supabase
          .from('ai_user_memory')
          .delete()
          .in('id', idsToDelete)
      }
    }
  }

  private static isContextuallyRelevant(memoryType: string, message: string): boolean {
    type ContextMap = {
      [key: string]: RegExp
    }

    const contextMap: ContextMap = {
      interests: /\b(like|love|enjoy|hobby|do|watch|play|favorite)\b/i,
      moods: /\b(feel|feeling|mood|emotion|happy|sad|excited|anxious)\b/i,
      personal: /\b(work|job|family|relationship|name|age|live)\b/i,
      preferences: /\b(prefer|favorite|best|worst|choose|hate|dislike)\b/i
    }
    
    return contextMap[memoryType]?.test(message) || false
  }

  private static getEmptyMemory(): MemoryGroup {
    return {
      interests: [],
      moods: [],
      personal: [],
      preferences: []
    }
  }

  // Keep existing methods from original memory.ts
  static async getAIFriend(userId: string) {
    const { data, error } = await supabase
      .from('ai_friends')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching AI friend:', error)
      return null
    }

    return data
  }

    static async createAIFriend(userId: string, name: string, personality: string, avatar: string) {
    const { data, error } = await supabase
      .from('ai_friends')
      .insert({
        user_id: userId,
        name,
        personality,
        avatar
      })
      .select()
      .single()

    return { data, error }
  }

  static async saveConversation(userId: string, message: string, isUser: boolean, emotion?: string) {
    const { error } = await supabase
      .from('ai_conversations')
      .insert({
        user_id: userId,
        message,
        is_user: isUser,
        emotion: emotion || null
      })

    if (error) {
      console.error('Error saving conversation:', error)
    }
  }

  static async getConversationHistory(userId: string, limit = 20) {
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching conversation history:', error)
      return []
    }

    return data?.reverse().map(msg => ({
      role: msg.is_user ? 'user' : 'assistant',
      content: msg.message,
      emotion: msg.emotion
    })) || []
  }
}