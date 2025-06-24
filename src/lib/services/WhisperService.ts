// src/lib/services/WhisperService.ts

import { supabase } from '@/lib/supabase';
import { Whisper, WhisperComment, WhisperReaction } from '@/types/whispers';

export class WhisperService {
  static async getWhispers() {
    const { data, error } = await supabase
      .from('whispers')
      .select(`
        *,
        profiles:user_id (
          username,
          profile_picture
        ),
        whisper_reactions(id),
        whisper_comments(id)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching whispers:', error);
      throw error;
    }

    // Transform the data to match the Whisper interface with calculated counts
    return data.map((whisper: any) => ({
      ...whisper,
      user: whisper.profiles,
      likes_count: whisper.whisper_reactions?.length || 0,
      comments_count: whisper.whisper_comments?.length || 0
    }));
  }

  static async createWhisper(whisper: Partial<Whisper>) {
    // Remove count fields since they don't exist in the database anymore
    const { likes_count, comments_count, user, ...whisperData } = whisper as any;
    
    const { data, error } = await supabase
      .from('whispers')
      .insert([whisperData])
      .select(`
        *,
        profiles:user_id (
          username,
          profile_picture
        ),
        whisper_reactions(id),
        whisper_comments(id)
      `);

    if (error) {
      console.error('Error creating whisper:', error);
      throw error;
    }

    return {
      ...data[0],
      user: data[0].profiles,
      likes_count: data[0].whisper_reactions?.length || 0,
      comments_count: data[0].whisper_comments?.length || 0
    };
  }

  static async getComments(whisperId: string) {
    const { data, error } = await supabase
      .from('whisper_comments')
      .select(`
        *,
        profiles:user_id (
          username,
          profile_picture
        )
      `)
      .eq('whisper_id', whisperId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }

    return data.map((comment: any) => ({
      ...comment,
      user: comment.profiles
    }));
  }

  static async addComment(comment: Partial<WhisperComment>) {
    try {
      const { data, error } = await supabase
        .from('whisper_comments')
        .insert([comment])
        .select(`
          *,
          profiles:user_id (
            username,
            profile_picture
          )
        `);

      if (error) {
        console.error('Error adding comment:', error);
        throw error;
      }

      // No need to update count - it's calculated dynamically

      return {
        ...data[0],
        user: data[0].profiles
      };
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }



  static async toggleLike(whisperId: string, userId: string) {
    try {
      // Check if reaction exists
      const { data: existingReaction, error: checkError } = await supabase
        .from('whisper_reactions')
        .select()
        .eq('whisper_id', whisperId)
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingReaction) {
        // Remove reaction if it exists
        const { error: deleteError } = await supabase
          .from('whisper_reactions')
          .delete()
          .eq('whisper_id', whisperId)
          .eq('user_id', userId);

        if (deleteError) throw deleteError;
      } else {
        // Add reaction if it doesn't exist
        const { error: insertError } = await supabase
          .from('whisper_reactions')
          .insert([{ 
            whisper_id: whisperId, 
            user_id: userId,
            reaction_type: 'like'
          }]);

        if (insertError) throw insertError;
      }

      // No need to update count - it's calculated dynamically

      // Return updated whisper with fresh data and calculated counts
      const { data: updatedWhisper, error: selectError } = await supabase
        .from('whispers')
        .select(`
          *,
          profiles:user_id (
            username,
            profile_picture
          ),
          whisper_reactions(id),
          whisper_comments(id)
        `)
        .eq('id', whisperId)
        .single();

      if (selectError) throw selectError;

      return {
        ...updatedWhisper,
        user: updatedWhisper.profiles,
        likes_count: updatedWhisper.whisper_reactions?.length || 0,
        comments_count: updatedWhisper.whisper_comments?.length || 0
      };
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }

  static async checkUserLike(whisperId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('whisper_reactions')
        .select()
        .eq('whisper_id', whisperId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking like status:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking like status:', error);
      return false;
    }
  }

  static async addReaction(reaction: Partial<WhisperReaction>) {
    const { data, error } = await supabase
      .from('whisper_reactions')
      .insert([reaction])
      .select();

    if (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }

    return data[0];
  }

  static async removeReaction(whisperId: string, userId: string) {
    const { error } = await supabase
      .from('whisper_reactions')
      .delete()
      .eq('whisper_id', whisperId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  }


}


