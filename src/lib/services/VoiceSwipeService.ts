// import { supabase } from '@/lib/supabase';
// import { uploadVoiceMessage, getVoiceMessageUrl } from '@/lib/voice-upload';

// export interface VoiceSwipe {
//   id: string;
//   user_id: string;
//   lobby_id: string;
//   audio_url: string;
//   custom_line: string;
//   duration: number;
//   created_at: string;
//   user: {
//     id: string;
//     username: string;
//     profile_picture: string | null;
//     gender: string;
//     age?: number;
//     bio?: string;
//   };
// }

// export interface SwipeAction {
//   id: string;
//   swiper_id: string;
//   swiped_user_id: string;
//   voice_swipe_id: string;
//   action_type: 'like' | 'skip';
//   created_at: string;
// }

// export interface VoiceMatch {
//   id: string;
//   user1_id: string;
//   user2_id: string;
//   lobby_id: string;
//   created_at: string;
//   user1: {
//     id: string;
//     username: string;
//     profile_picture: string | null;
//   };
//   user2: {
//     id: string;
//     username: string;
//     profile_picture: string | null;
//   };
//   user1_voice: VoiceSwipe;
//   user2_voice: VoiceSwipe;
// }

// export interface LikeReceived {
//   id: string;
//   swiper_id: string;
//   voice_swipe_id: string;
//   created_at: string;
//   swiper: {
//     id: string;
//     username: string;
//     profile_picture: string | null;
//     gender: string;
//   };
//   voice_swipe: VoiceSwipe;
// }

// export class VoiceSwipeService {
//   // Upload a voice swipe
//   static async createVoiceSwipe(
//     lobbyId: string,
//     userId: string,
//     audioBlob: Blob,
//     customLine: string,
//     duration: number
//   ) {
//     try {
//       console.log('🎤 Creating voice swipe...', { lobbyId, userId, customLine, duration });

//       // Upload audio file
//       const uploadResult = await uploadVoiceMessage(audioBlob, lobbyId, userId);
//       if (!uploadResult?.path) {
//         throw new Error('Failed to upload voice message');
//       }

//       const audioUrl = getVoiceMessageUrl(uploadResult.path);

//       // Create voice swipe record
//       const { data, error } = await supabase
//         .from('voice_swipes')
//         .insert({
//           user_id: userId,
//           lobby_id: lobbyId,
//           audio_url: audioUrl,
//           custom_line: customLine,
//           duration: duration
//         })
//         .select()
//         .single();

//       if (error) throw error;

//       console.log('✅ Voice swipe created successfully:', data);
//       return data;
//     } catch (error) {
//       console.error('❌ Error creating voice swipe:', error);
//       throw error;
//     }
//   }

//   // Get voice swipes to swipe on (excluding own and already swiped)
//   static async getVoiceSwipesToSwipe(lobbyId: string, userId: string, limit = 10) {
//     try {
//       console.log('🔍 Fetching voice swipes to swipe on...', { lobbyId, userId });

//       const { data, error } = await supabase
//         .from('voice_swipes')
//         .select(`
//           *,
//           user:user_id (
//             id,
//             username,
//             profile_picture,
//             gender,
//             bio,
//             dob
//           )
//         `)
//         .eq('lobby_id', lobbyId)
//         .eq('is_active', true)
//         .neq('user_id', userId)
//         .not('id', 'in', `(
//           SELECT voice_swipe_id 
//           FROM voice_swipe_actions 
//           WHERE swiper_id = '${userId}'
//         )`)
//         .order('created_at', { ascending: false })
//         .limit(limit);

//       if (error) throw error;

//       const transformedData = data?.map(item => ({
//         ...item,
//         user: Array.isArray(item.user) ? item.user[0] : item.user
//       })) || [];

//       console.log('✅ Found voice swipes:', transformedData.length);
//       return transformedData as VoiceSwipe[];
//     } catch (error) {
//       console.error('❌ Error fetching voice swipes:', error);
//       throw error;
//     }
//   }

//   // Perform swipe action
//   static async swipeOnVoice(
//     swiperId: string,
//     voiceSwipeId: string,
//     actionType: 'like' | 'skip',
//     lobbyId: string
//   ) {
//     try {
//       console.log('👆 Performing swipe action...', { swiperId, voiceSwipeId, actionType });

//       // Get the voice swipe details
//       const { data: voiceSwipe, error: voiceError } = await supabase
//         .from('voice_swipes')
//         .select('user_id')
//         .eq('id', voiceSwipeId)
//         .single();

//       if (voiceError || !voiceSwipe) throw voiceError || new Error('Voice swipe not found');

//       // Record the swipe action
//       const { data: swipeAction, error: swipeError } = await supabase
//         .from('voice_swipe_actions')
//         .insert({
//           swiper_id: swiperId,
//           swiped_user_id: voiceSwipe.user_id,
//           voice_swipe_id: voiceSwipeId,
//           lobby_id: lobbyId,
//           action_type: actionType
//         })
//         .select()
//         .single();

//       if (swipeError) throw swipeError;

//       // If it's a like, check for mutual like
//       let voiceMatch = null;
//       if (actionType === 'like') {
//         voiceMatch = await this.checkForMutualLike(swiperId, voiceSwipe.user_id, lobbyId);
//       }

//       console.log('✅ Swipe action completed:', { swipeAction, voiceMatch });
//       return { swipeAction, voiceMatch };
//     } catch (error) {
//       console.error('❌ Error performing swipe action:', error);
//       throw error;
//     }
//   }

//   // Check for mutual likes and create match if found
//   private static async checkForMutualLike(user1Id: string, user2Id: string, lobbyId: string) {
//     try {
//       console.log('💕 Checking for mutual likes...', { user1Id, user2Id });

//       // Check if user2 has liked user1's voice
//       const { data: mutualLike, error: mutualError } = await supabase
//         .from('voice_swipe_actions')
//         .select(`
//           *,
//           voice_swipe:voice_swipe_id (
//             id,
//             user_id,
//             audio_url,
//             custom_line,
//             duration
//           )
//         `)
//         .eq('swiper_id', user2Id)
//         .eq('swiped_user_id', user1Id)
//         .eq('lobby_id', lobbyId)
//         .eq('action_type', 'like')
//         .single();

//       if (mutualError || !mutualLike) {
//         console.log('❌ No mutual like found');
//         return null;
//       }

//       // Get user1's voice swipe that was liked by user2
//       const { data: user1Voice, error: user1VoiceError } = await supabase
//         .from('voice_swipes')
//         .select('*')
//         .eq('id', mutualLike.voice_swipe_id)
//         .single();

//       if (user1VoiceError || !user1Voice) throw user1VoiceError || new Error('User1 voice not found');

//       // Get user2's voice swipe (the one user1 just liked)
//       const { data: user2Voice, error: user2VoiceError } = await supabase
//         .from('voice_swipe_actions')
//         .select(`
//           voice_swipe:voice_swipe_id (
//             id,
//             user_id,
//             audio_url,
//             custom_line,
//             duration
//           )
//         `)
//         .eq('swiper_id', user1Id)
//         .eq('swiped_user_id', user2Id)
//         .eq('action_type', 'like')
//         .order('created_at', { ascending: false })
//         .limit(1)
//         .single();

//       if (user2VoiceError || !user2Voice) throw user2VoiceError || new Error('User2 voice not found');

//       // Create voice match
//       const { data: voiceMatch, error: matchError } = await supabase
//         .from('voice_matches')
//         .insert({
//           user1_id: user1Id,
//           user2_id: user2Id,
//           lobby_id: lobbyId,
//           user1_voice_id: user1Voice.id,
//           user2_voice_id: user2Voice.voice_swipe.id
//         })
//         .select()
//         .single();

//       if (matchError) throw matchError;

//       console.log('🎉 Voice match created!', voiceMatch);

//       // Create regular match in matches table for chat
//       const { data: regularMatch, error: regularMatchError } = await supabase
//         .from('matches')
//         .insert({
//           user1_id: user1Id,
//           user2_id: user2Id,
//           lobby_id: lobbyId,
//           status: 'matched'
//         })
//         .select()
//         .single();

//       if (regularMatchError) {
//         console.error('❌ Error creating regular match:', regularMatchError);
//       } else {
//         console.log('✅ Regular match created for chat:', regularMatch);

//         // Send push notifications
//         await this.sendMatchNotifications(user1Id, user2Id, regularMatch.id);

//         // Redirect both users to chat
//         setTimeout(() => {
//           window.location.href = `/matches/${regularMatch.id}`;
//         }, 2000);
//       }

//       return voiceMatch;
//     } catch (error) {
//       console.error('❌ Error checking mutual likes:', error);
//       throw error;
//     }
//   }

//   // Send match notifications
//   private static async sendMatchNotifications(user1Id: string, user2Id: string, matchId: string) {
//     try {
//       // Get usernames
//       const { data: users, error } = await supabase
//         .from('users')
//         .select('id, username')
//         .in('id', [user1Id, user2Id]);

//       if (error || !users) return;

//       const user1 = users.find(u => u.id === user1Id);
//       const user2 = users.find(u => u.id === user2Id);

//       // Send push notifications
//       await Promise.all([
//         fetch('/api/notifications/send', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             userId: user1Id,
//             title: '🎤💕 Voice Match!',
//             body: `You matched with ${user2?.username || 'someone'}! Start chatting now.`,
//             type: 'voice_match',
//             url: `/matches/${matchId}`,
//             matchId: matchId,
//             requireInteraction: true
//           })
//         }),
//         fetch('/api/notifications/send', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             userId: user2Id,
//             title: '🎤💕 Voice Match!',
//             body: `You matched with ${user1?.username || 'someone'}! Start chatting now.`,
//             type: 'voice_match',
//             url: `/matches/${matchId}`,
//             matchId: matchId,
//             requireInteraction: true
//           })
//         })
//       ]);
//     } catch (error) {
//       console.error('❌ Error sending match notifications:', error);
//     }
//   }

//   // Get likes received by user
//   static async getLikesReceived(userId: string, lobbyId: string) {
//     try {
//       console.log('💝 Fetching likes received...', { userId, lobbyId });

//       const { data, error } = await supabase
//         .from('voice_swipe_actions')
//         .select(`
//           id,
//           swiper_id,
//           voice_swipe_id,
//           created_at,
//           swiper:swiper_id (
//             id,
//             username,
//             profile_picture,
//             gender
//           ),
//           voice_swipe:voice_swipe_id (
//             id,
//             user_id,
//             audio_url,
//             custom_line,
//             duration,
//             user:user_id (
//               id,
//               username,
//               profile_picture,
//               gender
//             )
//           )
//         `)
//         .eq('swiped_user_id', userId)
//         .eq('lobby_id', lobbyId)
//         .eq('action_type', 'like')
//         .order('created_at', { ascending: false });

//       if (error) throw error;

//       const transformedData = data?.map(item => ({
//         ...item,
//         swiper: Array.isArray(item.swiper) ? item.swiper[0] : item.swiper,
//         voice_swipe: {
//           ...item.voice_swipe,
//           user: Array.isArray(item.voice_swipe.user) ? item.voice_swipe.user[0] : item.voice_swipe.user
//         }
//       })) || [];

//       console.log('✅ Found likes received:', transformedData.length);
//       return transformedData as LikeReceived[];
//     } catch (error) {
//       console.error('❌ Error fetching likes received:', error);
//       throw error;
//     }
//   }

//   // Like back someone who liked you
//   static async likeBack(userId: string, likeReceivedId: string, lobbyId: string) {
//     try {
//       console.log('💕 Liking back...', { userId, likeReceivedId });

//       // Get the like details
//       const { data: likeReceived, error: likeError } = await supabase
//         .from('voice_swipe_actions')
//         .select(`
//           swiper_id,
//           voice_swipe_id,
//           voice_swipe:voice_swipe_id (user_id)
//         `)
//         .eq('id', likeReceivedId)
//         .single();

//       if (likeError || !likeReceived) throw likeError || new Error('Like not found');

//       // Get user's voice swipe to like back with
//       const { data: userVoice, error: userVoiceError } = await supabase
//         .from('voice_swipes')
//         .select('id')
//         .eq('user_id', userId)
//         .eq('lobby_id', lobbyId)
//         .eq('is_active', true)
//         .order('created_at', { ascending: false })
//         .limit(1)
//         .single();

//       if (userVoiceError || !userVoice) {
//         throw new Error('You need to create a voice swipe first');
//       }

//       // Create like back action
//       const { data: likeBackAction, error: likeBackError } = await supabase
//         .from('voice_swipe_actions')
//         .insert({
//           swiper_id: userId,
//           swiped_user_id: likeReceived.swiper_id,
//           voice_swipe_id: userVoice.id,
//           lobby_id: lobbyId,
//           action_type: 'like'
//         })
//         .select()
//         .single();

//       if (likeBackError) throw likeBackError;

//       // This will create a match since it's mutual
//       const voiceMatch = await this.checkForMutualLike(userId, likeReceived.swiper_id, lobbyId);

//       return { likeBackAction, voiceMatch };
//     } catch (error) {
//       console.error('❌ Error liking back:', error);
//       throw error;
//     }
//   }
// }