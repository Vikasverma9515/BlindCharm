// src/hooks/useMatchChat.ts
'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { uploadVoiceMessage, getVoiceMessageUrl  } from '@/lib/voice-upload';
import { getRandomChallenge } from '@/lib/voiceChallenges';

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

     createVoiceChallenge: (prompt: string, timeLimit: number) => Promise<VoiceChallenge>;
  respondToChallenge: (challengeId: string, audioBlob: Blob, duration: number) => Promise<void>;
  currentChallenge: VoiceChallenge | null;

}

export interface VoiceChallenge {
  id: string;
  match_id: string;
  challenge_prompt: string;
  category: string;
  time_limit: number;
  created_at: string;
  status: string;
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
        if (!enabled || !matchId) return;

        console.log('🔗 Setting up real-time subscription for match:', matchId);

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

                    try {
                        // Fetch sender data for the new message
                        const { data: userData } = await supabase
                            .from('users')
                            .select('id, username, profile_picture')
                            .eq('id', newMsg.sender_id)
                            .single();

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

                        // Add message without duplicate check initially
                        setMessages(prev => {
                            // Check if message already exists
                            const exists = prev.some(msg => msg.id === message.id);
                            if (exists) {
                                console.log('⚠️ Message already exists, skipping:', message.id);
                                return prev;
                            }

                            console.log('✅ Adding new message to state');
                            return [...prev, message];
                        });

                    } catch (err) {
                        console.error('❌ Error processing new message:', err);
                    }
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

    // Add this useEffect to your MatchChatPage (after the existing useEffects)
    useEffect(() => {
        if (!matchId) return;

        console.log('🔗 Setting up supplementary real-time subscription for match:', matchId);

        const channel = supabase
            .channel(`match_messages_${matchId}_${Date.now()}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'match_messages',
                    filter: `match_id=eq.${matchId}`
                },
                (payload) => {
                    console.log('📨 Real-time event received in component:', payload.new);

                    // Instead of managing messages directly, just refresh the hook
                    console.log('🔄 Triggering hook refresh...');
                    refreshMessages();
                }
            )
            .subscribe((status) => {
                console.log('📡 Component subscription status:', status);
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Component successfully subscribed to match messages');
                }
            });

        return () => {
            console.log('🔌 Component unsubscribing from match messages');
            channel.unsubscribe();
        };
    }, [matchId, refreshMessages]);

    // Load initial messages when component mounts
    useEffect(() => {
        loadInitialMessages();
    }, [loadInitialMessages]);

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

    const createVoiceChallenge = useCallback(async (prompt: string, timeLimit: number): Promise<VoiceChallenge> => {
  if (!matchId) {
    throw new Error('No match ID');
  }

  try {
    const { data, error } = await supabase
      .from('voice_challenges')
      .insert({
        match_id: matchId,
        challenge_prompt: prompt,
        time_limit: timeLimit,
        category: 'quick_fun'
      })
      .select()
      .single();

    if (error) throw error;

    setCurrentChallenge(data);
    return data;
  } catch (err) {
    console.error('Error creating voice challenge:', err);
    throw err;
  }
}, [matchId]);

// Respond to challenge
const respondToChallenge = useCallback(async (challengeId: string, audioBlob: Blob, duration: number) => {
  if (!userId) {
    throw new Error('No user ID');
  }

  try {
    // Upload audio file
    const uploadResult = await uploadVoiceMessage(audioBlob, matchId, userId);
    if (!uploadResult?.path) {
      throw new Error('Upload failed');
    }

    const audioUrl = getVoiceMessageUrl(uploadResult.path);

    // Save challenge response
    const { error } = await supabase
      .from('voice_challenge_responses')
      .insert({
        challenge_id: challengeId,
        user_id: userId,
        audio_url: audioUrl,
        duration: duration
      });

    if (error) throw error;

    // Send as a special message
    await sendMessage(`🎤 Voice Challenge Response: "${currentChallenge?.challenge_prompt}"`, 'voice', {
      audio_url: audioUrl,
      duration: duration,
      challenge_id: challengeId,
      is_challenge_response: true
    });

    // Clear current challenge
    setCurrentChallenge(null);

  } catch (err) {
    console.error('Error responding to challenge:', err);
    throw err;
  }
}, [userId, matchId, currentChallenge, sendMessage]);

// Auto-suggest challenges when conversation slows down
useEffect(() => {
  if (messages.length === 0) return;

  const lastMessage = messages[messages.length - 1];
  const lastMessageDate = new Date(lastMessage.created_at);
  setLastMessageTime(lastMessageDate);

  // Check if conversation has been slow (no challenge already active)
  if (!currentChallenge) {
    const timeSinceLastMessage = Date.now() - lastMessageDate.getTime();
    const thirtyMinutes = 30 * 60 * 1000;

    if (timeSinceLastMessage > thirtyMinutes) {
      // Auto-suggest a challenge
      const randomChallenge = getRandomChallenge();
      createVoiceChallenge(randomChallenge.prompt, randomChallenge.timeLimit)
        .catch(console.error);
    }
  }
}, [messages, currentChallenge, createVoiceChallenge]);

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
        currentChallenge
    };
}