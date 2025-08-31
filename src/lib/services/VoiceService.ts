// src/lib/services/VoiceService.ts

import { supabase } from '@/lib/supabase';
import { 
  VoicePrompt, 
  VoiceCard, 
  VoiceCardSwipe, 
  VoiceMatch, 
  VoiceActivity,
  VoiceCardFormData 
} from '@/types/voice';

export class VoiceService {
  // Voice Prompts
  static async getActivePrompts(): Promise<VoicePrompt[]> {
    const { data, error } = await supabase
      .from('voice_prompts')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getRandomPrompt(): Promise<VoicePrompt | null> {
    const { data, error } = await supabase
      .from('voice_prompts')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    if (!data || data.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
  }

  // Voice Cards
  // static async getVoiceCardsForSwiping(userId: string, limit: number = 10): Promise<VoiceCard[]> {
  //   // Get cards that the user hasn't swiped on yet, excluding their own cards
  //   const { data, error } = await supabase
  //     .from('voice_cards')
  //     .select(`
  //       *,
  //       prompt:voice_prompts(*),
  //       user:users(id, username, full_name)
  //     `)
  //     .eq('is_active', true)
  //     .neq('user_id', userId)
  //     .not('id', 'in', `(
  //       SELECT voice_card_id 
  //       FROM voice_card_swipes 
  //       WHERE swiper_id = '${userId}'
  //     )`)
  //     .order('created_at', { ascending: false })
  //     .limit(limit);

  //   if (error) throw error;
  //   return data || [];
  // }

  static async getVoiceCardsForSwiping(userId: string, limit: number = 10): Promise<VoiceCard[]> {
  // First get the swiped card IDs
  const { data: swipedCards } = await supabase
    .from('voice_card_swipes')
    .select('voice_card_id')
    .eq('swiper_id', userId);

  const swipedCardIds = swipedCards?.map(card => card.voice_card_id) || [];

  // Then get cards excluding the swiped ones
  const query = supabase
    .from('voice_cards')
    .select(`
      *,
      prompt:voice_prompts(*),
      user:users(id, username, full_name)
    `)
    .eq('is_active', true)
    .neq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  // Only add the not-in filter if there are swiped cards
  if (swipedCardIds.length > 0) {
    query.not('id', 'in', swipedCardIds);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

  static async getUserVoiceCards(userId: string): Promise<VoiceCard[]> {
    const { data, error } = await supabase
      .from('voice_cards')
      .select(`
        *,
        prompt:voice_prompts(*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // static async createVoiceCard(formData: VoiceCardFormData, userId: string): Promise<VoiceCard> {
  //   // First, upload the audio file
  //   const audioFileName = `${userId}/${Date.now()}.webm`;
  //   const { data: uploadData, error: uploadError } = await supabase.storage
  //     .from('voice-recordings')
  //     .upload(audioFileName, formData.audio_blob, {
  //       contentType: 'audio/webm',
  //       upsert: false
  //     });

  //   if (uploadError) throw uploadError;

  //   // Get the public URL
  //   const { data: { publicUrl } } = supabase.storage
  //     .from('voice-recordings')
  //     .getPublicUrl(audioFileName);

  //   // Calculate audio duration (we'll need to do this on the client side)
  //   const audioDuration = await VoiceService.getAudioDuration(formData.audio_blob);

  //   // Create the voice card record
  //   const { data, error } = await supabase
  //     .from('voice_cards')
  //     .insert({
  //       user_id: userId,
  //       prompt_id: formData.prompt_id,
  //       audio_url: publicUrl,
  //       audio_duration: audioDuration,
  //       mood_tags: formData.mood_tags,
  //       quote: formData.quote,
  //       vibe_description: formData.vibe_description
  //     })
  //     .select(`
  //       *,
  //       prompt:voice_prompts(*),
  //       user:users(id, username, full_name)
  //     `)
  //     .single();

  //   if (error) throw error;
  //   return data;
  // }

   static async createVoiceCard(formData: VoiceCardFormData, userId: string): Promise<VoiceCard> {
  try {
    // First, calculate audio duration before anything else
    let audioDuration = 1; // Default to 1 second if calculation fails
    try {
      const duration = await VoiceService.getAudioDuration(formData.audio_blob);
      audioDuration = duration > 0 ? duration : 1;
    } catch (error) {
      console.error('Error calculating audio duration:', error);
    }

    // Upload the audio file
    const audioFileName = `${userId}/${Date.now()}.webm`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('voice-recordings')
      .upload(audioFileName, formData.audio_blob, {
        contentType: 'audio/webm',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('voice-recordings')
      .getPublicUrl(audioFileName);

    // Create the voice card record with guaranteed audio_duration
    const { data, error } = await supabase
      .from('voice_cards')
      .insert({
        user_id: userId,
        prompt_id: formData.prompt_id,
        audio_url: publicUrl,
        audio_duration: audioDuration, // This will never be null
        mood_tags: formData.mood_tags || [],
        quote: formData.quote || '',
        vibe_description: formData.vibe_description || '',
        is_active: true // Add this if it's required
      })
      .select(`
        *,
        prompt:voice_prompts(*),
        user:users(id, username, full_name)
      `)
      .single();

    if (error) {
      // If there's an error, clean up the uploaded file
      await supabase.storage
        .from('voice-recordings')
        .remove([audioFileName]);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createVoiceCard:', error);
    throw error;
  }
}


  static async deleteVoiceCard(cardId: string, userId: string): Promise<void> {
    // First get the card to get the audio URL
    const { data: card, error: fetchError } = await supabase
      .from('voice_cards')
      .select('audio_url')
      .eq('id', cardId)
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    // Extract file path from URL and delete from storage
    if (card?.audio_url) {
      const urlParts = card.audio_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${userId}/${fileName}`;
      
      await supabase.storage
        .from('voice-recordings')
        .remove([filePath]);
    }

    // Delete the voice card record
    const { error } = await supabase
      .from('voice_cards')
      .delete()
      .eq('id', cardId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  // Voice Card Swipes
  static async swipeVoiceCard(
    voiceCardId: string, 
    swipeDirection: 'left' | 'right' | 'up', 
    swiperId: string
  ): Promise<{ voiceMatch: VoiceMatch; chatMatchId: string } | null> {
    // Record the swipe
    const { error: swipeError } = await supabase
      .from('voice_card_swipes')
      .insert({
        swiper_id: swiperId,
        voice_card_id: voiceCardId,
        swipe_direction: swipeDirection
      });

    if (swipeError) throw swipeError;

    // If it's a right swipe, check for a match
    if (swipeDirection === 'right') {
      return await VoiceService.checkForMatch(voiceCardId, swiperId);
    }

    return null;
  }

  private static async checkForMatch(voiceCardId: string, swiperId: string): Promise<{ voiceMatch: VoiceMatch; chatMatchId: string } | null> {
    // Get the voice card to find the owner
    const { data: voiceCard, error: cardError } = await supabase
      .from('voice_cards')
      .select('user_id')
      .eq('id', voiceCardId)
      .single();

    if (cardError) throw cardError;

    const cardOwnerId = voiceCard.user_id;

    // Check if the card owner has also swiped right on any of the swiper's cards
    const { data: mutualSwipes, error: swipeError } = await supabase
      .from('voice_card_swipes')
      .select(`
        voice_card_id,
        voice_cards!inner(user_id)
      `)
      .eq('swiper_id', cardOwnerId)
      .eq('swipe_direction', 'right')
      .eq('voice_cards.user_id', swiperId);

    if (swipeError) throw swipeError;

    if (mutualSwipes && mutualSwipes.length > 0) {
      // Create a voice match record
      const voiceMatchData = {
        user1_id: swiperId,
        user2_id: cardOwnerId,
        voice_card1_id: mutualSwipes[0].voice_card_id,
        voice_card2_id: voiceCardId,
        match_type: 'voice_connection' as const
      };

      const { data: voiceMatch, error: voiceMatchError } = await supabase
        .from('voice_matches')
        .insert(voiceMatchData)
        .select(`
          *,
          user1:users!voice_matches_user1_id_fkey(id, username, full_name),
          user2:users!voice_matches_user2_id_fkey(id, username, full_name),
          voice_card1:voice_cards!voice_matches_voice_card1_id_fkey(*),
          voice_card2:voice_cards!voice_matches_voice_card2_id_fkey(*)
        `)
        .single();

      if (voiceMatchError) throw voiceMatchError;

      // Also create a standard chat match so we can route to private chat immediately
      const { data: createdMatch, error: createMatchError } = await supabase
        .from('matches')
        .insert({
          user1_id: swiperId,
          user2_id: cardOwnerId,
          status: 'active',
          user1_revealed: false,
          user2_revealed: false
        })
        .select('id')
        .single();

      if (createMatchError) throw createMatchError;

      return { voiceMatch, chatMatchId: createdMatch.id };
    }

    return null;
  }

  // Voice Matches
  static async getUserMatches(userId: string): Promise<VoiceMatch[]> {
    const { data, error } = await supabase
      .from('voice_matches')
      .select(`
        *,
        user1:users!voice_matches_user1_id_fkey(id, username, full_name),
        user2:users!voice_matches_user2_id_fkey(id, username, full_name),
        voice_card1:voice_cards!voice_matches_voice_card1_id_fkey(*),
        voice_card2:voice_cards!voice_matches_voice_card2_id_fkey(*)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Likes You (incoming likes the user has not responded to yet)
  static async getIncomingLikes(userId: string) {
    // Find swipes where someone swiped right on any of my cards, and I haven't swiped that card owner back right yet
    const { data, error } = await supabase
      .from('voice_card_swipes')
      .select(`
        id,
        created_at,
        swiper_id,
        voice_card_id,
        voice_cards!inner(
          id,
          user_id,
          audio_url,
          audio_duration,
          mood_tags,
          prompt:voice_prompts(*),
          user:users(id, username, full_name)
        )
      `)
      .eq('swipe_direction', 'right')
      // Their swipe is on one of MY cards
      .in('voice_card_id', supabase
        .from('voice_cards')
        .select('id')
        .eq('user_id', userId) as any)
      // And I haven't already right-swiped one of their cards
      ;

    if (error) throw error;

    const likes = (data || []).filter(like => like.swiper_id !== userId);
    return likes.map(like => ({
      likeId: like.id,
      created_at: like.created_at,
      liker_id: like.swiper_id,
      liker: like.voice_cards.user,
      their_card_id: like.voice_card_id,
      their_card: like.voice_cards,
    }));
  }

  // Like back: I right-swipe any one of the liker’s cards to create a match (and chat match)
  static async likeBack(likerUserId: string, myUserId: string) {
    // Find any of liker’s voice cards that I haven’t swiped right yet
    const { data: likerCards, error: likerCardsError } = await supabase
      .from('voice_cards')
      .select('id')
      .eq('user_id', likerUserId)
      .eq('is_active', true)
      .limit(1);

    if (likerCardsError) throw likerCardsError;
    if (!likerCards || likerCards.length === 0) throw new Error('No active cards from this user');

    const targetCardId = likerCards[0].id;

    // Perform a right swipe and reuse matching logic
    return await VoiceService.swipeVoiceCard(targetCardId, 'right', myUserId);
  }

  // Voice Activities
  static async createVoiceActivity(
    matchId: string, 
    activityType: VoiceActivity['activity_type'],
    activityData: Record<string, any> = {}
  ): Promise<VoiceActivity> {
    const { data, error } = await supabase
      .from('voice_activities')
      .insert({
        match_id: matchId,
        activity_type: activityType,
        activity_data: activityData
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  static async getMatchActivities(matchId: string): Promise<VoiceActivity[]> {
    const { data, error } = await supabase
      .from('voice_activities')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async updateActivityStatus(
    activityId: string, 
    status: VoiceActivity['status']
  ): Promise<VoiceActivity> {
    const { data, error } = await supabase
      .from('voice_activities')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', activityId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  // Utility functions
  // private static getAudioDuration(audioBlob: Blob): Promise<number> {
  //   return new Promise((resolve) => {
  //     const audio = new Audio();
  //     const url = URL.createObjectURL(audioBlob);
      
  //     audio.addEventListener('loadedmetadata', () => {
  //       URL.revokeObjectURL(url);
  //       resolve(Math.round(audio.duration));
  //     });
      
  //     audio.src = url;
  //   });
  // }
    private static getAudioDuration(audioBlob: Blob): Promise<number> {
  return new Promise((resolve) => {
    try {
      const audio = new Audio();
      const url = URL.createObjectURL(audioBlob);
      
      audio.addEventListener('loadedmetadata', () => {
        const duration = Math.round(audio.duration);
        URL.revokeObjectURL(url);
        resolve(duration > 0 ? duration : 1); // Never return less than 1
      });

      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        resolve(1); // Default to 1 second on error
      });
      
      audio.src = url;

      // Add timeout to prevent hanging
      setTimeout(() => {
        URL.revokeObjectURL(url);
        resolve(1); // Default to 1 second on timeout
      }, 5000);
    } catch (error) {
      console.error('Error in getAudioDuration:', error);
      resolve(1); // Default to 1 second on any error
    }
  });
}


  // Report voice card
  static async reportVoiceCard(
    voiceCardId: string, 
    reason: string, 
    description: string,
    reporterId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('voice_card_reports')
      .insert({
        reporter_id: reporterId,
        voice_card_id: voiceCardId,
        reason,
        description
      });

    if (error) throw error;
  }
}