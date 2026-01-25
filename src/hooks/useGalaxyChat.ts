
'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { chatCacheService, CachedMessage } from '@/lib/services/ChatCacheService';

export function useGalaxyChat({
    matchId,
    userId,
    otherUserId,
    enabled = true,
    pageSize = 20 // Load 20 messages at a time
}: { matchId: string, userId: string, otherUserId?: string, enabled?: boolean, pageSize?: number }) {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    const subscriptionRef = useRef<any>(null);
    const loadingRef = useRef(false);

    // Fetch messages from database with pagination
    const fetchMessagesFromDB = useCallback(async (
        limit: number = pageSize,
        before?: string
    ): Promise<{ messages: any[]; hasMore: boolean }> => {
        try {
            let query = supabase
                .from('match_messages')
                .select('*')
                .eq('match_id', matchId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (before) {
                query = query.lt('created_at', before);
            }

            const { data, error } = await query;

            if (error) throw error;

            // Reverse to get chronological order (oldest first)
            const transformedMessages = (data || []).reverse();
            const hasMore = data?.length === limit;

            return { messages: transformedMessages, hasMore };
        } catch (err) {
            console.error('Error fetching match messages:', err);
            throw err;
        }
    }, [matchId, pageSize]);

    // Load initial messages (cache-first)
    const loadInitialMessages = useCallback(async () => {
        if (!enabled || !matchId || loadingRef.current) return;

        setLoading(true);
        loadingRef.current = true;
        setError(null);

        try {
            // Try to get from cache first
            const cachedMessages = chatCacheService.getCachedMessages(matchId, 'match');

            if (cachedMessages && cachedMessages.length > 0) {
                setMessages(cachedMessages);
                setHasMoreMessages(chatCacheService.shouldLoadMore(matchId, 'match', pageSize));
                setInitialLoadComplete(true);
                console.log(`📦 Loaded ${cachedMessages.length} messages from cache for match ${matchId}`);
            } else {
                // Fetch from database
                const { messages: fetchedMessages, hasMore } = await fetchMessagesFromDB(pageSize);

                setMessages(fetchedMessages);
                setHasMoreMessages(hasMore);

                // Cache the messages
                chatCacheService.cacheMessages(matchId, 'match', fetchedMessages);

                console.log(`🌐 Loaded ${fetchedMessages.length} messages from database for match ${matchId}`);
            }

            setInitialLoadComplete(true);
        } catch (err) {
            setError(`Failed to load messages: ${(err as Error).message}`);
            console.error(`Error loading initial messages for match ${matchId}:`, err);
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [enabled, matchId, pageSize, fetchMessagesFromDB]);

    // Load more messages (pagination)
    const loadMoreMessages = useCallback(async () => {
        if (!hasMoreMessages || isLoadingMore || loadingRef.current) return;

        setIsLoadingMore(true);
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

                // Update cache
                chatCacheService.cacheMessages(matchId, 'match', updatedMessages);

                console.log(`📄 Loaded ${moreMessages.length} more messages for match ${matchId}`);
            }

            setHasMoreMessages(hasMore);
        } catch (err) {
            setError(`Failed to load more messages: ${(err as Error).message}`);
            console.error(`Error loading more messages for match ${matchId}:`, err);
        } finally {
            setIsLoadingMore(false);
            loadingRef.current = false;
        }
    }, [hasMoreMessages, isLoadingMore, messages, pageSize, fetchMessagesFromDB, matchId]);

    // Set up real-time subscription
    useEffect(() => {
        if (!enabled || !matchId || !initialLoadComplete) return;

        const channel = supabase
            .channel(`match_messages:${matchId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'match_messages',
                filter: `match_id=eq.${matchId}`
            }, (payload) => {
                const newMsg = payload.new;

                // Prevent duplicates - check if message already exists
                setMessages(prev => {
                    if (prev.some(m => m.id === newMsg.id)) {
                        return prev;
                    }
                    const updated = [...prev, newMsg];

                    // Update cache with full messages array
                    chatCacheService.cacheMessages(matchId, 'match', updated);

                    return updated;
                });

                console.log(`📨 Received new message in match ${matchId}`);
            })
            .subscribe();

        subscriptionRef.current = channel;

        return () => {
            if (subscriptionRef.current) {
                supabase.removeChannel(subscriptionRef.current);
                subscriptionRef.current = null;
            }
        };
    }, [enabled, matchId, initialLoadComplete]);

    // Load initial messages when component mounts
    useEffect(() => {
        loadInitialMessages();
    }, [loadInitialMessages]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (subscriptionRef.current) {
                supabase.removeChannel(subscriptionRef.current);
            }
        };
    }, []);

    const sendMessage = async (content: string) => {
        // Optimistic Update
        const tempId = 'temp-' + Date.now();
        const optimisticMsg = {
            id: tempId,
            match_id: matchId,
            sender_id: userId,
            content: content,
            created_at: new Date().toISOString(),
            type: 'text'
        };

        setMessages(prev => [...prev, optimisticMsg]);

        const { data, error } = await supabase
            .from('match_messages')
            .insert({
                match_id: matchId,
                sender_id: userId,
                content: content,
                type: 'text'
            })
            .select()
            .single();

        if (error) {
            setError(error.message);
            console.error("Send failed", error);
            setMessages(prev => prev.filter(m => m.id !== tempId));
        } else {
            // Replace temp with real
            setMessages(prev => prev.map(m => m.id === tempId ? data : m));

            // Trigger Push Notification
            if (otherUserId) {
                fetch('/api/notifications/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: otherUserId,
                        title: 'New Message',
                        body: content.length > 50 ? content.substring(0, 50) + '...' : content,
                        type: 'message',
                        url: `/galaxy/chat`,
                        matchId: matchId
                    })
                }).catch(err => console.error('Failed to trigger push', err));
            }
        }
    };

    const sendVoiceMessage = async (audioUrl: string, duration: number) => {
        // Optimistic Update
        const tempId = 'temp-voice-' + Date.now();
        const optimisticMsg = {
            id: tempId,
            match_id: matchId,
            sender_id: userId,
            content: audioUrl,
            created_at: new Date().toISOString(),
            type: 'voice',
            metadata: { duration }
        };

        setMessages(prev => [...prev, optimisticMsg]);

        const { data, error } = await supabase
            .from('match_messages')
            .insert({
                match_id: matchId,
                sender_id: userId,
                content: audioUrl,
                type: 'voice',
                metadata: { duration }
            })
            .select()
            .single();

        if (error) {
            setError(error.message);
            console.error("Voice send failed", error);
            setMessages(prev => prev.filter(m => m.id !== tempId));
            throw error;
        } else {
            // Replace temp with real
            setMessages(prev => prev.map(m => m.id === tempId ? data : m));

            // Trigger Push Notification
            if (otherUserId) {
                fetch('/api/notifications/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: otherUserId,
                        title: 'New Voice Message',
                        body: '🎤 Voice message',
                        type: 'message',
                        url: `/galaxy/chat`,
                        matchId: matchId
                    })
                }).catch(err => console.error('Failed to trigger push', err));
            }
        }

        return data;
    };

    const sendGIFMessage = async (gifUrl: string, gifId: string) => {
        // Optimistic Update
        const tempId = 'temp-gif-' + Date.now();
        const optimisticMsg = {
            id: tempId,
            match_id: matchId,
            sender_id: userId,
            content: gifUrl,
            created_at: new Date().toISOString(),
            type: 'gif',
            metadata: { gifId }
        };

        setMessages(prev => [...prev, optimisticMsg]);

        const { data, error } = await supabase
            .from('match_messages')
            .insert({
                match_id: matchId,
                sender_id: userId,
                content: gifUrl,
                type: 'gif',
                metadata: { gifId }
            })
            .select()
            .single();

        if (error) {
            setError(error.message);
            console.error("GIF send failed", error);
            setMessages(prev => prev.filter(m => m.id !== tempId));
            throw error;
        } else {
            // Replace temp with real
            setMessages(prev => prev.map(m => m.id === tempId ? data : m));

            // Trigger Push Notification
            if (otherUserId) {
                fetch('/api/notifications/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: otherUserId,
                        title: 'New GIF',
                        body: '🎬 Sent a GIF',
                        type: 'message',
                        url: `/galaxy/chat`,
                        matchId: matchId
                    })
                }).catch(err => console.error('Failed to trigger push', err));
            }
        }

        return data;
    };

    return {
        messages,
        loading,
        error,
        sendMessage,
        sendVoiceMessage,
        sendGIFMessage,
        loadMoreMessages,
        hasMoreMessages,
        isLoadingMore
    };
}
