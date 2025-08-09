// utils/voice.ts
// export const getVoiceMessageUrl = (filename: string) => {
//   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
//   return `${supabaseUrl}/storage/v1/object/public/voice-messages/${filename}`;
// };
export const getVoiceMessageUrl = (filename: string) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) throw new Error('Supabase URL not configured');
  
  // Ensure the URL is properly formatted
  const baseUrl = supabaseUrl.endsWith('/') ? supabaseUrl : `${supabaseUrl}/`;
  return `${baseUrl}storage/v1/object/public/voice-messages/${filename}`;
};

export const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};