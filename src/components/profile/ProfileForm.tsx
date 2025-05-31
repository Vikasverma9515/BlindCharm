// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { supabase } from '@/lib/supabase'
// import InterestSelector from './InterestSelector'

// export default function ProfileForm({ userId }: { userId: string }) {
//   const [formData, setFormData] = useState({
//     bio: '',
//     interests: [] as string[],
//     profilePicture: null as File | null,
//   })
//   const [loading, setLoading] = useState(false)
//   const router = useRouter()

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     try {
//       setLoading(true)

//       // Upload profile picture if selected
//       let profilePictureUrl = null
//       if (formData.profilePicture) {
//         const fileExt = formData.profilePicture.name.split('.').pop()
//         const fileName = `${userId}.${fileExt}`

//         const { error: uploadError, data } = await supabase.storage
//           .from('profile-pictures')
//           .upload(fileName, formData.profilePicture)

//         if (uploadError) throw uploadError
//         profilePictureUrl = data.path
//       }

//       // Update user profile
//       const { error: updateError } = await supabase
//         .from('users')
//         .update({
//           bio: formData.bio,
//           interests: formData.interests,
//           profile_picture: profilePictureUrl,
//           profile_complete: true,
//         })
//         .eq('id', userId)

//       if (updateError) throw updateError

//       router.push('/lobby')
//     } catch (error) {
//       alert('Error updating profile!')
//       console.error(error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       <div>
//         <label className="block text-sm font-medium text-gray-700">
//           Bio
//         </label>
//         <textarea
//           value={formData.bio}
//           onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
//           rows={4}
//         />
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700">
//           Profile Picture
//         </label>
//         <input
//           type="file"
//           accept="image/*"
//           onChange={(e) => {
//             const file = e.target.files?.[0]
//             if (file) {
//               setFormData({ ...formData, profilePicture: file })
//             }
//           }}
//           className="mt-1 block w-full"
//         />
//       </div>

//       <InterestSelector
//         selectedInterests={formData.interests}
//         onChange={(interests) => setFormData({ ...formData, interests })}
//       />

//       <button
//         type="submit"
//         disabled={loading}
//         className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
//       >
//         {loading ? 'Saving...' : 'Complete Profile'}
//       </button>
//     </form>
//   )
// }