// src/types/mindmatch.ts

// export interface MindMatchPrompt {
//   id: string;
//   type: 'rapid_fire' | 'situational' | 'vibe_prompt' | 'this_or_that';
//   question: string;
//   options?: string[];
//   category: string;
//   created_at: string;
// }

// // export interface MindMatchAnswer {
// //   id: string;
// //   prompt_id: string;
// //   user_id: string;
// //   lobby_id: string;
// //   answer: string;
// //   answer_index?: number; // For multiple choice
// //   created_at: string;
// // }
// export interface MindMatchAnswer {
//   id: string;
//   session_id: string;
//   prompt_id: string;
//   user_id: string;
//   answer_text?: string;         // Make optional
//   answer_option_index?: number; // Make optional
//   answer_value?: any;          // Add this field
//   time_taken?: number;         // Add this field
//   answered_at: string;
//   created_at: string;
//   prompt?: MindMatchPrompt;    // Add relation
// }

// export interface MindMatchSession {
//   id: string;
//   lobby_id: string;
//   status: 'waiting' | 'active' | 'completed';
//   current_prompt_index: number;
//   prompts: MindMatchPrompt[];
//   started_at?: string;
//   ends_at?: string;
//   created_at: string;
//   prompts_used: string[];
//   completed_at?: string;
// }

// // In types/mindmatch.ts
// // export interface MindMatchSession {
// //   id: string;
// //   lobby_id: string;
// //   status: 'waiting' | 'active' | 'completed';
// //   prompts_used: string[];
// //   created_by: string;
// //   started_at?: string;
// //   completed_at?: string;
// //   created_at: string;
// // }

// // export interface VibeMatch {
// //   id: string;
// //   user1_id: string;
// //   user2_id: string;
// //   lobby_id: string;
// //   session_id: string;
// //   compatibility_score: number;
// //   shared_answers: number;
// //   total_answers: number;
// //   match_type: 'mind_lock' | 'vibe_sync' | 'deep_connection';
// //   created_at: string;
// // }

// // export interface VibeMatch {
// //   id: string;
// //   user1_id: string;
// //   user2_id: string;
// //   lobby_id: string;
// //   session_id: string;
// //   compatibility_score: number;
// //   shared_answers: number;
// //   total_answers: number;
// //   match_type: 'mind_lock' | 'vibe_sync' | 'deep_connection';
// //   match_strength: 'low' | 'medium' | 'high' | 'perfect';
// //   status: 'active' | 'expired' | 'connected' | 'dismissed';
// //   created_at: string;
// //   updated_at: string;
// //   // user1?: LobbyParticipant;  // Add relations
// //   // user2?: LobbyParticipant;
// // }
// export interface VibeMatch {
//   id: string;
//   session_id: string;
//   user1_id: string;
//   user2_id: string;
//   lobby_id: string;
//   compatibility_score: number;
//   shared_answers: number;
//   total_answers: number;
//   match_type: 'mind_lock' | 'vibe_sync' | 'deep_connection';
//   match_strength: 'low' | 'medium' | 'high' | 'perfect';
//   status: 'active' | 'expired' | 'connected' | 'dismissed';
//   created_at?: string;
//   updated_at?: string;
// }


// export interface MindMatchStats {
//   user_id: string;
//   lobby_id: string;
//   total_answers: number;
//   vibe_matches: number;
//   compatibility_average: number;
//   most_matched_category: string;
//   charm_coins_earned: number;
// }

// export interface UserVibeProfile {
//   user_id: string;
//   lobby_id: string;
//   vibe_tags: string[];
//   personality_traits: Record<string, number>;
//   answer_patterns: Record<string, string>;
//   updated_at: string;
// }



// // src/types/mindmatch.ts
// export interface MindMatchPrompt {
//   id: string;
//   type: 'rapid_fire' | 'situational' | 'this_or_that' | 'vibe_prompt';
//   question: string;
//   options?: string[];
//   category: string;
// }

// export interface CurrentQuestion {
//   question: MindMatchPrompt;
//   questionNumber: number;
//   roundId: string;
//   endsAt: string;
// }

// export interface MindMatchAnswer {
//   id: string;
//   lobby_id: string;
//   user_id: string;
//   prompt_id: string;
//   round_id: string;
//   answer_text?: string;
//   answer_option_index?: number;
//   time_taken: number;
// }

// export interface VibeMatch {
//   id: string;
//   user1_id: string;
//   user2_id: string;
//   compatibility_score: number;
//   shared_answers: number;
//   total_answers: number;
//   match_type: 'vibe_sync' | 'mind_lock' | 'deep_connection';
//   match_strength: 'low' | 'medium' | 'high' | 'perfect';
//   user1?: { username: string; profile_picture?: string };
//   user2?: { username: string; profile_picture?: string };
// }


// src/types/mindmatch.ts
export interface MindMatchPrompt {
  id: string;
  type: 'rapid_fire' | 'situational' | 'this_or_that' | 'vibe_prompt';
  question: string;
  options?: string[] | null;
  category: string;
  is_active: boolean;
  difficulty_level: number;
  created_at: string;
}

export interface CurrentQuestion {
  question: MindMatchPrompt;
  questionNumber: number;
  roundId: string;
  endsAt: string;
}

export interface MindMatchAnswer {
  id: string;
  lobby_id: string;
  user_id: string;
  prompt_id: string;
  round_id: string;
  answer_text?: string;
  answer_option_index?: number;
  time_taken: number;
  answered_at: string;
  prompt?: MindMatchPrompt;
}

export interface VibeMatch {
  id: string;
  lobby_id: string;
  user1_id: string;
  user2_id: string;
  round_id: string;
  compatibility_score: number;
  shared_answers: number;
  total_answers: number;
  match_type: 'vibe_sync' | 'mind_lock' | 'deep_connection';
  match_strength: 'low' | 'medium' | 'high' | 'perfect';
  status: 'active' | 'expired';
  created_at: string;
  user1?: {
    id: string;
    username: string;
    profile_picture?: string;
  };
  user2?: {
    id: string;
    username: string;
    profile_picture?: string;
  };
}

export interface UserStats {
  total_rounds_played: number;
  total_matches_found: number;
  charm_coins_earned: number;
  best_compatibility_score: number;
  last_played_at?: string;
}

export interface LeaderboardEntry {
  user: {
    id: string;
    username: string;
    profile_picture?: string;
  };
  matches: number;
  totalCompatibility: number;
  averageCompatibility: number;
}