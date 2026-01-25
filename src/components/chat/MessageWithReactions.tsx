'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import ReactionPicker from '../chat/ReactionPicker';
import GIFMessage from '../chat/GIFMessage';
import { useMessageReactions } from '@/hooks/useMessageReactions';

interface MessageWithReactionsProps {
    message: any;
    isOwnMessage: boolean;
    currentUserId: string;
    formatTime: (isoString?: string) => string;
}

export default function MessageWithReactions({
    message,
    isOwnMessage,
    currentUserId,
    formatTime,
    showTimestamp = true
}: MessageWithReactionsProps & { showTimestamp?: boolean }) {
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const { reactions, toggleReaction } = useMessageReactions(message.id, currentUserId);

    const handleReactionClick = (emoji: string) => {
        toggleReaction(emoji);
        setShowReactionPicker(false);
    };

    const renderMessageContent = () => {
        switch (message.type) {
            case 'gif':
                return (
                    <GIFMessage
                        src={message.content}
                        isOwnMessage={isOwnMessage}
                    />
                );

            case 'text':
                return (
                    <div
                        className={`px-3 py-2 ${isOwnMessage
                            ? 'bg-gradient-to-br from-purple-600 to-purple-500 text-white rounded-[20px] rounded-tr-md'
                            : 'bg-white/10 text-white rounded-[20px] rounded-tl-md'
                            }`}
                    >
                        <p className="text-[15px] leading-snug break-words">{message.content}</p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div
            className={`relative group max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'}`}
            onDoubleClick={() => setShowReactionPicker(!showReactionPicker)}
        >
            <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                {renderMessageContent()}

                {/* Reactions Display - Commented out for debugging
                {reactions.length > 0 && (
                    <div className="flex gap-1 mt-1 px-1">
                        {reactions.map((reaction) => (
                            <button
                                key={reaction.emoji}
                                onClick={() => toggleReaction(reaction.emoji)}
                                className={`px-2 py-0.5 rounded-full text-sm flex items-center gap-1 transition-all ${reaction.userReacted
                                    ? 'bg-purple-600/30 border border-purple-500/50'
                                    : 'bg-white/10 border border-white/10 hover:bg-white/20'
                                    }`}
                            >
                                <span>{reaction.emoji}</span>
                                <span className="text-xs text-white/60">{reaction.count}</span>
                            </button>
                        ))}

                        <button
                            onClick={() => setShowReactionPicker(!showReactionPicker)}
                            className="px-2 py-0.5 rounded-full text-sm bg-white/10 border border-white/10 hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            +
                        </button>
                    </div>
                )}
                */}

                {/* Reaction Picker Trigger - Commented out for debugging
                {!reactions.length && (
                    <div className={`absolute top-0 h-full flex items-center ${isOwnMessage ? '-left-9' : '-right-9'} opacity-0 group-hover:opacity-100 group-active:opacity-100 group-focus-within:opacity-100 transition-opacity z-10`}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowReactionPicker(!showReactionPicker);
                            }}
                            className="p-1.5 rounded-full bg-zinc-800 border border-white/10 text-white/60 hover:text-white hover:bg-zinc-700 transition shadow-lg"
                            title="Add reaction"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="16"></line>
                                <line x1="8" y1="12" x2="16" y2="12"></line>
                            </svg>
                        </button>
                    </div>
                )}
                */}

                {/* ReactionPicker popup */}
                <div className="relative">
                    <ReactionPicker
                        isOpen={showReactionPicker}
                        onReact={handleReactionClick}
                    />
                </div>

                {/* Timestamp */}
                {showTimestamp && formatTime(message.created_at) && (
                    <span className="text-[10px] text-white/30 mt-1 px-1 font-medium block w-full text-right">
                        {formatTime(message.created_at)}
                    </span>
                )}
            </div>
        </div>
    );
}
