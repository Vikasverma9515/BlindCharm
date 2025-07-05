'use client'

import { useState, useEffect } from 'react'
import '@/styles/onboarding.css'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  MapPin, 
  Heart, 
  User, 
  Briefcase, 
  GraduationCap,
  Calendar,
  Ruler,
  Camera,
  Sparkles,
  Check,
  AlertCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
// import ImageUpload from '@/components/profile/ImageUpload'

interface OnboardingData {
  full_name: string
  dob: string
  gender: 'male' | 'female' | 'other'
  height: number
  bio: string
  occupation: string
  education: string
  interests: string[]
  personality_tags: string[]
  lifestyle_tags: string[]
  looking_for: string[]
  dealbreakers: string[]
  city: string
  country: string
  profile_picture: string | null
}

const INTERESTS_OPTIONS = [
  'Travel', 'Photography', 'Music', 'Movies', 'Reading', 'Cooking', 'Fitness', 'Yoga',
  'Dancing', 'Art', 'Gaming', 'Sports', 'Hiking', 'Swimming', 'Running', 'Cycling',
  'Fashion', 'Technology', 'Science', 'History', 'Politics', 'Philosophy', 'Psychology',
  'Meditation', 'Volunteering', 'Animals', 'Nature', 'Adventure', 'Comedy', 'Wine'
]

const PERSONALITY_TAGS = [
  'Adventurous', 'Ambitious', 'Caring', 'Creative', 'Funny', 'Honest', 'Intelligent',
  'Kind', 'Loyal', 'Optimistic', 'Passionate', 'Patient', 'Romantic', 'Spontaneous',
  'Thoughtful', 'Confident', 'Empathetic', 'Independent', 'Outgoing', 'Reliable'
]

const LIFESTYLE_TAGS = [
  'Active', 'Relaxed', 'Social', 'Homebody', 'Night Owl', 'Early Bird', 'Foodie',
  'Health Conscious', 'Spiritual', 'Career Focused', 'Family Oriented', 'Pet Lover',
  'Minimalist', 'Maximalist', 'Eco Friendly', 'Tech Savvy', 'Artistic', 'Athletic'
]

const LOOKING_FOR_OPTIONS = [
  'Long-term relationship', 'Casual dating', 'New friends', 'Something casual',
  'Marriage', 'Life partner', 'Fun dates', 'Serious relationship'
]

const DEALBREAKER_OPTIONS = [
  'Smoking', 'Drinking heavily', 'Drug use', 'No job', 'Lives with parents',
  'Has children', 'Wants children', 'Different religion', 'Different politics',
  'Long distance', 'Age gap (>10 years)', 'No education', 'Bad hygiene',
  'Rude to service staff', 'Always on phone', 'No ambition', 'Dishonesty',
  'Jealousy/possessiveness', 'No sense of humor', 'Different life goals'
]

const steps = [
  { id: 'welcome', title: 'Welcome!', icon: Sparkles },
  { id: 'basic', title: 'Basic Info', icon: User },
  { id: 'photo', title: 'Add Photo', icon: Camera },
  { id: 'bio', title: 'About You', icon: Heart },
  { id: 'interests', title: 'Interests', icon: Heart },
  { id: 'personality', title: 'Personality', icon: Sparkles },
  { id: 'lifestyle', title: 'Lifestyle', icon: MapPin },
  { id: 'looking', title: 'Looking For', icon: Heart },
  { id: 'dealbreakers', title: 'Deal Breakers', icon: AlertCircle },
  { id: 'complete', title: 'Complete!', icon: Check }
]

export default function ProfileOnboarding() {
  const { data: session } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    full_name: '',
    dob: '',
    gender: 'male',
    height: 170,
    bio: '',
    occupation: '',
    education: '',
    interests: [],
    personality_tags: [],
    lifestyle_tags: [],
    looking_for: [],
    dealbreakers: [],
    city: '',
    country: '',
    profile_picture: null
  })

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleComplete = async () => {
    if (!session?.user?.id) return
    
    setLoading(true)
    try {
      // Format location as string
      const location = data.city && data.country 
        ? `${data.city}, ${data.country}`
        : data.city || data.country || ''

      const { city, country, ...profileData } = data
      
      const { error } = await supabase
        .from('users')
        .update({
          ...profileData,
          location,
          profile_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id)

      if (error) throw error
      
      router.push('/lobby')
    } catch (error) {
      console.error('Error completing profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!session?.user?.id) return

    try {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`

      console.log('Uploading file:', fileName, 'Size:', file.size)

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        alert('Failed to upload image. Please try again.')
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName)

      console.log('Image uploaded successfully:', publicUrl)
      updateData('profile_picture', publicUrl)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    }
  }

  const renderStep = () => {
    const step = steps[currentStep]

    switch (step.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6 ">
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              {/* <Sparkles className="w-12 h-12 text-white" /> */}
             <img 
                src="/logo2.png" 
                alt="BlindCharm Logo" 
                className="h-8 w-auto"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to BlindCharm!</h2>
              <p className="text-gray-600 text-lg">Let's set up your profile to find your perfect match</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 text-sm">
                ✨ Your profile will remain hidden until you both choose to reveal. 
                This creates authentic connections based on personality first!
              </p>
            </div>
          </div>
        )

      case 'basic':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about yourself</h2>
              <p className="text-gray-600">Basic information to get started</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={data.full_name}
                  onChange={(e) => updateData('full_name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent "
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={data.dob}
                  onChange={(e) => updateData('dob', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <div className="grid grid-cols-3 gap-3">
                  {['male', 'female', 'other'].map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => updateData('gender', gender)}
                      className={`py-3 px-4 rounded-lg border-2 transition-colors ${
                        data.gender === gender
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height: {data.height} cm
                </label>
                <input
                  type="range"
                  min="140"
                  max="220"
                  value={data.height}
                  onChange={(e) => updateData('height', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>
        )

      case 'photo':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Add your best photo</h2>
              <p className="text-gray-600">This will be revealed when you both choose to connect</p>
            </div>
            
            <div className="flex justify-center">
              <div className="relative">
                {data.profile_picture ? (
                  <div className="relative">
                    <img
                      src={data.profile_picture}
                      alt="Profile"
                      className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <button
                      onClick={() => updateData('profile_picture', null)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-48 h-48 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">Add Photo</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleImageUpload(file)
                  }
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
              />
            </div>
          </div>
        )

      case 'bio':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell your story</h2>
              <p className="text-gray-600">Share what makes you unique</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={data.bio}
                  onChange={(e) => updateData('bio', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  placeholder="Tell us about yourself, your passions, what makes you laugh..."
                />
                <p className="text-sm text-gray-500 mt-1">{data.bio.length}/500 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                <input
                  type="text"
                  value={data.occupation}
                  onChange={(e) => updateData('occupation', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="What do you do for work?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                <input
                  type="text"
                  value={data.education}
                  onChange={(e) => updateData('education', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Your educational background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={data.city}
                    onChange={(e) => updateData('city', e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    value={data.country}
                    onChange={(e) => updateData('country', e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 'interests':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What are you into?</h2>
              <p className="text-gray-600">Select your interests (choose at least 3)</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {INTERESTS_OPTIONS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => {
                    const newInterests = data.interests.includes(interest)
                      ? data.interests.filter(i => i !== interest)
                      : [...data.interests, interest]
                    updateData('interests', newInterests)
                  }}
                  className={`px-4 py-2 rounded-full border-2 transition-colors ${
                    data.interests.includes(interest)
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
            
            <p className="text-center text-sm text-gray-500">
              Selected: {data.interests.length} interests
            </p>
          </div>
        )

      case 'personality':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Describe your personality</h2>
              <p className="text-gray-600">Pick traits that describe you best</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {PERSONALITY_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const newTags = data.personality_tags.includes(tag)
                      ? data.personality_tags.filter(t => t !== tag)
                      : [...data.personality_tags, tag]
                    updateData('personality_tags', newTags)
                  }}
                  className={`px-4 py-2 rounded-full border-2 transition-colors ${
                    data.personality_tags.includes(tag)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )

      case 'lifestyle':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your lifestyle</h2>
              <p className="text-gray-600">How do you like to spend your time?</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {LIFESTYLE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const newTags = data.lifestyle_tags.includes(tag)
                      ? data.lifestyle_tags.filter(t => t !== tag)
                      : [...data.lifestyle_tags, tag]
                    updateData('lifestyle_tags', newTags)
                  }}
                  className={`px-4 py-2 rounded-full border-2 transition-colors ${
                    data.lifestyle_tags.includes(tag)
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )

      case 'looking':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What are you looking for?</h2>
              <p className="text-gray-600">Help us find your perfect match</p>
            </div>
            
            <div className="space-y-3">
              {LOOKING_FOR_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    const newLooking = data.looking_for.includes(option)
                      ? data.looking_for.filter(l => l !== option)
                      : [...data.looking_for, option]
                    updateData('looking_for', newLooking)
                  }}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                    data.looking_for.includes(option)
                      ? 'border-pink-500 bg-pink-50 text-pink-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )

      case 'dealbreakers':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What are your deal breakers?</h2>
              <p className="text-gray-600">Select things that would be absolute no-gos for you</p>
            </div>
            
            <div className="space-y-3">
              {DEALBREAKER_OPTIONS.map((dealbreaker) => (
                <button
                  key={dealbreaker}
                  type="button"
                  onClick={() => {
                    const newDealbreakers = data.dealbreakers.includes(dealbreaker)
                      ? data.dealbreakers.filter(d => d !== dealbreaker)
                      : [...data.dealbreakers, dealbreaker]
                    updateData('dealbreakers', newDealbreakers)
                  }}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                    data.dealbreakers.includes(dealbreaker)
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{dealbreaker}</span>
                    {data.dealbreakers.includes(dealbreaker) && (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 text-sm">
                💡 <strong>Tip:</strong> Being clear about your deal breakers helps us find more compatible matches for you.
              </p>
            </div>
          </div>
        )

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">You're all set!</h2>
              <p className="text-gray-600 text-lg">Your profile is complete and ready to find matches</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                🎉 Welcome to BlindCharm! Start exploring and find your perfect match.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const canProceed = () => {
    const step = steps[currentStep]
    
    switch (step.id) {
      case 'welcome':
        return true
      case 'basic':
        return data.full_name && data.dob && data.gender && data.height
      case 'photo':
        return true // Photo is optional
      case 'bio':
        return data.bio && data.occupation && data.education && data.city && data.country
      case 'interests':
        return data.interests.length >= 3
      case 'personality':
        return data.personality_tags.length >= 2
      case 'lifestyle':
        return data.lifestyle_tags.length >= 2
      case 'looking':
        return data.looking_for.length >= 1
      case 'dealbreakers':
        return true // Deal breakers are optional
      case 'complete':
        return true
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-3 rounded-lg hover:from-red-600 hover:to-pink-600 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>{loading ? 'Completing...' : 'Complete Profile'}</span>
              </button>
            ) : (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className={`flex items-center space-x-2 px-8 py-3 rounded-lg transition-colors ${
                  canProceed()
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}