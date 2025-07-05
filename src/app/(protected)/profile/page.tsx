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
import { signOut } from 'next-auth/react'

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
  } | string;
  photos: { url: string; is_primary: boolean }[];
  match_preferences: {
    age_range: [number, number];
    distance: number;
    height_range: [number, number];
  };
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

export default function ProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingSection, setEditingSection] = useState<string | null>(null)
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
        photos: Array.isArray(data.photos) ? data.photos : []
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

  const handleImageUpload = async (file: File) => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      // Delete old image if it exists
      if (profile?.profile_picture) {
        const oldFileName = profile.profile_picture.split('/').pop();
        if (oldFileName && !oldFileName.includes('default')) {
          await supabase.storage
            .from('profile-pictures')
            .remove([oldFileName]);
        }
      }

      // Always use a unique file name
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;

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
        .update({ profile_picture: publicUrl })
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
      
      <main className="min-h-screen pt-0 pb-0 md:pt-0 md:pb-0 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ">
        <div className="max-w-md mx-auto px-4 py-6 md:max-w-2xl md:pt-8">
          
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

          {/* Profile Completion Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500 rounded-full">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Profile Strength</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Complete your profile to get more matches</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{completionPercentage}%</div>
              </div>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-red-500 rounded-full"
              />
            </div>
          </motion.div>

          {/* Profile Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300"
          >
            {/* Cover Photo */}
            <div className="relative h-32 bg-black dark:bg-gray-900">
              <div className="absolute inset-0 bg-amber-400 dark:bg-amber-400"></div>
            </div>

            {/* Profile Info */}
            <div className="relative px-6 pb-6">
              {/* Profile Picture */}
              <div className="absolute -top-12 left-6">
                <ImageUpload
                  currentImage={profile.profile_picture}
                  onImageUpload={handleImageUpload}
                  loading={loading}
                />
              </div>

              {/* Name and Age */}
              <div className="pt-16">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {profile.full_name || 'Complete your profile'}
                      {profile.dob && (
                        <span className="text-xl font-normal text-gray-600 dark:text-gray-400 ml-2">
                          {getAge(profile.dob)}
                        </span>
                      )}
                    </h1>
                    {(typeof profile.location === 'string' ? profile.location : (profile.location && typeof profile.location === 'object' ? profile.location.city : false)) && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {typeof profile.location === 'string' 
                            ? profile.location 
                            : profile.location && typeof profile.location === 'object'
                              ? `${profile.location.city}${profile.location.country ? `, ${profile.location.country}` : ''}`
                              : ''
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Profile Sections */}
          <div className="space-y-4">
            
            {/* Basic Info Section */}
            <ProfileSection
              title="Basic Information"
              icon={<User className="w-5 h-5" />}
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
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={editForm.full_name || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={editForm.dob || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, dob: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
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
              isEditing={editingSection === 'about'}
              onEdit={() => setEditingSection('about')}
              onCancel={() => setEditingSection(null)}
              onSave={() => handleUpdate('bio', editForm.bio)}
              loading={loading}
            >
              {editingSection === 'about' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={editForm.bio || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    placeholder="Tell people about yourself..."
                  />
                </div>
              ) : (
                <p className="text-gray-700 leading-relaxed">
                  {profile.bio || 'Add a bio to tell people about yourself'}
                </p>
              )}
            </ProfileSection>

            {/* Work & Education Section */}
            <ProfileSection
              title="Work & Education"
              icon={<Briefcase className="w-5 h-5" />}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                    <input
                      type="text"
                      value={editForm.occupation || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, occupation: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="What do you do for work?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                    <input
                      type="text"
                      value={editForm.education || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, education: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Where did you study?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
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
              isEditing={editingSection === 'interests'}
              onEdit={() => setEditingSection('interests')}
              onCancel={() => setEditingSection(null)}
              onSave={() => handleUpdate('interests', editForm.interests || [])}
              loading={loading}
            >
              {editingSection === 'interests' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select your interests</label>
                  <div className="grid grid-cols-2 gap-2">
                    {INTERESTS_OPTIONS.map(interest => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleTagToggle('interests', interest, editForm.interests || [])}
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                          (editForm.interests || []).includes(interest)
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
                    <label className="block text-sm font-medium text-gray-700 mb-3">Personality traits</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PERSONALITY_TAGS.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagToggle('personality_tags', tag, editForm.personality_tags || [])}
                          className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                            (editForm.personality_tags || []).includes(tag)
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
                    <label className="block text-sm font-medium text-gray-700 mb-3">Lifestyle</label>
                    <div className="grid grid-cols-2 gap-2">
                      {LIFESTYLE_TAGS.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagToggle('lifestyle_tags', tag, editForm.lifestyle_tags || [])}
                          className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                            (editForm.lifestyle_tags || []).includes(tag)
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
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Personality</h4>
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
                        <p className="text-gray-500 text-sm">Add personality traits</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Lifestyle</h4>
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
                    <label className="block text-sm font-medium text-gray-700 mb-3">I'm looking for</label>
                    <div className="space-y-2">
                      {LOOKING_FOR_OPTIONS.map(option => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleTagToggle('looking_for', option, editForm.looking_for || [])}
                          className={`w-full px-4 py-3 rounded-xl text-left font-medium transition-all ${
                            (editForm.looking_for || []).includes(option)
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
                    <label className="block text-sm font-medium text-gray-700 mb-3">Deal breakers</label>
                    <div className="grid grid-cols-1 gap-2">
                      {DEALBREAKERS_OPTIONS.map(option => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleTagToggle('dealbreakers', option, editForm.dealbreakers || [])}
                          className={`px-3 py-2 rounded-xl text-sm font-medium transition-all text-left ${
                            (editForm.dealbreakers || []).includes(option)
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
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Looking for</h4>
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
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Deal breakers</h4>
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

            {/* Settings Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500 rounded-full text-white">
                    <Settings className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Settings & Privacy</h3>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Account Settings */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Account</h4>
                  <div className="space-y-2">
                    <SettingsItem
                      icon={<Bell className="w-5 h-5" />}
                      title="Notifications"
                      subtitle="Manage your notification preferences"
                      onClick={() => {/* TODO: Navigate to notifications */}}
                    />
                    <SettingsItem
                      icon={<Eye className="w-5 h-5" />}
                      title="Privacy Settings"
                      subtitle="Control who can see your profile"
                      onClick={() => {/* TODO: Navigate to privacy */}}
                    />
                    <SettingsItem
                      icon={<Shield className="w-5 h-5" />}
                      title="Safety & Security"
                      subtitle="Block users, report issues"
                      onClick={() => {/* TODO: Navigate to safety */}}
                    />
                  </div>
                </div>

                {/* App Settings */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">App Settings</h4>
                  <div className="space-y-2">
                    <ThemeToggle variant="settings" />
                    <SettingsItem
                      icon={<MessageCircle className="w-5 h-5" />}
                      title="Chat Settings"
                      subtitle="Message preferences and filters"
                      onClick={() => {/* TODO: Navigate to chat settings */}}
                    />
                    <SettingsItem
                      icon={<Heart className="w-5 h-5" />}
                      title="Match Preferences"
                      subtitle="Age range, distance, and more"
                      onClick={() => {/* TODO: Navigate to match preferences */}}
                    />
                  </div>
                </div>

                {/* Support */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Support</h4>
                  <div className="space-y-2">
                    <SettingsItem
                      icon={<HelpCircle className="w-5 h-5" />}
                      title="Help & Support"
                      subtitle="FAQs, contact us"
                      onClick={() => {/* TODO: Navigate to help */}}
                    />
                  </div>
                </div>

                {/* Danger Zone */}
                <div>
                  <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-3">Account Actions</h4>
                  <div className="space-y-2">
                    <SettingsItem
                      icon={<LogOut className="w-5 h-5" />}
                      title="Sign Out"
                      subtitle="Sign out of your account"
                      onClick={async () => {
                        try {
                          await signOut({ callbackUrl: '/login' })
                        } catch (error) {
                          console.error('Error signing out:', error)
                        }
                      }}
                      danger
                    />
                    <SettingsItem
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
                    />
                  </div>
                </div>
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
}

function ProfileSection({ title, icon, children, isEditing, onEdit, onCancel, onSave, loading }: ProfileSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300"
    >
      <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500 rounded-full text-white">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        </div>
        {!isEditing && (
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <Edit2 className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <div className="p-6">
        {children}
        
        {isEditing && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save
                </>
              )}
            </button>
          </div>
        )}
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
    <div className="flex justify-between items-center py-2">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-gray-900 dark:text-gray-100 font-medium">
        {value || <span className="text-gray-400 dark:text-gray-500 italic">Not set</span>}
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
      className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all hover:bg-gray-50 dark:hover:bg-gray-700 ${
        danger ? 'hover:bg-red-50 dark:hover:bg-red-900/20' : ''
      }`}
    >
      <div className={`p-2 rounded-full ${
        danger 
          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
      }`}>
        {icon}
      </div>
      <div className="flex-1 text-left">
        <h4 className={`font-medium ${
          danger 
            ? 'text-red-600 dark:text-red-400' 
            : 'text-gray-900 dark:text-gray-100'
        }`}>
          {title}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>
      <ChevronRight className={`w-5 h-5 ${
        danger 
          ? 'text-red-400 dark:text-red-500' 
          : 'text-gray-400 dark:text-gray-500'
      }`} />
    </button>
  )
}