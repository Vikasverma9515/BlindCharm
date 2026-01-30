'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, ChevronRight } from 'lucide-react';

interface ChatListProps {
    initialMatches: any[];
    initialRequests: any[];
    userId: string;
}

export default function ChatList({ initialMatches, initialRequests, userId }: ChatListProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'chats' | 'requests'>('chats');

    // Realtime Subscriptions
    useEffect(() => {
        const channel = supabase
            .channel('galaxy_chat_list_updates')
            // Listen for changes to MY matches (as user_a or user_b)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'galaxy_matches', filter: `user_a=eq.${userId}` }, () => router.refresh())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'galaxy_matches', filter: `user_b=eq.${userId}` }, () => router.refresh())
            // Listen for new messages (to update last message/time)
            // Note: In a real app we'd filter this by match_id, but for prototype we just listed to all inserts 
            // and let the server component re-fetch if we are viewing the list.
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'match_messages' }, () => router.refresh())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, router]);

    return (

        <div className="h-screen bg-black text-white flex flex-col">
            {/* Fixed Header */}
            <div className="px-6 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-4 shrink-0 z-10 bg-black">
                <h1 className="text-3xl font-bold mb-6">Messages</h1>

                {/* Tabs */}
                <div className="flex gap-8 border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('chats')}
                        className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'chats' ? 'text-white' : 'text-white/40'}`}
                    >
                        Chats
                        {activeTab === 'chats' && (
                            <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'requests' ? 'text-white' : 'text-white/40'}`}
                    >
                        Requests
                        {initialRequests.length > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 bg-red-600 text-[10px] rounded-full text-white">
                                {initialRequests.length}
                            </span>
                        )}
                        {activeTab === 'requests' && (
                            <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />
                        )}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-24 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="space-y-2">
                    {activeTab === 'chats' ? (
                        initialMatches.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-20 px-4 text-center"
                            >
                                <div className="relative w-32 h-24 mb-4 mx-auto flex items-center justify-center">
                                    {/* Avatar 1 - Left */}
                                    <div className="absolute left-4 w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-900 shadow-xl z-0 transform -rotate-6 bg-zinc-800 opacity-60 grayscale">
                                        <Image
                                            src="/HeroAvatar/a8.svg"
                                            alt="Avatar 1"
                                            width={64}
                                            height={64}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {/* Avatar 2 - Right */}
                                    <div className="absolute right-4 w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-900 shadow-xl z-10 transform rotate-6 translate-y-2 bg-zinc-800 opacity-60 grayscale">
                                        <Image
                                            src="/HeroAvatar/a5.svg"
                                            alt="Avatar 2"
                                            width={64}
                                            height={64}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {/* Connection Symbol */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-6 z-20">
                                        <span className="text-3xl filter drop-shadow-lg">✨</span>
                                    </div>
                                </div>

                                <h2 className="text-xl font-medium text-white mb-2">No Chats Yet</h2>
                                <p className="text-white/40 text-sm mb-6 max-w-[240px]">
                                    Start exploring to find your cosmic connection.
                                </p>
                                <Link
                                    href="/galaxy/picks"
                                    className="px-8 py-3 bg-red-600 rounded-full text-sm font-semibold text-white shadow-lg hover:shadow-red-500/20 hover:scale-105 transition-all duration-300 hover:bg-red-700"
                                >
                                    Discover Now
                                </Link>
                            </motion.div>
                        ) : (
                            initialMatches.map((match, i) => (
                                <Link key={match.id} href={`/galaxy/chat/${match.id}`}>
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                                    >
                                        <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-purple-500/30 shrink-0">
                                            <img
                                                src={match.avatar}
                                                alt={match.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className="font-semibold text-white truncate">{match.name}</h3>
                                                <span className="text-xs text-white/40 ml-2">{match.time}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <p className={`text-sm truncate flex-1 ${match.unread > 0 ? 'text-white font-medium' : 'text-white/60'}`}>
                                                    {match.lastMessage}
                                                </p>
                                                {match.unread > 0 && (
                                                    <span className="shrink-0 min-w-[20px] h-5 px-1.5 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                                        {match.unread > 9 ? '9+' : match.unread}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))
                        )
                    ) : (
                        initialRequests.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-20 px-4 text-center"
                            >
                                <div className="relative w-32 h-24 mb-4 mx-auto flex items-center justify-center">
                                    {/* Avatar Stack Effect to represent 'Requests' queue */}
                                    <div className="absolute w-12 h-12 rounded-full overflow-hidden border-2 border-zinc-900 bg-zinc-800 z-0 scale-90 translate-y-4 -translate-x-6 opacity-60">
                                        <Image src="/HeroAvatar/a8.svg" alt="Avatar" width={48} height={48} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute w-14 h-14 rounded-full overflow-hidden border-2 border-zinc-900 bg-zinc-800 z-10 scale-95 translate-y-2 translate-x-6 opacity-80">
                                        <Image src="/HeroAvatar/a3.svg" alt="Avatar" width={56} height={56} className="w-full h-full object-cover" />
                                    </div>
                                    {/* Main Hero Avatar */}
                                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-900 bg-zinc-800 shadow-xl z-20">
                                        <Image
                                            src="/HeroAvatar/a9.svg"
                                            alt="Avatar 1"
                                            width={64}
                                            height={64}
                                            className="w-full h-full object-cover"
                                        />
                                        {/* Notification Badge */}
                                        <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-zinc-900" />
                                    </div>
                                </div>

                                <h2 className="text-xl font-medium text-white mb-2">Your Person is Nearby</h2>
                                <p className="text-white/40 text-sm mb-6 max-w-[240px]">
                                    Don't keep them waiting. Swipe now to spark something real.
                                </p>
                                <Link
                                    href="/galaxy"
                                    className="px-8 py-3 bg-red-600 rounded-full text-sm font-semibold text-white shadow-lg hover:shadow-red-500/20 hover:scale-105 transition-all duration-300 hover:bg-red-700"
                                >
                                    Start Matching
                                </Link>
                            </motion.div>
                        ) : (
                            initialRequests.map((request, i) => (
                                <Link key={request.id} href={`/galaxy/request/${request.id}`}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="flex items-center gap-4 p-4 mb-2 bg-gradient-to-r from-zinc-900/80 to-black border border-white/5 rounded-2xl hover:border-red-500/30 transition-all duration-300 group cursor-pointer active:scale-[0.98]"
                                    >
                                        <div className="relative w-12 h-12 rounded-full overflow-hidden ring-1 ring-white/10 group-hover:ring-red-500/50 transition-colors">
                                            <img
                                                src={request.avatar}
                                                alt={request.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-white text-base group-hover:text-red-400 transition-colors">{request.name}</h3>
                                            <p className="text-xs text-white/40 tracking-wide">Wants to connect</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-red-500 transition-colors" strokeWidth={1.5} />
                                    </motion.div>
                                </Link>
                            ))
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
