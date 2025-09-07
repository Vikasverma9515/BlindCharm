// Minimal AI layer with a free-first approach
// Strategy:
// - Use local heuristic + rules for memory extraction to keep zero-cost
// - Optionally plug in open-source models (Ollama) when available via env flag
// - Embeddings optional: when not available, store memory without embedding

export type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string }

export type MemoryRecord = {
  kind: 'like' | 'dislike' | 'hobby' | 'movie' | 'song' | 'trait' | 'life_update' | 'generic'
  content: string
  importance?: number
}

// Very simple rule-based memory extractor (free)
export function extractMemories(text: string): MemoryRecord[] {
  const memories: MemoryRecord[] = []
  const lc = text.toLowerCase()

  // Likes / dislikes
  const likeMatch = lc.match(/i (really\s+)?like ([^\.\!\n]+)/)
  if (likeMatch) {
    memories.push({ kind: 'like', content: likeMatch[2].trim(), importance: 2 })
  }
  const loveMatch = lc.match(/i (absolutely\s+)?love ([^\.\!\n]+)/)
  if (loveMatch) {
    memories.push({ kind: 'like', content: loveMatch[2].trim(), importance: 3 })
  }
  const dislikeMatch = lc.match(/i (really\s+)?(don'?t like|hate) ([^\.\!\n]+)/)
  if (dislikeMatch) {
    memories.push({ kind: 'dislike', content: dislikeMatch[3].trim(), importance: 2 })
  }

  // Hobbies & interests
  const hobbies = ['trekking','hiking','running','music','movies','bollywood','kishore kumar','gaming','reading','photography','art','design','fitness']
  hobbies.forEach(h => {
    if (lc.includes(h)) memories.push({ kind: 'hobby', content: h, importance: 1 })
  })

  // Life updates cues
  if (/feeling (low|lonely|down|sad)/.test(lc)) {
    memories.push({ kind: 'life_update', content: 'feeling low/lonely', importance: 3 })
  }

  // Movies / songs
  const songMatch = lc.match(/song[s]? (?:like|such as) ([^\.\!\n]+)/)
  if (songMatch) {
    memories.push({ kind: 'song', content: songMatch[1].trim(), importance: 2 })
  }

  return memories
}

// Basic assistant reply generator (free, rule-based placeholder)
export function generateAssistantReply(history: ChatMessage[], userInput: string): string {
  const lc = userInput.toLowerCase()
  if (/hello|hi|hey/.test(lc)) return "Hey! I'm your BlindCharm companion. Tell me what's on your mind—music, moods, plans?"
  if (/lonely|down|sad|low/.test(lc)) return "I'm here for you. Want to talk about what's making you feel this way? We can also plan a tiny mood-lift challenge together."
  if (/joke/.test(lc)) return "Here's one: Why did the developer go on a date with the database? Because it had the right schema for commitment! 😄"
  if (/bollywood|kishore/.test(lc)) return "Old Bollywood vibes! I can remember your favorites. Want me to keep a note so I can suggest like-minded folks later?"
  return "Got it! I'll remember what matters to you and keep you company. Want a prompt, a mini-challenge, or some conversation starters?"
}