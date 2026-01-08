'use client';

import { useState, useEffect } from 'react';
import { getAdminUsersAction, toggleUserBanAction, toggleUserVerificationAction, toggleUserPauseAction } from '@/app/galaxy/actions';
import { Search, Ban, Check, Shield, User, Loader2, X, Calendar, Mail, AlertTriangle, Eye, PauseCircle, PlayCircle, MapPin, Briefcase, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminUser {
    id: string;
    full_name: string;
    email: string;
    profile_picture: string;
    is_banned: boolean;
    face_verified: boolean;
    created_at: string;
    profile?: {
        photos?: string[];
        about_me?: string;
        location?: string;
        job_title?: string;
        company?: string;
        school?: string;
        is_paused?: boolean;
        prompts?: any[];
        identity_signals?: string[];
        gender?: string;
        height?: string;
        pronouns?: string;
    };
}

export default function UserTable() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [showFullProfile, setShowFullProfile] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getAdminUsersAction(search);
            setUsers(data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(fetchUsers, 500);
        return () => clearTimeout(timeout);
    }, [search]);

    const handleBan = async (user: AdminUser) => {
        try {
            setActionLoading(true);
            await toggleUserBanAction(user.id, !user.is_banned);
            toast.success(user.is_banned ? "User unbanned" : "User banned");
            updateLocalUser(user.id, { is_banned: !user.is_banned });
        } catch (error) {
            toast.error("Action failed");
        } finally {
            setActionLoading(false);
        }
    };

    const handleVerify = async (user: AdminUser) => {
        try {
            setActionLoading(true);
            await toggleUserVerificationAction(user.id, !user.face_verified);
            toast.success(user.face_verified ? "Verification removed" : "User verified");
            updateLocalUser(user.id, { face_verified: !user.face_verified });
        } catch (error) {
            toast.error("Action failed");
        } finally {
            setActionLoading(false);
        }
    };

    const handlePause = async (user: AdminUser) => {
        try {
            setActionLoading(true);
            const isPaused = user.profile?.is_paused || false;
            await toggleUserPauseAction(user.id, !isPaused);
            toast.success(isPaused ? "User unpaused" : "User paused");

            // Deep update for nested profile object
            setUsers(prev => prev.map(u => {
                if (u.id === user.id) {
                    return { ...u, profile: { ...u.profile, is_paused: !isPaused } };
                }
                return u;
            }));

            if (selectedUser?.id === user.id && selectedUser.profile) {
                setSelectedUser({
                    ...selectedUser,
                    profile: { ...selectedUser.profile, is_paused: !isPaused }
                });
            }

        } catch (error) {
            toast.error("Action failed");
        } finally {
            setActionLoading(false);
        }
    };

    const updateLocalUser = (id: string, updates: Partial<AdminUser>) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
        if (selectedUser?.id === id) {
            setSelectedUser({ ...selectedUser, ...updates });
        }
    };

    return (
        <div className="space-y-6 pb-20 relative">
            {/* Search - Sticky Header */}
            <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl py-4 -mx-4 px-4 border-b border-white/5">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-white/20 transition-colors"
                    />
                </div>
            </div>

            {/* List View */}
            <div className="space-y-2">
                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="animate-spin text-white/50" /></div>
                ) : users.length === 0 ? (
                    <div className="text-center py-12 text-white/40">No users found</div>
                ) : (
                    users.map(user => (
                        <div
                            key={user.id}
                            onClick={() => { setSelectedUser(user); setShowFullProfile(false); }}
                            className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl cursor-pointer transition-colors active:scale-[0.98]"
                        >
                            <div className="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden relative shrink-0">
                                {user.profile_picture ? (
                                    <Image src={user.profile_picture} alt="" fill className="object-cover" />
                                ) : <div className="w-full h-full flex items-center justify-center text-white/20"><User size={20} /></div>}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-white truncate">{user.full_name}</h3>
                                    {user.face_verified && <Check size={14} className="text-blue-400 shrink-0" strokeWidth={4} />}
                                    {user.profile?.is_paused && <PauseCircle size={14} className="text-amber-400 shrink-0" />}
                                </div>
                                <p className="text-sm text-white/40 truncate">{user.email}</p>
                            </div>

                            <div>
                                {user.is_banned ? (
                                    <span className="bg-red-500/10 text-red-500 text-xs px-3 py-1 rounded-full font-medium border border-red-500/20">Banned</span>
                                ) : (
                                    <span className="bg-green-500/10 text-green-500 text-xs px-3 py-1 rounded-full font-medium border border-green-500/20">Active</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Expanded User Details Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedUser(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-zinc-900/50 backdrop-blur z-20">
                                <h2 className="text-xl font-bold">Manage User</h2>
                                <button onClick={() => setSelectedUser(null)} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="overflow-y-auto p-6 space-y-8 flex-1">
                                {!showFullProfile ? (
                                    // MODE 1: Quick Actions & Overview
                                    <>
                                        <div className="flex flex-col items-center text-center">
                                            <div className="w-24 h-24 rounded-full bg-zinc-800 overflow-hidden relative mb-4 border-4 border-zinc-800 shadow-xl">
                                                {selectedUser.profile_picture ? (
                                                    <Image src={selectedUser.profile_picture} alt="" fill className="object-cover" />
                                                ) : <div className="w-full h-full flex items-center justify-center text-white/20"><User size={32} /></div>}
                                            </div>
                                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                                {selectedUser.full_name}
                                                {selectedUser.face_verified && <Check size={20} className="text-blue-400" strokeWidth={4} />}
                                            </h2>
                                            <p className="text-white/40 flex items-center gap-2 text-sm mt-1 mb-6">
                                                <Mail size={12} /> {selectedUser.email}
                                            </p>

                                            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                                                <div className={`p-3 rounded-2xl border text-center ${selectedUser.face_verified ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-white/5 border-white/5 text-white/40'}`}>
                                                    <Shield className="mx-auto mb-1" size={20} />
                                                    <p className="text-xs font-medium">{selectedUser.face_verified ? 'Verified' : 'Unverified'}</p>
                                                </div>
                                                <div className={`p-3 rounded-2xl border text-center ${selectedUser.is_banned ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                                                    <AlertTriangle className="mx-auto mb-1" size={20} />
                                                    <p className="text-xs font-medium">{selectedUser.is_banned ? 'Banned' : 'Active'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h3 className="text-xs font-bold text-white/30 uppercase tracking-wider mb-2">Controls</h3>

                                            <div className="grid grid-cols-1 gap-3">
                                                <button
                                                    onClick={() => setShowFullProfile(true)}
                                                    className="w-full py-4 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 font-medium transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Eye size={18} /> View Full Profile
                                                </button>

                                                <button
                                                    onClick={() => handlePause(selectedUser)}
                                                    disabled={actionLoading}
                                                    className={`w-full py-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 border
                                                        ${selectedUser.profile?.is_paused
                                                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                                                            : 'bg-white/5 border-white/5 text-white hover:bg-white/10'}`}
                                                >
                                                    {actionLoading ? <Loader2 className="animate-spin" /> : (selectedUser.profile?.is_paused ? <PlayCircle size={18} /> : <PauseCircle size={18} />)}
                                                    {selectedUser.profile?.is_paused ? 'Unpause User' : 'Force Pause User'}
                                                </button>

                                                <button
                                                    onClick={() => handleVerify(selectedUser)}
                                                    disabled={actionLoading}
                                                    className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 font-medium transition-colors flex items-center justify-center gap-2"
                                                >
                                                    {actionLoading ? <Loader2 className="animate-spin" /> : <Shield size={18} />}
                                                    {selectedUser.face_verified ? 'Remove Verification' : 'Verify Identity'}
                                                </button>

                                                <button
                                                    onClick={() => handleBan(selectedUser)}
                                                    disabled={actionLoading}
                                                    className={`w-full py-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 border
                                                        ${selectedUser.is_banned
                                                            ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                                                            : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'}`}
                                                >
                                                    {actionLoading ? <Loader2 className="animate-spin" /> : <Ban size={18} />}
                                                    {selectedUser.is_banned ? 'Unban User' : 'Ban User'}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    // MODE 2: Full Profile Inspector
                                    <div className="space-y-8">
                                        <button
                                            onClick={() => setShowFullProfile(false)}
                                            className="text-sm text-white/50 hover:text-white flex items-center gap-2"
                                        >
                                            ← Back to Actions
                                        </button>

                                        {/* Photos Grid */}
                                        {selectedUser.profile?.photos && selectedUser.profile.photos.length > 0 ? (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                {selectedUser.profile.photos.map((photo, i) => (
                                                    <div key={i} className="aspect-[3/4] relative rounded-lg overflow-hidden bg-zinc-800">
                                                        <Image src={photo} alt="" fill className="object-cover" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center bg-white/5 rounded-2xl text-white/30">No photos available</div>
                                        )}

                                        {/* Bio & Details */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-bold">About {selectedUser.full_name.split(' ')[0]}</h3>

                                            {selectedUser.profile?.about_me && (
                                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                                    <p className="text-white/80 italic">"{selectedUser.profile.about_me}"</p>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                {selectedUser.profile?.location && (
                                                    <div className="flex items-center gap-2 text-white/60">
                                                        <MapPin size={16} /> {selectedUser.profile.location}
                                                    </div>
                                                )}
                                                {selectedUser.profile?.job_title && (
                                                    <div className="flex items-center gap-2 text-white/60">
                                                        <Briefcase size={16} /> {selectedUser.profile.job_title} {selectedUser.profile.company && `at ${selectedUser.profile.company}`}
                                                    </div>
                                                )}
                                                {selectedUser.profile?.school && (
                                                    <div className="flex items-center gap-2 text-white/60">
                                                        <GraduationCap size={16} /> {selectedUser.profile.school}
                                                    </div>
                                                )}
                                                {selectedUser.profile?.height && (
                                                    <div className="flex items-center gap-2 text-white/60">
                                                        <span>📏</span> {selectedUser.profile.height}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Prompts */}
                                            {selectedUser.profile?.prompts && selectedUser.profile.prompts.length > 0 && (
                                                <div className="space-y-3 mt-4">
                                                    {selectedUser.profile.prompts.map((p, i) => (
                                                        <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5">
                                                            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">{p.question}</p>
                                                            <p className="text-white font-medium">{p.answer}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-xs text-white/20 pt-8 border-t border-white/5">
                                            User ID: {selectedUser.id} <br />
                                            Created: {new Date(selectedUser.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
