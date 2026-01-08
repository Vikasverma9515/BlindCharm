'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
// using native range input instead of Slider component
import { Check, X, ZoomIn } from 'lucide-react';
import getCroppedImg from '@/utils/cropImage';

interface ImageCropperProps {
    imageSrc: string;
    aspect: number;
    onCancel: () => void;
    onCropComplete: (croppedBlob: Blob) => void;
}

export default function ImageCropper({ imageSrc, aspect, onCancel, onCropComplete }: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onCropCompleteCallback = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (!croppedAreaPixels) return;
        setLoading(true);
        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (croppedBlob) {
                onCropComplete(croppedBlob);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-md h-[60vh] bg-gray-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspect}
                    onCropChange={onCropChange}
                    onCropComplete={onCropCompleteCallback}
                    onZoomChange={onZoomChange}
                    classes={{
                        containerClassName: "bg-gray-900",
                        mediaClassName: "",
                        cropAreaClassName: "border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]"
                    }}
                />
            </div>

            <div className="w-full max-w-md mt-6 space-y-6">
                <div className="flex items-center gap-4 px-4">
                    <ZoomIn size={20} className="text-white/50" />
                    <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                </div>

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={onCancel}
                        className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center gap-2"
                    >
                        <X size={18} /> Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-8 py-3 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <Check size={18} /> Apply Crop
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
