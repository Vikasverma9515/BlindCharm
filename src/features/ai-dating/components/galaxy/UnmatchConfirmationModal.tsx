'use client';

import { useState } from 'react';
import { UserMinus, AlertTriangle, Loader2 } from 'lucide-react';

interface UnmatchConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    otherUserName: string;
}

export default function UnmatchConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    otherUserName
}: UnmatchConfirmationModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-3xl p-6 w-full max-w-md border border-white/10">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-orange-500/20 rounded-full mb-4">
                    <UserMinus className="w-6 h-6 text-orange-400" />
                </div>

                <h3 className="text-lg font-semibold text-white text-center mb-2">
                    Unmatch with {otherUserName}?
                </h3>

                <p className="text-sm text-white/60 text-center mb-6">
                    This will end your conversation. You won't see each other's profiles anymore.
                </p>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-6">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-yellow-100">
                            You can always match again in the future if you both swipe right.
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 text-sm font-medium text-white/80 bg-white/10 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Unmatching...
                            </>
                        ) : (
                            'Unmatch'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
