// src/lib/services/UserService.ts
import { supabase } from '@/lib/supabase'

export class UserService {
  static async uploadProfilePicture(userId: string, file: File) {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName)

      // If main profile photo changes, require re-verification
      await supabase
        .from('users')
        .update({ 
          profile_picture: publicUrl,
          face_verified: false,
          face_verified_at: null,
          face_verification_score: null
        })
        .eq('id', userId)

      return publicUrl
    } catch (error) {
      console.error('Error uploading profile picture:', error)
      throw error
    }
  }
}