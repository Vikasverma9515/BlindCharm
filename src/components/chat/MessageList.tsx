// // src/lib/matching/types.ts
// interface MatchCriteria {
//     interests: string[];
//     age: number;
//     ageRange: { min: number; max: number };
//     gender: string;
//     genderPreference: string[];
//     location: string;
//     maxDistance: number;
//     dealBreakers: string[];
//   }

//   private calculateActivityCompatibility(user1: UserProfile, user2: UserProfile): number {
//     // Placeholder logic for activity compatibility
//     // Replace this with your actual implementation
//     return Math.random(); // Returns a random score between 0 and 1
//   }

// interface UserProfile {
//     id: string;
//     interests: string[];
//     age: number;
//     gender: string;
//     location: string;
//     [key: string]: any; // Add other fields as necessary
// }
  
//   // src/lib/matching/matchingEngine.ts
//   export class MatchingEngine {
//     private calculateCompatibilityScore(user1: UserProfile, user2: UserProfile): number {
//       let score = 0;
      
//       // Interest matching (30% of total score)
//       const sharedInterests = user1.interests.filter(i => user2.interests.includes(i));
//       score += (sharedInterests.length / Math.max(user1.interests.length, user2.interests.length)) * 30;
//       const activityScore = this.calculateActivityCompatibility(user1, user2);
//       // Age compatibility (20% of total score)
//       const ageDiff = Math.abs(user1.age - user2.age);
//       score += Math.max(0, (20 - ageDiff)) * 1;
  
//       // Activity level matching (20% of total score)
//       const activityScore = this.calculateActivityCompatibility(user1, user2);
//       score += activityScore * 20;
  
//       // Communication style (30% of total score)
//       const communicationScore = this.calculateCommunicationCompatibility(user1, user2);
//       score += communicationScore * 30;
  
//       return score;
//     }
  
//     async findMatches(userId: string, criteria: MatchCriteria): Promise<UserProfile[]> {
//       const { data: potentialMatches, error } = await supabase
//         .from('users')
//         .select('*')
//         .neq('id', userId)
//         .match({ gender: criteria.genderPreference })
//         .filter('age', 'between', [criteria.ageRange.min, criteria.ageRange.max]) as { data: UserProfile[] | null, error: any };
  
//       if (error) throw error;
  
//       return (potentialMatches || [])
//         .map((match: UserProfile) => ({
//           ...match,
//           compatibilityScore: this.calculateCompatibilityScore(user, match)
//         }))
//         .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
//     }
//   }