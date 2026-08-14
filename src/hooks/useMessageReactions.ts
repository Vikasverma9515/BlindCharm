'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DEMO_MODE } from '@/lib/demoData';

interface Reaction {
    id: string;
    message_id: string;
    user_id: string;
    emoji: string;
    created_at: string;
}

interface ReactionGroup {
    emoji: string;
    count: number;
    userReacted: boolean;
    users: string[];
}

export function useMessageReactions(messageId: string, currentUserId: string) {
    const [reactions, setReactions] = useState<Reaction[]>([]);
    const [loading, setLoading] = useState(false);

    // Group reactions by emoji
    const groupedReactions: ReactionGroup[] = reactions.reduce((acc, reaction) => {
        const existing = acc.find(r => r.emoji === reaction.emoji);
        if (existing) {
            existing.count++;
            existing.users.push(reaction.user_id);
            if (reaction.user_id === currentUserId) {
                existing.userReacted = true;
            }
        } else {
            acc.push({
                emoji: reaction.emoji,
                count: 1,
                userReacted: reaction.user_id === currentUserId,
                users: [reaction.user_id]
            });
        }
        return acc;
    }, [] as ReactionGroup[]);

    // Load reactions for message
    const loadReactions = async () => {
        // Skip for temporary messages (optimistic updates)
        if (messageId.startsWith('temp-') || DEMO_MODE) {
            return;
        }

        const { data, error } = await supabase
            .from('galaxy_message_reactions')
            .select('*')
            .eq('message_id', messageId);

        if (!error && data) {
            setReactions(data);
        }
    };

    // Add reaction
    const addReaction = async (emoji: string) => {
        // Cannot react to temporary messages
        if (messageId.startsWith('temp-')) {
            console.warn('Cannot react to temporary message');
            return;
        }

        if (DEMO_MODE) {
            setReactions(prev => [...prev, { id: `demo-${Date.now()}`, message_id: messageId, user_id: currentUserId, emoji, created_at: new Date().toISOString() }]);
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('galaxy_message_reactions')
                .insert({
                    message_id: messageId,
                    user_id: currentUserId,
                    emoji
                });

            if (!error) {
                await loadReactions();
            }
        } catch (err) {
            console.error('Failed to add reaction:', err);
        } finally {
            setLoading(false);
        }
    };

    // Remove reaction
    const removeReaction = async (emoji: string) => {
        if (messageId.startsWith('temp-')) return;

        if (DEMO_MODE) {
            setReactions(prev => prev.filter(r => !(r.emoji === emoji && r.user_id === currentUserId)));
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('galaxy_message_reactions')
                .delete()
                .eq('message_id', messageId)
                .eq('user_id', currentUserId)
                .eq('emoji', emoji);

            if (!error) {
                await loadReactions();
            }
        } catch (err) {
            console.error('Failed to remove reaction:', err);
        } finally {
            setLoading(false);
        }
    };

    // Toggle reaction (add if not present, remove if present)
    const toggleReaction = async (emoji: string) => {
        const existing = reactions.find(
            r => r.emoji === emoji && r.user_id === currentUserId
        );

        if (existing) {
            await removeReaction(emoji);
        } else {
            await addReaction(emoji);
        }
    };

    // Load reactions on mount
    useEffect(() => {
        if (messageId.startsWith('temp-')) {
            setReactions([]); // Clear reactions for temp messages
            return;
        }
        loadReactions();
    }, [messageId]);

    // Real-time subscription for reactions
    useEffect(() => {
        if (messageId.startsWith('temp-') || DEMO_MODE) return;

        const channel = supabase
            .channel(`reactions:${messageId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'galaxy_message_reactions',
                    filter: `message_id=eq.${messageId}`
                },
                () => {
                    loadReactions();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [messageId]);

    return {
        reactions: groupedReactions,
        loading,
        toggleReaction
    };
}
