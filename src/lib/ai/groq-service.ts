import Groq from 'groq-sdk'
import { EmotionDetector, EmotionContext } from './emotion-detector'
import { ConversationFlow, ConversationContext } from './conversation-flow'
import { MemoryItem } from './smart-memory'

interface GroqChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  emotion?: string
}


interface ChatContext {
  friendName: string
  friendPersonality?: string
  userTone: string
  userMemory: any
  conversationHistory: GroqChatMessage[]  
  emotion?: EmotionContext
  conversationContext?: ConversationContext
}

interface PersonalityTraits {
  [key: string]: string
}

interface EmotionalGuidance {
  [key: string]: string
}

interface EmotionalPrefixes {
  [key: string]: string[]
}

export class GroqAIService {
  private groq: Groq

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    })
  }

  async chat(message: string, context: ChatContext) {
  try {
    const emotion = context.emotion || EmotionDetector.detect(message)
    const conversationContext = ConversationFlow.analyzeContext(
      context.conversationHistory
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
    )
    
    const systemPrompt = this.buildSystemPrompt({
      ...context,
      emotion,
      conversationContext
    })
    
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...context.conversationHistory.slice(-8),
      { role: 'user' as const, content: message }
    ]

      // Choose model based on conversation complexity
      const modelToUse = this.selectModel(emotion, conversationContext)
      const maxTokens = this.getMaxTokens(emotion, conversationContext)

      const res = await this.groq.chat.completions.create({
        model: modelToUse,
        messages: messages as any,
        max_tokens: maxTokens,
        temperature: this.getTemperature(emotion),
        top_p: 0.85,
        stop: this.getStopSequences(),
      })

      let response = res.choices[0]?.message?.content?.trim() || ''
      
      // Post-process response
      response = this.humanizeResponse(response, emotion, context.userTone)
      response = this.ensureNaturalLength(response)
      
      // Add follow-up if appropriate
      if (ConversationFlow.shouldAskFollowUp(conversationContext, emotion)) {
        const followUp = ConversationFlow.getFollowUpQuestion(emotion, conversationContext)
        response = this.combineResponseWithFollowUp(response, followUp)
      }

      // Simulate natural typing delay
      await this.simulateTypingDelay(response)

      return response || this.getEmergencyResponse(emotion)
      
    } catch (error: any) {
      console.error('Groq AI Error:', error)
      return this.getErrorResponse(error, context.emotion)
    }
  }

  private buildSystemPrompt(context: ChatContext & { emotion: EmotionContext; conversationContext: ConversationContext }): string {
    const { friendName, friendPersonality, userTone, userMemory, emotion, conversationContext } = context
    
    const personalityTraits = this.getPersonalityTraits(friendPersonality)
    const memoryContext = this.formatMemoryForPrompt(userMemory)
    const emotionalGuidance = this.getEmotionalGuidance(emotion)
    
    return `You are ${friendName}, their close friend. Not an AI assistant - a real friend.

PERSONALITY: ${personalityTraits}
COMMUNICATION: ${this.getCommunicationStyle(userTone, conversationContext)}

WHAT YOU REMEMBER: ${memoryContext}

CURRENT SITUATION: ${emotionalGuidance}

RULES:
- Keep responses 1-2 sentences max
- Sound like you're texting a friend
- Match their energy and tone
- No therapy speak or generic responses
- React naturally to their emotions
- Use their name occasionally but not always

${this.getResponseGuidelines(emotion, conversationContext)}`
  }

  private getPersonalityTraits(personality?: string): string {
    const traits: PersonalityTraits = {
      supportive: 'caring, always there for them, gentle but real',
      fun: 'playful, loves jokes, brings lightness to heavy moments',
      chill: 'relaxed, easy-going, doesn\'t overthink things',
      wise: 'thoughtful, gives good perspective, asks good questions',
      energetic: 'enthusiastic, motivating, brings positive energy'
    }
    return traits[personality || ''] || 'genuine, caring, and real'
  }

  private getCommunicationStyle(userTone: string, context: ConversationContext): string {
    let style = 'casual and friendly'
    
    if (userTone.includes('Hindi')) style += ', comfortable mixing Hindi/English'
    if (context.conversationFlow === 'deep') style += ', more thoughtful and present'
    if (context.messageCount < 3) style += ', welcoming but not overwhelming'
    
    return style
  }

  private formatMemoryForPrompt(memory: any): string {
    const parts = []
    
    if (memory.interests?.length) {
      parts.push(`They like: ${memory.interests.slice(-2).map((i: any) => i.memory_data?.content || i.content).join(', ')}`)
    }
    if (memory.moods?.length) {
      parts.push(`Recent mood: ${memory.moods[0]?.memory_data?.content || memory.moods[0]?.content}`)
    }
    if (memory.personal?.length) {
      parts.push(`Personal: ${memory.personal.slice(-1).map((p: any) => p.memory_data?.content || p.content).join(', ')}`)
    }
    
    return parts.join(' | ') || 'Still getting to know them'
  }

  private getEmotionalGuidance(emotion: EmotionContext): string {
    const guidance: EmotionalGuidance = {
      sad: `They're feeling down (${emotion.intensity > 0.5 ? 'pretty' : 'a bit'} sad). Be caring but not pushy.`,
      excited: `They're excited! Match their energy and celebrate with them.`,
      anxious: `They seem worried. Be calming and supportive without dismissing their concerns.`,
      frustrated: `They're frustrated. Acknowledge it and let them vent.`,
      romantic: `They're talking about love/dating. Be a good friend - supportive but realistic.`,
      neutral: `Normal conversation. Be yourself and keep it natural.`
    }
    
    return guidance[emotion.primary] || guidance.neutral
  }

  private getResponseGuidelines(emotion: EmotionContext, context: ConversationContext): string {
    if (emotion.urgency === 'high') {
      return 'URGENT: They need support right now. Be present and caring.'
    }
    
    if (context.conversationFlow === 'opening') {
      return 'Keep it light and welcoming. Don\'t overwhelm with questions.'
    }
    
    if (context.lastBotQuestion) {
      return 'They just answered your question. Respond to what they said, don\'t ask another question immediately.'
    }
    
    return 'Be natural and responsive to what they\'re sharing.'
  }

  private selectModel(emotion: EmotionContext, context: ConversationContext): string {
    // Use bigger model for complex emotional situations
    if (emotion.urgency === 'high' || emotion.intensity > 0.7) {
      return 'llama-3.3-70b-versatile'
    }
    
    // Use smaller model for casual chat
    return 'llama-3.1-8b-instant'
  }

  private getMaxTokens(emotion: EmotionContext, context: ConversationContext): number {
    if (emotion.urgency === 'high') return 50 // Longer for urgent situations
    if (context.conversationFlow === 'deep') return 40
    return 25 // Keep most responses very short
  }

  private getTemperature(emotion: EmotionContext): number {
    if (emotion.primary === 'sad' && emotion.intensity > 0.5) return 0.6 // More consistent for serious moments
    if (emotion.primary === 'excited') return 0.8 // More creative for fun moments
    return 0.7 // Balanced default
  }

  private getStopSequences(): string[] {
    return ['\n\n', '?', '!', '.', '...', 'User:', 'Assistant:']
  }

  private humanizeResponse(response: string, emotion: EmotionContext, userTone: string): string {
    // Remove AI-like phrases
    response = response.replace(/\b(I understand|I can help|Let me|As an AI|I'm here to)\b/gi, '')
    response = response.replace(/\b(That sounds|It seems like|I think|I believe)\b/gi, '')
    
    // Add emotional matching prefixes (25% chance)
    if (Math.random() < 0.25) {
      const prefix = this.getEmotionalPrefix(emotion.primary)
      if (prefix) response = `${prefix} ${response}`
    }
    
    // Add Hinglish naturally
    if (userTone.includes('Hindi')) {
      response = this.addHinglishTouch(response, emotion)
    }
    
    // Clean up spacing
    return response.replace(/\s+/g, ' ').trim()
  }

  private getEmotionalPrefix(emotion: string): string {
    const prefixes: EmotionalPrefixes = {
      sad: ['Aw man', 'Oh no', 'That sucks', 'I feel you', 'Damn'],
      excited: ['Yess!', 'That\'s awesome!', 'No way!', 'Amazing!', 'Dude!'],
      anxious: ['Hey', 'It\'s okay', 'I get it', 'Listen'],
      frustrated: ['Ugh', 'That\'s annoying', 'I hate when that happens', 'So frustrating'],
      romantic: ['Ooh', 'Aww', 'That\'s sweet', 'Cute!']
    }
    
    const options = prefixes[emotion] || ['']
    return options[Math.floor(Math.random() * options.length)]
  }

  private addHinglishTouch(response: string, emotion: EmotionContext): string {
    const replacements: { [key: string]: string } = {
      'yes': Math.random() > 0.6 ? 'haan' : 'yes',
      'no': Math.random() > 0.6 ? 'nahi' : 'no',
      'what': Math.random() > 0.6 ? 'kya' : 'what',
      'how': Math.random() > 0.6 ? 'kaise' : 'how',
      'really': Math.random() > 0.6 ? 'sach mein' : 'really',
      'okay': Math.random() > 0.6 ? 'achha' : 'okay',
      'friend': Math.random() > 0.6 ? 'yaar' : 'friend'
    }
    
    Object.entries(replacements).forEach(([eng, hinglish]) => {
      response = response.replace(new RegExp(`\\b${eng}\\b`, 'gi'), hinglish)
    })
    
    // Add common Hinglish expressions based on emotion
    if (emotion.primary === 'sad' && Math.random() < 0.3) {
      response += ' yaar'
    } else if (emotion.primary === 'excited' && Math.random() < 0.3) {
      response = response.replace(/!$/, ' hai na!')
    }
    
    return response
  }

  private ensureNaturalLength(response: string): string {
    // If response is too long, cut it at natural break point
    if (response.length > 100) {
      const sentences = response.split(/[.!?]/)
      return sentences[0] + (sentences[0].endsWith('.') ? '' : '.')
    }
    
    // If too short and seems incomplete, don't add filler
    if (response.length < 5) {
      return "I'm here for you."
    }
    
    return response
  }

  private combineResponseWithFollowUp(response: string, followUp: string): string {
    // Don't add follow-up if response already has a question
    if (response.includes('?')) return response
    
    // Add natural connector
    const connectors = [' ', '. ', ' - ']
    const connector = connectors[Math.floor(Math.random() * connectors.length)]
    
    return response + connector + followUp
  }

  private async simulateTypingDelay(response: string): Promise<void> {
    // Calculate realistic typing speed (40-60 WPM)
    const wordsPerMinute = 50
    const words = response.split(' ').length
    const typingTime = (words / wordsPerMinute) * 60 * 1000 // Convert to milliseconds
    
    // Add some randomness and cap at 3 seconds
    const delay = Math.min(typingTime + Math.random() * 500, 3000)
    const finalDelay = Math.max(delay, 800) // Minimum 800ms
    
    await new Promise(resolve => setTimeout(resolve, finalDelay))
  }

    private getEmergencyResponse(emotion: EmotionContext): string {
    const responses: EmotionalPrefixes = {
      sad: ["I'm here with you.", "You're not alone in this.", "I care about you."],
      anxious: ["Take a deep breath.", "You're safe.", "One step at a time."],
      frustrated: ["That sounds really tough.", "I get why you're upset.", "Want to talk about it?"],
      excited: ["That's amazing!", "I'm so happy for you!", "Tell me more!"],
      romantic: ["Aww that's sweet!", "How exciting!", "Tell me everything!"]
    }
    
    const options = responses[emotion.primary] || ["I'm here for you.", "What's on your mind?", "Tell me more."]
    return options[Math.floor(Math.random() * options.length)]
  }

  private getErrorResponse(error: any, emotion?: EmotionContext): string {
    if (error.status === 429) {
      return "Give me a sec, so many people chatting right now! 😅"
    }
    
    if (error.status === 404) {
      return "Having a tiny tech issue. What were you saying? 🤗"
    }
    
    if (emotion?.urgency === 'high') {
      return "I'm here even if my brain's being slow right now ❤️"
    }
    
    return "Oops, brain freeze moment! Try again? 😊"
  }

  // Keep existing utility methods
  analyzeUserTone(message: string): string {
    const casual = /\b(hai|hey|sup|gonna|wanna|yaar|bro|sis|dude)\b/i.test(message)
    const formal = /\b(please|thank you|appreciate|sincerely|kindly)\b/i.test(message)
    const emotional = /\b(sad|happy|excited|nervous|scared|worried|love|hate)\b/i.test(message)
    const hinglish = /\b(hai|haan|nahi|kya|yaar|boss|bhai|didi|ji|achha|theek)\b/i.test(message)
    
    const tones = []
    if (casual) tones.push('casual')
    if (formal) tones.push('formal')
    if (emotional) tones.push('emotional')
    if (hinglish) tones.push('uses Hindi/English mix')
    
    return tones.length ? tones.join(', ') : 'neutral'
  }

  extractMemoryPoints(message: string): MemoryItem[] {
    const memories: MemoryItem[] = []
    const messageLower = message.toLowerCase()
    
    // Extract interests
    const interestPatterns = [
      /i (love|like|enjoy|am into|obsessed with) ([^.!?]+)/gi,
      /my (hobby|interest|passion) is ([^.!?]+)/gi
    ]
    
    interestPatterns.forEach(pattern => {
      const matches = message.match(pattern)
      if (matches) {
        matches.forEach(match => {
          const content = match.replace(/i (love|like|enjoy|am into|obsessed with|my hobby|my interest|my passion) is /gi, '').trim()
          memories.push({
            type: 'interests',
            content,
            relevanceScore: 1.2,
            timestamp: new Date().toISOString()
          })
        })
      }
    })
    
    // Extract feelings/moods
    const moodPatterns = [
      /i (feel|am feeling|felt) (sad|happy|excited|nervous|scared|worried|lonely|confident|anxious|frustrated)/gi,
      /i'm (so|really|very|extremely) (sad|happy|excited|nervous|scared|worried|lonely|confident|anxious|frustrated)/gi
    ]
    
    moodPatterns.forEach(pattern => {
      const matches = message.match(pattern)
      if (matches) {
        matches.forEach(match => {
          const mood = match.replace(/i (feel|am feeling|felt|'m so|'m really|'m very|'m extremely) /gi, '').trim()
          memories.push({
            type: 'moods',
            content: mood,
            relevanceScore: 1.5, // Moods are highly relevant
            timestamp: new Date().toISOString()
          })
        })
      }
    })
    
    // Extract personal info
    const personalPatterns = [
      /(my name is|call me|i'm) ([^.!?]+)/gi,
      /i (work|study) (at|in) ([^.!?]+)/gi,
      /i (live|am from) ([^.!?]+)/gi,
      /i have a (boyfriend|girlfriend|partner|crush) ([^.!?]*)/gi
    ]
    
    personalPatterns.forEach(pattern => {
      const matches = message.match(pattern)
      if (matches) {
        matches.forEach(match => {
          memories.push({
            type: 'personal',
            content: match.trim(),
            relevanceScore: 1.3,
            timestamp: new Date().toISOString()
          })
        })
      }
    })
    
    // Extract preferences
    const preferencePatterns = [
      /i (prefer|hate|dislike|can't stand) ([^.!?]+)/gi,
      /(my favorite|i love|i hate) ([^.!?]+)/gi
    ]
    
    preferencePatterns.forEach(pattern => {
      const matches = message.match(pattern)
      if (matches) {
        matches.forEach(match => {
          memories.push({
            type: 'preferences',
            content: match.trim(),
            relevanceScore: 1.1,
            timestamp: new Date().toISOString()
          })
        })
      }
    })
    
    return memories
  }
}