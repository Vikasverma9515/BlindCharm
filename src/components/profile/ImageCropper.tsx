'use client'

import React, { useState, useRef, useCallback } from 'react'
import ReactCrop, { 
  Crop, 
  PixelCrop, 
  centerCrop, 
  makeAspectCrop,
  convertToPixelCrop 
} from 'react-image-crop'
import { canvasPreview } from '@/lib/canvasPreview'
import { Button } from '@/components/ui/button'
import { X, Check, RotateCw, ZoomIn, ZoomOut } from 'lucide-react'
import 'react-image-crop/dist/ReactCrop.css'

interface ImageCropperProps {
  src: string
  onCropComplete: (croppedImageBlob: Blob) => void
  onCancel: () => void
  aspectRatio?: number
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export default function ImageCropper({ 
  src, 
  onCropComplete, 
  onCancel, 
  aspectRatio = 1 
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const imgRef = useRef<HTMLImageElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspectRatio) {
      const { width, height } = e.currentTarget
      setCrop(centerAspectCrop(width, height, aspectRatio))
    }
  }

  const handleCropComplete = useCallback(async () => {
    if (
      completedCrop?.width &&
      completedCrop?.height &&
      imgRef.current &&
      previewCanvasRef.current
    ) {
      setIsProcessing(true)
      try {
        // Generate canvas preview
        canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop,
          scale,
          rotate,
        )

        // Convert canvas to blob
        previewCanvasRef.current.toBlob((blob) => {
          if (blob) {
            onCropComplete(blob)
          }
        }, 'image/jpeg', 0.85) // 85% quality for good balance
      } catch (error) {
        console.error('Error processing crop:', error)
      } finally {
        setIsProcessing(false)
      }
    }
  }, [completedCrop, scale, rotate, onCropComplete])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Crop Your Profile Picture
          </h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="flex-1 p-4 overflow-auto min-h-0">
          <div className="flex justify-center items-center h-full">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              minWidth={100}
              minHeight={100}
              circularCrop={aspectRatio === 1}
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={src}
                style={{ 
                  transform: `scale(${scale}) rotate(${rotate}deg)`,
                  maxHeight: '60vh',
                  maxWidth: '100%'
                }}
                onLoad={onImageLoad}
                className="max-w-full h-auto"
              />
            </ReactCrop>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          {/* Mobile-first responsive layout */}
          <div className="space-y-4">
            {/* Controls Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center justify-center sm:justify-start gap-4">
                {/* Scale Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    disabled={scale <= 0.5}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
                    {Math.round(scale * 100)}%
                  </span>
                  <button
                    onClick={() => setScale(Math.min(3, scale + 0.1))}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    disabled={scale >= 3}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>

                {/* Rotate Control */}
                <button
                  onClick={() => setRotate((rotate + 90) % 360)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center sm:justify-end">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={isProcessing}
                  className="min-w-[80px]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCropComplete}
                  disabled={!completedCrop?.width || !completedCrop?.height || isProcessing}
                  className="bg-red-500 hover:bg-red-600 text-white min-w-[120px]"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Apply Crop
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Preview Instructions */}
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Drag to reposition • Use zoom controls to resize • Click rotate to adjust angle
            </p>
          </div>
        </div>

        {/* Hidden canvas for processing */}
        <canvas
          ref={previewCanvasRef}
          style={{
            display: 'none',
          }}
        />
      </div>
    </div>
  )
}