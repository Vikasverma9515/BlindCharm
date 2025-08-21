// utils/voice.ts
// export const getVoiceMessageUrl = (filename: string) => {
//   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
//   return `${supabaseUrl}/storage/v1/object/public/voice-messages/${filename}`;
// };
import { supabase } from '@/lib/supabase';

export const getVoiceMessageUrl = (filename: string) => {
  try {
    // Use Supabase's built-in method to get public URL
    const { data } = supabase.storage
      .from('voice-messages')
      .getPublicUrl(filename);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error generating voice message URL:', error);
    // Fallback to manual URL construction
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) throw new Error('Supabase URL not configured');
    
    const baseUrl = supabaseUrl.endsWith('/') ? supabaseUrl : `${supabaseUrl}/`;
    return `${baseUrl}storage/v1/object/public/voice-messages/${filename}`;
  }
};

export const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};