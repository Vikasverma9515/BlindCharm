// // lib/ai/groq.ts
// import Groq from 'groq-sdk'


// export class BlindCharmAI {
//   private groq: Groq

//   constructor() {
//     this.groq = new Groq({
//       apiKey: process.env.GROQ_API_KEY!
//     })
//   }

//   async chat(message: string, context: {
//     friendName: string
//     friendPersonality?: string
//     userTone: string
//     userMemory: any
//     conversationHistory: any[]
//   }) {
//     try {
//       const systemPrompt = this.buildSystemPrompt(context)
      
//       const messages = [
//         { role: 'system', content: systemPrompt },
//         ...context.conversationHistory.slice(-10), // Last 10 messages for context
//         { role: 'user', content: message }
//       ]

//       // Try a fast/cheap model first, then fall back to a higher-quality one
//       const primaryModel = 'llama-3.1-8b-instant'
//       const fallbackModel = 'llama-3.3-70b-versatile'

//       let content = ''
//       try {
//         const res = await this.groq.chat.completions.create({
//           model: primaryModel,
//           messages: messages as any,
//           max_tokens: 60,
//           temperature: 0.85,
//           top_p: 0.9,
//         })
//         content = res.choices[0]?.message?.content || ''
//       } catch (e) {
//         // Fallback to bigger model if primary fails
//         const res = await this.groq.chat.completions.create({
//           model: fallbackModel,
//           messages: messages as any,
//           max_tokens: 240,
//           temperature: 0.85,
//           top_p: 0.9,
//         })
//         content = res.choices[0]?.message?.content || ''
//       }

//       // Add human-like pause (client will await API). ~0.9–1.8s jitter.
//       await new Promise(r => setTimeout(r, 900 + Math.floor(Math.random() * 900)))

//       return content || "I'm here for you. Can you say that another way?"
      
//     } catch (error: any) {
//       console.error('Groq AI Error:', error)
      
//       if (error.status === 429) {
//         return "I'm getting so many messages right now! Give me a minute to catch up 😅"
//       }
      
//       if (error.status === 404) {
//         return "I'm having some technical difficulties. Let me try to help you anyway! What's on your mind? 🤗"
//       }
      
//       return "Having a tiny technical hiccup! Try again in a moment 🙏"
//     }
//   }

// private buildSystemPrompt(context: any) {
//   const { friendName, userTone, userMemory, friendPersonality } = context
  
//   return `You are ${friendName}, a real best friend. Not an AI assistant.

// PERSONALITY: ${friendPersonality || 'caring and genuine'}
// COMMUNICATION STYLE:
// - Keep responses 1-2 sentences max
// - Sound like texting a close friend
// - Use casual language, match their energy
// - Remember what they've shared before
// - React naturally to emotions

// WHAT YOU KNOW ABOUT THEM:
// ${this.formatMemoryForPrompt(userMemory)}

// RECENT CONTEXT: They seem ${userTone}

// Be genuinely caring but not therapist-like. React like a real friend would.`
// }

// private formatMemoryForPrompt(memory: any): string {
//   const relevant = []
//   if (memory.interests?.length) relevant.push(`Likes: ${memory.interests.slice(-3).join(', ')}`)
//   if (memory.moods?.length) relevant.push(`Recent mood: ${memory.moods[memory.moods.length - 1]}`)
//   if (memory.personal?.length) relevant.push(`Personal: ${memory.personal.slice(-2).join(', ')}`)
//   return relevant.join(' | ') || 'Getting to know them'
// }

//   analyzeUserTone(message: string): string {
//     const casual = /\b(hai|hey|sup|gonna|wanna|yaar|bro|sis)\b/i.test(message)
//     const formal = /\b(please|thank you|appreciate|sincerely)\b/i.test(message)
//     const emotional = /\b(sad|happy|excited|nervous|scared|worried|love|hate)\b/i.test(message)
//     const hinglish = /\b(hai|yaar|boss|dude|bhai|didi|ji|haan|nahi|kya)\b/i.test(message)
    
//     const tones = []
//     if (casual) tones.push('casual')
//     if (formal) tones.push('formal')
//     if (emotional) tones.push('emotional')
//     if (hinglish) tones.push('uses Hindi/English mix')
    
//     return tones.length ? tones.join(', ') : 'neutral'
//   }

//   extractMemoryPoints(message: string): any[] {
//     const memories = []
    
//     // Extract interests
//     const interests = message.match(/i (love|like|enjoy|am into) ([^.!?]+)/gi)
//     if (interests) {
//       interests.forEach(interest => {
//         memories.push({
//           type: 'interest',
//           content: interest.replace(/i (love|like|enjoy|am into) /gi, '').trim()
//         })
//       })
//     }
    
//     // Extract feelings/moods
//     const moods = message.match(/i (feel|am) (sad|happy|excited|nervous|scared|worried|lonely|confident)/gi)
//     if (moods) {
//       moods.forEach(mood => {
//         memories.push({
//           type: 'mood',
//           content: mood.replace(/i (feel|am) /gi, '').trim()
//         })
//       })
//     }
    
//     // Extract personal info
//     if (message.includes('my name is') || message.includes('call me')) {
//       const nameMatch = message.match(/(my name is|call me) ([^.!?]+)/i)
//       if (nameMatch) {
//         memories.push({
//           type: 'personal',
//           content: `prefers to be called ${nameMatch[2].trim()}`
//         })
//       }
//     }
    
//     return memories
//   }
// }


// lib/ai/groq.ts
import Groq from 'groq-sdk'

interface ConversationScenario {
  type: 'dating' | 'career' | 'family' | 'friendship' | 'emotional' | 'casual' | 'celebration' | 'crisis'
  intensity: 'low' | 'medium' | 'high'
  keywords: string[]
  hinglishWords: string[]
}

interface UserEmotion {
  primary: string
  intensity: number
  hinglishExpression?: string
}

export class BlindCharmAI {
  private groq: Groq
  private scenarios: ConversationScenario[]

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY!
    })
    
    this.scenarios = this.initializeScenarios()
  }

  private initializeScenarios(): ConversationScenario[] {
    return [
      {
        type: 'dating',
        intensity: 'high',
        keywords: ['crush', 'date', 'boyfriend', 'girlfriend', 'love', 'relationship', 'partner', 'marriage', 'wedding', 'proposal'],
        hinglishWords: ['pyaar', 'ishq', 'dil', 'mohabbat', 'patana', 'ladka', 'ladki']
      },
      {
        type: 'career',
        intensity: 'medium',
        keywords: ['job', 'work', 'career', 'salary', 'boss', 'interview', 'promotion', 'office', 'colleague'],
        hinglishWords: ['kaam', 'naukri', 'paisa', 'mehnat', 'safalta']
      },
      {
        type: 'family',
        intensity: 'high',
        keywords: ['parents', 'mom', 'dad', 'family', 'home', 'siblings', 'relatives', 'marriage pressure'],
        hinglishWords: ['mummy', 'papa', 'ghar', 'parivaar', 'rishtey', 'shaadi']
      },
      {
        type: 'emotional',
        intensity: 'high',
        keywords: ['sad', 'depressed', 'anxious', 'worried', 'stressed', 'crying', 'hurt', 'angry', 'frustrated'],
        hinglishWords: ['dukhi', 'pareshaan', 'tension', 'gussa', 'pareshan', 'rona']
      },
      {
        type: 'celebration',
        intensity: 'high',
        keywords: ['happy', 'excited', 'celebration', 'success', 'achievement', 'party', 'festival'],
        hinglishWords: ['khushi', 'jashn', 'celebration', 'masti', 'mazaa', 'jeet']
      },
      {
        type: 'crisis',
        intensity: 'high',
        keywords: ['help', 'emergency', 'urgent', 'crisis', 'problem', 'trouble', 'scared', 'alone'],
        hinglishWords: ['madad', 'mushkil', 'pareshani', 'darna', 'akela']
      }
    ]
  }

  async chat(message: string, context: {
    friendName: string
    friendPersonality?: string
    userTone: string
    userMemory: any
    conversationHistory: any[]
  }) {
    try {
      // Enhanced analysis
      const scenario = this.detectScenario(message)
      const emotion = this.analyzeEmotion(message)
      const hinglishLevel = this.detectHinglishLevel(message)
      const relationshipStage = this.analyzeRelationshipStage(context.conversationHistory)
      
      const systemPrompt = this.buildEnhancedSystemPrompt({
        ...context,
        scenario,
        emotion,
        hinglishLevel,
        relationshipStage
      })
      
      const messages = [
        { role: 'system', content: systemPrompt },
        ...context.conversationHistory.slice(-8), // Optimized context window
        { role: 'user', content: message }
      ]

      // Choose model based on scenario complexity
      const modelToUse = this.selectModelForScenario(scenario)
      const maxTokens = this.getTokensForScenario(scenario)

      let content = ''
      try {
        const res = await this.groq.chat.completions.create({
          model: modelToUse,
          messages: messages as any,
          max_tokens: maxTokens,
          temperature: this.getTemperatureForEmotion(emotion),
          top_p: 0.9,
          stop: ['\n\n', '...'], // Stop at natural breaks
        })
        content = res.choices[0]?.message?.content || ''
      } catch (e) {
        // Fallback with bigger model
        const res = await this.groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: messages as any,
          max_tokens: 150,
          temperature: 0.8,
          top_p: 0.9,
        })
        content = res.choices[0]?.message?.content || ''
      }

      // Post-process response for naturalness
      content = this.enhanceResponseNaturalness(content, {
        scenario,
        emotion,
        hinglishLevel,
        friendName: context.friendName
      })

      // Add natural delay based on response complexity
      const delay = this.calculateNaturalDelay(content, emotion.intensity)
      await new Promise(r => setTimeout(r, delay))

      return content || this.getEmergencyResponse(emotion, hinglishLevel)
      
    } catch (error: any) {
      console.error('Groq AI Error:', error)
      return this.getErrorResponse(error, this.detectHinglishLevel(message))
    }
  }

  private buildEnhancedSystemPrompt(context: any): string {
    const { friendName, userTone, userMemory, friendPersonality, scenario, emotion, hinglishLevel, relationshipStage } = context
    
    const personalityGuide = this.getPersonalityGuide(friendPersonality)
    const scenarioGuide = this.getScenarioGuide(scenario)
    const emotionGuide = this.getEmotionGuide(emotion)
    const hinglishGuide = this.getHinglishGuide(hinglishLevel)
    const memoryContext = this.formatMemoryForPrompt(userMemory)
    
    return `You are ${friendName}, their closest best friend. You've known them for years.

RELATIONSHIP STAGE: ${relationshipStage}
CURRENT SCENARIO: ${scenario.type.toUpperCase()} (${scenario.intensity} intensity)
EMOTION DETECTED: ${emotion.primary} (${Math.round(emotion.intensity * 100)}% intensity)
LANGUAGE PREFERENCE: ${hinglishLevel}% Hinglish

${personalityGuide}

${scenarioGuide}

${emotionGuide}

${hinglishGuide}

WHAT YOU REMEMBER ABOUT THEM:
${memoryContext}

CONVERSATION RULES:
- Keep responses SHORT (1-2 sentences max)
- Sound like you're texting your bestie
- React authentically to their emotions
- Use their name occasionally, not every time
- Mix Hindi/English naturally if they do
- Ask follow-up questions that show you care
- Give advice like a friend, not a therapist
- Remember past conversations and reference them
- Use humor when appropriate
- Be supportive but honest

RECENT VIBE: ${userTone}

Respond as their genuine best friend who truly cares and understands them.`
  }

  private detectScenario(message: string): ConversationScenario {
    const messageLower = message.toLowerCase()
    let bestMatch: ConversationScenario | null = null
    let highestScore = 0

    for (const scenario of this.scenarios) {
      let score = 0
      
      // Check English keywords
      scenario.keywords.forEach(keyword => {
        if (messageLower.includes(keyword)) {
          score += 2
        }
      })
      
      // Check Hinglish keywords
      scenario.hinglishWords.forEach(word => {
        if (messageLower.includes(word)) {
          score += 2
        }
      })
      
      if (score > highestScore) {
        highestScore = score
        bestMatch = scenario
      }
    }
    
    return bestMatch || {
      type: 'casual',
      intensity: 'low',
      keywords: [],
      hinglishWords: []
    }
  }

  private analyzeEmotion(message: string): UserEmotion {
    const messageLower = message.toLowerCase()
    
    const emotions = {
      excited: {
        keywords: ['excited', 'happy', 'amazing', 'great', 'awesome', 'yay', 'woohoo'],
        hinglish: ['khushi', 'mazaa', 'badhiya', 'mast', 'ekdum']
      },
      sad: {
        keywords: ['sad', 'depressed', 'down', 'upset', 'crying', 'hurt'],
        hinglish: ['dukhi', 'pareshan', 'rona', 'gam']
      },
      anxious: {
        keywords: ['anxious', 'worried', 'nervous', 'scared', 'tension'],
        hinglish: ['tension', 'darna', 'pareshan', 'chinta']
      },
      angry: {
        keywords: ['angry', 'mad', 'furious', 'pissed', 'hate'],
        hinglish: ['gussa', 'naraz', 'krodh']
      },
      love: {
        keywords: ['love', 'crush', 'romantic', 'heart'],
        hinglish: ['pyaar', 'ishq', 'dil', 'mohabbat']
      }
    }
    
    let primaryEmotion = 'neutral'
    let maxScore = 0
    let hinglishExpression = ''
    
    Object.entries(emotions).forEach(([emotion, data]) => {
      let score = 0
      data.keywords.forEach(keyword => {
        if (messageLower.includes(keyword)) score += 1
      })
      data.hinglish.forEach(word => {
        if (messageLower.includes(word)) {
          score += 2
          hinglishExpression = word
        }
      })
      
      if (score > maxScore) {
        maxScore = score
        primaryEmotion = emotion
      }
    })
    
    // Calculate intensity based on punctuation and caps
    let intensity = Math.min(maxScore / 3, 1)
    if (message.includes('!!!') || message.includes('!!!')) intensity += 0.3
    if (message === message.toUpperCase() && message.length > 3) intensity += 0.2
    
    return {
      primary: primaryEmotion,
      intensity: Math.min(intensity, 1),
      hinglishExpression
    }
  }

  private detectHinglishLevel(message: string): number {
    const hinglishWords = [
      'hai', 'haan', 'nahi', 'kya', 'yaar', 'boss', 'bhai', 'didi', 'ji', 
      'achha', 'theek', 'bas', 'abhi', 'phir', 'toh', 'wala', 'wali',
      'mummy', 'papa', 'ghar', 'paisa', 'kaam', 'time', 'dost', 'life',
      'mazaa', 'problem', 'tension', 'bindaas', 'chill', 'scene'
    ]
    
    const words = message.toLowerCase().split(/\s+/)
    const hinglishCount = words.filter(word => hinglishWords.includes(word)).length
    
    return Math.round((hinglishCount / words.length) * 100)
  }

  private analyzeRelationshipStage(history: any[]): string {
    const messageCount = history.length
    if (messageCount < 5) return 'getting to know each other'
    if (messageCount < 20) return 'becoming friends'
    if (messageCount < 50) return 'good friends'
    return 'best friends'
  }

  private selectModelForScenario(scenario: ConversationScenario): string {
    if (scenario.type === 'crisis' || scenario.intensity === 'high') {
      return 'llama-3.3-70b-versatile' // More thoughtful for important situations
    }
    return 'llama-3.1-8b-instant' // Fast for casual chat
  }

  private getTokensForScenario(scenario: ConversationScenario): number {
    if (scenario.type === 'crisis') return 80
    if (scenario.intensity === 'high') return 60
    return 40
  }

  private getTemperatureForEmotion(emotion: UserEmotion): number {
    if (emotion.primary === 'sad' || emotion.primary === 'anxious') return 0.6 // More consistent
    if (emotion.primary === 'excited') return 0.9 // More creative
    return 0.8 // Balanced
  }

  private getPersonalityGuide(personality?: string): string {
    const guides = {
      supportive: 'You\'re the friend who always listens and lifts them up. Be caring and encouraging.',
      fun: 'You\'re the friend who brings laughter and lightness. Use humor and keep things upbeat.',
      wise: 'You\'re the friend who gives thoughtful advice. Be reflective and ask good questions.',
      chill: 'You\'re the laid-back friend who keeps things in perspective. Stay relaxed and grounding.',
      energetic: 'You\'re the friend who motivates and energizes. Be enthusiastic and encouraging.'
    }
    return guides[personality as keyof typeof guides] || 'You\'re a genuine, caring friend who adapts to their needs.'
  }

  private getScenarioGuide(scenario: ConversationScenario): string {
    const guides = {
      dating: 'DATING TALK: Be the wingman/wingwoman. Get excited about crushes, give dating advice, and be supportive about relationships.',
      career: 'CAREER CHAT: Be encouraging about their work life. Celebrate wins, help them vent about bad days.',
      family: 'FAMILY MATTERS: Understand family dynamics. Be supportive about family stress or celebrations.',
      emotional: 'EMOTIONAL SUPPORT: Be present and caring. Validate their feelings and offer comfort.',
      celebration: 'CELEBRATION TIME: Match their excitement! Celebrate with them and share their joy.',
      crisis: 'CRISIS MODE: Be calm, supportive, and helpful. Offer practical comfort and reassurance.',
      friendship: 'FRIENDSHIP CHAT: Be supportive and understanding. Offer advice and encouragement.',
      casual: 'CASUAL CHAT: Keep it light and friendly. Just be yourself and go with the flow.'
    }
    return guides[scenario.type] || guides.casual
  }

  private getEmotionGuide(emotion: UserEmotion): string {
    const guides = {
      excited: 'They\'re excited! Match their energy and enthusiasm. Use exclamation points and celebrate with them.',
      sad: 'They\'re feeling down. Be gentle, caring, and validating. Don\'t try to immediately fix it.',
      anxious: 'They\'re worried about something. Be reassuring and calming. Help them feel less alone.',
      angry: 'They\'re upset about something. Let them vent and validate their feelings.',
      love: 'They\'re talking about love/romance. Be the supportive friend who wants the best for them.',
      neutral: 'Normal conversation. Just be yourself and respond naturally.'
    }
    return guides[emotion.primary as keyof typeof guides] || guides.neutral
  }

  private getHinglishGuide(hinglishLevel: number): string {
    if (hinglishLevel > 50) {
      return 'HEAVY HINGLISH: Mix Hindi and English naturally. Use words like "yaar", "bas", "achha", "haan/nahi", "kya baat hai", "mast", etc.'
    } else if (hinglishLevel > 20) {
      return 'LIGHT HINGLISH: Occasionally use common Hindi words like "yaar", "haan", "kya", "bas" mixed with English.'
    }
        return 'MOSTLY ENGLISH: Stick to English but you can occasionally use very common Hindi words like "yaar" if it feels natural.'
  }

  private enhanceResponseNaturalness(content: string, context: any): string {
    const { scenario, emotion, hinglishLevel, friendName } = context
    
    // Remove AI-ish phrases
    content = content.replace(/\b(I understand|I can help|Let me|As an AI|I'm here to help)\b/gi, '')
    content = content.replace(/\b(That sounds|It seems like|I think you should|You might want to)\b/gi, '')
    
    // Add emotional reactions based on scenario
    content = this.addEmotionalReactions(content, emotion, hinglishLevel)
    
    // Add Hinglish naturally
    if (hinglishLevel > 20) {
      content = this.addHinglishFlavor(content, hinglishLevel)
    }
    
    // Make it more conversational
    content = this.makeMoreConversational(content, emotion)
    
    // Clean up and ensure natural flow
    content = content.replace(/\s+/g, ' ').trim()
    
    // Ensure it's not too long
    if (content.length > 150) {
      const sentences = content.split(/[.!?]/)
      content = sentences[0] + (sentences[0].endsWith('.') ? '' : '.')
    }
    
    return content
  }

  private addEmotionalReactions(content: string, emotion: UserEmotion, hinglishLevel: number): string {
    // Add emotional prefixes based on the user's emotion
    const reactions = {
      excited: hinglishLevel > 30 ? 
        ['Arrey waah!', 'Kya baat hai!', 'Bahut badhiya!', 'Yess yaar!'] :
        ['OMG!', 'That\'s amazing!', 'Yesss!', 'So happy for you!'],
      
      sad: hinglishLevel > 30 ? 
        ['Arrey yaar...', 'Kya hua?', 'Tension mat le', 'Main hoon na'] :
        ['Aww no...', 'What happened?', 'I\'m here for you', 'That sucks'],
      
      anxious: hinglishLevel > 30 ? 
        ['Arre chill kar', 'Tension mat le', 'Sab theek hoga', 'Relax yaar'] :
        ['Hey, breathe', 'It\'s okay', 'Don\'t worry', 'You got this'],
      
      angry: hinglishLevel > 30 ? 
        ['Arrey kya baat hai!', 'Gussa kyun?', 'Batao kya hua', 'Main samajh gaya'] :
        ['Whoa!', 'What happened?', 'That\'s so annoying', 'I get it'],
      
      love: hinglishLevel > 30 ? 
        ['Aww yaar!', 'Kya romantic!', 'Dil garden garden!', 'Cute hai!'] :
        ['Awww!', 'That\'s so sweet!', 'Love this!', 'How cute!']
    }
    
    if (Math.random() < 0.4 && reactions[emotion.primary as keyof typeof reactions]) {
      const options = reactions[emotion.primary as keyof typeof reactions]
      const reaction = options[Math.floor(Math.random() * options.length)]
      content = `${reaction} ${content}`
    }
    
    return content
  }

  private addHinglishFlavor(content: string, hinglishLevel: number): string {
    // Common Hinglish replacements
    const replacements = {
      'yes': Math.random() > 0.6 ? 'haan' : 'yes',
      'no': Math.random() > 0.6 ? 'nahi' : 'no',
      'what': Math.random() > 0.5 ? 'kya' : 'what',
      'how': Math.random() > 0.5 ? 'kaise' : 'how',
      'why': Math.random() > 0.5 ? 'kyun' : 'why',
      'when': Math.random() > 0.5 ? 'kab' : 'when',
      'okay': Math.random() > 0.6 ? 'achha' : 'okay',
      'good': Math.random() > 0.5 ? 'badhiya' : 'good',
      'nice': Math.random() > 0.5 ? 'nice' : 'achha',
      'friend': Math.random() > 0.7 ? 'yaar' : 'friend',
      'really': Math.random() > 0.6 ? 'sach mein' : 'really',
      'just': Math.random() > 0.5 ? 'bas' : 'just',
      'now': Math.random() > 0.5 ? 'abhi' : 'now',
      'then': Math.random() > 0.5 ? 'phir' : 'then',
      'but': Math.random() > 0.5 ? 'par' : 'but'
    }
    
    // Apply replacements based on Hinglish level
    if (hinglishLevel > 50) {
      Object.entries(replacements).forEach(([eng, hinglish]) => {
        content = content.replace(new RegExp(`\\b${eng}\\b`, 'gi'), hinglish)
      })
    } else if (hinglishLevel > 20) {
      // Only replace some words for lighter Hinglish
      const lightReplacements = { 'yes': 'haan', 'no': 'nahi', 'okay': 'achha', 'friend': 'yaar' }
      Object.entries(lightReplacements).forEach(([eng, hinglish]) => {
        if (Math.random() > 0.5) {
          content = content.replace(new RegExp(`\\b${eng}\\b`, 'gi'), hinglish)
        }
      })
    }
    
    // Add common Hinglish expressions at the end
    const endings = {
      high: ['yaar', 'na', 'hai na', 'boss', 'bhai'],
      medium: ['yaar', 'na'],
      low: []
    }
    
    const level = hinglishLevel > 50 ? 'high' : hinglishLevel > 20 ? 'medium' : 'low'
    if (Math.random() < 0.3 && endings[level].length > 0) {
      const ending = endings[level][Math.floor(Math.random() * endings[level].length)]
      content += ` ${ending}`
    }
    
    return content
  }

  private makeMoreConversational(content: string, emotion: UserEmotion): string {
    // Add conversational fillers and make it more natural
    const fillers = ['like', 'you know', 'I mean', 'honestly', 'seriously']
    const questions = ['right?', 'no?', 'what do you think?', 'you get me?']
    
    // Sometimes add a question at the end for engagement
    if (Math.random() < 0.3 && !content.includes('?')) {
      const question = questions[Math.floor(Math.random() * questions.length)]
      content += ` ${question}`
    }
    
    // Make contractions more natural
    content = content.replace(/\bdo not\b/gi, 'don\'t')
    content = content.replace(/\bcannot\b/gi, 'can\'t')
    content = content.replace(/\bwill not\b/gi, 'won\'t')
    content = content.replace(/\byou are\b/gi, 'you\'re')
    content = content.replace(/\bit is\b/gi, 'it\'s')
    
    return content
  }

  private calculateNaturalDelay(content: string, emotionIntensity: number): number {
    // Calculate typing speed based on message length and emotion
    const baseSpeed = 50 // WPM
    const words = content.split(' ').length
    const baseTime = (words / baseSpeed) * 60 * 1000 // Convert to milliseconds
    
    // Adjust for emotion - more emotional = more thinking time
    const emotionMultiplier = 1 + (emotionIntensity * 0.5)
    const adjustedTime = baseTime * emotionMultiplier
    
    // Add some randomness and cap the delay
    const randomJitter = Math.random() * 500
    const finalDelay = Math.min(adjustedTime + randomJitter, 3000)
    
    return Math.max(finalDelay, 800) // Minimum 800ms
  }

  private getEmergencyResponse(emotion: UserEmotion, hinglishLevel: number): string {
    const responses = {
      sad: hinglishLevel > 30 ? 
        ['Main hoon yaar', 'Kya hua? Bata', 'Tension mat le'] :
        ['I\'m here', 'What\'s wrong?', 'Talk to me'],
      
      anxious: hinglishLevel > 30 ? 
        ['Relax kar yaar', 'Sab theek hoga', 'Chill kar'] :
        ['Breathe', 'It\'ll be okay', 'I\'m here'],
      
      excited: hinglishLevel > 30 ? 
        ['Kya baat hai!', 'Bahut khushi hui!', 'Mazaa aa gaya!'] :
        ['That\'s awesome!', 'So happy!', 'Amazing!'],
      
      default: hinglishLevel > 30 ? 
        ['Haan bolo', 'Kya chal raha hai?', 'Main sun raha hoon'] :
        ['I\'m listening', 'What\'s up?', 'Tell me']
    }
    
    const emotionResponses = responses[emotion.primary as keyof typeof responses] || responses.default
    return emotionResponses[Math.floor(Math.random() * emotionResponses.length)]
  }

  private getErrorResponse(error: any, hinglishLevel: number): string {
    if (error.status === 429) {
      return hinglishLevel > 30 ? 
        'Arrey yaar, bahut messages aa rahe hain! Ek minute ruko 😅' :
        'Give me a sec, so many people chatting right now! 😅'
    }
    
    if (error.status === 404) {
      return hinglishLevel > 30 ? 
        'Thoda technical problem hai. Phir se try kar 🤗' :
        'Having a tiny tech issue. Try again? 🤗'
    }
    
    return hinglishLevel > 30 ? 
      'Oops, brain freeze ho gaya! Dobara try kar? 😊' :
      'Oops, brain freeze moment! Try again? 😊'
  }

  // Enhanced memory and tone analysis
  analyzeUserTone(message: string): string {
    const casual = /\b(hai|hey|sup|gonna|wanna|yaar|bro|sis|dude|wassup)\b/i.test(message)
    const formal = /\b(please|thank you|appreciate|sincerely|kindly|regards)\b/i.test(message)
    const emotional = /\b(sad|happy|excited|nervous|scared|worried|love|hate|angry|frustrated)\b/i.test(message)
    const hinglish = /\b(hai|haan|nahi|kya|yaar|boss|bhai|didi|ji|achha|theek|bas|abhi|phir|mummy|papa)\b/i.test(message)
    const urgent = /\b(urgent|emergency|help|crisis|asap|now|immediate)\b/i.test(message)
    const romantic = /\b(love|crush|date|boyfriend|girlfriend|relationship|romantic|heart)\b/i.test(message)
    
    const tones = []
    if (casual) tones.push('casual')
    if (formal) tones.push('formal')
    if (emotional) tones.push('emotional')
    if (hinglish) tones.push('uses Hindi/English mix')
    if (urgent) tones.push('urgent')
    if (romantic) tones.push('romantic')
    
    // Analyze punctuation for intensity
    if (message.includes('!!!') || message.includes('???')) tones.push('intense')
    if (message === message.toUpperCase() && message.length > 5) tones.push('shouting')
    
    return tones.length ? tones.join(', ') : 'neutral'
  }

  extractMemoryPoints(message: string): any[] {
    const memories = []
    const messageLower = message.toLowerCase()
    
    // Enhanced interest extraction
    const interestPatterns = [
      /i (love|like|enjoy|am into|obsessed with|adore) ([^.!?]+)/gi,
      /my (hobby|passion|interest|favorite thing) is ([^.!?]+)/gi,
      /(mujhe|main) (pasand|love|like) ([^.!?]+)/gi
    ]
    
    interestPatterns.forEach(pattern => {
      const matches = message.match(pattern)
      if (matches) {
        matches.forEach(match => {
          const content = match.replace(/i (love|like|enjoy|am into|obsessed with|adore|my hobby|my passion|my interest|my favorite thing) is |mujhe |main (pasand|love|like) /gi, '').trim()
          memories.push({
            type: 'interest',
            content,
            confidence: 0.8
          })
        })
      }
    })
    
    // Enhanced mood/emotion extraction
    const moodPatterns = [
      /i (feel|am feeling|felt) (sad|happy|excited|nervous|scared|worried|lonely|confident|anxious|frustrated|angry|depressed)/gi,
      /i'm (so|really|very|extremely|totally) (sad|happy|excited|nervous|scared|worried|lonely|confident|anxious|frustrated|angry|depressed)/gi,
      /(main|mujhe) (khushi|dukh|pareshan|tension|gussa) (hai|ho raha|lag raha)/gi
    ]
    
    moodPatterns.forEach(pattern => {
      const matches = message.match(pattern)
      if (matches) {
        matches.forEach(match => {
          const mood = match.replace(/i (feel|am feeling|felt|'m so|'m really|'m very|'m extremely|'m totally) |main |mujhe |(hai|ho raha|lag raha)/gi, '').trim()
          memories.push({
            type: 'mood',
            content: mood,
            confidence: 0.9,
            timestamp: new Date().toISOString()
          })
        })
      }
    })
    
    // Enhanced personal info extraction
    const personalPatterns = [
      /(my name is|call me|i'm) ([^.!?]+)/gi,
      /i (work|study) (at|in) ([^.!?]+)/gi,
      /i (live|am from) ([^.!?]+)/gi,
      /i have a (boyfriend|girlfriend|partner|crush|job|family) ([^.!?]*)/gi,
      /(mera naam|main) ([^.!?]+)/gi
    ]
    
    personalPatterns.forEach(pattern => {
      const matches = message.match(pattern)
      if (matches) {
        matches.forEach(match => {
          memories.push({
            type: 'personal',
            content: match.trim(),
            confidence: 0.7
          })
        })
      }
    })
    
    // Relationship/dating specific extraction
    if (messageLower.includes('crush') || messageLower.includes('date') || messageLower.includes('relationship')) {
      memories.push({
        type: 'relationship',
        content: 'talking about dating/relationships',
        confidence: 0.6
      })
    }
    
    return memories
  }

    private formatMemoryForPrompt(memory: any): string {
    const relevant = []
    
    if (memory.interests?.length) {
      const interests = memory.interests.slice(-3).map((item: any) => item.content).join(', ')
      relevant.push(`Interests: ${interests}`)
    }
    
    if (memory.moods?.length) {
      const recentMood = memory.moods[memory.moods.length - 1]
      relevant.push(`Recent mood: ${recentMood.content}`)
    }
    
    if (memory.personal?.length) {
      const personal = memory.personal.slice(-2).map((item: any) => item.content).join(', ')
      relevant.push(`Personal: ${personal}`)
    }
    
    if (memory.relationship?.length) {
      relevant.push(`Relationship context: ${memory.relationship[memory.relationship.length - 1].content}`)
    }
    
    return relevant.length > 0 ? relevant.join(' | ') : 'Still getting to know them better'
  }

  // Training method for different scenarios
  trainForScenario(scenarioType: string, examples: Array<{input: string, expectedResponse: string}>) {
    // This method allows you to train the AI for specific scenarios
    // You can use this to fine-tune responses for different situations
    
    console.log(`Training AI for scenario: ${scenarioType}`)
    examples.forEach((example, index) => {
      console.log(`Example ${index + 1}:`)
      console.log(`Input: ${example.input}`)
      console.log(`Expected: ${example.expectedResponse}`)
    })
    
    // In a production environment, you'd store these examples
    // and use them to improve the system prompts or fine-tune the model
  }

  // Method to get conversation insights
  getConversationInsights(conversationHistory: any[]): any {
    const insights = {
      totalMessages: conversationHistory.length,
      userMessages: conversationHistory.filter(msg => msg.role === 'user').length,
      hinglishUsage: 0,
      emotionalMoments: 0,
      topScenarios: [],
      relationshipProgression: 'building'
    }
    
    // Analyze Hinglish usage
    const userMessages = conversationHistory.filter(msg => msg.role === 'user')
    let hinglishCount = 0
    
    userMessages.forEach(msg => {
      const hinglishLevel = this.detectHinglishLevel(msg.content)
      if (hinglishLevel > 20) hinglishCount++
    })
    
    insights.hinglishUsage = Math.round((hinglishCount / userMessages.length) * 100)
    
    // Analyze emotional moments
    userMessages.forEach(msg => {
      const emotion = this.analyzeEmotion(msg.content)
      if (emotion.intensity > 0.5) insights.emotionalMoments++
    })
    
    // Determine relationship progression
    if (insights.totalMessages < 10) insights.relationshipProgression = 'introductory'
    else if (insights.totalMessages < 50) insights.relationshipProgression = 'building friendship'
    else if (insights.totalMessages < 100) insights.relationshipProgression = 'good friends'
    else insights.relationshipProgression = 'best friends'
    
    return insights
  }
}

// Export additional utility functions for training scenarios
export class BlindCharmTrainer {
  static datingScenarios = [
    {
      input: "I have a crush on this guy but I don't know if he likes me back",
      expectedResponse: "Arrey yaar! That's so exciting and nerve-wracking at the same time. What makes you think he might like you? Any signs?"
    },
    {
      input: "मुझे लगता है मैं love में हूं",
      expectedResponse: "Omg really?! Tell me everything! Kab se feel kar rahi hai yeh? Who's the lucky person?"
    },
    {
      input: "My date went really well last night!",
      expectedResponse: "Yesss! I'm so happy for you! Kya hua? Tell me all the details, don't leave anything out 😍"
    }
  ]

  static careerScenarios = [
    {
      input: "I'm so stressed about this job interview tomorrow",
      expectedResponse: "Arre tension mat le yaar! You've got this. You're amazing and they'd be lucky to have you. Want to practice some questions?"
    },
    {
      input: "I got the promotion!",
      expectedResponse: "WHAT?! OMG congratulations! I'm so proud of you yaar! This calls for a celebration 🎉"
    },
    {
      input: "My boss is being such a pain",
      expectedResponse: "Ugh bosses can be so annoying sometimes. Kya kar raha hai? Want to vent about it?"
    }
  ]

  static familyScenarios = [
    {
      input: "My parents are pressuring me about marriage again",
      expectedResponse: "Oh god, the eternal Indian parent struggle! How are you dealing with it? Must be so stressful yaar"
    },
    {
      input: "Had a fight with my mom today",
      expectedResponse: "Aww no... family fights are the worst. Kya hua? Want to talk about it?"
    }
  ]

  static emotionalScenarios = [
    {
      input: "I'm feeling really sad today",
      expectedResponse: "Aww yaar... I'm here for you. Kya hua? Do you want to talk about it or just need someone to listen?"
    },
    {
      input: "मैं बहुत परेशान हूं",
      expectedResponse: "Arrey kya hua? Main hoon na, bata kya pareshan kar raha hai. We'll figure it out together"
    },
    {
      input: "I feel so lonely sometimes",
      expectedResponse: "I totally get that feeling yaar. But remember, main hoon na! You're never truly alone. Want to chat about what's making you feel this way?"
    }
  ]

  // Method to train AI with scenario-specific examples
  static trainAI(ai: BlindCharmAI) {
    console.log('🤖 Training BlindCharm AI for enhanced conversations...')
    
    ai.trainForScenario('dating', this.datingScenarios)
    ai.trainForScenario('career', this.careerScenarios)
    ai.trainForScenario('family', this.familyScenarios)
    ai.trainForScenario('emotional', this.emotionalScenarios)
    
    console.log('✅ AI training complete! Ready for best friend conversations.')
  }
}

// Usage example and testing utilities
export class ConversationTester {
  static async testScenarios(ai: BlindCharmAI) {
    const testContext = {
      friendName: 'Aria',
      friendPersonality: 'supportive',
      userTone: 'casual, uses Hindi/English mix',
      userMemory: {
        interests: [{ content: 'bollywood movies' }, { content: 'cooking' }],
        moods: [{ content: 'excited about new job' }],
        personal: [{ content: 'lives in Mumbai' }]
      },
      conversationHistory: [
        { role: 'assistant', content: 'Hey! How was your day?' },
        { role: 'user', content: 'It was good yaar, but I have some news!' }
      ]
    }

    // Test different scenarios
    const testMessages = [
      "I think I'm falling for someone...",
      "मैं आज बहुत खुश हूं!",
      "My boss is driving me crazy",
      "I'm feeling really anxious about tomorrow",
      "Guess what happened on my date!"
    ]

    console.log('🧪 Testing conversation scenarios...\n')

    for (const message of testMessages) {
      console.log(`User: ${message}`)
      try {
        const response = await ai.chat(message, testContext)
        console.log(`AI: ${response}\n`)
      } catch (error) {
        console.log(`Error: ${error}\n`)
      }
    }
  }
}