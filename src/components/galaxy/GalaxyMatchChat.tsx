'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Send, Loader2, ChevronLeft, MoreVertical, Mic, X, UserMinus, UserX, MessageCircle, Flag, Shield } from 'lucide-react'
import { useGalaxyChat } from '@/hooks/useGalaxyChat'
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'
import { uploadVoiceMessage, getVoiceMessageUrl } from '@/lib/voice-upload'
import VoiceMessageBubble from './VoiceMessageBubble'
import MatchProfileView from './MatchProfileView'
import UnmatchConfirmationModal from './UnmatchConfirmationModal'
import BlockConfirmationModal from './BlockConfirmationModal'
import ReportUserModal from './ReportUserModal'
import { unmatchAction, blockMatchAction } from '@/app/galaxy/actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface GalaxyMatchChatProps {
    matchId: string;
    currentUserId: string;
    otherUserId: string;
}

export default function GalaxyMatchChat({ matchId, currentUserId, otherUserId }: GalaxyMatchChatProps) {
    const router = useRouter()
    const [newMessage, setNewMessage] = useState('')
    const [otherUser, setOtherUser] = useState<any>(null)
    const [otherUserFullProfile, setOtherUserFullProfile] = useState<any>(null)
    const [mounted, setMounted] = useState(false)
    const [isRecordingVoice, setIsRecordingVoice] = useState(false)
    const [recordingDuration, setRecordingDuration] = useState(0)
    const [showProfileDrawer, setShowProfileDrawer] = useState(false)
    const [showMenu, setShowMenu] = useState(false)
    const [showUnmatchModal, setShowUnmatchModal] = useState(false)
    const [showBlockModal, setShowBlockModal] = useState(false)
    const [showReportModal, setShowReportModal] = useState(false)
    const [isReported, setIsReported] = useState(false)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const messagesContainerRef = useRef<HTMLDivElement>(null)
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => { setMounted(true) }, [])

    const {
        messages,
        loading,
        error,
        sendMessage: sendChatMessage,
        sendVoiceMessage: sendVoice
    } = useGalaxyChat({
        matchId,
        userId: currentUserId,
        otherUserId,
        enabled: !!matchId && !!currentUserId
    });

    const { isRecording, isProcessing, startRecording, stopRecording, cancelRecording } = useVoiceRecorder();

    useEffect(() => {
        const fetchMatchCtx = async () => {
            // Fetch profile
            const { data: profile } = await supabase
                .from('galaxy_profiles')
                .select('*')
                .eq('user_id', otherUserId)
                .single();

            if (profile) {
                setOtherUser({
                    username: profile.full_name,
                    profile_picture: profile.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=500&fit=crop'
                });
                setOtherUserFullProfile(profile);
            }

            // Check report status
            const { data: report } = await supabase
                .from('galaxy_reports')
                .select('id')
                .eq('reporter_id', currentUserId)
                .eq('reported_id', otherUserId)
                .maybeSingle();

            if (report) setIsReported(true);
        };
        fetchMatchCtx();
    }, [matchId, otherUserId, currentUserId]);

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [messages.length]);

    // Mark messages as read when chat is opened
    useEffect(() => {
        if (!matchId || !currentUserId) return;

        const markAsRead = async () => {
            try {
                await supabase.rpc('mark_messages_read', {
                    match_id_param: matchId,
                    user_id_param: currentUserId
                });
            } catch (err) {
                console.error('Failed to mark messages as read:', err);
            }
        };

        const timeout = setTimeout(markAsRead, 1000);
        return () => clearTimeout(timeout);
    }, [matchId, currentUserId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || loading) return;

        try {
            await sendChatMessage(newMessage.trim());
            setNewMessage('');
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    const handleStartVoiceRecording = async () => {
        try {
            await startRecording();
            setIsRecordingVoice(true);
            setRecordingDuration(0);

            recordingIntervalRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);

            setTimeout(() => {
                if (isRecording) {
                    handleSendVoice();
                }
            }, 60000);
        } catch (error) {
            console.error('Failed to start recording:', error);
            alert('Failed to access microphone. Please check permissions.');
        }
    };

    const handleSendVoice = async () => {
        if (!isRecording) return;

        try {
            const { blob, duration } = await stopRecording();

            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
                recordingIntervalRef.current = null;
            }

            setIsRecordingVoice(false);
            setRecordingDuration(0);

            const { path } = await uploadVoiceMessage(blob, matchId, currentUserId);
            const audioUrl = getVoiceMessageUrl(path);

            await sendVoice(audioUrl, duration);
        } catch (error) {
            console.error('Failed to send voice message:', error);
            handleCancelVoice();
        }
    };

    const handleCancelVoice = () => {
        cancelRecording();
        setIsRecordingVoice(false);
        setRecordingDuration(0);

        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
        }
    };

    // Block and Unmatch handlers
    const handleUnmatch = async () => {
        await unmatchAction(matchId);
        router.push('/galaxy/chat');
        router.refresh();
    };

    const handleBlock = async () => {
        await blockMatchAction(matchId);
        router.push('/galaxy/chat');
        router.refresh();
    };

    const formatTime = (isoString?: string) => {
        if (!isoString || !mounted) return '';
        try {
            return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        } catch {
            return '';
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">

            {/* Header - Clean, no status indicators */}
            <div className="shrink-0 h-16 bg-black border-b border-white/10 flex items-center justify-between px-4 pt-safe">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Link
                        href="/galaxy/chat"
                        className="p-2 -ml-2 text-white hover:text-purple-400 transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Link>

                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div onClick={() => setShowProfileDrawer(true)} className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-purple-500/40 shrink-0 cursor-pointer hover:ring-purple-500/60 transition-all active:scale-95">
                            {otherUser?.profile_picture ? (
                                <Image
                                    src={otherUser.profile_picture}
                                    alt={otherUser.username || 'User'}
                                    width={40}
                                    height={40}
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 animate-pulse" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h2 className="text-base font-semibold text-white truncate flex items-center gap-2">
                                {otherUser?.username || 'Loading...'}
                                {isReported && (
                                    <span className="px-1.5 py-0.5 rounded bg-red-500/20 border border-red-500/30 text-[10px] font-bold text-red-400 uppercase tracking-wide">
                                        Reported
                                    </span>
                                )}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 text-white/60 hover:text-white transition-colors"
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>

                    {showMenu && (
                        <>
                            {/* Backdrop */}
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowMenu(false)}
                            />

                            {/* Menu */}
                            <div className="absolute top-full right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-xl z-50">
                                <button
                                    onClick={() => {
                                        setShowMenu(false);
                                        setShowReportModal(true);
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/5 flex items-center gap-3 transition-colors"
                                >
                                    <Flag className="w-4 h-4" />
                                    Report
                                </button>
                                <button
                                    onClick={() => {
                                        setShowMenu(false);
                                        setShowUnmatchModal(true);
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/5 flex items-center gap-3 transition-colors"
                                >
                                    <UserMinus className="w-4 h-4" />
                                    Unmatch
                                </button>
                                <button
                                    onClick={() => {
                                        setShowMenu(false);
                                        setShowBlockModal(true);
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                                >
                                    <UserX className="w-4 h-4" />
                                    Block
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Reported Warning Banner */}
            {isReported && (
                <div className="bg-red-900/10 border-b border-red-500/10 backdrop-blur-sm px-4 py-2 flex items-center justify-center gap-2">
                    <Shield className="w-3 h-3 text-red-400" />
                    <span className="text-xs font-medium text-red-300/80">
                        Be careful, you've reported this profile.
                    </span>
                </div>
            )}

            {/* Messages Area */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto overscroll-contain chat-scrollbar"
                style={{
                    WebkitOverflowScrolling: 'touch',
                }}
            >
                <div className="min-h-full flex flex-col justify-end px-4 py-4">
                    {loading && messages.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pb-20">
                            <div className="relative w-32 h-24 mb-4 mx-auto flex items-center justify-center">
                                {/* Avatar 1 - Left */}
                                <div className="absolute left-4 w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-900 shadow-xl z-0 transform -rotate-6 bg-zinc-800">
                                    <Image
                                        src="/HeroAvatar/a2.svg"
                                        alt="Avatar 1"
                                        width={64}
                                        height={64}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {/* Avatar 2 - Right */}
                                <div className="absolute right-4 w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-900 shadow-xl z-10 transform rotate-6 translate-y-2 bg-zinc-800">
                                    <Image
                                        src="/HeroAvatar/a5.svg"
                                        alt="Avatar 2"
                                        width={64}
                                        height={64}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <h3 className="text-xl font-medium text-white mb-2">
                                It's a Match!
                            </h3>
                            <p className="text-white/40 text-sm max-w-[240px]">
                                Start your conversation and see where it goes.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3 pt-2">
                            {messages.map((message, i) => {
                                const isOwnMessage = message.sender_id === currentUserId;

                                return (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                        key={message.id || i}
                                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[75%] flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                                            {message.type === 'voice' ? (
                                                <VoiceMessageBubble
                                                    audioUrl={message.content}
                                                    duration={message.metadata?.duration || 0}
                                                    isOwnMessage={isOwnMessage}
                                                />
                                            ) : (
                                                <div
                                                    className={`px-4 py-3 ${isOwnMessage
                                                        ? 'bg-gradient-to-br from-purple-600 to-purple-500 text-white rounded-[20px] rounded-tr-md'
                                                        : 'bg-white/10 text-white rounded-[20px] rounded-tl-md'
                                                        }`}
                                                >
                                                    <p className="text-[15px] leading-snug break-words">{message.content}</p>
                                                </div>
                                            )}

                                            {formatTime(message.created_at) && (
                                                <span className="text-[11px] text-white/30 mt-1.5 px-3 font-medium">
                                                    {formatTime(message.created_at)}
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                            <div ref={messagesEndRef} className="h-1" />
                        </div>
                    )}
                </div>
            </div>

            {/* Input Area - With Voice Recording */}
            <div className="shrink-0 bg-black border-t border-white/10 px-4 py-3 mb-4">
                {isRecordingVoice || isProcessing ? (
                    <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-3 bg-white/10 rounded-full px-4 py-3">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-2.5 h-2.5 bg-red-500 rounded-full"
                            />
                            <span className="text-white text-sm font-medium">
                                {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={handleCancelVoice}
                            className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all active:scale-95"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>

                        <button
                            type="button"
                            onClick={handleSendVoice}
                            disabled={isProcessing}
                            className="w-11 h-11 rounded-full flex items-center justify-center transition-all bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/25"
                        >
                            {isProcessing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" style={{ transform: 'translateX(1px)' }} />
                            )}
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <div className="flex-1 bg-white/10 rounded-full flex items-center px-5 py-2.5 border border-white/10 focus-within:border-purple-500/50 focus-within:bg-white/[0.15] transition-all">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Message..."
                                className="flex-1 bg-transparent text-white placeholder:text-white/40 text-[15px] focus:outline-none"
                                disabled={loading}
                                autoComplete="off"
                            />
                        </div>

                        {newMessage.trim() ? (
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-11 h-11 rounded-full flex items-center justify-center transition-all bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/25"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" style={{ transform: 'translateX(1px)' }} />
                                )}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleStartVoiceRecording}
                                className="w-11 h-11 rounded-full flex items-center justify-center transition-all bg-white/10 hover:bg-purple-600 text-white hover:scale-105 active:scale-95"
                            >
                                <Mic className="w-5 h-5" />
                            </button>
                        )}
                    </form>
                )}
            </div>

            {/* Profile View */}
            <MatchProfileView
                isOpen={showProfileDrawer}
                onClose={() => setShowProfileDrawer(false)}
                profile={otherUserFullProfile}
            />

            {/* Confirmation Modals */}
            <UnmatchConfirmationModal
                isOpen={showUnmatchModal}
                onClose={() => setShowUnmatchModal(false)}
                onConfirm={handleUnmatch}
                otherUserName={otherUser?.username || 'User'}
            />

            <BlockConfirmationModal
                isOpen={showBlockModal}
                onClose={() => setShowBlockModal(false)}
                onConfirm={handleBlock}
                otherUserName={otherUser?.username || 'User'}
            />

            <ReportUserModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                reportedUserId={otherUserId}
                reportedUserName={otherUser?.username || 'User'}
                onSuccess={() => setIsReported(true)}
            />
        </div>
    );
}
