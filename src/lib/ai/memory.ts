// lib/ai/memory.ts
import { supabase } from '@/lib/supabase'

export class AIMemoryService {
  
  static async getUserMemory(userId: string) {
    const { data, error } = await supabase
      .from('ai_user_memory')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching user memory:', error)
      return {}
    }

    // Group memories by type
    const memory: any = {
      interests: [],
      moods: [],
      personal: [],
      preferences: []
    }

    data?.forEach(item => {
      if (memory[item.memory_type]) {
        memory[item.memory_type].push(item.memory_data)
      }
    })

    return memory
  }

  static async updateMemory(userId: string, memories: any[]) {
    for (const memory of memories) {
      await supabase
        .from('ai_user_memory')
        .upsert({
          user_id: userId,
          memory_type: memory.type,
          memory_data: { content: memory.content, timestamp: new Date().toISOString() }
        })
    }
  }

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

  static async saveConversation(userId: string, message: string, isUser: boolean) {
    const { error } = await supabase
      .from('ai_conversations')
      .insert({
        user_id: userId,
        message,
        is_user: isUser
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
      content: msg.message
    })) || []
  }
}

// // lib/ai/memory.ts
// import { supabase } from '@/lib/supabase'

// export class AIMemoryService {
  
//   static async getUserMemory(userId: string) {
//     const { data, error } = await supabase
//       .from('ai_user_memory')
//       .select('*')
//       .eq('user_id', userId)
//       .order('updated_at', { ascending: false })

//     if (error) {
//       console.error('Error fetching user memory:', error)
//       return {}
//     }

//     // Group memories by type
//     const memory: any = {
//       interests: [],
//       moods: [],
//       personal: [],
//       preferences: []
//     }

//     data?.forEach(item => {
//       if (memory[item.memory_type]) {
//         memory[item.memory_type].push(item.memory_data)
//       }
//     })

//     return memory
//   }

//   // FIXED: Enhanced memory update with better handling
//   static async updateMemory(userId: string, memories: any[]) {
//     if (!memories || memories.length === 0) {
//       console.log('No memories to save')
//       return
//     }

//     console.log(`💾 Saving ${memories.length} memories for user ${userId}:`, memories)

//     try {
//       for (const memory of memories) {
//         // Create unique identifier for each memory to avoid duplicates
//         const memoryHash = this.createMemoryHash(memory.content)
        
//         const { data, error } = await supabase
//           .from('ai_user_memory')
//           .upsert({
//             user_id: userId,
//             memory_type: memory.type,
//             memory_data: { 
//               content: memory.content,
//               confidence: memory.confidence || 0.7,
//               timestamp: new Date().toISOString(),
//               hash: memoryHash
//             },
//             memory_hash: memoryHash, // Add this column to your database
//             updated_at: new Date().toISOString()
//           }, {
//             onConflict: 'user_id,memory_type,memory_hash' // Prevent duplicates
//           })
//           .select()

//         if (error) {
//           console.error('Error saving individual memory:', error, memory)
//         } else {
//           console.log('✅ Saved memory:', memory.content)
//         }
//       }
//     } catch (error) {
//       console.error('Error in updateMemory:', error)
//       throw error
//     }
//   }

//   // Create a simple hash for memory deduplication
//   private static createMemoryHash(content: string): string {
//     return Buffer.from(content.toLowerCase().replace(/[^a-z0-9]/g, '')).toString('base64').slice(0, 12)
//   }

//   // Enhanced method to save comprehensive memory from conversations
//   static async saveConversationMemory(userId: string, userMessage: string, aiResponse: string) {
//     try {
//       // Extract memories from both user message and AI response context
//       const memories = this.extractComprehensiveMemories(userMessage, aiResponse)
      
//       if (memories.length > 0) {
//         console.log(`🧠 Extracted ${memories.length} memories from conversation`)
//         await this.updateMemory(userId, memories)
//       }
//     } catch (error) {
//       console.error('Error saving conversation memory:', error)
//     }
//   }

//   // ENHANCED: Much more comprehensive memory extraction
//   static extractComprehensiveMemories(userMessage: string, aiResponse?: string): any[] {
//     const memories: any[] = []
//     const messageLower = userMessage.toLowerCase()
    
//     // 1. INTERESTS - Enhanced patterns
//     const interestPatterns = [
//       // English patterns
//       /i (love|like|enjoy|am into|obsessed with|adore|am passionate about) ([^.!?,]+)/gi,
//       /my (hobby|passion|interest|favorite thing|favorite) is ([^.!?,]+)/gi,
//       /i'm (really into|crazy about|a fan of) ([^.!?,]+)/gi,
//       /i (watch|listen to|play|do|practice) ([^.!?,]+)/gi,
      
//       // Hinglish patterns
//       /(mujhe|main) (bahut pasand|love|like|enjoy) ([^.!?,]+)/gi,
//       /main (dekhta|sunta|karta|khelta) (hu|hun) ([^.!?,]+)/gi
//     ]

//     interestPatterns.forEach(pattern => {
//       const matches = userMessage.match(pattern)
//       if (matches) {
//         matches.forEach(match => {
//           const content = this.cleanExtractedContent(match)
//           if (content && content.length > 2 && content.length < 100) {
//             memories.push({
//               type: 'interests',
//               content: content,
//               confidence: 0.8,
//               source: 'user_message'
//             })
//           }
//         })
//       }
//     })

//     // 2. MOODS & EMOTIONS - Enhanced patterns
//     const moodPatterns = [
//       /i (feel|am feeling|felt|been feeling) (really |very |so |extremely |)?(sad|happy|excited|nervous|scared|worried|lonely|confident|anxious|frustrated|angry|depressed|stressed|overwhelmed|content|peaceful|energetic|tired)/gi,
//       /i'm (so|really|very|extremely|totally|completely|) (sad|happy|excited|nervous|scared|worried|lonely|confident|anxious|frustrated|angry|depressed|stressed|overwhelmed|content|peaceful|energetic|tired)/gi,
//       /feeling (a bit|quite|very|really|so|extremely|) (sad|happy|excited|nervous|scared|worried|lonely|confident|anxious|frustrated|angry|depressed|stressed|overwhelmed|content|peaceful|energetic|tired)/gi,
      
//       // Hinglish emotions
//       /(main|mujhe) (bahut|thoda|) (khushi|dukh|pareshan|tension|gussa|dar|chinta) (hai|ho raha|lag raha)/gi,
//       /main (khush|dukhi|pareshan|tense|nervous) (hu|hun|feel kar raha)/gi
//     ]

//     moodPatterns.forEach(pattern => {
//       const matches = userMessage.match(pattern)
//       if (matches) {
//         matches.forEach(match => {
//           const mood = this.cleanExtractedContent(match)
//           if (mood) {
//             memories.push({
//               type: 'moods',
//               content: mood,
//               confidence: 0.9,
//               timestamp: new Date().toISOString(),
//               source: 'user_message'
//             })
//           }
//         })
//       }
//     })

//     // 3. PERSONAL INFO - Enhanced patterns
//     const personalPatterns = [
//       /(my name is|call me|i'm|i am) ([^.!?,]+)/gi,
//       /i (work|study|go to school) (at|in|for) ([^.!?,]+)/gi,
//       /i (live|am from|stay) (in|at|from) ([^.!?,]+)/gi,
//       /i have (a|an) ([^.!?,]+)/gi,
//       /i'm (a|an) ([^.!?,]+)/gi,
//       /my (job|work|profession|career) is ([^.!?,]+)/gi,
//       /i (graduated|studied) (from|at) ([^.!?,]+)/gi,
      
//       // Relationship info
//       /i have a (boyfriend|girlfriend|partner|crush|husband|wife) ([^.!?,]*)/gi,
//       /i'm (single|married|in a relationship|dating) ([^.!?,]*)/gi,
      
//       // Family info
//       /my (mom|dad|mother|father|parents|family) ([^.!?,]+)/gi,
      
//       // Hinglish personal
//       /(mera naam|main) ([^.!?,]+)/gi,
//       /main ([^.!?,]+) (mein rehta|mein karta|hun)/gi
//     ]

//     personalPatterns.forEach(pattern => {
//       const matches = userMessage.match(pattern)
//       if (matches) {
//         matches.forEach(match => {
//           const info = this.cleanExtractedContent(match)
//           if (info && info.length > 2) {
//             memories.push({
//               type: 'personal',
//               content: info,
//               confidence: 0.7,
//               source: 'user_message'
//             })
//           }
//         })
//       }
//     })

//     // 4. PREFERENCES - Enhanced patterns
//     const preferencePatterns = [
//       /i (prefer|hate|dislike|can't stand|avoid|don't like) ([^.!?,]+)/gi,
//       /(my favorite|i love|i hate|i prefer|i always|i never) ([^.!?,]+)/gi,
//       /i (usually|always|never|sometimes|often) ([^.!?,]+)/gi,
      
//       // Food preferences
//       /i (eat|don't eat|love eating|hate eating) ([^.!?,]+)/gi,
      
//       // Hinglish preferences
//       /(mujhe|main) (pasand|napasand|prefer) (karta|karti) (hu|hun) ([^.!?,]+)/gi
//     ]

//     preferencePatterns.forEach(pattern => {
//       const matches = userMessage.match(pattern)
//       if (matches) {
//         matches.forEach(match => {
//           const preference = this.cleanExtractedContent(match)
//           if (preference) {
//             memories.push({
//               type: 'preferences',
//               content: preference,
//               confidence: 0.6,
//               source: 'user_message'
//             })
//           }
//         })
//       }
//     })

//     // 5. CONTEXTUAL MEMORIES - Extract topics and themes
//     this.extractContextualMemories(userMessage, memories)

//     // 6. RELATIONSHIP/DATING CONTEXT
//     this.extractRelationshipContext(userMessage, memories)

//     console.log(`🔍 Memory extraction found ${memories.length} memories:`, memories.map(m => m.content))
    
//     return memories
//   }

//   // Helper method to clean extracted content
//   private static cleanExtractedContent(match: string): string {
//     // Remove common prefixes
//     let cleaned = match.replace(/^(i |my |i'm |i am |mujhe |main |mera |)/gi, '')
//     cleaned = cleaned.replace(/^(love|like|enjoy|am into|obsessed with|adore|feel|am feeling|felt|have a|have an|prefer|hate|pasand|napasand|)/gi, '')
//     cleaned = cleaned.replace(/^(is |are |hu |hun |hai |ho |)/gi, '')
//     cleaned = cleaned.replace(/\s+/g, ' ').trim()
    
//     // Remove very common words that aren't meaningful
//     const stopWords = ['that', 'this', 'and', 'but', 'or', 'so', 'very', 'really', 'quite', 'a', 'an', 'the']
//     const words = cleaned.split(' ')
//     const filteredWords = words.filter(word => 
//       !stopWords.includes(word.toLowerCase()) && word.length > 1
//     )
    
//     return filteredWords.join(' ').trim()
//   }

//   // Extract contextual memories from conversation themes
//   private static extractContextualMemories(message: string, memories: any[]) {
//     const messageLower = message.toLowerCase()
    
//     // Dating/relationship context
//     if (/\b(date|dating|crush|boyfriend|girlfriend|relationship|love|romance|tinder|bumble|marriage|wedding)\b/.test(messageLower)) {
//       memories.push({
//         type: 'interests',
//         content: 'discussing dating and relationships',
//         confidence: 0.5,
//         source: 'context'
//       })
//     }
    
//     // Career/work context
//     if (/\b(work|job|career|office|boss|colleague|interview|promotion|salary|business)\b/.test(messageLower)) {
//       memories.push({
//         type: 'interests',
//         content: 'talking about work and career',
//         confidence: 0.5,
//         source: 'context'
//       })
//     }
    
//     // Family context
//     if (/\b(family|mom|dad|parents|brother|sister|relatives|home|ghar)\b/.test(messageLower)) {
//       memories.push({
//         type: 'personal',
//         content: 'shares family stories and experiences',
//         confidence: 0.5,
//         source: 'context'
//       })
//     }
//   }

//   // Extract relationship/dating specific context
//   private static extractRelationshipContext(message: string, memories: any[]) {
//     const relationshipKeywords = [
//       'single', 'dating', 'relationship', 'boyfriend', 'girlfriend', 'crush',
//       'tinder', 'bumble', 'date', 'romance', 'love', 'marriage', 'wedding',
//       'breakup', 'ex', 'partner'
//     ]
    
//     const messageLower = message.toLowerCase()
//     const foundKeywords = relationshipKeywords.filter(keyword => messageLower.includes(keyword))
    
//     if (foundKeywords.length > 0) {
//       memories.push({
//         type: 'personal',
//         content: `interested in discussing: ${foundKeywords.join(', ')}`,
//         confidence: 0.6,
//         source: 'relationship_context'
//       })
//     }
//   }

//   // Rest of your existing methods...
//   static async getAIFriend(userId: string) {
//     const { data, error } = await supabase
//       .from('ai_friends')
//       .select('*')
//       .eq('user_id', userId)
//       .single()

//     if (error && error.code !== 'PGRST116') {
//       console.error('Error fetching AI friend:', error)
//       return null
//     }

//     return data
//   }

//   static async createAIFriend(userId: string, name: string, personality: string, avatar: string) {
//     const { data, error } = await supabase
//       .from('ai_friends')
//       .insert({
//         user_id: userId,
//         name,
//         personality,
//         avatar,
//         created_at: new Date().toISOString()
//       })
//       .select()
//       .single()

//     return { data, error }
//   }

//   static async saveConversation(userId: string, message: string, isUser: boolean) {
//     try {
//       const { error } = await supabase
//         .from('ai_conversations')
//         .insert({
//           user_id: userId,
//           message,
//           is_user: isUser,
//           created_at: new Date().toISOString()
//         })

//       if (error) {
//         console.error('Error saving conversation:', error)
//         throw error
//       } else {
//         console.log(`💬 Saved ${isUser ? 'user' : 'AI'} message:`, message.slice(0, 50) + '...')
//       }
//     } catch (error) {
//       console.error('Error saving conversation:', error)
//       throw error
//     }
//   }

//   static async getConversationHistory(userId: string, limit = 20) {
//     try {
//       const { data, error } = await supabase
//         .from('ai_conversations')
//         .select('*')
//         .eq('user_id', userId)
//         .order('created_at', { ascending: false })
//                 .limit(limit)

//       if (error) {
//         console.error('Error fetching conversation history:', error)
//         throw error
//       }

//       // Return raw data in chronological order (oldest first)
//       return data?.reverse() || []
//     } catch (error) {
//       console.error('Error fetching conversation history:', error)
//       return []
//     }
//   }

//   // Separate method for getting formatted conversation for AI context
//   static async getFormattedConversationForAI(userId: string, limit = 20) {
//     try {
//       const rawHistory = await this.getConversationHistory(userId, limit)
      
//       return rawHistory.map(msg => ({
//         role: msg.is_user ? 'user' : 'assistant',
//         content: msg.message,
//         timestamp: msg.created_at
//       }))
//     } catch (error) {
//       console.error('Error formatting conversation for AI:', error)
//       return []
//     }
//   }

//   // Method to get memory insights for analytics
//   static async getMemoryInsights(userId: string) {
//     try {
//       const memory = await this.getUserMemory(userId)
      
//       return {
//         totalMemories: Object.values(memory).flat().length,
//         interestsCount: memory.interests?.length || 0,
//         moodsCount: memory.moods?.length || 0,
//         personalCount: memory.personal?.length || 0,
//         preferencesCount: memory.preferences?.length || 0,
//         lastUpdated: memory.interests?.[0]?.timestamp || null,
//         topInterests: memory.interests?.slice(0, 3).map((i: any) => i.content) || [],
//         recentMoods: memory.moods?.slice(0, 3).map((m: any) => m.content) || []
//       }
//     } catch (error) {
//       console.error('Error getting memory insights:', error)
//       return {
//         totalMemories: 0,
//         interestsCount: 0,
//         moodsCount: 0,
//         personalCount: 0,
//         preferencesCount: 0
//       }
//     }
//   }

//   // Clean up old or low-confidence memories
//   static async cleanupMemories(userId: string) {
//     try {
//       // Delete memories older than 6 months with low confidence
//       const sixMonthsAgo = new Date()
//       sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

//       await supabase
//         .from('ai_user_memory')
//         .delete()
//         .eq('user_id', userId)
//         .lt('updated_at', sixMonthsAgo.toISOString())
//         .lt('memory_data->confidence', 0.3)

//       console.log('🧹 Cleaned up old low-confidence memories')
//     } catch (error) {
//       console.error('Error cleaning up memories:', error)
//     }
//   }
// }