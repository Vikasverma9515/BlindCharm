// lib/supabase-storage.ts
import { supabase } from './supabase';


export async function uploadVoiceMessage(file: File, matchId: string) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not authenticated');
    
    // Create a unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const filename = `${user.id}/${matchId}/${timestamp}-${randomString}.webm`;

    // Upload the file
    const { data, error } = await supabase.storage
      .from('voice-messages')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'audio/webm'
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error uploading voice message:', error);
    throw error;
  }
}
export async function deleteVoiceMessage(filename: string) {
  try {
    const { data, error } = await supabase.storage
      .from('voice-messages')
      .remove([filename]);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting voice message:', error);
    throw error;
  }
}