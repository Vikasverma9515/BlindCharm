'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Loader2, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import ImageCropper from '@/components/shared/ImageCropper';

interface PhotoGridProps {
    photos: string[];
    onChange: (photos: string[]) => void;
}

export default function PhotoGrid({ photos, onChange }: PhotoGridProps) {
    const [uploading, setUploading] = useState(false);
    const [croppingImage, setCroppingImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleRemove = (index: number) => {
        const newPhotos = [...photos];
        newPhotos.splice(index, 1);
        onChange(newPhotos);
    };

    const handleMakeMain = (index: number) => {
        if (index === 0) return; // Already main
        const newPhotos = [...photos];
        const [selectedPhoto] = newPhotos.splice(index, 1);
        newPhotos.unshift(selectedPhoto); // Move to front
        onChange(newPhotos);
        toast.success('Main photo updated!');
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setCroppingImage(reader.result as string);
        });
        reader.readAsDataURL(file);

        // Reset input so same file can be selected again if needed
        e.target.value = '';
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        setUploading(true);
        setCroppingImage(null); // Close cropper

        try {
            const fileName = `${Math.random().toString(36).substring(2)}.jpg`;
            const filePath = `galaxy-photos/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('profile-pictures')
                .upload(filePath, croppedBlob, {
                    contentType: 'image/jpeg'
                });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('profile-pictures')
                .getPublicUrl(filePath);

            onChange([...photos, data.publicUrl]);
            toast.success('Photo uploaded!');
        } catch (error) {
            console.error('Error uploading photo:', error);
            toast.error('Failed to upload photo');
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            {croppingImage && (
                <ImageCropper
                    imageSrc={croppingImage}
                    aspect={3 / 4} // Matches the vertical card aspect ratio
                    onCancel={() => setCroppingImage(null)}
                    onCropComplete={handleCropComplete}
                />
            )}

            <div className="grid grid-cols-3 gap-3">
                {photos.map((photo, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-900 border border-white/10"
                    >
                        <img src={photo} alt={`Profile ${index + 1}`} className="w-full h-full object-cover" />

                        {/* Main Photo Badge */}
                        {index === 0 && (
                            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase tracking-wider border border-white/20 flex items-center gap-1">
                                <Star size={10} fill="currentColor" />
                                Main
                            </div>
                        )}

                        {/* Action Buttons - Always Visible */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
                            {/* Delete Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(index);
                                }}
                                className="p-1.5 bg-black/60 hover:bg-red-500/80 rounded-full text-white transition-colors backdrop-blur-sm"
                                aria-label="Delete photo"
                            >
                                <X size={14} />
                            </button>

                            {/* Make Main Button - Only show for non-main photos */}
                            {index !== 0 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleMakeMain(index);
                                    }}
                                    className="p-1.5 bg-black/60 hover:bg-yellow-500/80 rounded-full text-white transition-colors backdrop-blur-sm"
                                    aria-label="Make main photo"
                                >
                                    <Star size={14} />
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}

                {photos.length < 6 && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="aspect-[3/4] rounded-xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center text-white/30 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all disabled:opacity-50 group"
                    >
                        {uploading ? (
                            <Loader2 size={24} className="animate-spin mb-2 text-pink-500" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:bg-white/10 transition-colors">
                                <Plus size={20} />
                            </div>
                        )}
                        <span className="text-xs font-medium">{uploading ? 'Uploading...' : 'Add Photo'}</span>
                    </motion.button>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                />
            </div>
        </>
    );
}
