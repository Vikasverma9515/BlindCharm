# Profile Onboarding Setup Instructions

## 🚀 Quick Setup

To enable the profile onboarding flow for new users, you need to add a `profile_completed` field to your users table.

### Step 1: Add Database Field

Go to your **Supabase SQL Editor** and run this command:

```sql
-- Add profile_completed field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- Update existing users who have completed basic profile info
UPDATE users 
SET profile_completed = TRUE 
WHERE full_name IS NOT NULL 
  AND full_name != '' 
  AND bio IS NOT NULL 
  AND bio != ''
  AND interests IS NOT NULL 
  AND array_length(interests, 1) > 0;

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_users_profile_completed ON users(profile_completed);
```

### Step 2: Test the Flow

1. **Create a new user account** (register)
2. **You should be automatically redirected** to the onboarding flow at `/profile/setup`
3. **Complete all 9 steps** of the onboarding process
4. **You'll be redirected to the lobby** once complete

### Step 3: Verify Existing Users

Existing users with complete profiles will be automatically marked as `profile_completed = true` and won't see the onboarding flow.

## 🎨 Onboarding Flow Features

### 10 Engaging Steps:
1. **Welcome** - Introduction to BlindCharm
2. **Basic Info** - Name, age, gender, height
3. **Photo Upload** - Profile picture
4. **About You** - Bio, work, education, location
5. **Interests** - Select from 30+ options
6. **Personality** - Choose personality traits
7. **Lifestyle** - Lifestyle preferences
8. **Looking For** - Relationship goals
9. **Deal Breakers** - Absolute no-gos and preferences
10. **Complete** - Success and redirect

### Features:
- ✨ **Smooth animations** with Framer Motion
- 📱 **Fully responsive** design
- 🎯 **Step validation** to ensure quality profiles
- 🎨 **Beautiful gradients** and modern UI
- 📊 **Progress tracking** with completion percentage
- 🏷️ **Interactive tag selection** for interests/personality
- 📏 **Custom slider** for height selection

## 🔧 Customization

You can customize the onboarding by editing:
- **Interests**: `INTERESTS_OPTIONS` in `ProfileOnboarding.tsx`
- **Personality Tags**: `PERSONALITY_TAGS` in `ProfileOnboarding.tsx`
- **Lifestyle Tags**: `LIFESTYLE_TAGS` in `ProfileOnboarding.tsx`
- **Relationship Goals**: `LOOKING_FOR_OPTIONS` in `ProfileOnboarding.tsx`
- **Styling**: Update Tailwind classes or add custom CSS

## 🐛 Troubleshooting

If users aren't being redirected to onboarding:

1. **Check database**: Ensure the `profile_completed` field exists
2. **Check console**: Look for any errors in browser console
3. **Verify session**: Make sure NextAuth session includes user ID
4. **Test manually**: Navigate to `/profile/setup` directly

The system will gracefully handle cases where the `profile_completed` field doesn't exist by checking if users have basic profile information.

## 🎉 That's it!

Your profile onboarding system is now ready! New users will get a beautiful, step-by-step experience to complete their profiles before they can start matching. 🚀