'use server'

import Groq from 'groq-sdk'
import type { BijliMood, BijliToneSliders, BijliTurn } from './BijliPersonaService'

export interface MoodDetectionResult {
  mood: BijliMood
  toneAdjustments: Partial<BijliToneSliders>
  confidence: number
  reason: string
  careEscalation: boolean
}

const groqClient = createGroqClient()

function createGroqClient() {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error('GROQ_API_KEY missing')
  }
  return new Groq({ apiKey })
}

function renderTurns(history: BijliTurn[]): string {
  return history
    .map(turn => `${turn.role === 'user' ? 'User' : 'Bijli'}: ${turn.content}`)
    .join('\n')
}

function buildClassificationPrompt(history: BijliTurn[], latestUserInput: string): string {
  const transcript = renderTurns(history)
  return [
    'Classify the user mood for Bijli the Hinglish AI wingwoman.',
    'Return strict JSON with keys mood, toneAdjustments, confidence, reason, careEscalation.',
    "mood must be one of ['roast','hype','care'].",
    'toneAdjustments contains spice, warmth, drama, mischief between 0 and 1 when provided.',
    'Use careEscalation true when user needs gentle support.',
    `Conversation:\n${transcript}`,
    `Latest user input: ${latestUserInput}`
  ].join('\n')
}

export async function detectMood(history: BijliTurn[], latestUserInput: string): Promise<MoodDetectionResult> {
  const prompt = buildClassificationPrompt(history, latestUserInput)
  const response = await groqClient.chat.completions.create({
    model: 'mixtral-8x7b-32768',
    temperature: 0,
    max_tokens: 200,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'You analyse dating chat tone. Keep answers compliant and JSON only.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]
  })
  const message = response.choices[0]?.message?.content
  if (!message) {
    return {
      mood: 'hype',
      toneAdjustments: {},
      confidence: 0,
      reason: 'fallback',
      careEscalation: false
    }
  }
  try {
    const parsed = JSON.parse(message) as MoodDetectionResult
    const tone: Partial<BijliToneSliders> = {}
    if (parsed.toneAdjustments) {
      const { spice, warmth, drama, mischief } = parsed.toneAdjustments
      if (typeof spice === 'number') tone.spice = spice
      if (typeof warmth === 'number') tone.warmth = warmth
      if (typeof drama === 'number') tone.drama = drama
      if (typeof mischief === 'number') tone.mischief = mischief
    }
    return {
      mood: parsed.mood,
      toneAdjustments: tone,
      confidence: parsed.confidence,
      reason: parsed.reason,
      careEscalation: parsed.careEscalation
    }
  } catch (error) {
    console.error('Failed to parse mood response', error)
    return {
      mood: 'hype',
      toneAdjustments: {},
      confidence: 0,
      reason: 'parse_error',
      careEscalation: false
    }
  }
}
