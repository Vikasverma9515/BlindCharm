'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase-admin'

interface OnboardingData {
    full_name: string
    birth_date: string
    gender: string
    photos: string[]
    interested_in: string[]
}

export async function completeOnboarding(data: OnboardingData) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const userId = session.user.id
        const mainPhoto = data.photos.length > 0 ? data.photos[0] : null

        // Map gender to database allowed values
        const genderMap: Record<string, string> = {
            'Man': 'male',
            'Woman': 'female',
            'Non-binary': 'non_binary',
            'Prefer not to say': 'prefer_not_to_say'
        }
        const dbGender = genderMap[data.gender] || data.gender.toLowerCase()

        // 1. Upsert users table (ensure it exists and update)
        const { error: userError } = await supabaseAdmin.from('users').upsert({
            id: userId,
            email: session.user.email,
            full_name: data.full_name,
            dob: data.birth_date,
            gender: dbGender,
            photos: data.photos,
            profile_picture: mainPhoto,
            profile_complete: true,
            updated_at: new Date().toISOString()
        })

        if (userError) throw userError

        // 2. Generate Embedding
        let embedding = null;
        try {
            // Import dynamically to avoid top-level await issues or server warnings if any
            const { generateEmbedding } = await import('@/lib/embeddings');

            // Create a rich text representation of the user for the "Vibe"
            // We can mix: Bio (if any), Interests, Gender, Traits
            // For onboarding, we only have basics + interests + gender
            const vibeText = `
                Gender: ${dbGender}
                Interested In: ${data.interested_in.join(', ')}
                Name: ${data.full_name}
             `.trim();

            // Note: Ideally we'd have a 'bio' here too, but simple onboarding might not have it yet.
            // If we add bio later, we should regenerate this.

            embedding = await generateEmbedding(vibeText);
            console.log("Generated embedding for user:", userId);
        } catch (e) {
            console.error("Failed to generate embedding:", e);
            // Non-blocking, we can continue without it
        }

        // 3. Upsert galaxy_profiles
        const { error: profileError } = await supabaseAdmin.from('galaxy_profiles').upsert({
            user_id: userId,
            full_name: data.full_name,
            birth_date: data.birth_date,
            gender: dbGender,
            photos: data.photos,
            interested_in: data.interested_in,
            onboarding_completed: true,
            embedding: embedding, // Save the vector!
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })

        if (profileError) throw profileError

        return { success: true }
    } catch (error: any) {
        console.error('Onboarding action failed:', error)
        return { success: false, error: error.message }
    }
}
