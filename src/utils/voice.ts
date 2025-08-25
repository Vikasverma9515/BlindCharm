// utils/voice.ts
// Now compatible with both Firebase Storage and Supabase Storage
import { supabase } from '@/lib/supabase';

export const getVoiceMessageUrl = (pathOrUrl: string) => {
  // If it's already a full URL (Firebase download URL), return as-is
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

  try {
    // Supabase public URL generation (legacy path)
    const { data } = supabase.storage
      .from('voice-messages')
      .getPublicUrl(pathOrUrl);
    return data.publicUrl;
  } catch (error) {
    console.error('Error generating voice message URL:', error);
    // Fallback to manual URL construction
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) throw new Error('Supabase URL not configured');
    const baseUrl = supabaseUrl.endsWith('/') ? supabaseUrl : `${supabaseUrl}/`;
    return `${baseUrl}storage/v1/object/public/voice-messages/${pathOrUrl}`;
  }
};

export const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};