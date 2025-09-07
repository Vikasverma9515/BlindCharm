export interface EmotionContext {
  primary: string
  intensity: number
  keywords: string[]
  urgency: 'low' | 'medium' | 'high'
}

interface EmotionPattern {
  keywords: string[]
  intensity: string[]
}

interface EmotionPatterns {
  [key: string]: EmotionPattern
}

export class EmotionDetector {
  private static emotionPatterns: EmotionPatterns = {
    sad: {
      keywords: ['sad', 'down', 'depressed', 'crying', 'tears', 'hurt', 'pain', 'lonely', 'empty', 'broken', 'devastated'],
      intensity: ['a bit', 'really', 'very', 'extremely', 'completely']
    },
    excited: {
      keywords: ['excited', 'amazing', 'awesome', 'great', 'fantastic', 'love', 'happy', 'thrilled', 'ecstatic'],
      intensity: ['so', 'really', 'super', 'extremely', 'absolutely']
    },
    anxious: {
      keywords: ['anxious', 'worried', 'nervous', 'scared', 'afraid', 'stress', 'panic', 'overwhelmed'],
      intensity: ['a little', 'quite', 'very', 'extremely', 'really']
    },
    frustrated: {
      keywords: ['angry', 'mad', 'frustrated', 'annoyed', 'pissed', 'hate', 'furious', 'irritated'],
      intensity: ['a bit', 'really', 'so', 'extremely', 'totally']
    },
    confused: {
      keywords: ['confused', 'lost', 'don\'t know', 'unsure', 'mixed up', 'puzzled', 'unclear'],
      intensity: ['a bit', 'really', 'completely', 'totally', 'so']
    },
    romantic: {
      keywords: ['love', 'crush', 'date', 'relationship', 'boyfriend', 'girlfriend', 'partner', 'romantic', 'attracted'],
      intensity: ['really', 'so', 'deeply', 'madly', 'totally']
    }
  }

  static detect(message: string): EmotionContext {
    const messageLower = message.toLowerCase()
    let bestMatch = { emotion: 'neutral', score: 0, keywords: [] as string[], intensity: 0 }

    Object.entries(this.emotionPatterns).forEach(([emotion, data]) => {
      let score = 0
      const foundKeywords: string[] = []
      let intensityLevel = 0

      // Check for emotion keywords
      data.keywords.forEach((keyword: string) => {
        if (messageLower.includes(keyword)) {
          score += 2
          foundKeywords.push(keyword)
        }
      })

      // Check for intensity modifiers
      data.intensity.forEach((intensifier: string, index: number) => {
        if (messageLower.includes(intensifier)) {
          intensityLevel = Math.max(intensityLevel, index + 1)
          score += 1
        }
      })

      if (score > bestMatch.score) {
        bestMatch = { emotion, score, keywords: foundKeywords, intensity: intensityLevel }
      }
    })

    const urgency = this.detectUrgency(message, bestMatch.emotion)
    
    return {
      primary: bestMatch.emotion,
      intensity: bestMatch.intensity / 5, // Normalize to 0-1
      keywords: bestMatch.keywords,
      urgency
    }
  }

  private static detectUrgency(message: string, emotion: string): 'low' | 'medium' | 'high' {
    const urgentWords = ['help', 'urgent', 'emergency', 'now', 'immediately', 'crisis', 'desperate']
    const messageLower = message.toLowerCase()
    
    const hasUrgentWords = urgentWords.some(word => messageLower.includes(word))
    const hasMultipleExclamations = (message.match(/!/g) || []).length > 2
    const isHighIntensityEmotion = ['sad', 'anxious', 'frustrated'].includes(emotion)
    
    if (hasUrgentWords || hasMultipleExclamations) return 'high'
    if (isHighIntensityEmotion) return 'medium'
    return 'low'
  }
}