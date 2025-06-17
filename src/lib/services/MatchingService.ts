// src/lib/services/MatchingService.ts

import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  gender: 'male' | 'female' | 'other';
  interests: string[];
}

interface LobbyParticipant {
  id: string;
  user_id: string;
  user: User;
}

interface Match {
  user1_id: string;
  user2_id: string;
  lobby_id: string;
  status: 'matched';
  created_at: string;
}

export class MatchingService {
  static async matchParticipants(lobbyId: string) {
    try {
      // Get all waiting participants with user info
      const { data: participants, error } = await supabase
        .from('lobby_participants')
        .select(`
          id,
          user_id,
          users:user_id (
            id,
            gender,
            interests
          )
        `)
        .eq('lobby_id', lobbyId)
        .eq('status', 'waiting');

      if (error) throw error;

      // Transform the data structure
      const typedParticipants = (participants || []).map((p: any) => ({
        id: p.id,
        user_id: p.user_id,
        user: p.users
      }));

      // Separate by gender
      const males = typedParticipants.filter(p => p.user?.gender === 'male');
      const females = typedParticipants.filter(p => p.user?.gender === 'female');

      // Shuffle for randomness
      const shuffle = (arr: any[]) => arr.sort(() => Math.random() - 0.5);
      const shuffledMales = shuffle(males);
      const shuffledFemales = shuffle(females);

      // Create matches
      const matches = [];
      const maxMatches = Math.min(shuffledMales.length, shuffledFemales.length);

      for (let i = 0; i < maxMatches; i++) {
        matches.push({
          user1_id: shuffledMales[i].user_id,
          user2_id: shuffledFemales[i].user_id,
          lobby_id: lobbyId,
          status: 'matched'
        });
      }

      if (matches.length > 0) {
        // Insert matches
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .insert(matches)
          .select('*');

        if (matchError) throw matchError;

        // Update participant status
        const matchedUserIds = matches.flatMap(m => [m.user1_id, m.user2_id]);
        await supabase
          .from('lobby_participants')
          .update({ status: 'matched' })
          .in('user_id', matchedUserIds)
          .eq('lobby_id', lobbyId);

        return { success: true, matches: matchData };
      }

      return { success: true, matches: [] };
    } catch (error) {
      console.error('Error in matching:', error);
      return { success: false, error };
    }
  }

  // Helper method to calculate compatibility score
  private static calculateCompatibilityScore(user1: User, user2: User): number {
    let score = 0;

    // Check common interests
    const commonInterests = user1.interests.filter(interest => 
      user2.interests.includes(interest)
    );
    
    score += commonInterests.length * 10; // Add 10 points for each common interest

    return score;
  }

  // Method to find best matches
  private static findBestMatches(males: LobbyParticipant[], females: LobbyParticipant[]): [LobbyParticipant, LobbyParticipant][] {
    const matches: [LobbyParticipant, LobbyParticipant][] = [];
    const usedMales = new Set<string>();
    const usedFemales = new Set<string>();

    // Create compatibility scores for all possible pairs
    const scores: { male: LobbyParticipant; female: LobbyParticipant; score: number }[] = [];
    
    males.forEach(male => {
      females.forEach(female => {
        const score = this.calculateCompatibilityScore(male.user, female.user);
        scores.push({ male, female, score });
      });
    });

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);

    // Create matches based on highest scores
    for (const { male, female, score } of scores) {
      if (!usedMales.has(male.user_id) && !usedFemales.has(female.user_id)) {
        matches.push([male, female]);
        usedMales.add(male.user_id);
        usedFemales.add(female.user_id);
      }
    }

    return matches;
  }
}