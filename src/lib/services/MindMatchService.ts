// src/lib/services/MindMatchService.ts - Simplified Version
import { supabase } from '@/lib/supabase'
import { MindMatchPrompt, MindMatchAnswer, VibeMatch, CurrentQuestion } from '@/types/mindmatch'

export class MindMatchService {
  // Get current active question for a lobby
  static async getCurrentQuestion(lobbyId: string): Promise<CurrentQuestion | null> {
    try {
      const { data, error } = await supabase
        .from('current_active_question')
        .select(`
          *,
          prompt:mindmatch_prompts(*)
        `)
        .eq('lobby_id', lobbyId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching current question:', error)
        return null
      }
      if (!data) {
        // No current question found
        return null
      }
      return {
        question: data.prompt,
        questionNumber: data.question_number,
        roundId: data.round_id,
        endsAt: data.ends_at
      }
    } catch (error) {
      console.error('Error fetching current question:', error)
      return null
    }
  }

  // Start a new round (5 questions) for a lobby
  static async startNewRound(lobbyId: string): Promise<string | null> {
    try {
      // Just call the backend function, which handles everything
      const { data, error } = await supabase.rpc('start_new_round', { p_lobby_id: lobbyId });
      if (error) throw error;
      // The function returns the new round_id
      return data as string;
    } catch (error) {
      console.error('Error starting new round:', error);
      return null;
    }
  }

  // Start next question in current round
  // static async startNextQuestion(lobbyId: string, roundId: string, questionNumber: number): Promise<boolean> {
  //   try {
  //     // Get next prompt
  //     const { data: prompts, error: promptsError } = await supabase
  //       .from('mindmatch_prompts')
  //       .select('*')
  //       .eq('is_active', true)
  //       .order('RANDOM()')
  //       .limit(1)

  //     if (promptsError || !prompts || prompts.length === 0) {
  //       throw new Error('No prompts available')
  //     }

  //     const { error } = await supabase.rpc('start_new_question', {
  //       p_lobby_id: lobbyId,
  //       p_prompt_id: prompts[0].id,
  //       p_question_number: questionNumber,
  //       p_round_id: roundId
  //     })

  //     return !error
  //   } catch (error) {
  //     console.error('Error starting next question:', error)
  //     return false
  //   }
  // }

  // Submit an answer
  static async submitAnswer(
    lobbyId: string,
    userId: string,
    promptId: string,
    roundId: string,
    answer: {
      text?: string;
      optionIndex?: number;
      timeTaken?: number;
    }
  ): Promise<MindMatchAnswer | null> {
    try {
      const { data, error } = await supabase
        .from('mindmatch_answers')
        .upsert({
          lobby_id: lobbyId,
          user_id: userId,
          prompt_id: promptId,
          round_id: roundId,
          answer_text: answer.text,
          answer_option_index: answer.optionIndex,
          time_taken: answer.timeTaken || 30
        }, { onConflict: 'lobby_id,user_id,prompt_id,round_id' })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error submitting answer:', error)
      return null
    }
  }

  // Get user's answers for current round
  static async getUserRoundAnswers(lobbyId: string, userId: string, roundId: string): Promise<MindMatchAnswer[]> {
    try {
      const { data, error } = await supabase
        .from('mindmatch_answers')
        .select(`
          *,
          prompt:mindmatch_prompts(*)
        `)
        .eq('lobby_id', lobbyId)
        .eq('user_id', userId)
        .eq('round_id', roundId)
        .order('answered_at', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user answers:', error)
      return []
    }
  }

  // Fetch all answers for a round
  static async getAllRoundAnswers(lobbyId: string, roundId: string): Promise<MindMatchAnswer[]> {
    const { data, error } = await supabase
      .from('mindmatch_answers')
      .select('*')
      .eq('lobby_id', lobbyId)
      .eq('round_id', roundId);
    if (error) return [];
    return data || [];
  }

  // Calculate matches after round completion
  static async calculateRoundMatches(lobbyId: string, roundId: string): Promise<VibeMatch[]> {
    try {
      // Use the database function to calculate matches
      const { data, error } = await supabase.rpc('calculate_round_matches', {
        p_lobby_id: lobbyId,
        p_round_id: roundId
      })

      if (error) throw error

      // Get the created matches
      const { data: matches, error: matchesError } = await supabase
        .from('vibe_matches')
        .select(`
          *,
          user1:users!vibe_matches_user1_id_fkey(id, username, profile_picture),
          user2:users!vibe_matches_user2_id_fkey(id, username, profile_picture)
        `)
        .eq('lobby_id', lobbyId)
        .eq('round_id', roundId)
        .order('compatibility_score', { ascending: false })

      if (matchesError) throw matchesError
      return matches || []
    } catch (error) {
      console.error('Error calculating matches:', error)
      return []
    }
  }

  // Get current round matches for a lobby
  static async getCurrentRoundMatches(lobbyId: string, roundId: string): Promise<VibeMatch[]> {
    try {
      const { data, error } = await supabase
        .from('vibe_matches')
        .select(`
          *,
          user1:users!vibe_matches_user1_id_fkey(id, username, profile_picture),
          user2:users!vibe_matches_user2_id_fkey(id, username, profile_picture)
        `)
        .eq('lobby_id', lobbyId)
        .eq('round_id', roundId)
        .order('compatibility_score', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching matches:', error)
      return []
    }
  }

  // React to an answer
  static async reactToAnswer(
    answerId: string,
    userId: string,
    reactionType: string = 'heart'
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('answer_reactions')
        .upsert({
          answer_id: answerId,
          user_id: userId,
          reaction_type: reactionType
        })

      return !error
    } catch (error) {
      console.error('Error reacting to answer:', error)
      return false
    }
  }

  // Update user stats
  static async updateUserStats(userId: string, updates: {
    total_rounds_played?: number;
    total_matches_found?: number;
    charm_coins_earned?: number;
    best_compatibility_score?: number;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_mindmatch_stats')
        .upsert({
          user_id: userId,
          ...updates,
          last_played_at: new Date().toISOString()
        })

      return !error
    } catch (error) {
      console.error('Error updating user stats:', error)
      return false
    }
  }
}
