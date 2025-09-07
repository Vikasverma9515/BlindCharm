import { EmotionContext } from './emotion-detector'

export interface ConversationContext {
  messageCount: number
  lastBotQuestion: boolean
  recentTopics: string[]
  conversationFlow: 'opening' | 'building' | 'deep' | 'closing'
}

interface ConversationMessage {  // Renamed to avoid conflicts
  role: 'user' | 'assistant'
  content: string
  emotion?: string
}


export class ConversationFlow {
  static analyzeContext(history: ConversationMessage[]): ConversationContext {
    const lastFewMessages = history.slice(-6)
    const lastBotMessage = [...lastFewMessages].reverse().find(m => m.role === 'assistant')
    
    return {
      messageCount: history.filter(m => m.role === 'user').length,
      lastBotQuestion: lastBotMessage?.content.includes('?') || false,
      recentTopics: this.extractTopics(lastFewMessages),
      conversationFlow: this.determineFlow(history.length)
    }
  }

  static shouldAskFollowUp(context: ConversationContext, emotion: EmotionContext): boolean {
    // Don't ask if we just asked a question
    if (context.lastBotQuestion) return false
    
    // Always follow up on high urgency emotions
    if (emotion.urgency === 'high') return true
    
    // Follow up on strong emotions
    if (emotion.intensity > 0.6 && ['sad', 'excited', 'anxious'].includes(emotion.primary)) {
      return true
    }
    
    // Don't overwhelm with questions in deep conversation
    if (context.conversationFlow === 'deep' && Math.random() < 0.3) return true
    
    // Ask follow-up if conversation is getting short
    return context.messageCount < 3 && Math.random() < 0.7
  }

  static getFollowUpQuestion(emotion: EmotionContext, context: ConversationContext): string {
    type EmotionQuestions = {
      [key: string]: string[]
    }

    const emotionQuestions: EmotionQuestions = {
      sad: [
        'What happened?',
        'Want to talk about it?',
        'When did you start feeling like this?',
        'Is there something specific bothering you?'
      ],
      excited: [
        'Tell me everything!',
        'What happened?',
        'How are you celebrating?',
        'That sounds amazing! Details?'
      ],
      anxious: [
        'What\'s making you anxious?',
        'Is there something specific worrying you?',
        'Want to talk through it?',
        'What usually helps you feel better?'
      ],
      frustrated: [
        'That sounds frustrating! What happened?',
        'Want to vent about it?',
        'What\'s bothering you most?',
        'That sucks. Tell me more?'
      ],
      romantic: [
        'Ooh tell me more!',
        'How did you meet?',
        'What are they like?',
        'Are you going to ask them out?'
      ]
    }

    const neutralQuestions = [
      'How was your day?',
      'What\'s on your mind?',
      'Anything interesting happening?',
      'What\'s new with you?'
    ]

    const questions = emotionQuestions[emotion.primary] || neutralQuestions
    return questions[Math.floor(Math.random() * questions.length)]
  }

  private static extractTopics(messages: ConversationMessage[]): string[] {
    const topics = new Set<string>()
    messages.forEach(msg => {
      if (msg.role === 'user') {
        const words = msg.content.toLowerCase().split(' ')
        words.forEach(word => {
          if (word.length > 4 && !this.isCommonWord(word)) {
            topics.add(word)
          }
        })
      }
    })
    return Array.from(topics).slice(0, 5)
  }

  private static determineFlow(totalMessages: number): 'opening' | 'building' | 'deep' | 'closing' {
    if (totalMessages < 4) return 'opening'
    if (totalMessages < 10) return 'building'
    if (totalMessages < 20) return 'deep'
    return 'closing'
  }

  private static isCommonWord(word: string): boolean {
    const common = ['the', 'and', 'you', 'that', 'was', 'for', 'are', 'with', 'his', 'they']
    return common.includes(word)
  }
}