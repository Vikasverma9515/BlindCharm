// src/components/debug/CacheStats.tsx
'use client'

import { useState, useEffect } from 'react';
import { chatCacheService } from '@/lib/services/ChatCacheService';
import { Database, Trash2, RefreshCw } from 'lucide-react';

interface CacheStatsProps {
  className?: string;
}

export default function CacheStats({ className = '' }: CacheStatsProps) {
  const [stats, setStats] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  const refreshStats = () => {
    const cacheStats = chatCacheService.getCacheStats();
    setStats(cacheStats);
  };

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleClearCache = () => {
    chatCacheService.clearAllCache();
    refreshStats();
  };

  if (!stats) return null;

  return (
    <div className={`fixed bottom-4 left-4 z-50 ${className}`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="Cache Statistics"
      >
        <Database className="w-4 h-4" />
      </button>

      {/* Stats Panel */}
      {isVisible && (
        <div className="absolute bottom-12 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 min-w-64">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Chat Cache Stats
            </h3>
            <div className="flex gap-1">
              <button
                onClick={refreshStats}
                className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                title="Refresh"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
              <button
                onClick={handleClearCache}
                className="p-1 text-red-600 hover:text-red-800"
                title="Clear Cache"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Chats:</span>
              <span className="font-mono text-gray-800 dark:text-gray-200">
                {stats.totalChats}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Messages:</span>
              <span className="font-mono text-gray-800 dark:text-gray-200">
                {stats.totalMessages}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Cache Size:</span>
              <span className="font-mono text-gray-800 dark:text-gray-200">
                {stats.cacheSize}
              </span>
            </div>
            
            {stats.totalChats > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Oldest Entry:</span>
                  <span className="font-mono text-gray-800 dark:text-gray-200">
                    {Math.round((Date.now() - stats.oldestEntry) / 1000)}s ago
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Newest Entry:</span>
                  <span className="font-mono text-gray-800 dark:text-gray-200">
                    {Math.round((Date.now() - stats.newestEntry) / 1000)}s ago
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Cache reduces server load by storing messages locally for 5 minutes.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}