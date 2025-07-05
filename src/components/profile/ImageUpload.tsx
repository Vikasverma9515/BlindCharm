'use client'

import React, { useState, useRef } from 'react'
import { Camera, Upload, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ImageCropper from './ImageCropper'
import { compressImage, createImagePreview, validateImageFile, blobToFile } from '@/lib/imageUtils'

interface ImageUploadProps {
  currentImage?: string | null
  onImageUpload: (file: File) => Promise<void>
  loading?: boolean
  className?: string
}

export default function ImageUpload({ 
  currentImage, 
  onImageUpload, 
  loading = false,
  className = '' 
}: ImageUploadProps) {
  const [showCropper, setShowCropper] = useState(false)
  const [previewSrc, setPreviewSrc] = useState<string>('')
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file')
      return
    }

    try {
      setIsProcessing(true)
      
      // Create preview for cropper
      const preview = await createImagePreview(file)
      setPreviewSrc(preview)
      setOriginalFile(file)
      setShowCropper(true)
    } catch (err) {
      console.error('Error processing file:', err)
      setError('Failed to process image')
    } finally {
      setIsProcessing(false)
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!originalFile) return

    try {
      setIsProcessing(true)
      setShowCropper(false)

      // Convert blob to file
      const fileExt = originalFile.name.split('.').pop() || 'jpg'
      const croppedFile = await blobToFile(croppedBlob, `profile.${fileExt}`)

      // Compress the cropped image
      const compressedFile = await compressImage(croppedFile, {
        maxSizeMB: 0.3, // 300KB max for profile pictures
        maxWidthOrHeight: 400, // 400px max for profile pictures
        quality: 0.8
      })

      // Upload the compressed file
      await onImageUpload(compressedFile)
    } catch (err) {
      console.error('Error processing cropped image:', err)
      setError('Failed to process cropped image')
    } finally {
      setIsProcessing(false)
      setOriginalFile(null)
      setPreviewSrc('')
    }
  }

  const handleCropCancel = () => {
    setShowCropper(false)
    setPreviewSrc('')
    setOriginalFile(null)
    setError('')
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <>
      <div className={`relative ${className}`}>
        {/* Profile Picture Display */}
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-700 shadow-lg">
          {currentImage ? (
            <img
              src={currentImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20">
              <Camera className="w-8 h-8 text-red-400" />
            </div>
          )}
        </div>

        {/* Upload Button */}
        <button
          onClick={triggerFileInput}
          disabled={loading || isProcessing}
          className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200"
        >
          {loading || isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
        </button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={loading || isProcessing}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Processing Status */}
      {isProcessing && (
        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Processing image...
          </p>
        </div>
      )}

      {/* Image Cropper Modal */}
      {showCropper && previewSrc && (
        <ImageCropper
          src={previewSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1} // Square crop for profile pictures
        />
      )}
    </>
  )
}