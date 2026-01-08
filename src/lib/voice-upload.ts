// lib/voice-upload.ts - Updated with size check
import { supabase } from '@/lib/supabase'

export async function uploadVoiceMessage(
  audioBlob: Blob, 
  matchId: string, 
  senderId: string,
  bucketName: string = 'voice-messages'
) {
  try {
    // Check file size before upload (max 1MB for voice messages)
    const maxSize = 1024 * 1024; // 1MB
    if (audioBlob.size > maxSize) {
      throw new Error(`File too large: ${Math.round(audioBlob.size / 1024)}KB. Maximum allowed: ${Math.round(maxSize / 1024)}KB`);
    }

    // Determine file extension based on blob type
    let extension = 'webm';
    if (audioBlob.type.includes('mp4')) extension = 'm4a'; // Use .m4a for MP4 audio
    else if (audioBlob.type.includes('wav')) extension = 'wav';
    else if (audioBlob.type.includes('ogg')) extension = 'ogg';
    else if (audioBlob.type.includes('webm')) extension = 'webm';
    
    // Create unique filename
    const timestamp = Date.now()
    const fileName = `${matchId}/${senderId}/${timestamp}.${extension}`
    
    console.log('🎤 Uploading voice message:', fileName, 'Size:', audioBlob.size, 'Type:', audioBlob.type, 'Bucket:', bucketName)
    
    // Upload to Supabase Storage with proper content type
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, audioBlob, {
        contentType: audioBlob.type || 'audio/webm',
        upsert: false,
        duplex: 'half'
      })

    if (error) {
      console.error('❌ Upload error:', error)
      
      // Handle specific errors
      if (error.message?.includes('exceeded the maximum allowed size')) {
        throw new Error('Voice message too long. Please record a shorter message.');
      }
      
      throw error
    }

    console.log('✅ Voice message uploaded:', data.path)
    return data
  } catch (error) {
    console.error('❌ Voice upload failed:', error)
    throw error
  }
}

export function getVoiceMessageUrl(path: string) {
  const { data } = supabase.storage
    .from('voice-messages')
    .getPublicUrl(path)
  
  console.log('🔗 Generated URL:', data.publicUrl)
  return data.publicUrl
}

// // lib/voice-upload.ts
// import { supabase } from '@/lib/supabase'

// export async function uploadVoiceMessage(audioBlob: Blob, matchId: string, senderId: string) {
//   try {
//     // Determine file extension based on blob type
//     let extension = 'webm';
//     if (audioBlob.type.includes('mp4')) extension = 'mp4';
//     else if (audioBlob.type.includes('wav')) extension = 'wav';
//     else if (audioBlob.type.includes('ogg')) extension = 'ogg';
//     else if (audioBlob.type.includes('webm')) extension = 'webm';
    
//     // Create unique filename
//     const timestamp = Date.now()
//     const fileName = `${matchId}/${senderId}/${timestamp}.${extension}`
    
//     console.log('🎤 Uploading voice message:', fileName, 'Size:', audioBlob.size, 'Type:', audioBlob.type)
    
//     // Upload to Supabase Storage with proper content type
//     const { data, error } = await supabase.storage
//       .from('voice-messages')
//       .upload(fileName, audioBlob, {
//         contentType: audioBlob.type || 'audio/webm',
//         upsert: false,
//         duplex: 'half' // Add this for better compatibility
//       })

//     if (error) {
//       console.error('❌ Upload error:', error)
//       throw error
//     }

//     console.log('✅ Voice message uploaded:', data.path)
//     return data
//   } catch (error) {
//     console.error('❌ Voice upload failed:', error)
//     throw error
//   }
// }

// export function getVoiceMessageUrl(path: string) {
//   const { data } = supabase.storage
//     .from('voice-messages')
//     .getPublicUrl(path)
  
//   console.log('🔗 Generated URL:', data.publicUrl)
//   return data.publicUrl
// }

// export async function deleteVoiceMessage(path: string) {
//   try {
//     const { error } = await supabase.storage
//       .from('voice-messages')
//       .remove([path])
    
//     if (error) throw error
//     return true
//   } catch (error) {
//     console.error('❌ Voice delete failed:', error)
//     return false
//   }
// }