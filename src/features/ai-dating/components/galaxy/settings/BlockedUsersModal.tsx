'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, UserMinus, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { toast } from 'sonner';
import { getBlockedUsersAction, unblockUserAction } from '@/app/(ai-dating)/galaxy/actions';

interface BlockedUser {
    matchId: string;
    userId: string;
    name: string;
    photo: string | null;
    blockedAt: string;
}

interface BlockedUsersModalProps {
    onClose: () => void;
}

// Funny empty state messages
const EMPTY_MESSAGES = [
    "No enemies here, just good vibes! ✨",
    "You're a lover, not a fighter! ❤️",
    "Everyone makes the cut! 🎬",
    "Zero drama, all peace. ✌️",
    "Your block list is cleaner than my room! 🧹",
    "Looks like you get along with everyone! 🤝"
];

export default function BlockedUsersModal({ onClose }: BlockedUsersModalProps) {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<BlockedUser[]>([]);
    const [unblockingId, setUnblockingId] = useState<string | null>(null);
    const [randomAvatar, setRandomAvatar] = useState<string>('');
    const [randomMessage, setRandomMessage] = useState<string>('');

    useEffect(() => {
        // Pick random avatar (a1-a16) and message for empty state
        const randomNum = Math.floor(Math.random() * 16) + 1;
        setRandomAvatar(`/HeroAvatar/a${randomNum}.svg`);
        setRandomMessage(EMPTY_MESSAGES[Math.floor(Math.random() * EMPTY_MESSAGES.length)]);

        loadBlockedUsers();
    }, []);

    const loadBlockedUsers = async () => {
        try {
            const data = await getBlockedUsersAction();
            setUsers(data);
        } catch (error) {
            console.error('Failed to load blocked users:', error);
            toast.error('Failed to load block list');
        } finally {
            setLoading(false);
        }
    };

    const handleUnblock = async (matchId: string, name: string) => {
        if (unblockingId) return;

        setUnblockingId(matchId);
        try {
            await unblockUserAction(matchId);
            setUsers(prev => prev.filter(u => u.matchId !== matchId));
            toast.success(`Unblocked ${name}`);
        } catch (error) {
            console.error('Failed to unblock:', error);
            toast.error(`Failed to unblock ${name}`);
        } finally {
            setUnblockingId(null);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 font-sans"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-zinc-900 w-full max-w-md rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col max-h-[80vh]"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-zinc-900 z-10">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="text-purple-500" size={20} />
                        Block List
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-white/40 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                            <p className="text-white/40 text-sm">Loading blocked users...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-32 h-32 mb-6 relative">
                                <Image
                                    src={randomAvatar}
                                    alt="Funny Avatar"
                                    fill
                                    className="object-contain drop-shadow-2xl"
                                />
                            </div>
                            <h4 className="text-xl font-bold text-white mb-2 max-w-[280px]">
                                {randomMessage}
                            </h4>
                            <p className="text-white/40 text-sm max-w-[260px]">
                                You haven't blocked anyone yet. Let's keep the vibes high! 🚀
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {users.map((user) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    key={user.matchId}
                                    className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-800">
                                            {user.photo ? (
                                                <Image
                                                    src={user.photo}
                                                    alt={user.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-white/20">
                                                    <UserMinus size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-white">{user.name}</h4>
                                            <p className="text-xs text-red-400/60">Blocked</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleUnblock(user.matchId, user.name)}
                                        disabled={unblockingId === user.matchId}
                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl text-xs font-semibold transition-all active:scale-95 border border-white/5 hover:border-white/10"
                                    >
                                        {unblockingId === user.matchId ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            "Unblock"
                                        )}
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-zinc-900 border-t border-white/5 text-center">
                    <p className="text-[10px] text-white/20 uppercase tracking-widest font-medium">
                        Privacy & Safety
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}
