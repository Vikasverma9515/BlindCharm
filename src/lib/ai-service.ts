import Groq from 'groq-sdk';
import { UserIntent, StoryCard } from '@/types/ai';

const groq = new Groq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
    dangerouslyAllowBrowser: true // Allow client-side calls for prototype speed
});

export const AI_MODELS = {
    FAST: 'llama3-8b-8192',
    SMART: 'llama3-70b-8192',
};

export class IntentExtractionService {
    static async extract(userInput: string): Promise<UserIntent> {
        const systemPrompt = `
      You are an emotional intelligence AI. Analyze the user's input to understand what kind of human connection they are looking for.
      Output JSON only.
      Schema:
      {
        "connection_type": "friendship" | "collaboration" | "emotional" | "romantic" | "casual",
        "energy_level": "calm" | "playful" | "focused" | "deep",
        "pace": "slow" | "no_pressure" | "open" | "intentional",
        "boundaries": ["string"]
      }
    `;

        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userInput }
                ],
                model: AI_MODELS.FAST,
                temperature: 0.5,
                response_format: { type: 'json_object' }
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) throw new Error('No content from AI');

            const parsed = JSON.parse(content);
            return {
                raw_input: userInput,
                ...parsed
            };
        } catch (error) {
            console.error('Intent extraction failed:', error);
            // Fallback for demo/error cases
            return {
                raw_input: userInput,
                connection_type: 'friendship',
                energy_level: 'calm',
                pace: 'open',
                boundaries: []
            };
        }
    }
}

export class StoryGenerationService {
    static async generate(userIntent: UserIntent, matchedUserProfile: any): Promise<StoryCard> {
        const systemPrompt = `
      Generate a "Story Card" for a potential match.
      User's Intent: ${JSON.stringify(userIntent)}
      Matched Profile: ${JSON.stringify(matchedUserProfile)}
      
      Task:
      1. Write ONE sentence explaining why this connection makes sense.
      2. Select 2 short "Visual Proof" tags (e.g., "Night-focused", "Calm energy").
      
      Rules:
      - Calm, observational tone.
      - No hype, no flirting, no percentages.
      - Never sound like an algorithm.
      
      Output JSON only:
      {
        "story_line": "string",
        "visual_proof_tags": ["string", "string"]
      }
    `;

        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt }
                ],
                model: AI_MODELS.FAST,
                temperature: 0.7,
                response_format: { type: 'json_object' }
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) throw new Error('No content from AI');

            const parsed = JSON.parse(content);
            return {
                user_id: matchedUserProfile.id,
                photo_url: matchedUserProfile.avatar_url || matchedUserProfile.profile_picture, // Handle different naming conventions
                voice_url: matchedUserProfile.voice_url,
                story_line: parsed.story_line,
                visual_proof_tags: parsed.visual_proof_tags
            };
        } catch (error) {
            console.error('Story generation failed:', error);
            return {
                user_id: matchedUserProfile.id,
                photo_url: matchedUserProfile.avatar_url,
                story_line: "You both seem to be looking for a similar vibe right now.",
                visual_proof_tags: ["Compatible", "Vibe Match"]
            };
        }
    }
}

export class EmbeddingService {
    // Placeholder for embedding generation
    // In a real scenario, this would call an embedding API (OpenAI or local model)
    // For this prototype, we might mock it or use a lightweight JS library if needed.
    // Since we are using Groq (which doesn't have embeddings yet publicly or we might need another provider),
    // we will return a random vector or a mock for now, OR use a simple keyword-based fallback in the DB query.

    static async generate(text: string): Promise<number[]> {
        // TODO: Implement actual embedding generation
        // For now, return a zero vector of size 1536 to prevent errors if called
        return new Array(1536).fill(0);
    }
}
