'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    MessageCircle,
    Bug,
    Lightbulb,
    AlertTriangle,
    HelpCircle,
    CheckCircle,
    Loader2,
    Mail,
    X,
    MessageSquare
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface GalaxyContactSupportProps {
    isOpen: boolean;
    onClose: () => void;
    defaultType?: string;
}

const messageTypes = [
    {
        id: 'bug_report',
        label: 'Bug Report',
        icon: Bug,
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20'
    },
    {
        id: 'feature_request',
        label: 'Feature Request',
        icon: Lightbulb,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/20'
    },
    {
        id: 'feedback',
        label: 'Feedback',
        icon: MessageCircle,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20'
    },
    {
        id: 'complaint',
        label: 'Complaint',
        icon: AlertTriangle,
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20'
    },
    {
        id: 'question',
        label: 'Help / Question',
        icon: HelpCircle,
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/20'
    },
    {
        id: 'other',
        label: 'Other',
        icon: MessageSquare,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/20'
    },
];

export default function GalaxyContactSupport({ isOpen, onClose, defaultType = 'feedback' }: GalaxyContactSupportProps) {
    const { data: session } = useSession();
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        messageType: defaultType,
        subject: '',
        message: '',
        name: session?.user?.name || '',
        email: session?.user?.email || '',
    });

    const selectedType = messageTypes.find(t => t.id === formData.messageType);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (result.success) {
                setStep('success');
                // Auto close after 2.5s
                setTimeout(() => {
                    onClose();
                    // Reset after close animation
                    setTimeout(() => {
                        setStep('form');
                        setFormData({
                            messageType: 'feedback', // reset to default
                            subject: '',
                            message: '',
                            name: session?.user?.name || '',
                            email: session?.user?.email || '',
                        });
                    }, 300);
                }, 2500);
            } else {
                toast.error(result.error || 'Something went wrong');
            }
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-zinc-900 border border-white/10 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-[32px] shadow-2xl relative scrollbar-hide"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-zinc-900/90 backdrop-blur-md p-6 border-b border-white/5 flex items-center justify-between z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                        <Mail className="text-white" size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Contact Support</h2>
                                        <p className="text-xs text-white/50">We're here to help.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-6">
                                <AnimatePresence mode="wait">
                                    {step === 'form' ? (
                                        <motion.form
                                            key="form"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            onSubmit={handleSubmit}
                                            className="space-y-6"
                                        >
                                            {/* Type Selection */}
                                            <div className="grid grid-cols-2 gap-3">
                                                {messageTypes.map((type) => {
                                                    const Icon = type.icon;
                                                    const isSelected = formData.messageType === type.id;
                                                    return (
                                                        <button
                                                            key={type.id}
                                                            type="button"
                                                            onClick={() => handleInputChange('messageType', type.id)}
                                                            className={`p-3 rounded-xl border text-left flex flex-col gap-2 transition-all ${isSelected
                                                                ? `${type.bgColor} ${type.borderColor} ${type.color}`
                                                                : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'
                                                                }`}
                                                        >
                                                            <Icon size={20} />
                                                            <span className="text-xs font-bold">{type.label}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Subject & Message */}
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider ml-1">Subject</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.subject}
                                                        onChange={e => handleInputChange('subject', e.target.value)}
                                                        placeholder="Brief summary..."
                                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider ml-1">Message</label>
                                                    <textarea
                                                        required
                                                        rows={5}
                                                        value={formData.message}
                                                        onChange={e => handleInputChange('message', e.target.value)}
                                                        placeholder="Tell us more details..."
                                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors resize-none"
                                                    />
                                                    <div className="flex justify-end">
                                                        <span className="text-[10px] text-white/30">{formData.message.length}/1000</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Info (Auto-filled but visible) */}
                                            {!session?.user && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <input
                                                        type="text"
                                                        placeholder="Your Name"
                                                        required
                                                        value={formData.name}
                                                        onChange={e => handleInputChange('name', e.target.value)}
                                                        className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                                                    />
                                                    <input
                                                        type="email"
                                                        placeholder="Email Address"
                                                        required
                                                        value={formData.email}
                                                        onChange={e => handleInputChange('email', e.target.value)}
                                                        className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                                                    />
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="animate-spin" size={18} />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send size={18} />
                                                        Send Message
                                                    </>
                                                )}
                                            </button>
                                        </motion.form>
                                    ) : (
                                        <motion.div
                                            key="success"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex flex-col items-center text-center py-10"
                                        >
                                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                                                <CheckCircle className="text-green-500" size={40} />
                                            </div>
                                            <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                                            <p className="text-white/60 mb-6 max-w-xs">
                                                Thanks for reaching out. We'll check it and get back to you at <span className="text-white">{formData.email}</span> soon.
                                            </p>
                                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: "100%" }}
                                                    animate={{ width: "0%" }}
                                                    transition={{ duration: 2.5, ease: "linear" }}
                                                    className="h-full bg-white"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
