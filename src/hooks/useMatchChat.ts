// src/hooks/useMatchChat.ts
'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { uploadVoiceMessage, getVoiceMessageUrl } from '@/lib/voice-upload';
import { getRandomChallenge } from '@/lib/voiceChallenges';
import { DEMO_MODE, DEMO_BLIND_MATCH_MESSAGES } from '@/lib/demoData';

// Match-specific message interface
export interface MatchMessage {
    id: string;
    content: string;
    sender_id: string;
    match_id: string;
    created_at: string;
    type: 'text' | 'voice' | 'image';
    metadata?: Record<string, any>;
    sender: {
        id: string;
        username: string;
        profile_picture: string | null;
    };
    timestamp: number;
}

interface UseMatchChatOptions {
    matchId: string;
    userId?: string;
    enabled?: boolean;
    pageSize?: number;
}

interface UseMatchChatReturn {
    messages: MatchMessage[];
    loading: boolean;
    error: string | null;
    sendMessage: (content: string, type?: 'text' | 'voice', metadata?: Record<string, any>) => Promise<void>;
    loadMoreMessages: () => Promise<void>;
    hasMoreMessages: boolean;
    refreshMessages: () => Promise<void>;
    clearError: () => void;
    ///////////////////////
    blockUser: () => Promise<void>;

    acceptChallenge: (challengeId: string) => Promise<void>;
    skipChallenge: (challengeId: string) => Promise<void>;


    createVoiceChallenge: (prompt: string, timeLimit: number, recipientId: string) => Promise<VoiceChallenge>;
    respondToChallenge: (challengeId: string, audioBlob: Blob, duration: number) => Promise<void>;
    currentChallenge: VoiceChallenge | null;

}

// export interface VoiceChallenge {
//   id: string;
//   match_id: string;
//   challenge_prompt: string;
//   category: string;
//   time_limit: number;
//   created_at: string;
//   status: string;
// }

export interface VoiceChallenge {
    id: string;
    match_id: string;
    challenge_prompt: string;
    category: string;
    time_limit: number;
    created_at: string;
    status: string; // overall status
    created_by: string;
    challenge_from: string; // Who created the challenge
    challenge_for: string;  // Who the challenge is FOR
    recipient_status: 'pending' | 'accepted' | 'completed' | 'skipped';
}

export function useMatchChat({
    matchId,
    userId,
    enabled = true,
    pageSize = 20
}: UseMatchChatOptions): UseMatchChatReturn {
    const [messages, setMessages] = useState<MatchMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    const [currentChallenge, setCurrentChallenge] = useState<VoiceChallenge | null>(null);
    const [lastMessageTime, setLastMessageTime] = useState<Date | null>(null);

    const subscriptionRef = useRef<any>(null);
    const loadingRef = useRef(false);

    // Clear error function
    const clearError = useCallback(() => {
        setError(null);
    }, []);





    // Fetch messages from database
    const fetchMessagesFromDB = useCallback(async (
        limit: number = pageSize,
        before?: string
    ): Promise<{ messages: MatchMessage[]; hasMore: boolean }> => {
        if (DEMO_MODE) {
            return { messages: (DEMO_BLIND_MATCH_MESSAGES[matchId] || []) as unknown as MatchMessage[], hasMore: false };
        }
        try {
            let query = supabase
                .from('match_messages')
                .select(`
          id,
          content,
          sender_id,
          match_id,
          created_at,
          type,
          metadata,
          sender:sender_id (
            id,
            username,
            profile_picture
          )
        `)
                .eq('match_id', matchId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (before) {
                query = query.lt('created_at', before);
            }

            const { data, error } = await query;

            if (error) throw error;

            const transformedMessages: MatchMessage[] = (data || []).map((msg: any) => {
                const sender = Array.isArray(msg.sender) ? msg.sender[0] : msg.sender;
                return {
                    id: msg.id,
                    content: msg.content,
                    sender_id: msg.sender_id,
                    match_id: msg.match_id,
                    created_at: msg.created_at,
                    type: msg.type || 'text',
                    metadata: msg.metadata || undefined,
                    sender: {
                        id: sender?.id || '',
                        username: sender?.username || 'Unknown User',
                        profile_picture: sender?.profile_picture || null,
                    },
                    timestamp: Date.now()
                };
            }).reverse(); // Reverse to get chronological order

            const hasMore = data?.length === limit;

            return { messages: transformedMessages, hasMore };
        } catch (err) {
            console.error('Error fetching match messages:', err);
            throw err;
        }
    }, [matchId, pageSize]);

    // Load initial messages
    const loadInitialMessages = useCallback(async () => {
        if (!enabled || !matchId || loadingRef.current) return;

        setLoading(true);
        loadingRef.current = true;
        setError(null);

        try {
            // Fetch from database
            const { messages: fetchedMessages, hasMore } = await fetchMessagesFromDB(pageSize);

            setMessages(fetchedMessages);
            setHasMoreMessages(hasMore);
            setInitialLoadComplete(true);

            console.log(`🌐 Loaded ${fetchedMessages.length} match messages from database for match ${matchId}`);
        } catch (err) {
            setError(`Failed to load messages: ${(err as Error).message}`);
            console.error(`Error loading initial match messages for ${matchId}:`, err);
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [enabled, matchId, pageSize, fetchMessagesFromDB]);

    // Load more messages (pagination)
    const loadMoreMessages = useCallback(async () => {
        if (!hasMoreMessages || loading || loadingRef.current) return;

        setLoading(true);
        loadingRef.current = true;

        try {
            const oldestMessage = messages[0];
            if (!oldestMessage) return;

            const { messages: moreMessages, hasMore } = await fetchMessagesFromDB(
                pageSize,
                oldestMessage.created_at
            );

            if (moreMessages.length > 0) {
                const updatedMessages = [...moreMessages, ...messages];
                setMessages(updatedMessages);

                console.log(`📄 Loaded ${moreMessages.length} more match messages for ${matchId}`);
            }

            setHasMoreMessages(hasMore);
        } catch (err) {
            setError(`Failed to load more messages: ${(err as Error).message}`);
            console.error(`Error loading more match messages for ${matchId}:`, err);
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [hasMoreMessages, loading, messages, pageSize, fetchMessagesFromDB, matchId]);

    // Refresh messages
    const refreshMessages = useCallback(async () => {
        setInitialLoadComplete(false);
        await loadInitialMessages();
    }, [loadInitialMessages]);

    // Send message
    //   const sendMessage = useCallback(async (
    //     content: string, 
    //     type: 'text' | 'voice' = 'text', 
    //     metadata?: Record<string, any>
    //   ) => {
    //     if (!userId || !content.trim()) return;

    //     try {
    //       const messageData = {
    //         match_id: matchId,
    //         sender_id: userId,
    //         content: content.trim(),
    //         type: type,
    //         ...(metadata && { metadata })
    //       };

    //       const { data, error } = await supabase
    //         .from('match_messages')
    //         .insert(messageData)
    //         .select('id, content, created_at, type, metadata')
    //         .single();

    //       if (error) throw error;

    //       // Add message locally immediately for better UX
    //       if (data) {
    //         const newMessage: MatchMessage = {
    //           ...data,
    //           sender_id: userId,
    //           match_id: matchId,
    //           sender: {
    //             id: userId,
    //             username: 'You',
    //             profile_picture: null
    //           },
    //           timestamp: Date.now()
    //         };

    //         setMessages(prev => [...prev, newMessage]);
    //       }

    //       console.log(`📤 Sent ${type} message to match ${matchId}`);
    //     } catch (err) {
    //       setError(`Failed to send message: ${(err as Error).message}`);
    //       console.error(`Error sending message to match ${matchId}:`, err);
    //       throw err;
    //     }
    //   }, [userId, matchId]);

    // Update the sendMessage function in useMatchChat.ts

    // Update the sendMessage function with more debugging
    const sendMessage = useCallback(async (
        content: string,
        type: 'text' | 'voice' = 'text',
        metadata?: Record<string, any>
    ) => {
        if (!userId || !content.trim()) {
            console.log('❌ Cannot send message - missing userId or content:', { userId, content: content?.length });
            return;
        }

        if (DEMO_MODE) {
            const newMessage: MatchMessage = {
                id: `demo-${Date.now()}`,
                content: content.trim(),
                sender_id: userId,
                match_id: matchId,
                created_at: new Date().toISOString(),
                type,
                metadata,
                sender: { id: userId, username: 'You', profile_picture: null },
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, newMessage]);
            return;
        }

        try {
            const messageData = {
                match_id: matchId,
                sender_id: userId,
                content: content.trim(),
                type: type,
                ...(metadata && { metadata })
            };

            console.log('📤 Attempting to send message:', {
                matchId,
                userId,
                type,
                content: content.substring(0, 50),
                messageData
            });

            const { data, error } = await supabase
                .from('match_messages')
                .insert(messageData)
                .select('id, content, created_at, type, metadata')
                .single();

            if (error) {
                console.error('❌ Database insert error:', error);
                throw error;
            }

            console.log('✅ Message inserted to database:', data);

            // Add message locally immediately for better UX
            if (data) {
                const newMessage: MatchMessage = {
                    ...data,
                    sender_id: userId,
                    match_id: matchId,
                    sender: {
                        id: userId,
                        username: 'You',
                        profile_picture: null
                    },
                    timestamp: Date.now()
                };

                console.log('➕ Adding sent message locally:', newMessage.id);

                setMessages(prev => {
                    const exists = prev.some(msg => msg.id === newMessage.id);
                    if (exists) {
                        console.log('⚠️ Message already exists locally, skipping');
                        return prev;
                    }
                    console.log('✅ Added message to local state');
                    return [...prev, newMessage];
                });
            }

            console.log(`🎉 Successfully sent ${type} message to match ${matchId}`);
        } catch (err) {
            console.error(`💥 Error sending message to match ${matchId}:`, err);
            setError(`Failed to send message: ${(err as Error).message}`);
            throw err;
        }
    }, [userId, matchId]);




    // Set up real-time subscription
    //   useEffect(() => {
    //     if (!enabled || !matchId || !initialLoadComplete) return;

    //     const channel = supabase
    //       .channel(`match_messages_${matchId}_${Date.now()}`)
    //       .on(
    //         'postgres_changes',
    //         {
    //           event: 'INSERT',
    //           schema: 'public',
    //           table: 'match_messages',
    //           filter: `match_id=eq.${matchId}`
    //         },
    //         async (payload) => {
    //           const newMsg = payload.new;

    //           // Fetch sender data for the new message
    //           try {
    //             const { data: userData } = await supabase
    //               .from('users')
    //               .select('id, username, profile_picture')
    //               .eq('id', newMsg.sender_id)
    //               .single();

    //             const message: MatchMessage = {
    //               id: newMsg.id,
    //               content: newMsg.content,
    //               sender_id: newMsg.sender_id,
    //               match_id: newMsg.match_id,
    //               created_at: newMsg.created_at,
    //               type: newMsg.type || 'text',
    //               metadata: newMsg.metadata || undefined,
    //               sender: {
    //                 id: userData?.id || '',
    //                 username: userData?.username || 'Unknown User',
    //                 profile_picture: userData?.profile_picture || null,
    //               },
    //               timestamp: Date.now()
    //             };

    //             // Check if message already exists to prevent duplicates
    //             setMessages(prev => {
    //               if (prev.some(msg => msg.id === message.id)) return prev;

    //               // Only add messages from other users (avoid duplicates from our own sends)
    //               if (message.sender_id !== userId) {
    //                 return [...prev, message];
    //               }

    //               return prev;
    //             });

    //             console.log(`📨 Received new message in match ${matchId}`);
    //           } catch (err) {
    //             console.error('Error processing new message:', err);
    //           }
    //         }
    //       )
    //       .subscribe();

    //     subscriptionRef.current = channel;

    //     return () => {
    //       if (subscriptionRef.current) {
    //         subscriptionRef.current.unsubscribe();
    //         subscriptionRef.current = null;
    //       }
    //     };
    //   }, [enabled, matchId, initialLoadComplete, userId]);

    // Update the real-time subscription useEffect in useMatchChat.ts

    useEffect(() => {
        if (DEMO_MODE || !enabled || !matchId || !userId) return;

        console.log('🔗 Setting up real-time subscription for match:', matchId, 'for user:', userId);

        // Use a simpler channel name without timestamp
        const channelName = `match_messages_${matchId}`;

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'match_messages',
                    filter: `match_id=eq.${matchId}`
                },
                async (payload) => {
                    console.log('📨 Real-time message received:', payload);
                    const newMsg = payload.new;

                    // Try to fetch sender data, but do NOT block message insert if it fails (RLS or network)
                    let userData: { id: string; username: string; profile_picture: string | null } | null = null;
                    try {
                        const { data } = await supabase
                            .from('users')
                            .select('id, username, profile_picture')
                            .eq('id', newMsg.sender_id)
                            .single();
                        userData = data ?? null;
                    } catch (fetchErr) {
                        console.warn('⚠️ Could not fetch sender details, using fallback:', fetchErr);
                    }

                    const message: MatchMessage = {
                        id: newMsg.id,
                        content: newMsg.content,
                        sender_id: newMsg.sender_id,
                        match_id: newMsg.match_id,
                        created_at: newMsg.created_at,
                        type: newMsg.type || 'text',
                        metadata: newMsg.metadata || undefined,
                        sender: {
                            id: userData?.id || newMsg.sender_id,
                            username: userData?.username || 'Unknown User',
                            profile_picture: userData?.profile_picture || null,
                        },
                        timestamp: Date.now()
                    };

                    console.log('📝 Processed message:', { id: message.id, sender: message.sender_id, content: message.content.substring(0, 50) });

                    setMessages(prev => {
                        const exists = prev.some(msg => msg.id === message.id);
                        if (exists) {
                            console.log('⚠️ Message already exists, skipping:', message.id);
                            return prev;
                        }
                        // Avoid duplicating messages we just optimistically added on sender side
                        if (message.sender_id === userId) {
                            console.log('↩️ Skipping self-emitted realtime echo');
                            return prev;
                        }
                        console.log('✅ Adding new message to state');
                        return [...prev, message];
                    });
                }
            )
            .subscribe((status) => {
                console.log('📡 Subscription status:', status);

                if (status === 'SUBSCRIBED') {
                    console.log('✅ Successfully subscribed to match messages');
                } else if (status === 'CHANNEL_ERROR') {
                    console.error('❌ Error subscribing to match messages');
                } else if (status === 'TIMED_OUT') {
                    console.error('⏰ Match messages subscription timed out');
                } else if (status === 'CLOSED') {
                    console.warn('🔒 Match messages subscription closed');
                }
            });

        subscriptionRef.current = channel;

        return () => {
            console.log('🔌 Unsubscribing from match messages');
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
                subscriptionRef.current = null;
            }
        };
    }, [enabled, matchId]); // Removed initialLoadComplete and userId dependencies



    // Load initial messages when component mounts
    useEffect(() => {
        loadInitialMessages();
    }, [loadInitialMessages]);

    // Ensure fresh messages after subscription attaches (helps second client see newest)
    useEffect(() => {
        if (!enabled || !matchId || !userId) return;
        // slight delay to let subscription register on server
        const t = setTimeout(() => {
            refreshMessages().catch(() => { });
        }, 150);
        return () => clearTimeout(t);
    }, [enabled, matchId, userId, refreshMessages]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
            }
        };
    }, []);

    // Add this function inside your useMatchChat hook
    const blockUser = useCallback(async () => {
        if (!userId || !matchId) {
            throw new Error('Missing user ID or match ID');
        }

        if (DEMO_MODE) return;

        try {
            console.log('🚫 Blocking user for match:', matchId);

            // Update the match status to blocked
            const { error: updateError } = await supabase
                .from('matches')
                .update({
                    status: 'blocked',
                    blocked_by: userId,
                    blocked_at: new Date().toISOString()
                })
                .eq('id', matchId);

            if (updateError) {
                console.error('Error updating match status:', updateError);
                throw updateError;
            }

            console.log('✅ Successfully blocked user');

            // Clear local messages
            setMessages([]);

        } catch (err) {
            console.error('Error blocking user:', err);
            setError(`Failed to block user: ${(err as Error).message}`);
            throw err;
        }
    }, [userId, matchId]);

    // const createVoiceChallenge = useCallback(async (prompt: string, timeLimit: number): Promise<VoiceChallenge> => {
    //     if (!matchId) {
    //         throw new Error('No match ID');
    //     }

    //     try {
    //         const { data, error } = await supabase
    //             .from('voice_challenges')
    //             .insert({
    //                 match_id: matchId,
    //                 challenge_prompt: prompt,
    //                 time_limit: timeLimit,
    //                 category: 'quick_fun'
    //             })
    //             .select()
    //             .single();

    //         if (error) throw error;

    //         setCurrentChallenge(data);
    //         return data;
    //     } catch (err) {
    //         console.error('Error creating voice challenge:', err);
    //         throw err;
    //     }
    // }, [matchId]);
    // Update your createVoiceChallenge function to include the new fields
    const createVoiceChallenge = useCallback(async (prompt: string, timeLimit: number, recipientId: string): Promise<VoiceChallenge> => {
        if (!matchId || !userId) {
            throw new Error('No match ID or user ID');
        }

        try {
            console.log('🎯 Creating challenge FROM', userId, 'FOR', recipientId);

            const { data, error } = await supabase
                .from('voice_challenges')
                .insert({
                    match_id: matchId,
                    challenge_prompt: prompt,
                    time_limit: timeLimit,
                    category: 'quick_fun',
                    status: 'active',
                    challenge_from: userId,
                    challenge_for: recipientId,
                    recipient_status: 'pending'
                })
                .select()
                .single();

            if (error) throw error;

            console.log('✅ Challenge created successfully for recipient:', recipientId);
            return data;
        } catch (err) {
            console.error('Error creating voice challenge:', err);
            throw err;
        }
    }, [matchId, userId]);


    // const fetchCurrentChallenge = useCallback(async () => {
    //     if (!userId || !matchId) return;

    //     try {
    //         const { data, error } = await supabase
    //             .from('voice_challenges')
    //             .select('*')
    //             .eq('match_id', matchId)
    //             .eq('challenge_for', userId) // Only challenges FOR current user
    //             .eq('status', 'active')
    //             .in('recipient_status', ['pending', 'accepted'])
    //             .order('created_at', { ascending: false })
    //             .limit(1)
    //             .single();

    //         if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    //             console.error('Error fetching current challenge:', error);
    //             return;
    //         }

    //         if (data) {
    //             console.log('📥 Found active challenge for current user:', data);
    //             setCurrentChallenge(data);
    //         } else {
    //             console.log('📭 No active challenges for current user');
    //             setCurrentChallenge(null);
    //         }
    //     } catch (err) {
    //         console.error('Error in fetchCurrentChallenge:', err);
    //     }
    // }, [userId, matchId]);

    // Update your fetchCurrentChallenge function to be more robust
const fetchCurrentChallenge = useCallback(async () => {
  if (!userId || !matchId) {
    console.log('❌ Cannot fetch challenges - missing userId or matchId:', { userId, matchId });
    return;
  }
  if (DEMO_MODE) return;

  try {
    console.log('🔍 Fetching current challenges for user:', userId, 'in match:', matchId);
    
    const { data, error } = await supabase
      .from('voice_challenges')
      .select('*')
      .eq('match_id', matchId)
      .eq('challenge_for', userId)
      .eq('status', 'active')
      .in('recipient_status', ['pending', 'accepted'])
      .order('created_at', { ascending: false });

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Error fetching current challenge:', error);
      return;
    }

    console.log('📊 Raw challenge query result:', { 
      dataLength: data?.length || 0, 
      data: data?.map(d => ({
        id: d.id,
        for: d.challenge_for,
        from: d.challenge_from,
        status: d.status,
        recipient_status: d.recipient_status,
        prompt: d.challenge_prompt?.substring(0, 30)
      }))
    });

    if (data && data.length > 0) {
      const challenge = data[0]; // Get the most recent one
      console.log('📥 Found active challenge for current user:', {
        id: challenge.id,
        from: challenge.challenge_from,
        for: challenge.challenge_for,
        prompt: challenge.challenge_prompt?.substring(0, 50),
        status: challenge.status,
        recipient_status: challenge.recipient_status
      });
      setCurrentChallenge(challenge);
    } else {
      console.log('📭 No active challenges found for current user');
      setCurrentChallenge(null);
    }
  } catch (err) {
    console.error('💥 Error in fetchCurrentChallenge:', err);
  }
}, [userId, matchId]);



    useEffect(() => {
        fetchCurrentChallenge();
    }, [fetchCurrentChallenge]);
    // Respond to challenge
    // const respondToChallenge = useCallback(async (challengeId: string, audioBlob: Blob, duration: number) => {
    //   if (!userId) {
    //     throw new Error('No user ID');
    //   }

    //   try {
    //     // Upload audio file
    //     const uploadResult = await uploadVoiceMessage(audioBlob, matchId, userId);
    //     if (!uploadResult?.path) {
    //       throw new Error('Upload failed');
    //     }

    //     const audioUrl = getVoiceMessageUrl(uploadResult.path);

    //     // Save challenge response
    //     const { error } = await supabase
    //       .from('voice_challenge_responses')
    //       .insert({
    //         challenge_id: challengeId,
    //         user_id: userId,
    //         audio_url: audioUrl,
    //         duration: duration
    //       });

    //     if (error) throw error;

    //     // Send as a special message
    //     await sendMessage(`🎤 Voice Challenge Response: "${currentChallenge?.challenge_prompt}"`, 'voice', {
    //       audio_url: audioUrl,
    //       duration: duration,
    //       challenge_id: challengeId,
    //       is_challenge_response: true
    //     });

    //     // Clear current challenge
    //     setCurrentChallenge(null);

    //   } catch (err) {
    //     console.error('Error responding to challenge:', err);
    //     throw err;
    //   }
    // }, [userId, matchId, currentChallenge, sendMessage]);

    // Auto-suggest challenges when conversation slows down
    // useEffect(() => {
    //     if (messages.length === 0) return;

    //     const lastMessage = messages[messages.length - 1];
    //     const lastMessageDate = new Date(lastMessage.created_at);
    //     setLastMessageTime(lastMessageDate);

    //     // Check if conversation has been slow (no challenge already active)
    //     if (!currentChallenge) {
    //         const timeSinceLastMessage = Date.now() - lastMessageDate.getTime();
    //         const thirtyMinutes = 30 * 60 * 1000;

    //         if (timeSinceLastMessage > thirtyMinutes) {
    //             // Auto-suggest a challenge
    //             const randomChallenge = getRandomChallenge();
    //             createVoiceChallenge(randomChallenge.prompt, randomChallenge.timeLimit)
    //                 .catch(console.error);
    //         }
    //     }
    // }, [messages, currentChallenge, createVoiceChallenge]);


    // Add these new functions to your useMatchChat hook

    // Accept challenge (user-specific)
    // const acceptChallenge = useCallback(async (challengeId: string) => {
    //   if (!userId || !matchId) return;

    //   try {
    //     // Determine if current user is user1 or user2
    //     const { data: matchData } = await supabase
    //       .from('matches')
    //       .select('user1_id, user2_id')
    //       .eq('id', matchId)
    //       .single();

    //     if (!matchData) throw new Error('Match not found');

    //     const isUser1 = matchData.user1_id === userId;
    //     const statusField = isUser1 ? 'user1_status' : 'user2_status';

    //     // Update user's status to accepted
    //     const { error } = await supabase
    //       .from('voice_challenges')
    //       .update({ [statusField]: 'accepted' })
    //       .eq('id', challengeId);

    //     if (error) throw error;

    //     console.log('✅ Challenge accepted by user');
    //   } catch (err) {
    //     console.error('Error accepting challenge:', err);
    //     throw err;
    //   }
    // }, [userId, matchId]);

    // // Skip challenge (user-specific)
    // const skipChallenge = useCallback(async (challengeId: string) => {
    //   if (!userId || !matchId) return;

    //   try {
    //     // Determine if current user is user1 or user2
    //     const { data: matchData } = await supabase
    //       .from('matches')
    //       .select('user1_id, user2_id')
    //       .eq('id', matchId)
    //       .single();

    //     if (!matchData) throw new Error('Match not found');

    //     const isUser1 = matchData.user1_id === userId;
    //     const statusField = isUser1 ? 'user1_status' : 'user2_status';

    //     // Update user's status to skipped
    //     const { error } = await supabase
    //       .from('voice_challenges')
    //       .update({ [statusField]: 'skipped' })
    //       .eq('id', challengeId);

    //     if (error) throw error;

    //     // Check if both users have responded (either accepted or skipped)
    //     const { data: challengeData } = await supabase
    //       .from('voice_challenges')
    //       .select('user1_status, user2_status')
    //       .eq('id', challengeId)
    //       .single();

    //     if (challengeData) {
    //       const bothResponded = 
    //         challengeData.user1_status !== 'pending' && 
    //         challengeData.user2_status !== 'pending';

    //       const bothSkipped = 
    //         challengeData.user1_status === 'skipped' && 
    //         challengeData.user2_status === 'skipped';

    //       // If both users have responded or both skipped, end the challenge
    //       if (bothResponded && bothSkipped) {
    //         await supabase
    //           .from('voice_challenges')
    //           .update({ status: 'cancelled' })
    //           .eq('id', challengeId);
    //       }
    //     }

    //     console.log('✅ Challenge skipped by user');
    //   } catch (err) {
    //     console.error('Error skipping challenge:', err);
    //     throw err;
    //   }
    // }, [userId, matchId]);

    // Update your existing respondToChallenge function
    const respondToChallenge = useCallback(async (challengeId: string, audioBlob: Blob, duration: number) => {
        if (!userId) {
            throw new Error('No user ID');
        }

        try {
            console.log('🎤 Responding to challenge...');

            // Upload audio file
            const uploadResult = await uploadVoiceMessage(audioBlob, matchId, userId);
            if (!uploadResult?.path) {
                throw new Error('Upload failed');
            }

            const audioUrl = getVoiceMessageUrl(uploadResult.path);

            // Save challenge response
            const { data: responseData, error: responseError } = await supabase
                .from('voice_challenge_responses')
                .insert({
                    challenge_id: challengeId,
                    user_id: userId,
                    audio_url: audioUrl,
                    duration: duration
                })
                .select()
                .single();

            if (responseError) throw responseError;

            // Update challenge status to completed (simplified - no more user1/user2 columns)
            const { error: updateError } = await supabase
                .from('voice_challenges')
                .update({
                    recipient_status: 'completed',
                    status: 'completed'
                })
                .eq('id', challengeId)
                .eq('challenge_for', userId); // Make sure it's a challenge for current user

            if (updateError) throw updateError;

            // Send as a special message
            await sendMessage(`🎤 Voice Challenge Response: "${currentChallenge?.challenge_prompt}"`, 'voice', {
                audio_url: audioUrl,
                duration: duration,
                challenge_id: challengeId,
                is_challenge_response: true
            });

            console.log('✅ Challenge response completed');

            // Clear current challenge
            setCurrentChallenge(null);

        } catch (err) {
            console.error('Error responding to challenge:', err);
            throw err;
        }
    }, [userId, matchId, currentChallenge, sendMessage]);

    // Accept challenge (user-specific)
    const acceptChallenge = useCallback(async (challengeId: string) => {
        if (!userId) return;

        try {
            console.log('✅ Accepting challenge:', challengeId);

            const { error } = await supabase
                .from('voice_challenges')
                .update({ recipient_status: 'accepted' })
                .eq('id', challengeId)
                .eq('challenge_for', userId);

            if (error) throw error;

            console.log('✅ Challenge accepted successfully');
        } catch (err) {
            console.error('Error accepting challenge:', err);
            throw err;
        }
    }, [userId]);

    // Skip challenge (user-specific)
    const skipChallenge = useCallback(async (challengeId: string) => {
        if (!userId) return;

        try {
            console.log('⏭️ Skipping challenge:', challengeId);

            const { error } = await supabase
                .from('voice_challenges')
                .update({
                    recipient_status: 'skipped',
                    status: 'completed'
                })
                .eq('id', challengeId)
                .eq('challenge_for', userId); // Extra safety check

            if (error) throw error;

            console.log('✅ Challenge skipped successfully');
            setCurrentChallenge(null);
        } catch (err) {
            console.error('Error skipping challenge:', err);
            throw err;
        }
    }, [userId]);


    // Add this useEffect for challenge real-time updates (add this after your message subscription)
    // useEffect(() => {
    //     if (!enabled || !matchId) return;

    //     console.log('🎯 Setting up challenge subscription for match:', matchId);

    //     const challengeChannel = supabase
    //         .channel(`voice_challenges_${matchId}`)
    //         .on(
    //             'postgres_changes',
    //             {
    //                 event: 'INSERT',
    //                 schema: 'public',
    //                 table: 'voice_challenges',
    //                 filter: `match_id=eq.${matchId}`
    //             },
    //             (payload) => {
    //                 console.log('🎪 New challenge received:', payload.new);
    //                 const newChallenge = payload.new as VoiceChallenge;

    //                 // Only set if we don't already have this challenge
    //                 setCurrentChallenge(prevChallenge => {
    //                     if (prevChallenge?.id !== newChallenge.id) {
    //                         return newChallenge;
    //                     }
    //                     return prevChallenge;
    //                 });
    //             }
    //         )
    //         .on(
    //             'postgres_changes',
    //             {
    //                 event: 'UPDATE',
    //                 schema: 'public',
    //                 table: 'voice_challenges',
    //                 filter: `match_id=eq.${matchId}`
    //             },
    //             (payload) => {
    //                 console.log('🔄 Challenge updated:', payload.new);
    //                 const updatedChallenge = payload.new as VoiceChallenge;

    //                 // Update current challenge if it's the same one
    //                 setCurrentChallenge(prevChallenge => {
    //                     if (prevChallenge?.id === updatedChallenge.id) {
    //                         return updatedChallenge;
    //                     }
    //                     return prevChallenge;
    //                 });

    //                 // Clear challenge if it was completed or cancelled
    //                 if (updatedChallenge.status === 'completed' || updatedChallenge.status === 'cancelled' || updatedChallenge.status === 'expired') {
    //                     setCurrentChallenge(null);
    //                 }
    //             }
    //         )
    //         .subscribe((status) => {
    //             console.log('📡 Challenge subscription status:', status);
    //         });

    //     return () => {
    //         console.log('🔌 Unsubscribing from challenge updates');
    //         challengeChannel.unsubscribe();
    //     };
    // }, [enabled, matchId]);

    // Replace the existing challenge subscription useEffect with this enhanced version
    useEffect(() => {
        if (DEMO_MODE || !enabled || !matchId || !userId) return;

        console.log('🎯 Setting up ENHANCED challenge subscription for match:', matchId, 'user:', userId);

        // Use a similar channel pattern to your working message subscription
        const challengeChannelName = `match_challenges_${matchId}`;

        const challengeChannel = supabase
            .channel(challengeChannelName)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'voice_challenges',
                    filter: `match_id=eq.${matchId}` // Listen to ALL challenges in this match (like messages)
                },
                async (payload) => {
                    console.log('🎪 Challenge INSERT received:', payload.new);
                    const newChallenge = payload.new as VoiceChallenge;

                    // Only show challenges that are FOR the current user
                    if (newChallenge.challenge_for === userId && newChallenge.status === 'active') {
                        console.log('✅ This challenge is FOR current user, showing it!');
                        console.log('📊 Challenge details:', {
                            id: newChallenge.id,
                            from: newChallenge.challenge_from,
                            for: newChallenge.challenge_for,
                            prompt: newChallenge.challenge_prompt,
                            status: newChallenge.status,
                            recipient_status: newChallenge.recipient_status
                        });
                        setCurrentChallenge(newChallenge);
                    } else {
                        console.log('⏭️ This challenge is not for current user, ignoring:', {
                            challenge_for: newChallenge.challenge_for,
                            current_userId: userId,
                            status: newChallenge.status
                        });
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'voice_challenges',
                    filter: `match_id=eq.${matchId}`
                },
                (payload) => {
                    console.log('🔄 Challenge UPDATE received:', payload.new);
                    const updatedChallenge = payload.new as VoiceChallenge;

                    // Update current challenge if it's the same one
                    setCurrentChallenge(prevChallenge => {
                        if (prevChallenge?.id === updatedChallenge.id) {
                            console.log('🔄 Updating current challenge:', {
                                old_status: prevChallenge.recipient_status,
                                new_status: updatedChallenge.recipient_status
                            });

                            // Clear challenge if completed or cancelled
                            if (updatedChallenge.status === 'completed' ||
                                updatedChallenge.status === 'cancelled' ||
                                updatedChallenge.recipient_status === 'completed' ||
                                updatedChallenge.recipient_status === 'skipped') {
                                console.log('✅ Challenge completed/cancelled, clearing it');
                                return null;
                            }

                            return updatedChallenge;
                        }
                        return prevChallenge;
                    });
                }
            )
            .subscribe((status) => {
                console.log('📡 Enhanced challenge subscription status:', status);

                if (status === 'SUBSCRIBED') {
                    console.log('✅ Successfully subscribed to challenge updates');
                } else if (status === 'CHANNEL_ERROR') {
                    console.error('❌ Error subscribing to challenges');
                } else if (status === 'TIMED_OUT') {
                    console.error('⏰ Challenge subscription timed out');
                } else if (status === 'CLOSED') {
                    console.warn('🔒 Challenge subscription closed');
                }
            });

        return () => {
            console.log('🔌 Unsubscribing from enhanced challenge updates');
            challengeChannel.unsubscribe();
        };
    }, [enabled, matchId, userId]);


    useEffect(() => {
        if (!enabled || !matchId || !userId) return;

        console.log('🔄 Setting up challenge refresh timer...');

        // Slight delay to let subscription register on server
        const t = setTimeout(() => {
            console.log('🔄 Refreshing challenges after subscription setup...');
            fetchCurrentChallenge().catch(console.error);
        }, 200);

        return () => clearTimeout(t);
    }, [enabled, matchId, userId, fetchCurrentChallenge]);

    // Add this to your useMatchChat hook - auto-cleanup after 5 minutes
    useEffect(() => {
        if (!currentChallenge) return;

        const timeout = setTimeout(() => {
            // Auto-cancel challenges that have been pending too long
            supabase
                .from('voice_challenges')
                .update({ status: 'expired' })
                .eq('id', currentChallenge.id)
                .then(() => {
                    console.log('🕐 Challenge expired due to inactivity');
                    setCurrentChallenge(null);
                });
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearTimeout(timeout);
    }, [currentChallenge]);

    return {
        messages,
        loading,
        error,
        sendMessage,
        loadMoreMessages,
        hasMoreMessages,
        refreshMessages,
        clearError,
        blockUser,
        createVoiceChallenge,
        respondToChallenge,
        currentChallenge,
        acceptChallenge,
        skipChallenge
    };
}