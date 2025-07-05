// src/lib/services/MatchingService.ts

import { supabase } from '@/lib/supabase'


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




// src/lib/services/MatchingService.ts

export class MatchingService {
  static async matchParticipants(lobbyId: string) {
    try {
      console.log('Starting matching process for lobby:', lobbyId);

      // Get all waiting participants
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

      if (error) throw error;

      if (!rawParticipants || rawParticipants.length < 2) {
        console.log('Not enough participants for matching');
        return { success: true, matches: [] };
      }

      // Process participants
      const typedParticipants = rawParticipants
        .filter(p => {
          if (!p.users) return false;
          if (Array.isArray(p.users)) {
            return p.users.length > 0 && typeof p.users[0].gender === 'string';
          }
          return typeof (p.users as { gender: string }).gender === 'string';
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

      // Separate and shuffle participants
      const males = typedParticipants.filter(p => p.user.gender === 'male');
      const females = typedParticipants.filter(p => p.user.gender === 'female');
      
      
      const shuffle = (array: any[]) => {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
      };

      shuffle(males);
      shuffle(females);
      

      // Create matches
      const matches = [];
      const maxMatches = Math.min(males.length, females.length);

      for (let i = 0; i < maxMatches; i++) {
        matches.push({
          user1_id: males[i].user_id,
          user2_id: females[i].user_id,
          lobby_id: lobbyId,
          status: 'matched'
        });
      }

      if (matches.length > 0) {
        console.log('🎯 Creating matches:', matches);
        
        // Insert matches - triggers will handle notifications
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .insert(matches)
          .select();

        if (matchError) {
          console.error('❌ Error inserting matches:', matchError);
          throw matchError;
        }

        console.log('✅ Matches inserted successfully:', matchData);
        console.log('🔔 Sending broadcast notifications to both users in each match...');
        
        // Create a map of user_id to username from our participants data
        const userIdToUsername = new Map<string, string>();
        typedParticipants.forEach(p => {
          userIdToUsername.set(p.user_id, p.user.username);
        });

        // Send broadcast notifications for each match
        const notificationPromises = matchData?.map(async (match) => {
          try {
            // Get usernames from our participant data
            const user1Username = userIdToUsername.get(match.user1_id);
            const user2Username = userIdToUsername.get(match.user2_id);

            console.log(`📡 Sending notifications for match ${match.id}: ${user1Username} & ${user2Username}`);

            // Create notification channels for both users
            const channel1 = supabase.channel(`match_notifications_${match.user1_id}`);
           const channel2 = supabase.channel(`match_notifications_${match.user2_id}`);

            await Promise.all([
              channel1.subscribe(),
              channel2.subscribe()
             ]);

            // Send match notification to both users
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

            console.log(`✅ Broadcast notifications sent for match ${match.id}`);

            // Clean up channels after a short delay
            setTimeout(() => {
              channel1.unsubscribe();
              channel2.unsubscribe();
            }, 2000);

          } catch (notificationError) {
            console.error('❌ Error sending broadcast notifications for match:', match.id, notificationError);
          }
        }) || [];

        await Promise.all(notificationPromises);

        // Remove participants
        const matchedUserIds = matches.flatMap(m => [m.user1_id, m.user2_id]);
        console.log('Removing participants:', matchedUserIds);
        
        const { error: deleteError } = await supabase
          .from('lobby_participants')
          .delete()
          .eq('lobby_id', lobbyId)
          .in('user_id', matchedUserIds);

        if (deleteError) {
          console.error('Error removing participants:', deleteError);
          // Don't throw here, matches are already created
        } else {
          console.log('Participants removed successfully');
        }

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


