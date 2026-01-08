'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { reportUserAction } from '@/app/galaxy/actions';
import { toast } from 'sonner';

interface ReportUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportedUserId: string;
    reportedUserName: string;
    onSuccess?: () => void;
}

const REPORT_REASONS = [
    "Inappropriate Photos",
    "Spam or Scams",
    "Harassment or Bullying",
    "Hate Speech",
    "Underage User",
    "Other"
];

export default function ReportUserModal({ isOpen, onClose, reportedUserId, reportedUserName, onSuccess }: ReportUserModalProps) {
    const [selectedReason, setSelectedReason] = useState<string>("");
    const [details, setDetails] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!selectedReason) {
            toast.error("Please select a reason");
            return;
        }

        setIsSubmitting(true);
        try {
            await reportUserAction(reportedUserId, selectedReason, details);
            toast.success("Report submitted. We will review it shortly.");
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit report. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative"
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                                    <AlertTriangle className="text-yellow-500 w-5 h-5" />
                                    Report {reportedUserName}
                                </h2>
                                <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                <p className="text-white/60 text-sm">
                                    Your report is anonymous. We will review this user's profile and take appropriate action.
                                </p>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-white/80">Reason</label>
                                    <div className="grid gap-2">
                                        {REPORT_REASONS.map((reason) => (
                                            <button
                                                key={reason}
                                                onClick={() => setSelectedReason(reason)}
                                                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${selectedReason === reason
                                                    ? 'bg-purple-500/10 border-purple-500 text-purple-400'
                                                    : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
                                                    }`}
                                            >
                                                {reason}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/80">Details (Optional)</label>
                                    <textarea
                                        value={details}
                                        onChange={(e) => setDetails(e.target.value)}
                                        placeholder="Please provide any additional context..."
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 min-h-[100px]"
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 bg-black/20 border-t border-white/10 flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 text-center rounded-full font-medium text-white/60 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !selectedReason}
                                    className="flex-1 py-3 text-center rounded-full font-bold bg-white text-black hover:bg-gray-200 transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        "Submit Report"
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
