import imageCompression from 'browser-image-compression'

export interface CompressionOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  useWebWorker?: boolean
  quality?: number
}

export async function compressImage(
  file: File, 
  options: CompressionOptions = {}
): Promise<File> {
  const defaultOptions = {
    maxSizeMB: 0.5, // 500KB max
    maxWidthOrHeight: 800, // Max dimension 800px
    useWebWorker: true,
    quality: 0.85, // 85% quality
    ...options
  }

  try {
    const compressedFile = await imageCompression(file, defaultOptions)
    
    // Log compression results
    console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB')
    console.log('Compressed file size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB')
    console.log('Compression ratio:', ((1 - compressedFile.size / file.size) * 100).toFixed(1), '%')
    
    return compressedFile
  } catch (error) {
    console.error('Error compressing image:', error)
    throw new Error('Failed to compress image')
  }
}

export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string)
      } else {
        reject(new Error('Failed to read file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please select a valid image file (JPEG, PNG, or WebP)'
    }
  }

  // Check file size (max 10MB before compression)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Image file is too large. Please select an image smaller than 10MB'
    }
  }

  return { isValid: true }
}

export async function blobToFile(blob: Blob, fileName: string): Promise<File> {
  return new File([blob], fileName, {
    type: blob.type,
    lastModified: Date.now(),
  })
}