// Database migration utilities
import { supabase } from './supabase'

export async function ensureProfileCompletedField() {
  try {
    // Try to select the profile_completed field to see if it exists
    const { data, error } = await supabase
      .from('users')
      .select('profile_completed')
      .limit(1)

    if (error && error.message.includes('column "profile_completed" does not exist')) {
      console.log('profile_completed field does not exist, please add it manually in Supabase')
      return false
    }

    return true
  } catch (error) {
    console.error('Error checking profile_completed field:', error)
    return false
  }
}

export async function initializeProfileCompletedForExistingUsers() {
  try {
    // Get all users without profile_completed set
    const { data: users, error } = await supabase
      .from('users')
      .select('id, full_name, bio, interests, profile_completed')
      .is('profile_completed', null)

    if (error) {
      console.error('Error fetching users:', error)
      return
    }

    if (!users || users.length === 0) {
      console.log('No users need profile_completed initialization')
      return
    }

    console.log(`Initializing profile_completed for ${users.length} users`)

    for (const user of users) {
      const hasBasicInfo = user.full_name && 
                          user.full_name.trim() !== '' && 
                          user.bio && 
                          user.bio.trim() !== '' && 
                          user.interests && 
                          user.interests.length > 0

      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_completed: hasBasicInfo })
        .eq('id', user.id)

      if (updateError) {
        console.error(`Error updating user ${user.id}:`, updateError)
      }
    }

    console.log('Profile completion initialization complete')
  } catch (error) {
    console.error('Error initializing profile_completed:', error)
  }
}