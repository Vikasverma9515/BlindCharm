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

      await supabase
        .from('users')
        .update({ profile_picture: publicUrl })
        .eq('id', userId)

      return publicUrl
    } catch (error) {
      console.error('Error uploading profile picture:', error)
      throw error
    }
  }
}