// src/lib/services/ChatCacheService.ts

interface CachedMessage {
  id: string;
  content: string;
  user_id: string;
  lobby_id?: string;
  chat_id?: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    gender?: string;
    profile_picture?: string | null;
    additional_photo_1?: string | null;
    additional_photo_2?: string | null;
  };
  timestamp: number; // When this message was cached
}

interface CacheEntry {
  messages: CachedMessage[];
  lastFetch: number;
  lastMessageId?: string;
  totalCount: number;
}

class ChatCacheService {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 50; // Maximum number of chat caches to keep
  private readonly MESSAGES_PER_PAGE = 50; // Number of messages to load per page
  private readonly MAX_CACHED_MESSAGES = 200; // Maximum messages to keep in cache per chat

  /**
   * Get cache key for a chat
   */
  private getCacheKey(chatId: string, type: 'lobby' | 'match'): string {
    return `${type}_${chatId}`;
  }

  /**
   * Check if cache is valid and not expired
   */
  private isCacheValid(entry: CacheEntry): boolean {
    const now = Date.now();
    return (now - entry.lastFetch) < this.CACHE_DURATION;
  }

  /**
   * Clean up old cache entries to prevent memory leaks
   */
  private cleanupCache(): void {
    if (this.cache.size <= this.MAX_CACHE_SIZE) return;

    // Sort by last fetch time and remove oldest entries
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.lastFetch - b.lastFetch);

    const toRemove = entries.slice(0, this.cache.size - this.MAX_CACHE_SIZE);
    toRemove.forEach(([key]) => this.cache.delete(key));

    console.log(`🧹 Cleaned up ${toRemove.length} old cache entries`);
  }

  /**
   * Get cached messages for a chat
   */
  getCachedMessages(chatId: string, type: 'lobby' | 'match'): CachedMessage[] | null {
    const key = this.getCacheKey(chatId, type);
    const entry = this.cache.get(key);

    if (!entry || !this.isCacheValid(entry)) {
      return null;
    }

    console.log(`📦 Cache hit for ${type} chat ${chatId}: ${entry.messages.length} messages`);
    return entry.messages;
  }

  /**
   * Cache messages for a chat
   */
  cacheMessages(
    chatId: string, 
    type: 'lobby' | 'match', 
    messages: CachedMessage[],
    totalCount?: number
  ): void {
    const key = this.getCacheKey(chatId, type);
    const now = Date.now();

    // Limit the number of cached messages to prevent memory issues
    const limitedMessages = messages.slice(-this.MAX_CACHED_MESSAGES);

    const entry: CacheEntry = {
      messages: limitedMessages,
      lastFetch: now,
      lastMessageId: limitedMessages[limitedMessages.length - 1]?.id,
      totalCount: totalCount || limitedMessages.length
    };

    this.cache.set(key, entry);
    this.cleanupCache();

    console.log(`💾 Cached ${limitedMessages.length} messages for ${type} chat ${chatId}`);
  }

  /**
   * Add a new message to cache (for real-time updates)
   */
  addMessageToCache(chatId: string, type: 'lobby' | 'match', message: CachedMessage): void {
    const key = this.getCacheKey(chatId, type);
    const entry = this.cache.get(key);

    if (!entry) return;

    // Check if message already exists (prevent duplicates)
    const exists = entry.messages.some(m => m.id === message.id);
    if (exists) return;

    // Add message and maintain size limit
    entry.messages.push(message);
    if (entry.messages.length > this.MAX_CACHED_MESSAGES) {
      entry.messages = entry.messages.slice(-this.MAX_CACHED_MESSAGES);
    }

    entry.lastMessageId = message.id;
    entry.totalCount++;

    console.log(`➕ Added new message to ${type} chat ${chatId} cache`);
  }

  /**
   * Update a message in cache
   */
  updateMessageInCache(chatId: string, type: 'lobby' | 'match', messageId: string, updates: Partial<CachedMessage>): void {
    const key = this.getCacheKey(chatId, type);
    const entry = this.cache.get(key);

    if (!entry) return;

    const messageIndex = entry.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    entry.messages[messageIndex] = { ...entry.messages[messageIndex], ...updates };
    console.log(`✏️ Updated message ${messageId} in ${type} chat ${chatId} cache`);
  }

  /**
   * Remove a message from cache
   */
  removeMessageFromCache(chatId: string, type: 'lobby' | 'match', messageId: string): void {
    const key = this.getCacheKey(chatId, type);
    const entry = this.cache.get(key);

    if (!entry) return;

    entry.messages = entry.messages.filter(m => m.id !== messageId);
    entry.totalCount = Math.max(0, entry.totalCount - 1);

    console.log(`🗑️ Removed message ${messageId} from ${type} chat ${chatId} cache`);
  }

  /**
   * Check if we need to load more messages (pagination)
   */
  shouldLoadMore(chatId: string, type: 'lobby' | 'match', requestedCount: number): boolean {
    const key = this.getCacheKey(chatId, type);
    const entry = this.cache.get(key);

    if (!entry) return true;

    return entry.messages.length < requestedCount && entry.messages.length < entry.totalCount;
  }

  /**
   * Get the last message ID for pagination
   */
  getLastMessageId(chatId: string, type: 'lobby' | 'match'): string | undefined {
    const key = this.getCacheKey(chatId, type);
    const entry = this.cache.get(key);

    return entry?.lastMessageId;
  }

  /**
   * Invalidate cache for a specific chat
   */
  invalidateCache(chatId: string, type: 'lobby' | 'match'): void {
    const key = this.getCacheKey(chatId, type);
    this.cache.delete(key);
    console.log(`🗑️ Invalidated cache for ${type} chat ${chatId}`);
  }

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    this.cache.clear();
    console.log('🧹 Cleared all chat cache');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    totalChats: number;
    totalMessages: number;
    cacheSize: string;
    oldestEntry: number;
    newestEntry: number;
  } {
    let totalMessages = 0;
    let oldestEntry = Date.now();
    let newestEntry = 0;

    for (const entry of this.cache.values()) {
      totalMessages += entry.messages.length;
      oldestEntry = Math.min(oldestEntry, entry.lastFetch);
      newestEntry = Math.max(newestEntry, entry.lastFetch);
    }

    return {
      totalChats: this.cache.size,
      totalMessages,
      cacheSize: `${Math.round(JSON.stringify(Array.from(this.cache.entries())).length / 1024)}KB`,
      oldestEntry,
      newestEntry
    };
  }

  /**
   * Preload messages for a chat (useful for anticipated navigation)
   */
  async preloadMessages(
    chatId: string, 
    type: 'lobby' | 'match',
    fetchFunction: () => Promise<CachedMessage[]>
  ): Promise<void> {
    const key = this.getCacheKey(chatId, type);
    
    // Don't preload if already cached and valid
    if (this.cache.has(key) && this.isCacheValid(this.cache.get(key)!)) {
      return;
    }

    try {
      const messages = await fetchFunction();
      this.cacheMessages(chatId, type, messages);
      console.log(`🚀 Preloaded ${messages.length} messages for ${type} chat ${chatId}`);
    } catch (error) {
      console.error(`❌ Failed to preload messages for ${type} chat ${chatId}:`, error);
    }
  }
}

// Export singleton instance
export const chatCacheService = new ChatCacheService();
export type { CachedMessage };