// src/hooks/useChat.ts
'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { chatCacheService, CachedMessage } from '@/lib/services/ChatCacheService';
import { DEMO_MODE, DEMO_LOBBY_MESSAGES } from '@/lib/demoData';

interface UseChatOptions {
  chatId: string;
  type: 'lobby' | 'match';
  userId?: string;
  enabled?: boolean;
  pageSize?: number;
}

interface UseChatReturn {
  messages: CachedMessage[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  hasMoreMessages: boolean;
  refreshMessages: () => Promise<void>;
  clearError: () => void;
}

export function useChat({
  chatId,
  type,
  userId,
  enabled = true,
  pageSize = 50
}: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<CachedMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
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
  ): Promise<{ messages: CachedMessage[]; hasMore: boolean }> => {
    if (DEMO_MODE) {
      const mock = type === 'lobby' ? (DEMO_LOBBY_MESSAGES[chatId] || []) : [];
      return { messages: mock as unknown as CachedMessage[], hasMore: false };
    }
    try {
      let query = supabase
        .from(type === 'lobby' ? 'lobby_messages' : 'private_messages')
        .select(`
          id,
          content,
          ${type === 'lobby' ? 'user_id, lobby_id' : 'sender_id, chat_id'},
          created_at,
          ${type === 'lobby' ? 'user:user_id' : 'sender:sender_id'} (
            id,
            username,
            ${type === 'lobby' ? 'gender,' : ''}
            profile_picture,
            additional_photo_1,
            additional_photo_2
          )
        `)
        .eq(type === 'lobby' ? 'lobby_id' : 'chat_id', chatId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (before) {
        query = query.lt('created_at', before);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedMessages: CachedMessage[] = (data || []).map((msg: any) => {
        const user = type === 'lobby' ? msg.user : msg.sender;
        return {
          id: msg.id,
          content: msg.content,
          user_id: type === 'lobby' ? msg.user_id : msg.sender_id,
          [type === 'lobby' ? 'lobby_id' : 'chat_id']: type === 'lobby' ? msg.lobby_id : msg.chat_id,
          created_at: msg.created_at,
          user: {
            id: user?.id || '',
            username: user?.username || 'Unknown User',
            gender: user?.gender || 'other',
            profile_picture: user?.profile_picture || null,
            additional_photo_1: user?.additional_photo_1 || null,
            additional_photo_2: user?.additional_photo_2 || null
          },
          timestamp: Date.now()
        };
      }).reverse(); // Reverse to get chronological order

      const hasMore = data?.length === limit;

      return { messages: transformedMessages, hasMore };
    } catch (err) {
      console.error(`Error fetching ${type} messages:`, err);
      throw err;
    }
  }, [chatId, type, pageSize]);

  // Load initial messages
  const loadInitialMessages = useCallback(async () => {
    if (!enabled || !chatId || loadingRef.current) return;

    setLoading(true);
    loadingRef.current = true;
    setError(null);

    try {
      // Try to get from cache first
      const cachedMessages = chatCacheService.getCachedMessages(chatId, type);
      
      if (cachedMessages && cachedMessages.length > 0) {
        setMessages(cachedMessages);
        setHasMoreMessages(chatCacheService.shouldLoadMore(chatId, type, pageSize));
        setInitialLoadComplete(true);
        console.log(`📦 Loaded ${cachedMessages.length} messages from cache for ${type} chat ${chatId}`);
      } else {
        // Fetch from database
        const { messages: fetchedMessages, hasMore } = await fetchMessagesFromDB(pageSize);
        
        setMessages(fetchedMessages);
        setHasMoreMessages(hasMore);
        
        // Cache the messages
        chatCacheService.cacheMessages(chatId, type, fetchedMessages);
        
        console.log(`🌐 Loaded ${fetchedMessages.length} messages from database for ${type} chat ${chatId}`);
      }
      
      setInitialLoadComplete(true);
    } catch (err) {
      setError(`Failed to load messages: ${(err as Error).message}`);
      console.error(`Error loading initial messages for ${type} chat ${chatId}:`, err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [enabled, chatId, type, pageSize, fetchMessagesFromDB]);

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
        
        // Update cache
        chatCacheService.cacheMessages(chatId, type, updatedMessages);
        
        console.log(`📄 Loaded ${moreMessages.length} more messages for ${type} chat ${chatId}`);
      }

      setHasMoreMessages(hasMore);
    } catch (err) {
      setError(`Failed to load more messages: ${(err as Error).message}`);
      console.error(`Error loading more messages for ${type} chat ${chatId}:`, err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [hasMoreMessages, loading, messages, pageSize, fetchMessagesFromDB, chatId, type]);

  // Refresh messages
  const refreshMessages = useCallback(async () => {
    // Invalidate cache and reload
    chatCacheService.invalidateCache(chatId, type);
    setInitialLoadComplete(false);
    await loadInitialMessages();
  }, [chatId, type, loadInitialMessages]);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!userId || !content.trim()) return;

    if (DEMO_MODE) {
      const newMessage: CachedMessage = {
        id: `demo-${Date.now()}`,
        content: content.trim(),
        user_id: userId,
        [type === 'lobby' ? 'lobby_id' : 'chat_id']: chatId,
        created_at: new Date().toISOString(),
        user: { id: userId, username: 'You', gender: 'other', profile_picture: null, additional_photo_1: null, additional_photo_2: null },
        timestamp: Date.now()
      } as unknown as CachedMessage;
      setMessages(prev => [...prev, newMessage]);
      return;
    }

    try {
      const messageData = {
        [type === 'lobby' ? 'lobby_id' : 'chat_id']: chatId,
        [type === 'lobby' ? 'user_id' : 'sender_id']: userId,
        content: content.trim()
      };

      const { data, error } = await supabase
        .from(type === 'lobby' ? 'lobby_messages' : 'private_messages')
        .insert(messageData)
        .select('id, content, created_at')
        .single();

      if (error) throw error;

      // The real-time subscription will handle adding the message to the UI
      console.log(`📤 Sent message to ${type} chat ${chatId}`);
    } catch (err) {
      setError(`Failed to send message: ${(err as Error).message}`);
      console.error(`Error sending message to ${type} chat ${chatId}:`, err);
      throw err;
    }
  }, [userId, chatId, type]);

  // Set up real-time subscription
  useEffect(() => {
    if (DEMO_MODE || !enabled || !chatId || !initialLoadComplete) return;

    const tableName = type === 'lobby' ? 'lobby_messages' : 'private_messages';
    const filterColumn = type === 'lobby' ? 'lobby_id' : 'chat_id';

    const channel = supabase
      .channel(`${type}_messages_${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: tableName,
          filter: `${filterColumn}=eq.${chatId}`
        },
        async (payload) => {
          const newMsg = payload.new;
          
          // Fetch user data for the new message
          try {
            const { data: userData } = await supabase
              .from('users')
              .select('id, username, gender, profile_picture, additional_photo_1, additional_photo_2')
              .eq('id', type === 'lobby' ? newMsg.user_id : newMsg.sender_id)
              .single();

            const message: CachedMessage = {
              id: newMsg.id,
              content: newMsg.content,
              user_id: type === 'lobby' ? newMsg.user_id : newMsg.sender_id,
              [type === 'lobby' ? 'lobby_id' : 'chat_id']: type === 'lobby' ? newMsg.lobby_id : newMsg.chat_id,
              created_at: newMsg.created_at,
              user: {
                id: userData?.id || '',
                username: userData?.username || 'Unknown User',
                gender: userData?.gender || 'other',
                profile_picture: userData?.profile_picture || null,
                additional_photo_1: userData?.additional_photo_1 || null,
                additional_photo_2: userData?.additional_photo_2 || null
              },
              timestamp: Date.now()
            };

            // Check if message already exists to prevent duplicates
            setMessages(prev => {
              if (prev.some(msg => msg.id === message.id)) return prev;
              const updated = [...prev, message];
              
              // Add to cache
              chatCacheService.addMessageToCache(chatId, type, message);
              
              return updated;
            });

            console.log(`📨 Received new message in ${type} chat ${chatId}`);
          } catch (err) {
            console.error('Error processing new message:', err);
          }
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [enabled, chatId, type, initialLoadComplete]);

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

  return {
    messages,
    loading,
    error,
    sendMessage,
    loadMoreMessages,
    hasMoreMessages,
    refreshMessages,
    clearError
  };
}