
'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

// Simple cache for now (in memory)
const messageCache = new Map<string, any[]>();

export function useGalaxyChat({
    matchId,
    userId,
    otherUserId,
    enabled = true
}: { matchId: string, userId: string, otherUserId?: string, enabled?: boolean }) {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load Initial
    useEffect(() => {
        if (!enabled || !matchId) return;

        // Check cache
        if (messageCache.has(matchId)) {
            setMessages(messageCache.get(matchId)!);
        }

        const loadMessages = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('match_messages')
                .select('*')
                .eq('match_id', matchId)
                .order('created_at', { ascending: true }); // Oldest first for chat list? Or Descending? Usually generic chat is Ascending but UI flexes col-reverse.
            // MatchChat UI uses flex-col and maps messages.
            // Let's assume standard ascending order (oldest at top).

            if (error) {
                console.error(error);
                setError(error.message);
            } else {
                setMessages(data || []);
                messageCache.set(matchId, data || []);
            }
            setLoading(false);
        };

        loadMessages();

        // Subscribe
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
                        return prev; // Already exists, don't add again
                    }
                    return [...prev, newMsg];
                });
                // update cache
                const current = messageCache.get(matchId) || [];
                if (!current.some(m => m.id === newMsg.id)) {
                    messageCache.set(matchId, [...current, newMsg]);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        }
    }, [matchId, enabled]);

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
                        url: `/galaxy/chat`, // Redirect to chat list or specific match if supported
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

    return { messages, loading, error, sendMessage, sendVoiceMessage };
}
