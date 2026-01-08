import React, { useState, useRef, useEffect } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { Mic, Square, Upload, RefreshCw, Play, Pause, Trash2 } from 'lucide-react';
import { uploadVoiceMessage } from '@/lib/voice-upload';
import { toast } from 'sonner';

interface VoiceRecorderProps {
    userId: string;
    onUploadComplete: (url: string) => void;
    initialAudioUrl?: string | null;
    onDelete?: () => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ userId, onUploadComplete, initialAudioUrl, onDelete }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    // ... (useReactMediaRecorder hook remains same)

    const {
        status,
        startRecording,
        stopRecording,
        mediaBlobUrl,
        clearBlobUrl
    } = useReactMediaRecorder({
        audio: true,
        blobPropertyBag: { type: 'audio/webm' }
    });

    const handleStop = () => {
        stopRecording();
    };

    const handleUpload = async () => {
        if (!mediaBlobUrl) return;

        try {
            setIsUploading(true);
            const blob = await fetch(mediaBlobUrl).then(r => r.blob());
            const result = await uploadVoiceMessage(blob, 'profile-intro', userId, 'voice-intros');

            if (result?.path) {
                const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/voice-intros/${result.path}`;
                onUploadComplete(publicUrl);
                toast.success('Voice intro uploaded!');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload voice intro');
        } finally {
            setIsUploading(false);
        }
    };

    const resetRecording = () => {
        clearBlobUrl();
        setRecordedUrl(null);
    };

    // Use initial URL if available and no new recording
    const activeAudioUrl = mediaBlobUrl || initialAudioUrl;
    const showPlayer = !!activeAudioUrl && status !== 'recording';

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            <div className="text-center mb-2">
                <h3 className="text-lg font-semibold text-white">
                    {initialAudioUrl ? 'Your Voice Intro' : 'Record Your Intro'}
                </h3>
                <p className="text-sm text-white/60">
                    {initialAudioUrl ? 'Listen to your current intro or record a new one.' : '15 seconds to say who you really are.'}
                </p>
            </div>

            {status === 'recording' ? (
                <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                        <button
                            onClick={handleStop}
                            className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center hover:scale-105 transition-transform"
                        >
                            <Square size={20} fill="currentColor" className="text-white" />
                        </button>
                    </div>
                    <span className="text-red-400 text-sm font-medium animate-pulse">Recording...</span>
                </div>
            ) : !showPlayer ? (
                <button
                    onClick={startRecording}
                    className="w-16 h-16 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-white/10"
                >
                    <Mic size={24} className="text-black" />
                </button>
            ) : (
                <div className="flex flex-col items-center gap-4 w-full">
                    <audio
                        src={activeAudioUrl}
                        controls
                        className="w-full max-w-xs h-10 rounded-lg"
                        ref={audioRef}
                    />

                    <div className="flex items-center gap-3">
                        {/* Only show Save button if it's a NEW recording (mediaBlobUrl exists) */}
                        {mediaBlobUrl && (
                            <button
                                onClick={handleUpload}
                                disabled={isUploading}
                                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
                            >
                                {isUploading ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
                                {isUploading ? 'Saving...' : 'Save New Intro'}
                            </button>
                        )}

                        <button
                            onClick={() => {
                                resetRecording();
                                startRecording();
                            }}
                            className="px-4 py-2 bg-white/10 rounded-full text-white/80 hover:bg-white/20 hover:text-white transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            <RefreshCw size={14} />
                            {mediaBlobUrl ? 'Discard & Retry' : 'Record New'}
                        </button>

                        {/* Delete button only if we have an initial URL and NOT recording a new one (or allow deleting new draft too?) */}
                        {/* Actually, if initialAudioUrl exists, show delete button to remove it from profile */}
                        {initialAudioUrl && !mediaBlobUrl && onDelete && (
                            <button
                                onClick={onDelete}
                                className="px-4 py-2 bg-red-500/10 rounded-full text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                <Trash2 size={14} />
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoiceRecorder;
