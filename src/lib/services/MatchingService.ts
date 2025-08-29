// // src/lib/services/MatchingService.ts

// import { supabase } from '@/lib/supabase'


// interface User {
//   id: string;
//   username: string;
//   gender: 'male' | 'female' | 'other';
// }

// interface LobbyParticipant {
//   id: string;
//   user_id: string;
//   users: {
//     id: string;
//     username: string;
//     gender: string;
//   };
// }




// // src/lib/services/MatchingService.ts

// export class MatchingService {
//   // Test function to check if basic match insertion works
//   static async testMatchInsertion(lobbyId: string) {
//     try {
//       console.log('🧪 Testing basic match insertion...');
      
//       const testMatch = {
//         user1_id: 'test-user-1',
//         user2_id: 'test-user-2', 
//         lobby_id: lobbyId,
//         status: 'matched',
//         user1_revealed: false,
//         user2_revealed: false
//       };
      
//       const { data, error } = await supabase
//         .from('matches')
//         .insert([testMatch])
//         .select();
        
//       if (error) {
//         console.error('🧪 Test insertion failed:', error);
//         return { success: false, error };
//       }
      
//       console.log('🧪 Test insertion successful:', data);
      
//       // Clean up test data
//       if (data && data[0]) {
//         await supabase.from('matches').delete().eq('id', data[0].id);
//         console.log('🧪 Test data cleaned up');
//       }
      
//       return { success: true, data };
//     } catch (error) {
//       console.error('🧪 Test insertion error:', error);
//       return { success: false, error };
//     }
//   }

//   static async matchParticipants(lobbyId: string) {
//     try {
//       console.log('Starting matching process for lobby:', lobbyId);
      
//       // Check current session
//       const { data: { session }, error: sessionError } = await supabase.auth.getSession();
//       console.log('🔐 Current session:', session?.user?.id ? 'Authenticated' : 'Not authenticated');
//       if (sessionError) console.error('Session error:', sessionError);

//       // Get all waiting participants
//       const { data: rawParticipants, error } = await supabase
//         .from('lobby_participants')
//         .select(`
//           id,
//           user_id,
//           users:user_id (
//             id,
//             username,
//             gender
//           )
//         `)
//         .eq('lobby_id', lobbyId)
//         .eq('status', 'waiting');

//       if (error) throw error;

//       if (!rawParticipants || rawParticipants.length < 2) {
//         console.log('Not enough participants for matching');
//         return { success: true, matches: [] };
//       }

//       // Process participants
//       const typedParticipants = rawParticipants
//         .filter(p => {
//           if (!p.users) return false;
//           if (Array.isArray(p.users)) {
//             return p.users.length > 0 && typeof p.users[0].gender === 'string';
//           }
//           return typeof (p.users as { gender: string }).gender === 'string';
//         })
//         .map(p => {
//           let userObj = Array.isArray(p.users) ? p.users[0] : p.users;
//           return {
//             id: p.id,
//             user_id: p.user_id,
//             user: {
//               id: userObj.id,
//               username: userObj.username,
//               gender: userObj.gender.toLowerCase()
//             }
//           };
//         });

//       // Separate and shuffle participants
//       const males = typedParticipants.filter(p => p.user.gender === 'male');
//       const females = typedParticipants.filter(p => p.user.gender === 'female');
      
      
//       const shuffle = (array: any[]) => {
//         for (let i = array.length - 1; i > 0; i--) {
//           const j = Math.floor(Math.random() * (i + 1));
//           [array[i], array[j]] = [array[j], array[i]];
//         }
//       };

//       shuffle(males);
//       shuffle(females);
      

//       // Create matches
//       const matches = [];
//       const maxMatches = Math.min(males.length, females.length);

//       for (let i = 0; i < maxMatches; i++) {
//         matches.push({
//           user1_id: males[i].user_id,
//           user2_id: females[i].user_id,
//           lobby_id: lobbyId,
//           status: 'matched',
//           user1_revealed: false,
//           user2_revealed: false
//         });
//       }

//       if (matches.length > 0) {
//         console.log('🎯 Creating matches:', matches);
        
//         // Insert matches - triggers will handle notifications
//         const { data: matchData, error: matchError } = await supabase
//           .from('matches')
//           .insert(matches)
//           .select();

//         if (matchError) {
//           console.error('❌ Error inserting matches:', matchError);
//           console.error('❌ Match data being inserted:', matches);
//           console.error('❌ Error details:', {
//             code: matchError.code,
//             message: matchError.message,
//             details: matchError.details,
//             hint: matchError.hint
//           });
//           throw matchError;
//         }

//         console.log('✅ Matches inserted successfully:', matchData);
//         console.log('🔔 Sending broadcast notifications to both users in each match...');
        
//         // Create a map of user_id to username from our participants data
//         const userIdToUsername = new Map<string, string>();
//         typedParticipants.forEach(p => {
//           userIdToUsername.set(p.user_id, p.user.username);
//         });

//         // Send broadcast notifications for each match
//         const notificationPromises = matchData?.map(async (match) => {
//           try {
//             // Get usernames from our participant data
//             const user1Username = userIdToUsername.get(match.user1_id);
//             const user2Username = userIdToUsername.get(match.user2_id);

//             console.log(`📡 Sending notifications for match ${match.id}: ${user1Username} & ${user2Username}`);

//             // Create notification channels for both users
//             const channel1 = supabase.channel(`match_notifications_${match.user1_id}`);
//            const channel2 = supabase.channel(`match_notifications_${match.user2_id}`);

//             await Promise.all([
//               channel1.subscribe(),
//               channel2.subscribe()
//              ]);

//             // Send match notification to both users
//             await Promise.all([
//               channel1.send({
//                 type: 'broadcast',
//                 event: 'match_success',
//                 payload: {
//                   matchId: match.id,
//                   user1Id: match.user1_id,
//                   user2Id: match.user2_id,
//                   user1Username: user1Username,
//                   user2Username: user2Username
//                 }
//               }),
//               channel2.send({
//                 type: 'broadcast',
//                 event: 'match_success',
//                 payload: {
//                   matchId: match.id,
//                   user1Id: match.user1_id,
//                   user2Id: match.user2_id,
//                   user1Username: user1Username,
//                   user2Username: user2Username
//                 }
//               })
//             ]);

//             console.log(`✅ Broadcast notifications sent for match ${match.id}`);

//             // Clean up channels after a short delay
//             setTimeout(() => {
//               channel1.unsubscribe();
//               channel2.unsubscribe();
//             }, 2000);

//           } catch (notificationError) {
//             console.error('❌ Error sending broadcast notifications for match:', match.id, notificationError);
//           }
//         }) || [];

//         await Promise.all(notificationPromises);

//         // Remove participants
//         const matchedUserIds = matches.flatMap(m => [m.user1_id, m.user2_id]);
//         console.log('Removing participants:', matchedUserIds);
        
//         const { error: deleteError } = await supabase
//           .from('lobby_participants')
//           .delete()
//           .eq('lobby_id', lobbyId)
//           .in('user_id', matchedUserIds);

//         if (deleteError) {
//           console.error('Error removing participants:', deleteError);
//           // Don't throw here, matches are already created
//         } else {
//           console.log('Participants removed successfully');
//         }

//         return {
//           success: true,
//           matches: matchData
//         };
//       }

//       return { success: true, matches: [] };
//     } catch (error) {
//       console.error('Error in matching process:', error);
//       return { success: false, error };
//     }
//   }
// }






// src/lib/services/MatchingService.ts
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  username: string;
  gender: 'male' | 'female' | 'other';
}

interface LobbyParticipant {
  id: string;
  user_id: string;
  users: {
    id: string;
    username: string;
    gender: string;
  };
}

export class MatchingService {
  static async matchParticipants(lobbyId: string) {
    try {
      console.log('Starting matching process for lobby:', lobbyId);

      // Get all waiting participants with correct join
      const { data: rawParticipants, error } = await supabase
        .from('lobby_participants')
        .select(`
          id,
          user_id,
          users:user_id (
            id,
            username,
            gender
          )
        `)
        .eq('lobby_id', lobbyId)
        .eq('status', 'waiting');

      if (error) {
        console.error('Error fetching participants:', error);
        throw error;
      }

      console.log('📊 Raw participants fetched:', rawParticipants.length);
      console.log('📋 Raw participants data:', rawParticipants);

      if (!rawParticipants || rawParticipants.length < 2) {
        console.log('❌ Not enough participants for matching (total:', rawParticipants?.length || 0, ')');
        return { success: true, matches: [] };
      }

      const typedParticipants = rawParticipants
        .filter(p => {
          if (!p.users) {
            console.log('⚠️ Participant missing user data:', p);
            return false;
          }
          if (Array.isArray(p.users)) {
            const hasValidGender = p.users.length > 0 && typeof p.users[0].gender === 'string';
            if (!hasValidGender) {
              console.log('⚠️ Participant with invalid gender (array):', p);
            }
            return hasValidGender;
          }
          const hasValidGender = typeof (p.users as { gender: string }).gender === 'string';
          if (!hasValidGender) {
            console.log('⚠️ Participant with invalid gender (object):', p);
          }
          return hasValidGender;
        })
        .map(p => {
          let userObj = Array.isArray(p.users) ? p.users[0] : p.users;
          return {
            id: p.id,
            user_id: p.user_id,
            user: {
              id: userObj.id,
              username: userObj.username,
              gender: userObj.gender.toLowerCase()
            }
          };
        });

      console.log('✅ Valid participants after filtering:', typedParticipants.length);
      console.log('👥 Participant details:', typedParticipants.map(p => ({ 
        username: p.user.username, 
        gender: p.user.gender 
      })));

      // Separate participants
      const males = typedParticipants.filter(p => p.user.gender === 'male');
      const females = typedParticipants.filter(p => p.user.gender === 'female');

      console.log('👨 Males found:', males.length, males.map(m => m.user.username));
      console.log('👩 Females found:', females.length, females.map(f => f.user.username));

      // Get question scores for boys to prioritize high scorers
      // Include both reviewed written answers and auto-scored MCQ answers
      const { data: questionScores, error: scoresError } = await supabase
        .from('question_answers')
        .select('boy_id, points_awarded, is_reviewed')
        .eq('lobby_id', lobbyId);

      if (scoresError) {
        console.error('Error fetching question scores:', scoresError);
      }

      // Calculate total scores for each boy
      const boyScores = new Map<string, number>();
      if (questionScores) {
        console.log('📊 All question scores found:', questionScores);
        questionScores.forEach(score => {
          const currentScore = boyScores.get(score.boy_id) || 0;
          boyScores.set(score.boy_id, currentScore + score.points_awarded);
        });
        console.log('💯 Final boy scores:', Array.from(boyScores.entries()));
      } else {
        console.log('⚠️ No question scores found for lobby:', lobbyId);
      }

      // Sort males by their question scores (highest first)
      males.sort((a, b) => {
        const scoreA = boyScores.get(a.user_id) || 0;
        const scoreB = boyScores.get(b.user_id) || 0;
        return scoreB - scoreA; // Descending order (highest score first)
      });

      console.log('🏆 Males sorted by score:', males.map(m => ({
        username: m.user.username,
        score: boyScores.get(m.user_id) || 0
      })));

      // Shuffle females for fairness
      const shuffle = (array: any[]) => {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
      };

      shuffle(females);

      // Check if we have at least one male and one female
      if (males.length === 0 || females.length === 0) {
        console.log('❌ Cannot create matches: need at least 1 male and 1 female');
        console.log(`   Males: ${males.length}, Females: ${females.length}`);
        return { success: true, matches: [] };
      }

      const matches = [];
      const maxMatches = Math.min(males.length, females.length);
      console.log('🎯 Creating', maxMatches, 'matches');
 
      for (let i = 0; i < maxMatches; i++) {
        matches.push({
          user1_id: males[i].user_id,
          user2_id: females[i].user_id,
          lobby_id: lobbyId,
          status: 'matched',
        });
      }

      if (matches.length > 0) {
        console.log('Creating matches:', matches);
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .insert(matches)
          .select();

        if (matchError) {
          console.error('Error creating matches:', matchError);
          throw matchError;
        }

        console.log('Matches created successfully:', matchData);
        console.log('Sending broadcast notifications to both users in each match...');

        // Create a map of user_id to username from our participants data
        const userIdToUsername = new Map<string, string>();
        typedParticipants.forEach(p => {
          userIdToUsername.set(p.user_id, p.user.username);
        });

        // Send push notifications for matches
        const pushNotificationPromises = matchData?.map(async (match) => {
          try {
            const user1Username = userIdToUsername.get(match.user1_id);
            const user2Username = userIdToUsername.get(match.user2_id);

            // Send push notification to user1
            await fetch('/api/notifications/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: match.user1_id,
                title: '💕 New Match!',
                body: user2Username 
                  ? `You matched with ${user2Username}! Start chatting now.`
                  : 'You have a new match! Start chatting now.',
                type: 'match',
                url: `/matches/${match.id}`,
                matchId: match.id,
                requireInteraction: true
              })
            });

            // Send push notification to user2
            await fetch('/api/notifications/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: match.user2_id,
                title: '💕 New Match!',
                body: user1Username 
                  ? `You matched with ${user1Username}! Start chatting now.`
                  : 'You have a new match! Start chatting now.',
                type: 'match',
                url: `/matches/${match.id}`,
                matchId: match.id,
                requireInteraction: true
              })
            });

            console.log(`✅ Push notifications sent for match ${match.id}`);
          } catch (error) {
            console.error(`❌ Error sending push notifications for match ${match.id}:`, error);
          }
        });

        // Wait for push notifications to complete (but don't block the main flow)
        if (pushNotificationPromises) {
          Promise.all(pushNotificationPromises).catch(error => {
            console.error('Some push notifications failed:', error);
          });
        }

        // Send broadcast notifications for each match
        const notificationPromises = matchData?.map(async (match) => {
          try {
            // Get usernames from our participant data
            const user1Username = userIdToUsername.get(match.user1_id);
            const user2Username = userIdToUsername.get(match.user2_id);

            console.log(`Sending notifications for match ${match.id}: ${user1Username} & ${user2Username}`);

            // Create notification channels for both users
            const channel1 = supabase.channel(`match_notifications_${match.user1_id}`);
            const channel2 = supabase.channel(`match_notifications_${match.user2_id}`);

            // Send notifications for both users
            await Promise.all([
              channel1.send({
                type: 'broadcast',
                event: 'match_success',
                payload: {
                  matchId: match.id,
                  user1Id: match.user1_id,
                  user2Id: match.user2_id,
                  user1Username: user1Username,
                  user2Username: user2Username
                }
              }),
              channel2.send({
                type: 'broadcast',
                event: 'match_success',
                payload: {
                  matchId: match.id,
                  user1Id: match.user1_id,
                  user2Id: match.user2_id,
                  user1Username: user1Username,
                  user2Username: user2Username
                }
              })
            ]);

            console.log(`Notifications sent for match ${match.id}`);
            
            // Cleanup channels
            setTimeout(() => {
              channel1.unsubscribe();
              channel2.unsubscribe();
            }, 2000);
          } catch (notificationError) {
            console.error('Error sending notifications for match:', match.id, notificationError);
          }
        });

        if (notificationPromises) {
          await Promise.all(notificationPromises);
        }

        // // Update matched participants status
        // const matchedUserIds = matches.flatMap(m => [m.user1_id, m.user2_id]);
        // console.log('Updating participants status:', matchedUserIds);

        // const { error: updateError } = await supabase
        //   .from('lobby_participants')
        //   .update({ status: 'matched' })
        //   .eq('lobby_id', lobbyId)
        //   .in('user_id', matchedUserIds);

        // if (updateError) {
        //   console.error('Error updating participants:', updateError);
        //   throw updateError;
        // }

        // console.log('Participants status updated successfully');

        //remove participants
        const matchedUserIds = matches.flatMap(m => [m.user1_id, m.user2_id]);
        console.log('Removing participants:', matchedUserIds);

        const { error: deleteError } = await supabase
          .from('lobby_participants')
          .delete()
          .eq('lobby_id', lobbyId)
          .in('user_id', matchedUserIds);

        if (deleteError) {
          console.error('Error removing participants:', deleteError);
          throw deleteError;
        }

        console.log('Participants removed successfully');

        // Reset questions and answers for the next round
        await this.resetQuestionsAndAnswers(lobbyId);

        return {
          success: true,
          matches: matchData
        };
      }

      return { success: true, matches: [] };
    } catch (error) {
      console.error('Error in matching process:', error);
      return { success: false, error };
    }
  }

  // Reset questions and answers after matching for a fresh start
  static async resetQuestionsAndAnswers(lobbyId: string) {
    try {
      console.log('🔄 Resetting questions and answers for lobby:', lobbyId);

      // Delete all answers for this lobby
      const { error: answersError } = await supabase
        .from('question_answers')
        .delete()
        .eq('lobby_id', lobbyId);

      if (answersError) {
        console.error('❌ Error deleting answers:', answersError);
        throw answersError;
      }

      // Delete all questions for this lobby
      const { error: questionsError } = await supabase
        .from('girl_questions')
        .delete()
        .eq('lobby_id', lobbyId);

      if (questionsError) {
        console.error('❌ Error deleting questions:', questionsError);
        throw questionsError;
      }

      console.log('✅ Questions and answers reset successfully for lobby:', lobbyId);
      
      // Send broadcast notification to refresh the Q&A system
      const resetChannel = supabase.channel(`lobby_reset_${lobbyId}`);
      await resetChannel.send({
        type: 'broadcast',
        event: 'questions_reset',
        payload: { lobbyId }
      });

      // Clean up channel
      setTimeout(() => {
        resetChannel.unsubscribe();
      }, 1000);

    } catch (error) {
      console.error('❌ Error resetting questions and answers:', error);
      // Don't throw error here as it shouldn't block the matching process
    }
  }
}








//   static async matchParticipants(lobbyId: string) {
//     try {
//       console.log('Starting matching process for lobby:', lobbyId);

//       // Get all waiting participants with correct join
//       const { data: rawParticipants, error } = await supabase
//         .from('lobby_participants')
//         .select(`
//           id,
//           user_id,
//           users:user_id (
//             id,
//             username,
//             gender
//           )
//         `)
//         .eq('lobby_id', lobbyId)
//         .eq('status', 'waiting');

//       if (error) {
//         console.error('Error fetching participants:', error);
//         throw error;
//       }

//       if (!rawParticipants || rawParticipants.length < 2) {
//         console.log('Not enough participants for matching');
//         return { success: true, matches: [] };
//       }

//       // Normalize and filter participants
//       const typedParticipants = rawParticipants
//         .filter(p => {
//           if (!p.users) return false;
//           if (Array.isArray(p.users)) {
//             return p.users.length > 0 && typeof p.users[0].gender === 'string';
//           }
//           return typeof (p.users as { gender: string }).gender === 'string';
//         })
//         .map(p => {
//           let userObj;
//           if (Array.isArray(p.users)) {
//             userObj = p.users[0];
//           } else {
//             userObj = p.users;
//           }
//           return {
//             id: p.id,
//             user_id: p.user_id,
//             user: {
//               id: userObj.id,
//               username: userObj.username,
//               gender: userObj.gender.toLowerCase()
//             }
//           };
//         });

//       // Separate by gender
//       const males = typedParticipants.filter(p => p.user.gender === 'male');
//       const females = typedParticipants.filter(p => p.user.gender === 'female');

//       // Shuffle for fairness
//       const shuffle = (array: any[]) => {
//         for (let i = array.length - 1; i > 0; i--) {
//           const j = Math.floor(Math.random() * (i + 1));
//           [array[i], array[j]] = [array[j], array[i]];
//         }
//       };

//       shuffle(males);
//       shuffle(females);

//       // Create matches
//       const matches = [];
//       const maxMatches = Math.min(males.length, females.length);

//       for (let i = 0; i < maxMatches; i++) {
//         const match = {
//           user1_id: males[i].user_id,
//           user2_id: females[i].user_id,
//           lobby_id: lobbyId,
//           status: 'matched'
//         };
//         matches.push(match);
//       }

//       console.log('Proposed matches:', matches);

//       if (matches.length > 0) {
//         // Start a transaction: insert matches
//         const { data: matchData, error: matchError } = await supabase
//           .from('matches')
//           .insert(matches)
//           .select(`
//             id,
//             user1_id,
//             user2_id
//           `);

//         if (matchError) throw matchError;

//         // Get all matched user IDs
//         const matchedUserIds = matches.flatMap(m => [m.user1_id, m.user2_id]);

//         // Remove all matched users from the lobby at once
//         // const { error: deleteError } = await supabase
//         //   .from('lobby_participants')
//         //   .delete()
//         //   .eq('lobby_id', lobbyId)
//         //   .in('user_id', matchedUserIds);

//         // if (deleteError) throw deleteError;

//         const { error: deleteError } = await supabase
//   .from('lobby_participants')
//   .delete()
//   .eq('lobby_id', lobbyId)
//   .in('user_id', matchedUserIds);

// if (deleteError) {
//   console.error('Error removing users from lobby_participants:', deleteError);
//   throw deleteError;
// } else {
//   console.log('Removed users from lobby_participants:', matchedUserIds);
// }


//         // Create a map of user_id to username from our participants data
//         const userIdToUsername = new Map<string, string>();
//         typedParticipants.forEach(p => {
//           userIdToUsername.set(p.user_id, p.user.username);
//         });

//         // Create notification channels for each match
//         const notificationPromises = matchData?.map(async (match) => {
//           // Get usernames from our participant data
//           const user1Username = userIdToUsername.get(match.user1_id);
//           const user2Username = userIdToUsername.get(match.user2_id);

//           // Create notification channel for both users
//           const channel1 = supabase.channel(`match_notifications_${match.user1_id}`);
//           const channel2 = supabase.channel(`match_notifications_${match.user2_id}`);

//           await Promise.all([
//             channel1.subscribe(),
//             channel2.subscribe()
//           ]);

//           // Send match notification
//           await Promise.all([
//             channel1.send({
//               type: 'broadcast',
//               event: 'match_success',
//               payload: {
//                 matchId: match.id,
//                 user1Id: match.user1_id,
//                 user2Id: match.user2_id,
//                 user1Username: user1Username,
//                 user2Username: user2Username
//               }
//             }),
//             channel2.send({
//               type: 'broadcast',
//               event: 'match_success',
//               payload: {
//                 matchId: match.id,
//                 user1Id: match.user1_id,
//                 user2Id: match.user2_id,
//                 user1Username: user1Username,
//                 user2Username: user2Username
//               }
//             })
//           ]);

//           // // Cleanup channels
//           // channel1.unsubscribe();
//           // channel2.unsubscribe();
//         }) || [];

//         await Promise.all(notificationPromises);

//         return {
//           success: true,
//           matches: matchData,
//           matchedUsers: matchedUserIds
//         };
//       }

//       return { success: true, matches: [] };
//     } catch (error) {
//       console.error('Error in matching process:', error);
//       return { success: false, error };
//     }
//   }
// }




// // src/lib/services/MatchingService.ts

// import { supabase } from '@/lib/supabase'

// interface User {
//   id: string;
//   username: string;
//   gender: 'male' | 'female' | 'other';
// }

// interface LobbyParticipant {
//   id: string;
//   user_id: string;
//   users: {
//     id: string;
//     username: string;
//     gender: string;
//   };
// }


// interface SupabaseResponse {
//   id: string;
//   user_id: string;
//   users: {
//     id: string;
//     username: string;
//     gender: string;
//   };
// }

// interface Match {
//   user1_id: string;
//   user2_id: string;
//   lobby_id: string;
//   status: 'matched';
// }


// export class MatchingService {
//   static async matchParticipants(lobbyId: string) {
//     try {
//       console.log('Starting matching process for lobby:', lobbyId);

//       // Get all waiting participants with correct join
//       const { data: rawParticipants, error } = await supabase
//         .from('lobby_participants')
//         .select(`
//           id,
//           user_id,
//           users:user_id (
//             id,
//             username,
//             gender
//           )
//         `)
//         .eq('lobby_id', lobbyId)
//         .eq('status', 'waiting');

//       if (error) {
//         console.error('Error fetching participants:', error);
//         throw error;
//       }

//       if (!rawParticipants || rawParticipants.length < 2) {
//         console.log('Not enough participants for matching');
//         return { success: true, matches: [] };
//       }

//       // Normalize and filter participants
//       const typedParticipants = rawParticipants
//         .filter(p => {
//           // Handle both array and object cases for p.users
//           if (!p.users) return false;
//           if (Array.isArray(p.users)) {
//             return p.users.length > 0 && typeof p.users[0].gender === 'string';
//           }
//           return typeof (p.users as { gender: string }).gender === 'string';
//         })
//         .map(p => {
//           let userObj;
//           if (Array.isArray(p.users)) {
//             userObj = p.users[0];
//           } else {
//             userObj = p.users;
//           }
//           return {
//             id: p.id,
//             user_id: p.user_id,
//             user: {
//               id: userObj.id,
//               username: userObj.username,
//               gender: userObj.gender.toLowerCase()
//             }
//           };
//         });

//       // Separate by gender
//       const males = typedParticipants.filter(p => p.user.gender === 'male');
//       const females = typedParticipants.filter(p => p.user.gender === 'female');

//       // Shuffle for fairness
//       const shuffle = (array: any[]) => {
//         for (let i = array.length - 1; i > 0; i--) {
//           const j = Math.floor(Math.random() * (i + 1));
//           [array[i], array[j]] = [array[j], array[i]];
//         }
//       };

//       shuffle(males);
//       shuffle(females);

//       // Create matches
//       const matches = [];
//       const maxMatches = Math.min(males.length, females.length);

//       for (let i = 0; i < maxMatches; i++) {
//         matches.push({
//           user1_id: males[i].user_id,
//           user2_id: females[i].user_id,
//           lobby_id: lobbyId,
//           status: 'matched'
//         });
//       }

//       console.log('Proposed matches:', matches);

//       if (matches.length > 0) {
//         // Create matches first
//         const { data: matchData, error: matchError } = await supabase
//           .from('matches')
//           .insert(matches)
//           .select();

//         if (matchError) throw matchError;

//         // Remove ALL matched users from lobby_participants
//         const matchedUserIds = matches.flatMap(m => [m.user1_id, m.user2_id]);
//         const { error: deleteError } = await supabase
//           .from('lobby_participants')
//           .delete()
//           .eq('lobby_id', lobbyId)
//           .in('user_id', matchedUserIds);

//         if (deleteError) {
//           console.error('Error removing matched participants:', deleteError);
//           throw deleteError;
//         }

//         // Optionally: create welcome messages, etc.

//         return { success: true, matches: matchData };
//       }

//       return { success: true, matches: [] };
//     } catch (error) {
//       console.error('Error in matching process:', error);
//       return { success: false, error };
//     }
//   }
// }



// // src/lib/services/MatchingService.ts

// import { supabase } from '@/lib/supabase'

// interface User {
//   id: string;
//   username: string;
//   gender: 'male' | 'female' | 'other';
// }

// interface LobbyParticipant {
//   id: string;
//   user_id: string;
//   users: {
//     id: string;
//     username: string;
//     gender: string;
//   };
// }

// interface Match {
//   user1_id: string;
//   user2_id: string;
//   lobby_id: string;
//   status: 'matched';
// }

// export class MatchingService {
//   // Automatically match at 0, 3, 6, 9, 12, 15, 18, 21 o'clock
//   static async autoMatchIfNeeded(lobbyId: string) {
//     const matchHours = [0, 3, 6, 9, 12, 15, 18, 21];
//     const now = new Date();
//     const hour = now.getHours();
//     const minute = now.getMinutes();

//     if (matchHours.includes(hour) && minute === 0) {
//       return await MatchingService.matchParticipants(lobbyId);
//     }
//     return { success: false, reason: 'Not match time' };
//   }

//   static async matchParticipants(lobbyId: string) {
//     try {
//       console.log('Starting matching process for lobby:', lobbyId);

//       // Get all waiting participants with correct join
//       const { data: rawParticipants, error } = await supabase
//         .from('lobby_participants')
//         .select(`
//           id,
//           user_id,
//           users:user_id (
//             id,
//             username,
//             gender
//           )
//         `)
//         .eq('lobby_id', lobbyId)
//         .eq('status', 'waiting');

//       if (error) {
//         console.error('Error fetching participants:', error);
//         throw error;
//       }

//       if (!rawParticipants || rawParticipants.length < 2) {
//         console.log('Not enough participants for matching');
//         return { success: true, matches: [] };
//       }

//       // Normalize and filter participants
//       const typedParticipants = rawParticipants
//         .filter(p => {
//           if (!p.users) return false;
//           if (Array.isArray(p.users)) {
//             return p.users.length > 0 && typeof p.users[0].gender === 'string';
//           }
//           return typeof (p.users as { gender: string }).gender === 'string';
//         })
//         .map(p => {
//           let userObj;
//           if (Array.isArray(p.users)) {
//             userObj = p.users[0];
//           } else {
//             userObj = p.users;
//           }
//           return {
//             id: p.id,
//             user_id: p.user_id,
//             user: {
//               id: userObj.id,
//               username: userObj.username,
//               gender: userObj.gender.toLowerCase()
//             }
//           };
//         });

//       // Separate by gender
//       const males = typedParticipants.filter(p => p.user.gender === 'male');
//       const females = typedParticipants.filter(p => p.user.gender === 'female');

//       // Shuffle for fairness
//       const shuffle = (array: any[]) => {
//         for (let i = array.length - 1; i > 0; i--) {
//           const j = Math.floor(Math.random() * (i + 1));
//           [array[i], array[j]] = [array[j], array[i]];
//         }
//       };

//       shuffle(males);
//       shuffle(females);

//       // Create matches
//       const matches = [];
//       const maxMatches = Math.min(males.length, females.length);

//       for (let i = 0; i < maxMatches; i++) {
//         const match = {
//           user1_id: males[i].user_id,
//           user2_id: females[i].user_id,
//           lobby_id: lobbyId,
//           status: 'matched'
//         };
//         matches.push(match);
//       }

//       console.log('Proposed matches:', matches);

//       if (matches.length > 0) {
//         // Begin transaction
//         const { data: matchData, error: matchError } = await supabase
//           .from('matches')
//           .insert(matches)
//           .select(`
//             id,
//             user1_id,
//             user2_id,
//             user1:user1_id(username),
//             user2:user2_id(username)
//           `);

//         if (matchError) throw matchError;

//         // Update participant status instead of deleting
//         const matchedUserIds = matches.flatMap(m => [m.user1_id, m.user2_id]);
//         const { error: updateError } = await supabase
//           .from('lobby_participants')
//           .update({ status: 'matched' })
//           .eq('lobby_id', lobbyId)
//           .in('user_id', matchedUserIds);

//         if (updateError) {
//           console.error('Error updating matched participants:', updateError);
//           throw updateError;
//         }

//         // Create notification records for both users in each match
//         const notifications = (matchData || []).flatMap(match => ([
//           {
//             user_id: match.user1_id,
//             match_id: match.id,
//             type: 'match_success',
//             read: false
//           },
//           {
//             user_id: match.user2_id,
//             match_id: match.id,
//             type: 'match_success',
//             read: false
//           }
//         ]));

//         // Insert notifications
//         const { error: notificationError } = await supabase
//           .from('notifications')
//           .insert(notifications);

//         if (notificationError) {
//           console.error('Error creating notifications:', notificationError);
//         }

//         return { 
//           success: true, 
//           matches: matchData,
//           matchedUsers: matchedUserIds 
//         };
//       }

//       return { success: true, matches: [] };
//     } catch (error) {
//       console.error('Error in matching process:', error);
//       return { success: false, error };
//     }
//   }
// }


