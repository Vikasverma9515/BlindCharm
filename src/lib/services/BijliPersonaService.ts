import { createHash } from 'crypto'

export type BijliMood = 'roast' | 'hype' | 'care'

export interface BijliToneSliders {
  spice: number
  warmth: number
  drama: number
  mischief: number
}

export interface BijliSessionMemory {
  insideJokes: string[]
  loyaltyLevel: 'spark' | 'steady' | 'bestie' | 'ride_or_die'
  favoriteRoasts: string[]
  supportMoments: string[]
}

export interface BijliHighlight {
  id: string
  line: string
  category: 'punchline' | 'support' | 'vibe'
  timestamp: string
}

export interface BijliVibePack {
  id: string
  label: string
  memeDrop: string
  bollywoodRef: string
  buzzwords: string[]
}

export interface BijliSessionState {
  mood: BijliMood
  tone: BijliToneSliders
  memory: BijliSessionMemory
  highlights: BijliHighlight[]
  vibePack: BijliVibePack
  loyaltyScore: number
}

export interface BijliTurn {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  mood?: BijliMood
}

export interface BijliPromptRequest {
  history: BijliTurn[]
  userInput: string
  sessionState: BijliSessionState
  moodOverride?: BijliMood
  toneOverride?: Partial<BijliToneSliders>
}

const defaultTone: BijliToneSliders = {
  spice: 0.7,
  warmth: 0.6,
  drama: 0.65,
  mischief: 0.75
}

const defaultMemory: BijliSessionMemory = {
  insideJokes: [],
  loyaltyLevel: 'spark',
  favoriteRoasts: [],
  supportMoments: []
}

const vibePacks: BijliVibePack[] = [
  {
    id: 'monsoon-meme-rain',
    label: 'Monsoon Meme Rain',
    memeDrop: 'Koffee With Karan meltdown gifs',
    bollywoodRef: 'Jab We Met ke Geet level chaos',
    buzzwords: ['itni bhi kya jaldi', 'delulu nehi, powerful', 'main character']
  },
  {
    id: 'festival-dhamaka',
    label: 'Festival Dhamaka',
    memeDrop: 'Govinda dance loops',
    bollywoodRef: 'Dilwale Dulhania ka sarson field energy',
    buzzwords: ['full power vibes', 'yaar tu icon hai', 'no chhoti baat']
  },
  {
    id: 'lazy-sunday-reel',
    label: 'Lazy Sunday Reel',
    memeDrop: 'K3G Poo eye-roll clips',
    bollywoodRef: 'Yeh Jawaani Hai Deewani hillside nostalgia',
    buzzwords: ['soft life pending', 'snack aur nap', 'thoda chill kar']
  }
]

const moodSlang: Record<BijliMood, string[]> = {
  roast: ['acha baccha', 'power saver mode', 'thoda toh sharam karo', 'level pro-max gaddari'],
  hype: ['lit AF', 'scene solid', 'full send energy', 'bijli beam'],
  care: ['sun yaar', 'aaj tu meri VIP list me', 'ek tight hug', 'detox lele']
}

function clamp(value: number): number {
  if (value < 0) return 0
  if (value > 1) return 1
  return Number(value.toFixed(2))
}

function normaliseTone(sliders: BijliToneSliders): BijliToneSliders {
  return {
    spice: clamp(sliders.spice),
    warmth: clamp(sliders.warmth),
    drama: clamp(sliders.drama),
    mischief: clamp(sliders.mischief)
  }
}

function pickVibePack(date: Date): BijliVibePack {
  const dayIndex = date.getUTCDate() % vibePacks.length
  return vibePacks[dayIndex]
}

function hashSeed(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function stablePick(values: string[], seed: string): string {
  if (values.length === 0) return ''
  const index = hashSeed(seed) % values.length
  return values[index]
}

function trimHistory(history: BijliTurn[], limit = 20): BijliTurn[] {
  if (history.length <= limit) return history
  return history.slice(history.length - limit)
}

function renderHistory(history: BijliTurn[]): string {
  return history
    .map(turn => `${turn.role === 'user' ? 'User' : 'Bijli'}: ${turn.content}`)
    .join('\n')
}

function renderMemories(memory: BijliSessionMemory): string {
  const jokes = memory.insideJokes.slice(-3).join(' | ') || 'n/a'
  const roasts = memory.favoriteRoasts.slice(-3).join(' | ') || 'n/a'
  const support = memory.supportMoments.slice(-2).join(' | ') || 'n/a'
  return `Inside jokes: ${jokes}\nFavourite roasts: ${roasts}\nTop support: ${support}`
}

function renderHighlights(highlights: BijliHighlight[]): string {
  if (highlights.length === 0) return 'none yet'
  return highlights
    .slice(-3)
    .map(highlight => `${highlight.category.toUpperCase()}: ${highlight.line}`)
    .join(' | ')
}

export interface BijliPromptPayload {
  prompt: string
  slangToken: string
  mood: BijliMood
  vibePack: BijliVibePack
}

export class BijliPersonaEngine {
  private state: BijliSessionState

  constructor(initial?: Partial<BijliSessionState>) {
    const vibePack = initial?.vibePack || pickVibePack(new Date())
    this.state = {
      mood: initial?.mood || 'hype',
      tone: normaliseTone(initial?.tone || defaultTone),
      memory: initial?.memory || defaultMemory,
      highlights: initial?.highlights || [],
      vibePack,
      loyaltyScore: initial?.loyaltyScore ?? 0
    }
  }

  getState(): BijliSessionState {
    return this.state
  }

  updateMood(mood: BijliMood): void {
    this.state = { ...this.state, mood }
  }

  mergeTone(tone: Partial<BijliToneSliders>): void {
    this.state = {
      ...this.state,
      tone: normaliseTone({ ...this.state.tone, ...tone })
    }
  }

  upsertMemory(memory: Partial<BijliSessionMemory>): void {
    this.state = {
      ...this.state,
      memory: {
        ...this.state.memory,
        ...memory,
        insideJokes: memory.insideJokes ?? this.state.memory.insideJokes,
        favoriteRoasts: memory.favoriteRoasts ?? this.state.memory.favoriteRoasts,
        supportMoments: memory.supportMoments ?? this.state.memory.supportMoments
      }
    }
  }

  pushHighlight(highlight: BijliHighlight): void {
    const highlights = [...this.state.highlights, highlight].slice(-12)
    this.state = { ...this.state, highlights }
  }

  refreshVibePack(date: Date): void {
    this.state = { ...this.state, vibePack: pickVibePack(date) }
  }

  adjustLoyalty(delta: number): void {
    const score = this.state.loyaltyScore + delta
    this.state = { ...this.state, loyaltyScore: Math.max(0, Math.min(100, score)) }
    if (score >= 75) this.state.memory.loyaltyLevel = 'ride_or_die'
    else if (score >= 45) this.state.memory.loyaltyLevel = 'bestie'
    else if (score >= 20) this.state.memory.loyaltyLevel = 'steady'
    else this.state.memory.loyaltyLevel = 'spark'
  }

  buildPrompt(request: BijliPromptRequest): BijliPromptPayload {
    const mood = request.moodOverride || this.state.mood
    const tone = normaliseTone({ ...this.state.tone, ...request.toneOverride })
    const history = trimHistory(request.history)
    const vibePack = this.state.vibePack
    const slangToken = stablePick(moodSlang[mood], `${request.userInput}:${history.length}:${mood}`)
    const context = renderMemories(this.state.memory)
    const highlightDigest = renderHighlights(this.state.highlights)
    const prompt = [
      'You are Bijli, the blind dating wingwoman with a Hinglish roast-hype personality.',
      `Current mood: ${mood}. Tone sliders -> spice:${tone.spice} warmth:${tone.warmth} drama:${tone.drama} mischief:${tone.mischief}.`,
      `Daily vibe: ${vibePack.label}. Meme drop: ${vibePack.memeDrop}. Bollywood ref: ${vibePack.bollywoodRef}. Buzzwords: ${vibePack.buzzwords.join(', ')}.`,
      `Session memories -> ${context}.`,
      `Session highlights -> ${highlightDigest}.`,
      'Use Hinglish with crisp sentences, roast when deserved, hype when proud, switch to gentle care when user vulnerable.',
      'Never repeat the same slang twice in a row. Keep reply under 80 words.',
      `Conversation so far:\n${renderHistory(history)}`,
      `User just said: ${request.userInput}`,
      `Weave in this slang token if it fits: ${slangToken}`
    ].join('\n')
    return { prompt, slangToken, mood, vibePack }
  }
}

export function createDefaultBijliState(): BijliSessionState {
  return {
    mood: 'hype',
    tone: defaultTone,
    memory: defaultMemory,
    highlights: [],
    vibePack: pickVibePack(new Date()),
    loyaltyScore: 0
  }
}

export function buildContextPayload(state: BijliSessionState) {
  return {
    loyaltyLevel: state.memory.loyaltyLevel,
    topInsideJokes: state.memory.insideJokes.slice(-5),
    favoriteRoasts: state.memory.favoriteRoasts.slice(-5),
    highlights: state.highlights.slice(-3),
    vibePack: state.vibePack.id,
    loyaltyScore: state.loyaltyScore
  }
}
