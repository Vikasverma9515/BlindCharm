// src/components/profile/ProfileSetupForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '@/lib/supabase'
import InterestSelector from './InterestSelector'

const profileSchema = z.object({
  bio: z.string().min(10, 'Bio must be at least 10 characters').max(500),
  interests: z.array(z.string()).min(3, 'Select at least 3 interests'),
  profilePicture: z.any().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileSetupFormProps {
  userId: string
}

export default function ProfileSetupForm({ userId }: ProfileSetupFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsLoading(true)

      let profilePictureUrl = null
      if (data.profilePicture?.[0]) {
        const file = data.profilePicture[0]
        const fileExt = file.name.split('.').pop()
        const fileName = `${userId}.${fileExt}`

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('profile-pictures')
          .upload(fileName, file)

        if (uploadError) throw uploadError
        profilePictureUrl = uploadData.path
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({
          bio: data.bio,
          interests: data.interests,
          profile_picture: profilePictureUrl,
          profile_complete: true,
        })
        .eq('id', userId)

      if (updateError) throw updateError

      router.push('/lobby')
    } catch (error: any) {
      setError('root', {
        message: error.message || 'Error updating profile',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {errors.root && (
        <div className="p-3 text-sm font-medium text-red-600 bg-red-50 rounded-md">
          {errors.root.message}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Profile Picture
        </label>
        <input
          type="file"
          accept="image/*"
          {...register('profilePicture')}
          className="mt-1 block w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Bio
        </label>
        <textarea
          {...register('bio')}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Tell us about yourself..."
        />
        {errors.bio && (
          <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
        )}
      </div>

      <InterestSelector
        onSelect={(interests: string[]) => setValue('interests', interests)}
      />
      {errors.interests && (
        <p className="mt-1 text-sm text-red-600">{errors.interests.message}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isLoading ? 'Saving...' : 'Complete Profile'}
      </button>
    </form>
  )
}