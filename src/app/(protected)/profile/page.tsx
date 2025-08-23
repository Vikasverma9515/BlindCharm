'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Edit2,
  Loader2,
  Camera,
  Save,
  X,
  Plus,
  MapPin,
  Heart,
  User,
  Briefcase,
  GraduationCap,
  Languages,
  Smile,
  Settings,
  Check,
  ChevronRight,
  Star,
  LogOut,
  Shield,
  Bell,
  Eye,
  HelpCircle,
  MessageCircle,
  Lock,
  Trash2,
  Moon,
  Sun
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import ImageUpload from '@/components/profile/ImageUpload'
import SimpleTopNav from '@/components/shared/SimpleTopNav'
import SimpleBottomNav from '@/components/shared/SimpleBottomNav'
import ThemeToggle from '@/components/ui/ThemeToggle'
import AdminBadge from '@/components/ui/AdminBadge'
import { signOut } from 'next-auth/react'

import BroadcastNotifications from '@/components/admin/BroadcastNotifications'
import AdminNotificationPanel from '@/components/admin/AdminNotificationPanel'
import { useRouter } from 'next/navigation'
import BlindCharmVerification from '@/components/verification/BlindCharmVerification'
import FaceVerification from '@/components/verification/FaceVerification'
import LogoutButton from '@/components/auth/LogoutButton'
import DeleteAccountButton from '@/components/settings/DeleteAccountButton'

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
  additional_photo_1: string | null;
  additional_photo_2: string | null;
  is_admin?: boolean;
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
  } | string;
  photos: { url: string; is_primary: boolean }[];
  match_preferences: {
    age_range: [number, number];
    distance: number;
    height_range: [number, number];
  };
}
interface ProfileSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  loading: boolean;
  theme: keyof typeof sectionThemes; // Add theme prop
}


// Predefined options for easy selection
const INTERESTS_OPTIONS = [
  'Travel', 'Photography', 'Music', 'Movies', 'Reading', 'Cooking', 'Fitness', 'Yoga',
  'Dancing', 'Art', 'Gaming', 'Sports', 'Hiking', 'Swimming', 'Running', 'Cycling',
  'Fashion', 'Technology', 'Science', 'History', 'Politics', 'Philosophy', 'Psychology',
  'Meditation', 'Volunteering', 'Animals', 'Nature', 'Adventure', 'Comedy', 'Wine'
];

const PERSONALITY_TAGS = [
  'Adventurous', 'Ambitious', 'Caring', 'Creative', 'Funny', 'Honest', 'Intelligent',
  'Kind', 'Loyal', 'Optimistic', 'Passionate', 'Patient', 'Romantic', 'Spontaneous',
  'Thoughtful', 'Confident', 'Empathetic', 'Independent', 'Outgoing', 'Reliable'
];

const LIFESTYLE_TAGS = [
  'Active', 'Relaxed', 'Social', 'Homebody', 'Night Owl', 'Early Bird', 'Foodie',
  'Health Conscious', 'Spiritual', 'Career Focused', 'Family Oriented', 'Pet Lover',
  'Minimalist', 'Maximalist', 'Eco Friendly', 'Tech Savvy', 'Artistic', 'Athletic'
];

const LOOKING_FOR_OPTIONS = [
  'Long-term relationship', 'Casual dating', 'New friends', 'Something casual',
  'Marriage', 'Life partner', 'Fun dates', 'Serious relationship'
];

const DEALBREAKERS_OPTIONS = [
  'Smoking', 'Drinking heavily', 'No sense of humor', 'Dishonesty', 'Rudeness',
  'Poor hygiene', 'Different life goals', 'No ambition', 'Closed minded',
  'Drama', 'Negativity', 'Unreliability', 'Disrespectful', 'No communication'
];

// Define color themes for different sections
const sectionThemes = {
  basic: {
    icon: "bg-blue-500",
    border: "border-blue-200",
    hover: "hover:bg-blue-50",
    gradient: "from-blue-50 to-white",
    dark: {
      border: "dark:border-blue-800",
      hover: "dark:hover:bg-blue-900/20",
      gradient: "dark:from-blue-900/20 dark:to-transparent"
    }
  },
  about: {
    icon: "bg-purple-500",
    border: "border-purple-200",
    hover: "hover:bg-purple-50",
    gradient: "from-purple-50 to-white",
    dark: {
      border: "dark:border-purple-800",
      hover: "dark:hover:bg-purple-900/20",
      gradient: "dark:from-purple-900/20 dark:to-transparent"
    }
  },
  work: {
    icon: "bg-amber-500",
    border: "border-amber-200",
    hover: "hover:bg-amber-50",
    gradient: "from-amber-50 to-white",
    dark: {
      border: "dark:border-amber-800",
      hover: "dark:hover:bg-amber-900/20",
      gradient: "dark:from-amber-900/20 dark:to-transparent"
    }
  },
  interests: {
    icon: "bg-green-500",
    border: "border-green-200",
    hover: "hover:bg-green-50",
    gradient: "from-green-50 to-white",
    dark: {
      border: "dark:border-green-800",
      hover: "dark:hover:bg-green-900/20",
      gradient: "dark:from-green-900/20 dark:to-transparent"
    }
  },
  personality: {
    icon: "bg-red-500",
    border: "border-red-200",
    hover: "hover:bg-red-50",
    gradient: "from-red-50 to-white",
    dark: {
      border: "dark:border-red-800",
      hover: "dark:hover:bg-red-900/20",
      gradient: "dark:from-red-900/20 dark:to-transparent"
    }
  }
};



export default function ProfilePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({})
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [showVerifier, setShowVerifier] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  // Check if user is admin (same logic as lobby components)
  const isAdmin = profile?.is_admin ||
    session?.user?.email === 'admin@blindcharm.com' ||
    session?.user?.email === 'Blindcharm@gmail.com';

  // Debug admin status
  console.log('🔍 Admin Debug:', {
    profileIsAdmin: profile?.is_admin,
    sessionEmail: session?.user?.email,
    finalIsAdmin: isAdmin,
    profile: profile
  });


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

      // Ensure array fields are always arrays, not null
      const safeData = {
        ...data,
        interests: Array.isArray(data.interests) ? data.interests : [],
        personality_tags: Array.isArray(data.personality_tags) ? data.personality_tags : [],
        lifestyle_tags: Array.isArray(data.lifestyle_tags) ? data.lifestyle_tags : [],
        looking_for: Array.isArray(data.looking_for) ? data.looking_for : [],
        dealbreakers: Array.isArray(data.dealbreakers) ? data.dealbreakers : [],
        languages: Array.isArray(data.languages) ? data.languages : [],
        hobbies: Array.isArray(data.hobbies) ? data.hobbies : [],
        photos: Array.isArray(data.photos) ? data.photos : [],
        additional_photo_1: data.additional_photo_1 || null,
        additional_photo_2: data.additional_photo_2 || null
      }

      setEditForm(safeData)
      calculateCompletion(data)
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const calculateCompletion = (data: UserProfile) => {
    const fields = ['full_name', 'bio', 'interests', 'occupation', 'education', 'height', 'location']
    let completedFields = 0

    fields.forEach(field => {
      const value = data[field as keyof UserProfile]
      if (value) {
        if (Array.isArray(value)) {
          if (value.length > 0) completedFields++
        } else if (typeof value === 'object' && value !== null) {
          if (Object.keys(value).length > 0) completedFields++
        } else if (typeof value === 'string' && value.trim()) {
          completedFields++
        } else if (typeof value === 'number' && value > 0) {
          completedFields++
        }
      }
    })

    setCompletionPercentage(Math.round((completedFields / fields.length) * 100))
  }

  const handleImageUpload = async (file: File, photoType: 'profile_picture' | 'additional_photo_1' | 'additional_photo_2' = 'profile_picture') => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      // Delete old image if it exists
      const currentImage = profile?.[photoType];
      if (currentImage) {
        const oldFileName = currentImage.split('/').pop();
        if (oldFileName && !oldFileName.includes('default')) {
          await supabase.storage
            .from('profile-pictures')
            .remove([oldFileName]);
        }
      }

      // Always use a unique file name
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${session.user.id}-${photoType}-${Date.now()}.${fileExt}`;

      // Upload compressed and cropped image
      const { error: uploadError } = await supabase
        .storage
        .from('profile-pictures')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        setError('Failed to upload image');
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
        .update({ [photoType]: publicUrl })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      // Refresh profile
      await fetchProfile();
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = async (photoType: 'additional_photo_1' | 'additional_photo_2') => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      // Delete image from storage if it exists
      const currentImage = profile?.[photoType];
      if (currentImage) {
        const fileName = currentImage.split('/').pop();
        if (fileName && !fileName.includes('default')) {
          await supabase.storage
            .from('profile-pictures')
            .remove([fileName]);
        }
      }

      // Update user profile to remove image URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ [photoType]: null })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      // Refresh profile
      await fetchProfile();
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error removing image:', err);
      setError('Failed to remove image');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (field: string, value: any) => {
    if (!session?.user?.id) return
    setLoading(true)
    setError(null)

    try {
      const updateData = { [field]: value }
      console.log('🔄 Updating field:', field, 'with value:', value)

      const { error, data } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', session.user.id)
        .select()

      if (error) {
        console.error('❌ Supabase error:', error)
        throw error
      }

      console.log('✅ Update successful, returned data:', data)
      await fetchProfile()
      setEditingSection(null)
    } catch (err) {
      console.error('❌ Error updating profile:', err)
      setError('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleMultipleUpdates = async (updates: Record<string, any>) => {
    if (!session?.user?.id) return
    setLoading(true)
    setError(null)

    try {
      console.log('🔄 Multiple updates:', updates)

      const { error, data } = await supabase
        .from('users')
        .update(updates)
        .eq('id', session.user.id)
        .select()

      if (error) {
        console.error('❌ Supabase error:', error)
        throw error
      }

      console.log('✅ Multiple updates successful, returned data:', data)
      await fetchProfile()
      setEditingSection(null)
    } catch (err) {
      console.error('❌ Error updating profile:', err)
      setError('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleTagToggle = (field: string, tag: string, currentTags: string[] = []) => {
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]

    console.log(`🏷️ Toggling ${field}: ${tag} -> [${newTags.join(', ')}]`)

    setEditForm(prev => ({ ...prev, [field]: newTags }))
  }

  const getAge = (dob: string) => {
    if (!dob) return null
    const birthDate = new Date(dob)
    const today = new Date()
    return today.getFullYear() - birthDate.getFullYear()
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <SimpleTopNav pageName="My Profile" />
      {/* <BlindCharmVerification /> */}

      <main className="min-h-screen pt-0 pb-4 md:pt-0 md:pb-8 bg-gray-50 dark:bg-gray-900 transition-all duration-500">
        <div className="max-w-md mx-auto px-4 py-6 md:max-w-2xl md:pt-8 space-y-6">

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          {/* Modern Profile Completion Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-4xl p-4 md:p-6 ">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <Star className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Strength</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Complete your profile to get more matches</p>
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">{completionPercentage}%</div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">Complete</div>
                </div>
              </div>

              {/* Modern Progress Bar */}
              <div className="relative">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-blue-500 dark:bg-blue-400 rounded-full"
                  />
                </div>
                {/* Completion milestones */}
                <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                  <span>Basic</span>
                  <span>Good</span>
                  <span>Great</span>
                  <span>Perfect</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Modern Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            {/* Profile Info Card */}
            <div className="w-full max-w-3xl mx-auto pb-4  dark:bg-gray-900/50 rounded-2xl ">
              {/* Main Profile Card - Dark theme with glass effect */}
              <div className=" bg-white/25 dark:bg-gray-900/50 border  dark:border-gray-700 backdrop-blur-lg rounded-3xl overflow-hidden shadow-xl">
                {/* Profile Header Section */}
                <div className="relative">
                  {/* Large Profile Picture */}
                  <div className="w-full h-64 sm:h-80 relative">
                    {profile.profile_picture ? (
                      <img
                        src={profile.profile_picture}
                        alt={profile.full_name || 'Profile'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <Camera size={48} className="text-gray-600" />
                      </div>
                    )}
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
                  </div>

                  {/* Edit Photo Button - Floating */}
                  <div className="absolute top-4 right-4">
                    <ImageUpload
                      currentImage={profile.profile_picture}
                      onImageUpload={handleImageUpload}
                      loading={loading}
                      className="bg-gray-900/50 backdrop-blur-md hover:bg-gray-800/50 text-white rounded-full p-2"
                    />
                  </div>
                </div>

                {/* Profile Info Section */}
                <div className="px-4 sm:px-6 pb-6">
                  {/* Name and Age */}
                  <div className="flex items-center justify-between -mt-8 relative z-10 mb-4">
                    <div className="flex items-baseline gap-2">
                      <h1 className="text-2xl sm:text-3xl font-bold text-white">
                        {profile.full_name || 'Your Name'}
                      </h1>
                      {profile.dob && (
                        <span className="text-xl text-gray-300">
                          {getAge(profile.dob)}
                        </span>
                      )}
                    </div>
                    {/* Admin Badge */}
                    {profile.is_admin && (
                      <div className="flex-shrink-0">
                        <AdminBadge size="sm" />
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  {(typeof profile.location === 'string' ? profile.location : (profile.location && typeof profile.location === 'object' ? profile.location.city : false)) && (
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-5 h-5 dark:text-gray-400" />
                      <span className="dark:text-gray-300 text-sm">
                        {typeof profile.location === 'string'
                          ? profile.location
                          : profile.location && typeof profile.location === 'object'
                            ? `${profile.location.city}${profile.location.country ? `, ${profile.location.country}` : ''}`
                            : ''
                        }
                      </span>
                    </div>
                  )}

                  {/* Active Status */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="px-3 py-1.5 bg-green-500/10 rounded-full flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm font-medium">Active</span>
                    </div>
                  </div>

                  {/* Bio */}
                  {profile.bio && (
                    <div className="mb-6">
                      <h2 className=" text-sm font-blindcharm-tech text-lime-600 dark:text-lime-300 mb-2">About</h2>
                      <p className="dark:text-gray-300 text-sm font-medium leading-relaxed">
                        {profile.bio}
                      </p>
                    </div>
                  )}

                  {/* Basic Info Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 ">
                    {profile.height && (
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-xl p-3">
                        <p className="dark:text-gray-400 font-medium text-xs mb-1">Height</p>
                        <p className="text-black font-medium">{profile.height} cm</p>
                      </div>
                    )}
                    {profile.occupation && (
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-xl p-3">
                        <p className="dark:text-gray-400 font-medium text-xs mb-1">Work</p>
                        <p className="text-black font-medium">{profile.occupation}</p>
                      </div>
                    )}
                    {profile.education && (
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-xl p-3">
                        <p className="dark:text-gray-400 font-medium text-xs mb-1">Education</p>
                        <p className="text-black font-medium">{profile.education}</p>
                      </div>
                    )}
                  </div>

                  {/* Interests */}
                  {profile.interests && profile.interests.length > 0 && (
                    <div className="mb-6">
                      <h2 className=" text-sm font-blindcharm-tech dark:text-lime-300 text-lime-600 mb-3">Interests</h2>
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map((interest, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-black rounded-full dark:text-gray-300 text-white  text-sm"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Other Sections (Languages, Hobbies, etc.) */}
                  {profile.languages && profile.languages.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-gray-400 text-sm font-medium mb-3">Languages</h2>
                      <div className="flex flex-wrap gap-2">
                        {profile.languages.map((language, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-gray-800/50 rounded-full text-gray-300 text-sm"
                          >
                            {language}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Photos Grid */}
                  {/* {profile.photos && profile.photos.length > 0 && (
        <div className="mb-6">
          <h2 className="text-gray-400 text-sm font-medium mb-3">Photos</h2>
          <div className="grid grid-cols-3 gap-2">
            {profile.photos.map((photo, index) => (
              <div key={index} className="aspect-square rounded-xl overflow-hidden">
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )} */}
                </div>
              </div>
            </div>

            {/* Photo Gallery Section */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 md:p-6 shadow-lg mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Photos</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">Add up to 3 photos</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Main Profile Picture */}
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                  {profile.profile_picture ? (
                    <img
                      src={profile.profile_picture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera size={24} className="text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                  <div className="absolute bottom-1 left-1 px-2 py-1 bg-black/50 rounded text-white text-xs font-medium">
                    Main
                  </div>
                </div>

                {/* Additional Photo 1 */}
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                  {profile.additional_photo_1 ? (
                    <>
                      <img
                        src={profile.additional_photo_1}
                        alt="Additional Photo 1"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleRemovePhoto('additional_photo_1')}
                        className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                        title="Remove photo"
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors border-2 border-dashed border-gray-300 dark:border-gray-600">
                      <Plus size={20} className="text-gray-400 dark:text-gray-500 mb-1" />
                      <span className="text-xs text-gray-500 dark:text-gray-400 text-center">Add Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, 'additional_photo_1');
                        }}
                      />
                    </label>
                  )}
                </div>

                {/* Additional Photo 2 */}
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                  {profile.additional_photo_2 ? (
                    <>
                      <img
                        src={profile.additional_photo_2}
                        alt="Additional Photo 2"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleRemovePhoto('additional_photo_2')}
                        className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                        title="Remove photo"
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors border-2 border-dashed border-gray-300 dark:border-gray-600">
                      <Plus size={20} className="text-gray-400 dark:text-gray-500 mb-1" />
                      <span className="text-xs text-gray-500 dark:text-gray-400 text-center">Add Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, 'additional_photo_2');
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center shadow-lg border border-gray-100 dark:border-gray-700"
              >
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {completionPercentage}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Complete</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center shadow-lg border border-gray-100 dark:border-gray-700"
              >
                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                  {(profile.interests?.length || 0) + (profile.hobbies?.length || 0)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Interests</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center shadow-lg border border-gray-100 dark:border-gray-700"
              >
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {profile.languages?.length || 0}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Languages</div>
              </motion.div>
            </div>
          </motion.div>
          <div>
            {/* <h1>Your Profile</h1>
                <button onClick={() => setShowVerifier(true)}>
                  {`🔒 Get Verified`}
                </button> */}

            {/* {showVerifier && (
                  <FaceVerification
                    onVerificationComplete={(success, data) => {
                      console.log('Verification complete:', { success, data });
                      setShowVerifier(false);
                      if (success) {
                        // Save verified status (e.g., Supabase update)
                        alert('✅ You are now verified!');
                      } else {
                        alert('❌ Verification failed.');
                      }
                    }}
                    onClose={() => setShowVerifier(false)}
                  />
                )} */}
          </div>
          {/* Profile Sections */}
          <div className="space-y-6">

            {/* Basic Info Section */}
            <ProfileSection
              title="Basic Information"
              icon={<User className="w-5 h-5 " />}
              theme='basic'
              isEditing={editingSection === 'basic'}
              onEdit={() => setEditingSection('basic')}
              onCancel={() => setEditingSection(null)}
              onSave={() => {
                handleMultipleUpdates({
                  full_name: editForm.full_name,
                  dob: editForm.dob,
                  gender: editForm.gender
                })
              }}
              loading={loading}
            >
              {editingSection === 'basic' ? (
                <div className="space-y-4 ">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-emerald-400 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={editForm.full_name || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-emerald-400 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={editForm.dob || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, dob: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200  rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-emerald-400 mb-2">Gender</label>
                    <select
                      value={editForm.gender || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' | 'other' }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <InfoItem label="Name" value={profile.full_name} />
                  <InfoItem label="Age" value={profile.dob ? `${getAge(profile.dob)} years old` : null} />
                  <InfoItem label="Gender" value={profile.gender} />
                </div>
              )}
            </ProfileSection>

            {/* About Me Section */}
            <ProfileSection
              title="About Me"
              icon={<Heart className="w-5 h-5" />}
              theme="about"
              isEditing={editingSection === 'about'}
              onEdit={() => setEditingSection('about')}
              onCancel={() => setEditingSection(null)}
              onSave={() => handleUpdate('bio', editForm.bio)}
              loading={loading}
            >
              {editingSection === 'about' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-emerald-400 mb-2">Bio</label>
                  <textarea
                    value={editForm.bio || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    placeholder="Tell people about yourself..."
                  />
                </div>
              ) : (
                <p className="text-gray-700 dark:text-white font-medium leading-relaxed">
                  {profile.bio || 'Add a bio to tell people about yourself'}
                </p>
              )}
            </ProfileSection>

            {/* Work & Education Section */}
            <ProfileSection
              title="Work & Education"
              icon={<Briefcase className="w-5 h-5" />}
              theme="work"
              isEditing={editingSection === 'work'}
              onEdit={() => setEditingSection('work')}
              onCancel={() => setEditingSection(null)}
              onSave={() => {
                handleMultipleUpdates({
                  occupation: editForm.occupation,
                  education: editForm.education,
                  height: editForm.height
                })
              }}
              loading={loading}
            >
              {editingSection === 'work' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-emerald-400 mb-2">Occupation</label>
                    <input
                      type="text"
                      value={editForm.occupation || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, occupation: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="What do you do for work?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-emerald-400 mb-2">Education</label>
                    <input
                      type="text"
                      value={editForm.education || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, education: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Where did you study?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-emerald-400 mb-2">Height (cm)</label>
                    <input
                      type="number"
                      value={editForm.height || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Your height in centimeters"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <InfoItem label="Occupation" value={profile.occupation} />
                  <InfoItem label="Education" value={profile.education} />
                  <InfoItem label="Height" value={profile.height ? `${profile.height} cm` : null} />
                </div>
              )}
            </ProfileSection>

            {/* Location Section */}
            <ProfileSection
              title="Location"
              icon={<MapPin className="w-5 h-5" />}
              theme="basic"
              isEditing={editingSection === 'location'}
              onEdit={() => setEditingSection('location')}
              onCancel={() => setEditingSection(null)}
              onSave={() => {
                // Store location as a simple string instead of object
                const locationObj = typeof editForm.location === 'object' && editForm.location ? editForm.location : { city: '', country: '' }
                const locationString = locationObj.city && locationObj.country
                  ? `${locationObj.city}, ${locationObj.country}`
                  : locationObj.city || locationObj.country || ''
                handleUpdate('location', locationString)
              }}
              loading={loading}
            >
              {editingSection === 'location' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-emerald-400 mb-2">City</label>
                    <input
                      type="text"
                      value={typeof editForm.location === 'object' && editForm.location ? editForm.location.city || '' : ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        location: {
                          city: e.target.value,
                          country: typeof prev.location === 'object' && prev.location ? prev.location.country || '' : ''
                        }
                      }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Your city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-emerald-400 mb-2">Country</label>
                    <input
                      type="text"
                      value={typeof editForm.location === 'object' && editForm.location ? editForm.location.country || '' : ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        location: {
                          city: typeof prev.location === 'object' && prev.location ? prev.location.city || '' : '',
                          country: e.target.value
                        }
                      }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Your country"
                    />
                  </div>
                </div>
              ) : (
                <InfoItem
                  label="Location"
                  value={typeof profile.location === 'string'
                    ? profile.location
                    : profile.location && typeof profile.location === 'object'
                      ? (profile.location.city && profile.location.country
                        ? `${profile.location.city}, ${profile.location.country}`
                        : profile.location.city || profile.location.country || null)
                      : null
                  }
                />
              )}
            </ProfileSection>

            {/* Interests Section */}
            <ProfileSection
              title="Interests"
              icon={<Heart className="w-5 h-5" />}
              theme="interests"
              isEditing={editingSection === 'interests'}
              onEdit={() => setEditingSection('interests')}
              onCancel={() => setEditingSection(null)}
              onSave={() => handleUpdate('interests', editForm.interests || [])}
              loading={loading}
            >
              {editingSection === 'interests' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-emerald-400 mb-3">Select your interests</label>
                  <div className="grid grid-cols-2 gap-2">
                    {INTERESTS_OPTIONS.map(interest => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleTagToggle('interests', interest, editForm.interests || [])}
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${(editForm.interests || []).includes(interest)
                          ? 'bg-red-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.interests?.length ? (
                    profile.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">Add your interests to help others get to know you</p>
                  )}
                </div>
              )}
            </ProfileSection>

            {/* Personality Section */}
            <ProfileSection
              title="Personality"
              icon={<Smile className="w-5 h-5" />}
              theme="personality"
              isEditing={editingSection === 'personality'}
              onEdit={() => setEditingSection('personality')}
              onCancel={() => setEditingSection(null)}
              onSave={() => {
                handleMultipleUpdates({
                  personality_tags: editForm.personality_tags || [],
                  lifestyle_tags: editForm.lifestyle_tags || []
                })
              }}
              loading={loading}
            >
              {editingSection === 'personality' ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-emerald-400 mb-3">Personality traits</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PERSONALITY_TAGS.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagToggle('personality_tags', tag, editForm.personality_tags || [])}
                          className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${(editForm.personality_tags || []).includes(tag)
                            ? 'bg-red-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-emerald-400 mb-3">Lifestyle</label>
                    <div className="grid grid-cols-2 gap-2">
                      {LIFESTYLE_TAGS.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagToggle('lifestyle_tags', tag, editForm.lifestyle_tags || [])}
                          className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${(editForm.lifestyle_tags || []).includes(tag)
                            ? 'bg-yellow-500 text-black shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Personality</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.personality_tags?.length ? (
                        profile.personality_tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 dark:text-gray-300 text-sm">Add personality traits</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lifestyle</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.lifestyle_tags?.length ? (
                        profile.lifestyle_tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">Add lifestyle preferences</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </ProfileSection>

            {/* Looking For Section */}
            <ProfileSection
              title="What I'm Looking For"
              icon={<Settings className="w-5 h-5" />}
              theme="basic"
              isEditing={editingSection === 'looking_for'}
              onEdit={() => setEditingSection('looking_for')}
              onCancel={() => setEditingSection(null)}
              onSave={() => {
                handleMultipleUpdates({
                  looking_for: editForm.looking_for || [],
                  dealbreakers: editForm.dealbreakers || []
                })
              }}
              loading={loading}
            >
              {editingSection === 'looking_for' ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-emerald-400 mb-3">I'm looking for</label>
                    <div className="space-y-2">
                      {LOOKING_FOR_OPTIONS.map(option => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleTagToggle('looking_for', option, editForm.looking_for || [])}
                          className={`w-full px-4 py-3 rounded-xl text-left font-medium transition-all ${(editForm.looking_for || []).includes(option)
                            ? 'bg-red-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-emerald-400 mb-3">Deal breakers</label>
                    <div className="grid grid-cols-1 gap-2">
                      {DEALBREAKERS_OPTIONS.map(option => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleTagToggle('dealbreakers', option, editForm.dealbreakers || [])}
                          className={`px-3 py-2 rounded-xl text-sm font-medium transition-all text-left ${(editForm.dealbreakers || []).includes(option)
                            ? 'bg-black text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Looking for</h4>
                    <div className="space-y-2">
                      {profile.looking_for?.length ? (
                        profile.looking_for.map((item, index) => (
                          <span
                            key={index}
                            className="block px-3 py-2 bg-red-100 text-red-800 rounded-xl text-sm font-medium"
                          >
                            {item}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">Add what you're looking for</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Deal breakers</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.dealbreakers?.length ? (
                        profile.dealbreakers.map((item, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-black text-white rounded-full text-sm font-medium"
                          >
                            {item}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">Add your deal breakers</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </ProfileSection>

            {/* Modern Settings Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="group"
            >
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100/50 dark:border-gray-700/50 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">

                {/* Modern Header */}
                <div className="relative p-6 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500 dark:bg-indigo-600 rounded-2xl shadow-lg">
                      <Settings className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                        Settings & Privacy
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Manage your account and preferences
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 space-y-6">
                  {/* Account Settings */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">Account</h4>
                    <div className="space-y-3">
                      <SettingsItem
                        icon={<Bell className="w-5 h-5" />}
                        title="Notification Settings"
                        subtitle="Manage your notification preferences"
                        onClick={() => router.push('/settings/notifications')}
                      />
                      <SettingsItem
                        icon={<Eye className="w-5 h-5" />}
                        title="Privacy Settings"
                        subtitle="Control who can see your profile"
                        onClick={() => {/* TODO: Navigate to privacy */ }}
                      />
                      <SettingsItem
                        icon={<Shield className="w-5 h-5" />}
                        title="Safety & Security"
                        subtitle="Block users, report issues"
                        onClick={() => {/* TODO: Navigate to safety */ }}
                      />
                    </div>
                  </div>

                  {/* App Settings */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">Preferences</h4>
                    <div className="space-y-3">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl">
                        <ThemeToggle variant="settings" />
                      </div>
                      <SettingsItem
                        icon={<MessageCircle className="w-5 h-5" />}
                        title="Chat Settings"
                        subtitle="Message preferences and filters"
                        onClick={() => {/* TODO: Navigate to chat settings */ }}
                      />
                      <SettingsItem
                        icon={<Heart className="w-5 h-5" />}
                        title="Match Preferences"
                        subtitle="Age range, distance, and more"
                        onClick={() => {/* TODO: Navigate to match preferences */ }}
                      />
                    </div>
                  </div>

                  {/* Support */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">Support</h4>
                    <div className="space-y-3">
                      <SettingsItem
                        icon={<HelpCircle className="w-5 h-5" />}
                        title="Help & Support"
                        subtitle="FAQs, contact us"
                        onClick={() => {/* TODO: Navigate to help */ }}
                      />
                    </div>
                  </div>



                  {/* Danger Zone */}
                  <div>
                    <h4 className="text-sm font-bold text-red-600 dark:text-red-400 mb-4 uppercase tracking-wider">Danger Zone</h4>
                    <div className="space-y-3 p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
                      {/* <SettingsItem
                        icon={<LogOut className="w-5 h-5" />}
                        title="Sign Out"
                        subtitle="Sign out of your account"
                        onClick={async () => {
                          try {
                            // await signOut({ callbackUrl: '/login' })
                            await signOut({ callbackUrl:'/login' })
                          } catch (error) {
                            console.error('Error signing out:', error)
                          }
                        }}
                        danger
                      /> */}
                      <LogoutButton />

                      
                      {/* <DeleteAccountButton /> */}

                      {/* <SettingsItem
                        icon={<Trash2 className="w-5 h-5" />}
                        title="Delete Account"
                        subtitle="Permanently delete your account"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                            // TODO: Implement account deletion
                            alert('Account deletion feature coming soon')
                          }
                        }}
                        danger
                      /> */}
                    </div>
                    
                  </div>
                  
                </div>

                {/* Debug Admin Status */}
                {/* <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-medium text-yellow-800 mb-2">🔍 Admin Debug Info</h3>
                  <div className="text-sm text-yellow-700 space-y-1">
                    <p><strong>profile?.is_admin:</strong> {String(profile?.is_admin)}</p>
                    <p><strong>session?.user?.email:</strong> {session?.user?.email}</p>
                    <p><strong>session?.user?.id:</strong> {session?.user?.id}</p>
                    <p><strong>isAdmin result:</strong> {String(isAdmin)}</p>
                    <p><strong>Should show panel:</strong> {isAdmin ? 'YES' : 'NO'}</p>
                    <p><strong>Current URL port:</strong> {typeof window !== 'undefined' ? window.location.port : 'N/A'}</p>
                  </div>
                  <div className="mt-2 p-2 bg-yellow-100 rounded text-xs">
                    <p><strong>Note:</strong> Make sure you're accessing the correct port (3001, not 3000)</p>
                    <p><strong>Correct URL:</strong> http://localhost:3001/admin-test</p>
                    <a 
                      href="/admin-test" 
                      className="inline-block mt-1 text-blue-600 hover:text-blue-800 underline"
                    >
                      → Test Admin Status on Correct Port
                    </a>
                  </div>
                </div> */}

                {isAdmin && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <AdminNotificationPanel />
                  </motion.div>
                )}

                {/* {!isAdmin && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="font-medium text-red-800 mb-2">❌ Admin Panel Not Showing</h3>
                    <p className="text-sm text-red-700">
                      The admin panel is not showing because isAdmin = {String(isAdmin)}
                    </p>
                  </div>
                )} */}

              </div>
            </motion.div>

          </div>
        </div>
      </main>

      <SimpleBottomNav />
    </>
  )
}

// Profile Section Component
interface ProfileSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  isEditing: boolean
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
  loading: boolean
  theme: keyof typeof sectionThemes
}

function ProfileSection({ title, icon, children, isEditing, onEdit, onCancel, onSave, loading, theme }: ProfileSectionProps) {
  const themeConfig = sectionThemes[theme]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      {/* Modern Card Design */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100/50 dark:border-gray-700/50 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">

        {/* Header with floating icon */}
        <div className="relative p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Floating Icon */}
              <div className={`relative p-3 ${themeConfig.icon} rounded-2xl shadow-lg`}>
                <div className="text-white">
                  {icon}
                </div>
                {/* Subtle glow effect */}
                <div className={`absolute inset-0 ${themeConfig.icon} rounded-2xl opacity-20 blur-lg scale-110`}></div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                  {title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {isEditing ? 'Editing mode' : 'Tap to edit'}
                </p>
              </div>
            </div>

            {!isEditing && (
              <button
                onClick={onEdit}
                className="p-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-all duration-200 group-hover:scale-105"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="px-6 pb-6">
          {/* Content with better spacing */}
          <div className={`${isEditing ? 'bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-4' : ''}`}>
            {children}
          </div>

          {/* Modern Action Buttons */}
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 mt-6"
            >
              <button
                onClick={onCancel}
                className="flex-1 px-6 py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={loading}
                className="flex-1 px-6 py-3.5 bg-blue-500 dark:bg-blue-600 text-white rounded-2xl hover:bg-blue-600 dark:hover:bg-blue-700 transition-all duration-200 font-semibold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Info Item Component
interface InfoItemProps {
  label: string
  value: string | null | undefined
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="flex justify-between items-center py-3 px-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-gray-900 dark:text-gray-100 font-semibold">
        {value || <span className="text-gray-400 dark:text-gray-500 italic font-normal">Add {label.toLowerCase()}</span>}
      </span>
    </div>
  )
}

// Settings Item Component
interface SettingsItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
  danger?: boolean;
}

function SettingsItem({ icon, title, subtitle, onClick, danger = false }: SettingsItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 hover:scale-[1.02] ${danger
        ? 'hover:bg-red-50 dark:hover:bg-red-900/20 hover:shadow-lg hover:shadow-red-100 dark:hover:shadow-red-900/20'
        : 'hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-lg'
        }`}
    >
      <div className={`p-3 rounded-2xl shadow-sm ${danger
        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
        }`}>
        {icon}
      </div>
      <div className="flex-1 text-left">
        <h4 className={`font-bold text-base ${danger
          ? 'text-red-600 dark:text-red-400'
          : 'text-gray-900 dark:text-gray-100'
          }`}>
          {title}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{subtitle}</p>
      </div>
      <div className={`p-2 rounded-full ${danger
        ? 'bg-red-100 dark:bg-red-900/30'
        : 'bg-gray-100 dark:bg-gray-700'
        }`}>
        <ChevronRight className={`w-4 h-4 ${danger
          ? 'text-red-500 dark:text-red-400'
          : 'text-gray-400 dark:text-gray-500'
          }`} />
      </div>
    </button>
  )
}