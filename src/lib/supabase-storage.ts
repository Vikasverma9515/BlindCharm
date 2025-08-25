// lib/supabase-storage.ts
// Upload voice messages using Firebase Storage if Firebase user is present,
// otherwise fall back to Supabase Storage when Supabase user session exists.
// This preserves the original function signatures used across the app.

import { supabase } from './supabase'
import { auth } from './firebase'
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { onAuthStateChanged } from 'firebase/auth'

// Wait briefly for Firebase auth to initialize if needed
async function waitForFirebaseUser(timeoutMs = 2000) {
  const existing = auth.currentUser
  if (existing) return existing

  return new Promise((resolve) => {
    let settled = false
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!settled) {
        settled = true
        unsub()
        resolve(user)
      }
    })
    setTimeout(() => {
      if (!settled) {
        settled = true
        unsub()
        resolve(null)
      }
    }, timeoutMs)
  })
}

export async function uploadVoiceMessage(file: File, matchId: string) {
  try {
    // 1) Try Firebase first (wait a moment for auth to be ready)
    const fbUser = await waitForFirebaseUser()
    if (fbUser) {
      const fileExtension = (file.name.split('.').pop() || 'webm').toLowerCase()
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(7)
      const fbPath = `voice-messages/${fbUser.uid}/${matchId}/${timestamp}-${randomString}.${fileExtension}`

      const storage = getStorage()
      const objectRef = ref(storage, fbPath)
      await uploadBytes(objectRef, file, { contentType: file.type || 'audio/webm' })
      const downloadUrl = await getDownloadURL(objectRef)

      // Return shape compatible with existing callers
      return { path: downloadUrl }
    }

    // 2) Fall back to Supabase Storage if Supabase session exists
    const { data: userData } = await supabase.auth.getUser()
    const sbUser = userData?.user
    if (sbUser) {
      const fileExtension = (file.name.split('.').pop() || 'webm').toLowerCase()
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(7)
      const sbFilename = `${sbUser.id}/${matchId}/${timestamp}-${randomString}.${fileExtension}`

      const { data, error } = await supabase.storage
        .from('voice-messages')
        .upload(sbFilename, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'audio/webm',
        })

      if (error) throw error
      return data // contains { path }
    }

    // 3) Neither Firebase nor Supabase auth is available
    throw new Error('User not authenticated: no Firebase user and no Supabase session found')
  } catch (error) {
    console.error('Error uploading voice message:', error)
    throw error
  }
}

export async function deleteVoiceMessage(filenameOrUrl: string) {
  try {
    // If this looks like a Firebase download URL, try deleting via Firebase
    if (filenameOrUrl.startsWith('http')) {
      try {
        const url = new URL(filenameOrUrl)
        const afterO = url.pathname.split('/o/')[1]
        if (afterO) {
          const encodedPath = afterO
          const path = decodeURIComponent(encodedPath)
          const storage = getStorage()
          const objectRef = ref(storage, path)
          await deleteObject(objectRef)
          return { success: true }
        }
      } catch (e) {
        // if parsing fails, fall back to Supabase route below
        console.warn('Failed to parse Firebase URL for deletion, falling back to Supabase:', e)
      }
    }

    // Fallback: try Supabase storage (legacy)
    const { data, error } = await supabase.storage
      .from('voice-messages')
      .remove([filenameOrUrl])

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error deleting voice message:', error)
    throw error
  }
}