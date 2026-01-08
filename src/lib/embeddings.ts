import { openai, EMBEDDING_MODEL } from '@/lib/openai';

/**
 * Generate embedding for text (profile or query)
 * @param text - Text to embed
 * @returns Array of 1536 numbers
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    if (!text || text.trim().length === 0) {
        throw new Error('Text cannot be empty');
    }

    try {
        const response = await openai.embeddings.create({
            model: EMBEDDING_MODEL,
            input: text.trim(),
            encoding_format: 'float', // Returns array of numbers
        });

        return response.data[0].embedding;
    } catch (error) {
        console.error('OpenAI embedding error:', error);
        throw error;
    }
}

/**
 * Prepare profile text for embedding
 * @param profile - User profile object
 * @returns Concatenated text representation
 */
export function prepareProfileText(profile: any): string {
    if (!profile) return '';

    const parts = [
        profile.about_me || '',
        profile.bio || '',
        profile.connection_style || '',
        (profile.identity_signals || []).join(', '),
        (profile.interest_capsules || []).join(', '),
        profile.current_mood || '',
        profile.job_title || '',
        profile.company || '',
        profile.school || ''
    ].filter(Boolean);

    // If we have "prompts" (answers to questions), add them too
    if (Array.isArray(profile.prompts)) {
        profile.prompts.forEach((p: any) => {
            if (p.answer) parts.push(p.answer);
        });
    }

    return parts.join(' | ');
}
