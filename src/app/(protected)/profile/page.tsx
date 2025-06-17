// // src/app/profile/page.tsx
// 'use client'

// import { useState, useEffect } from 'react'
// import { useSession } from 'next-auth/react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { Edit2, Save, X, Camera, Loader2 } from 'lucide-react'
// import Image from 'next/image'
// import { supabase } from '@/lib/supabase'
// import { OptimizedImage } from '@/components/OptimizedImage'

// interface UserProfile {
//   id: string
//   username: string
//   full_name: string
//   gender: 'male' | 'female' | 'other'
//   dob: string
//   bio: string
//   interests: string[]
//   profile_picture: string | null
// }

// export default function ProfilePage() {
//   const { data: session } = useSession()
//   const [profile, setProfile] = useState<UserProfile | null>(null)
//   const [isEditing, setIsEditing] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [editForm, setEditForm] = useState<Partial<UserProfile>>({})

//   useEffect(() => {
//     const fetchProfile = async () => {
//       if (!session?.user?.id) return

//       try {
//         const { data, error } = await supabase
//           .from('users')
//           .select('*')
//           .eq('id', session.user.id)
//           .single()

//         if (error) throw error
//         setProfile(data)
//         setEditForm(data)
//       } catch (err) {
//         console.error('Error fetching profile:', err)
//         setError('Failed to load profile')
//       }
//     }

//     fetchProfile()
//   }, [session])

//   const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target
//     setEditForm(prev => ({ ...prev, [name]: value }))
//   }

//   const handleInterestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const interests = e.target.value.split(',').map(i => i.trim())
//     setEditForm(prev => ({ ...prev, interests }))
//   }

//   const handleSave = async () => {
//     if (!session?.user?.id) return
//     setLoading(true)

//     try {
//       const { error } = await supabase
//         .from('users')
//         .update(editForm)
//         .eq('id', session.user.id)

//       if (error) throw error

//       setProfile(prev => ({ ...prev!, ...editForm }))
//       setIsEditing(false)
//     } catch (err) {
//       console.error('Error updating profile:', err)
//       setError('Failed to update profile')
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (!profile) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
//       </div>
//     )
//   }

//   return (
//     <div className="max-w-4xl mx-auto px-4 py-8">
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//         {/* Profile Header */}
//         <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-500">
//           <div className="absolute -bottom-16 left-8">
//             <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white bg-white">
//               {profile.profile_picture ? (
//                 <OptimizedImage
//                   src={profile.profile_picture}
//                   alt={profile.username || 'Profile'}
//                   className="w-full h-full object-cover rounded-full"
//                 />
//               ) : (
//                 <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-full">
//                   <span className="text-4xl text-gray-400">
//                     {profile.username?.[0]?.toUpperCase()}
//                   </span>
//                 </div>
//               )}
//             </div>
//           </div>
          
//           {!isEditing && (
//             <button
//               onClick={() => setIsEditing(true)}
//               className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white rounded-full p-2"
//             >
//               <Edit2 className="w-5 h-5" />
//             </button>
//           )}
//         </div>

//         {/* Profile Content */}
//         <div className="pt-20 px-8 pb-8">
//           {isEditing ? (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//             >
//               <div className="space-y-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Username</label>
//                   <input
//                     type="text"
//                     name="username"
//                     value={editForm.username || ''}
//                     onChange={handleFormChange}
//                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Full Name</label>
//                   <input
//                     type="text"
//                     name="full_name"
//                     value={editForm.full_name || ''}
//                     onChange={handleFormChange}
//                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Gender</label>
//                   <select
//                     name="gender"
//                     value={editForm.gender || ''}
//                     onChange={handleFormChange}
//                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                   >
//                     <option value="male">Male</option>
//                     <option value="female">Female</option>
//                     <option value="other">Other</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
//                   <input
//                     type="date"
//                     name="dob"
//                     value={editForm.dob || ''}
//                     onChange={handleFormChange}
//                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Bio</label>
//                   <textarea
//                     name="bio"
//                     value={editForm.bio || ''}
//                     onChange={handleFormChange}
//                     rows={4}
//                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     Interests (comma-separated)
//                   </label>
//                   <input
//                     type="text"
//                     value={editForm.interests?.join(', ') || ''}
//                     onChange={handleInterestsChange}
//                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                   />
//                 </div>

//                 <div className="flex justify-end space-x-3">
//                   <button
//                     onClick={() => setIsEditing(false)}
//                     className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={handleSave}
//                     disabled={loading}
//                     className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
//                   >
//                     {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           ) : (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="space-y-6"
//             >
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
//                 <p className="text-gray-500">@{profile.username}</p>
//               </div>

//               <div>
//                 <h2 className="text-lg font-semibold text-gray-900">About Me</h2>
//                 <p className="mt-2 text-gray-600">{profile.bio || 'No bio yet'}</p>
//               </div>

//               <div>
//                 <h2 className="text-lg font-semibold text-gray-900">Interests</h2>
//                 <div className="mt-2 flex flex-wrap gap-2">
//                   {profile.interests?.map((interest, index) => (
//                     <span
//                       key={index}
//                       className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
//                     >
//                       {interest}
//                     </span>
//                   ))}
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <h2 className="text-lg font-semibold text-gray-900">Gender</h2>
//                   <p className="mt-2 text-gray-600 capitalize">{profile.gender}</p>
//                 </div>
//                 <div>
//                   <h2 className="text-lg font-semibold text-gray-900">Age</h2>
//                   <p className="mt-2 text-gray-600">
//                     {profile.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : 'Not set'}
//                   </p>
//                 </div>
//               </div>
//             </motion.div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }


// src/app/profile/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Edit2, Loader2, Camera, Save, X } from 'lucide-react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { OptimizedImage } from '@/components/profile/OptimizedImage'
import EditSection from '@/components/profile/EditSection'
import ViewSection from '@/components/profile/ViewSection'

interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  gender: 'male' | 'female' | 'other';
  dob: string;
  bio: string;
  interests: string[];
  profile_picture: string | null;
  height: number;
  occupation: string;
  education: string;
  languages: string[];
  hobbies: string[];
  looking_for: string[];
  dealbreakers: string[];
  personality_tags: string[];
  lifestyle_tags: string[];
  location: {
    city: string;
    country: string;
  };
  photos: { url: string; is_primary: boolean }[];
  match_preferences: {
    age_range: [number, number];
    distance: number;
    height_range: [number, number];
  };
}

const SECTIONS = [
  {
    id: 'basic',
    title: 'Basic Information',
    icon: 'UserIcon',
    fields: ['username', 'full_name', 'gender', 'dob', 'email']
  },
  {
    id: 'about',
    title: 'About Me',
    icon: 'BookOpen',
    fields: ['bio', 'occupation', 'education']
  },
  {
    id: 'appearance',
    title: 'Appearance',
    icon: 'User',
    fields: ['height']
  },
  {
    id: 'interests',
    title: 'Interests & Hobbies',
    icon: 'Heart',
    fields: ['interests', 'hobbies']
  },
  {
    id: 'preferences',
    title: 'Preferences',
    icon: 'Settings',
    fields: ['looking_for', 'dealbreakers']
  },
  {
    id: 'personality',
    title: 'Personality',
    icon: 'Smile',
    fields: ['personality_tags', 'lifestyle_tags']
  },
  {
    id: 'location',
    title: 'Location',
    icon: 'MapPin',
    fields: ['location']
  }
];

export default function ProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('basic')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({})
  const [completionPercentage, setCompletionPercentage] = useState(0)

  useEffect(() => {
    fetchProfile()
  }, [session])

  const fetchProfile = async () => {
    if (!session?.user?.id) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error) throw error
      setProfile(data)
      setEditForm(data)
      calculateCompletion(data)
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const calculateCompletion = (data: UserProfile) => {
    const totalFields = SECTIONS.reduce((acc, section) => acc + section.fields.length, 0)
    let completedFields = 0

    SECTIONS.forEach(section => {
      section.fields.forEach(field => {
        const value = data[field as keyof UserProfile]
        if (value) {
          if (Array.isArray(value)) {
            if (value.length > 0) completedFields++
          } else if (typeof value === 'object') {
            if (Object.keys(value).length > 0) completedFields++
          } else {
            completedFields++
          }
        }
      })
    })

    setCompletionPercentage(Math.round((completedFields / totalFields) * 100))
  }

  // const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0]
  //   if (!file || !session?.user?.id) return

  //   setLoading(true)
  //   try {
  //     // Delete old image if it exists
  //     if (profile?.profile_picture) {
  //       const oldFileName = profile.profile_picture.split('/').pop()
  //       if (oldFileName) {
  //         await supabase.storage
  //           .from('profile-pictures')
  //           .remove([oldFileName])
  //       }
  //     }

  //     // Upload new image
  //     const fileExt = file.name.split('.').pop()
  //     const fileName = `${session.user.id}-${Date.now()}.${fileExt}`

  //     const { error: uploadError } = await supabase.storage
  //       .from('profile-pictures')
  //       .upload(fileName, file, {
  //         cacheControl: '3600',
  //         upsert: true
  //       })

  //     if (uploadError) throw uploadError

  //     // Get the public URL
  //     const { data } = supabase.storage
  //       .from('profile-pictures')
  //       .getPublicUrl(fileName)

  //     const publicUrl = data?.publicUrl

  //     // Update user profile with new image URL
  //     const { error: updateError } = await supabase
  //       .from('users')
  //       .update({ profile_picture: publicUrl })
  //       .eq('id', session.user.id)

  //     if (updateError) throw updateError

  //     // Refresh profile
  //     await fetchProfile()
  //   } catch (err) {
  //     console.error('Error uploading image:', err)
  //     setError('Failed to upload image')
  //   } finally {
  //     setLoading(false)
  //   }
  // }
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file || !session?.user?.id) return;

  setLoading(true);
  try {
    // Delete old image if it exists
    if (profile?.profile_picture) {
      const oldFileName = profile.profile_picture.split('/').pop();
      if (oldFileName) {
        await supabase.storage
          .from('profile-pictures')
          .remove([oldFileName]);
      }
    }

    // Always use a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;

    // Upload new image
    const { error: uploadError } = await supabase
      .storage
      .from('profile-pictures')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      setError('Failed to upload image');
      setLoading(false);
      return;
    }

    // Get the public URL
    const { data } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName);

    const publicUrl = data?.publicUrl;

    // Update user profile with new image URL
    const { error: updateError } = await supabase
      .from('users')
      .update({ profile_picture: publicUrl })
      .eq('id', session.user.id);

    if (updateError) throw updateError;

    // Refresh profile
    await fetchProfile();
  } catch (err) {
    console.error('Error uploading image:', err);
    setError('Failed to upload image');
  } finally {
    setLoading(false);
  }
};
  const handleUpdate = async (formData: Partial<UserProfile>) => {
    if (!session?.user?.id) return
    setLoading(true)
    setError(null)

    try {
      // Remove any undefined or null values
      const cleanedData = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== null && value !== undefined)
      )

      const { error } = await supabase
        .from('users')
        .update(cleanedData)
        .eq('id', session.user.id)

      if (error) throw error

      await fetchProfile()
      setIsEditing(false)
    } catch (err) {
      console.error('Error updating profile:', err)
      setError('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditForm(prev => ({ ...prev, [name]: value }))
  }

  const handleArrayChange = (field: string | number, value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(Boolean)
    setEditForm(prev => ({ ...prev, [field]: array }))
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Completion Bar */}
      <div className="mb-8 bg-white rounded-lg p-6 shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Profile Completion</h2>
          <span className="text-lg font-medium">{completionPercentage}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Profile Content */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Profile Header with Image */}
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-500">
          <div className="absolute -bottom-16 left-8">
            <div className="relative w-32 h-32">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-white bg-white">
                {profile.profile_picture ? (
                  <img
                    src={profile.profile_picture}
                    alt={profile.username || 'Profile'}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-full">
                    <span className="text-4xl text-gray-400">
                      {profile.username?.[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600 transition">
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={loading}
                />
              </label>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white rounded-full p-2"
          >
            {isEditing ? (
              <X className="w-5 h-5" />
            ) : (
              <Edit2 className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Section Navigation */}
        <div className="pt-20 px-8">
          <div className="flex space-x-4 border-b">
            {SECTIONS.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-4 py-2 border-b-2 transition-colors ${
                  activeSection === section.id
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>

        {/* Section Content */}
        <div className="p-8">
          {isEditing ? (
            <EditSection
              section={SECTIONS.find(s => s.id === activeSection)!}
              formData={editForm}
              onChange={handleInputChange}
              onArrayChange={handleArrayChange}
              onSubmit={() => handleUpdate(editForm)}
              loading={loading}
            />
          ) : (
            <ViewSection
              section={SECTIONS.find(s => s.id === activeSection)!}
              profile={profile}
            />
          )}
        </div>
      </div>
    </div>
  )
}