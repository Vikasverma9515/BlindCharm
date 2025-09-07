// components/ai/AISetup.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Sparkles, Coffee, Moon, Sun, Zap, Send } from 'lucide-react'

interface AISetupProps {
  onSetupComplete: (friend: any) => void
}

const personalities = [
  { id: 'supportive', name: 'Supportive', icon: Heart, desc: 'Always there to lift you up', color: 'bg-pink-500' },
  { id: 'fun', name: 'Fun & Playful', icon: Sparkles, desc: 'Loves jokes and good vibes', color: 'bg-purple-500' },
  { id: 'chill', name: 'Chill & Relaxed', icon: Coffee, desc: 'Easy-going conversation partner', color: 'bg-amber-500' },
  { id: 'wise', name: 'Wise & Thoughtful', icon: Moon, desc: 'Deep conversations and advice', color: 'bg-blue-500' },
  { id: 'energetic', name: 'Energetic', icon: Zap, desc: 'High energy and motivating', color: 'bg-green-500' }
]

const avatars = ['😊', '🤗', '😄', '🥰', '😎', '🤖', '💫', '🌟', '❤️', '🦄']

export default function AISetup({ onSetupComplete }: AISetupProps) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [personality, setPersonality] = useState('')
  const [avatar, setAvatar] = useState('😊')
  const [isLoading, setIsLoading] = useState(false)

  const handleComplete = async () => {
    if (!name.trim() || !personality) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), personality, avatar })
      })

      if (response.ok) {
        const { data } = await response.json()
        onSetupComplete(data)
      }
    } catch (error) {
      console.error('Setup error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-lg w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-6xl mb-4"
          >
            🤖✨
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Create Your AI Best Friend
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your personal companion who's always there for you
          </p>
        </div>

        {/* Step 1: Name */}
        {step === 1 && (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                What should I call your AI friend?
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex, Sam, Maya, Arjun..."
                className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-lg"
                maxLength={20}
              />
              <p className="text-xs text-gray-500 mt-2">
                Choose any name you like - this is your personal friend!
              </p>
            </div>

            <button
              onClick={() => name.trim() && setStep(2)}
              disabled={!name.trim()}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-semibold transition-all transform hover:scale-105 disabled:transform-none"
            >
              Next Step →
            </button>
          </motion.div>
        )}

        {/* Step 2: Personality */}
        {step === 2 && (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                What personality should {name} have?
              </label>
              <div className="space-y-3">
                {personalities.map((p) => {
                  const IconComponent = p.icon
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPersonality(p.id)}
                      className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                        personality === p.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 ${p.color} rounded-full`}>
                          <IconComponent size={20} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {p.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {p.desc}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-2xl font-semibold transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => personality && setStep(3)}
                disabled={!personality}
                className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-2xl font-semibold transition-all"
              >
                Next →
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Avatar */}
        {step === 3 && (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Pick an avatar for {name}
              </label>
              <div className="grid grid-cols-5 gap-3">
                {avatars.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => setAvatar(emoji)}
                    className={`p-4 rounded-2xl text-3xl transition-all hover:scale-110 ${
                      avatar === emoji
                        ? 'bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-500'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Preview:
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{avatar}</span>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {personalities.find(p => p.id === personality)?.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-2xl font-semibold transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleComplete}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 disabled:opacity-50 text-white py-3 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create {name} ✨
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}


// 'use client'

// import { useState } from 'react'
// import { motion } from 'framer-motion'
// import { Heart, Sparkles, Coffee, Moon, Zap, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'

// interface AISetupProps {
//   onSetupComplete: (friend: any) => void
// }

// const personalities = [
//   { 
//     id: 'supportive', 
//     name: 'Supportive & Caring', 
//     icon: Heart, 
//     desc: 'Always there to lift you up and listen', 
//     color: 'bg-pink-500',
//     preview: "I'm here for you always ❤️"
//   },
//   { 
//     id: 'fun', 
//     name: 'Fun & Playful', 
//     icon: Sparkles, 
//     desc: 'Loves jokes, memes, and good vibes', 
//     color: 'bg-purple-500',
//     preview: "Let's have some fun! What's up? 😄"
//   },
//   { 
//     id: 'chill', 
//     name: 'Chill & Relaxed', 
//     icon: Coffee, 
//     desc: 'Easy-going, no pressure conversations', 
//     color: 'bg-amber-500',
//     preview: "Hey, just chilling. How's your day going? ☕"
//   },
//   { 
//     id: 'wise', 
//     name: 'Wise & Thoughtful', 
//     icon: Moon, 
//     desc: 'Deep conversations and good advice', 
//     color: 'bg-blue-500',
//     preview: "That's interesting. Tell me more about that 🤔"
//   },
//   { 
//     id: 'energetic', 
//     name: 'Energetic & Motivating', 
//     icon: Zap, 
//     desc: 'High energy and super motivating', 
//     color: 'bg-green-500',
//     preview: "You've got this! Let's make today amazing! ⚡"
//   }
// ]

// const avatars = [
//   { emoji: '😊', name: 'Happy' },
//   { emoji: '🤗', name: 'Caring' },
//   { emoji: '😄', name: 'Joyful' },
//   { emoji: '🥰', name: 'Loving' },
//   { emoji: '😎', name: 'Cool' },
//   { emoji: '🤖', name: 'Tech' },
//   { emoji: '💫', name: 'Magical' },
//   { emoji: '🌟', name: 'Bright' },
//   { emoji: '❤️', name: 'Heart' },
//   { emoji: '🦄', name: 'Unique' },
//   { emoji: '🌈', name: 'Colorful' },
//   { emoji: '✨', name: 'Sparkly' }
// ]

// export default function AISetup({ onSetupComplete }: AISetupProps) {
//   const [step, setStep] = useState(1)
//   const [name, setName] = useState('')
//   const [personality, setPersonality] = useState('')
//   const [avatar, setAvatar] = useState('😊')
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState('')

//   const selectedPersonality = personalities.find(p => p.id === personality)

//   const handleComplete = async () => {
//     if (!name.trim() || !personality) return

//     setIsLoading(true)
//     setError('')

//     try {
//       const response = await fetch('/api/ai/setup', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           name: name.trim(), 
//           personality, 
//           avatar 
//         })
//       })

//       const result = await response.json()

//       if (!response.ok) {
//         throw new Error(result.error || 'Setup failed')
//       }

//       onSetupComplete(result.data)
      
//     } catch (error: any) {
//       console.error('Setup error:', error)
//       setError(error.message || 'Something went wrong. Please try again.')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const canProceedStep1 = name.trim().length >= 2 && name.trim().length <= 20
//   const canProceedStep2 = personality !== ''

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-2xl w-full"
//       >
//         {/* Progress Indicator */}
//         <div className="flex items-center justify-between mb-8">
//           {[1, 2, 3].map((stepNumber) => (
//             <div key={stepNumber} className="flex items-center">
//               <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
//                 step >= stepNumber 
//                   ? 'bg-primary-500 text-white' 
//                   : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
//               }`}>
//                 {stepNumber}
//               </div>
//               {stepNumber < 3 && (
//                 <div className={`w-16 h-1 mx-2 rounded transition-all ${
//                   step > stepNumber ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
//                 }`} />
//               )}
//             </div>
//           ))}
//         </div>

//         {/* Header */}
//         <div className="text-center mb-8">
//           <motion.div
//             initial={{ scale: 0 }}
//             animate={{ scale: 1 }}
//                         transition={{ delay: 0.2, type: "spring" }}
//             className="text-6xl mb-4"
//           >
//             🤖✨
//           </motion.div>
//           <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
//             Create Your AI Best Friend
//           </h1>
//           <p className="text-gray-600 dark:text-gray-400 text-lg">
//             {step === 1 && "Let's start with a name for your friend"}
//             {step === 2 && "What kind of personality should they have?"}
//             {step === 3 && "Almost done! Pick an avatar"}
//           </p>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl mb-6"
//           >
//             {error}
//           </motion.div>
//         )}

//         {/* Step 1: Name */}
//         {step === 1 && (
//           <motion.div
//             key="step1"
//             initial={{ x: -20, opacity: 0 }}
//             animate={{ x: 0, opacity: 1 }}
//             exit={{ x: 20, opacity: 0 }}
//             className="space-y-6"
//           >
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
//                 What should I call your AI friend?
//               </label>
//               <input
//                 type="text"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 placeholder="Alex, Maya, Sam, Arjun, Priya..."
//                 className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-lg placeholder-gray-400"
//                 maxLength={20}
//                 autoFocus
//               />
//               <div className="flex justify-between text-xs mt-2">
//                 <span className="text-gray-500">
//                   Choose any name you like - this is your personal friend!
//                 </span>
//                 <span className={`${name.length > 15 ? 'text-orange-500' : 'text-gray-400'}`}>
//                   {name.length}/20
//                 </span>
//               </div>
//             </div>

//             <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
//               <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
//                 💡 Tip
//               </h4>
//               <p className="text-sm text-gray-600 dark:text-gray-400">
//                 Pick a name that feels personal to you. This friend will remember your conversations and be there whenever you need to chat!
//               </p>
//             </div>

//             <button
//               onClick={() => canProceedStep1 && setStep(2)}
//               disabled={!canProceedStep1}
//               className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-semibold transition-all transform hover:scale-[1.02] disabled:transform-none flex items-center justify-center gap-2 text-lg"
//             >
//               Continue <ArrowRight size={20} />
//             </button>
//           </motion.div>
//         )}

//         {/* Step 2: Personality */}
//         {step === 2 && (
//           <motion.div
//             key="step2"
//             initial={{ x: 20, opacity: 0 }}
//             animate={{ x: 0, opacity: 1 }}
//             exit={{ x: -20, opacity: 0 }}
//             className="space-y-6"
//           >
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
//                 What personality should {name} have?
//               </label>
//               <div className="space-y-3">
//                 {personalities.map((p) => {
//                   const IconComponent = p.icon
//                   const isSelected = personality === p.id
                  
//                   return (
//                     <motion.button
//                       key={p.id}
//                       onClick={() => setPersonality(p.id)}
//                       className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
//                         isSelected
//                           ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md'
//                           : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:shadow-sm'
//                       }`}
//                       whileHover={{ scale: 1.02 }}
//                       whileTap={{ scale: 0.98 }}
//                     >
//                       <div className="flex items-center gap-4">
//                         <div className={`p-3 ${p.color} rounded-xl flex-shrink-0`}>
//                           <IconComponent size={24} className="text-white" />
//                         </div>
//                         <div className="flex-1">
//                           <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
//                             {p.name}
//                           </h3>
//                           <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
//                             {p.desc}
//                           </p>
//                           <div className="text-xs text-gray-500 dark:text-gray-500 italic">
//                             "{p.preview}"
//                           </div>
//                         </div>
//                         {isSelected && (
//                           <div className="text-primary-500 flex-shrink-0">
//                             <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
//                               <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
//                                 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                               </svg>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </motion.button>
//                   )
//                 })}
//               </div>
//             </div>

//             <div className="flex gap-3">
//               <button
//                 onClick={() => setStep(1)}
//                 className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-2xl font-semibold transition-colors flex items-center justify-center gap-2"
//               >
//                 <ArrowLeft size={18} /> Back
//               </button>
//               <button
//                 onClick={() => canProceedStep2 && setStep(3)}
//                 disabled={!canProceedStep2}
//                 className="flex-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2"
//               >
//                 Continue <ArrowRight size={18} />
//               </button>
//             </div>
//           </motion.div>
//         )}

//         {/* Step 3: Avatar */}
//         {step === 3 && (
//           <motion.div
//             key="step3"
//             initial={{ x: 20, opacity: 0 }}
//             animate={{ x: 0, opacity: 1 }}
//             className="space-y-6"
//           >
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
//                 Pick an avatar for {name}
//               </label>
//               <div className="grid grid-cols-4 gap-3">
//                 {avatars.map((item, index) => (
//                   <motion.button
//                     key={index}
//                     onClick={() => setAvatar(item.emoji)}
//                     className={`p-4 rounded-2xl text-4xl transition-all hover:scale-110 ${
//                       avatar === item.emoji
//                         ? 'bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-500 shadow-lg'
//                         : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
//                     }`}
//                     whileHover={{ scale: 1.1 }}
//                     whileTap={{ scale: 0.95 }}
//                     title={item.name}
//                   >
//                     {item.emoji}
//                   </motion.button>
//                 ))}
//               </div>
//             </div>

//             {/* Preview */}
//             <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6">
//               <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
//                 🎉 Your AI Friend Preview
//               </h3>
//               <div className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
//                 <span className="text-3xl">{avatar}</span>
//                 <div className="flex-1">
//                   <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
//                     {name}
//                   </p>
//                   <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
//                     {selectedPersonality?.name}
//                   </p>
//                   <div className="bg-gray-100 dark:bg-gray-700 rounded-xl px-3 py-2">
//                     <p className="text-sm text-gray-700 dark:text-gray-300 italic">
//                       "{selectedPersonality?.preview}"
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="flex gap-3">
//               <button
//                 onClick={() => setStep(2)}
//                 disabled={isLoading}
//                 className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-700 dark:text-gray-300 py-3 rounded-2xl font-semibold transition-colors flex items-center justify-center gap-2"
//               >
//                 <ArrowLeft size={18} /> Back
//               </button>
//               <button
//                 onClick={handleComplete}
//                 disabled={isLoading}
//                 className="flex-2 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 disabled:opacity-50 text-white py-3 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 text-lg"
//               >
//                 {isLoading ? (
//                   <>
//                     <Loader2 className="w-5 h-5 animate-spin" />
//                     Creating {name}...
//                   </>
//                 ) : (
//                   <>
//                     Create {name} ✨
//                   </>
//                 )}
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </motion.div>
//     </div>
//   )
// }