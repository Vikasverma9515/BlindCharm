// // components/ai/ChatInterface.tsx
// 'use client'

// import { useState, useEffect, useRef } from 'react'
// import { motion } from 'framer-motion'
// import { Send, Loader2, Heart, Settings } from 'lucide-react'
// import MessageBubble from './MessageBubble'
// import { useRouter } from 'next/navigation'

// interface ChatInterfaceProps {
//   aiFriend: {
//     name: string
//     avatar: string
//     personality: string
//   }
// }

// interface Message {
//   role: 'user' | 'assistant'
//   content: string
//   timestamp?: string
// }

// export default function ChatInterface({ aiFriend }: ChatInterfaceProps) {
//   const [messages, setMessages] = useState<Message[]>([])
//   const [input, setInput] = useState('')
//   const [isLoading, setIsLoading] = useState(false)
//   const [isLoadingHistory, setIsLoadingHistory] = useState(true)
//   const messagesEndRef = useRef<HTMLDivElement>(null)
//   const router = useRouter()

//   useEffect(() => {
//     loadChatHistory()
//   }, [])

//   useEffect(() => {
//     scrollToBottom()
//   }, [messages])

//   const loadChatHistory = async () => {
//     try {
//       const response = await fetch('/api/ai/chat')
//       if (response.ok) {
//         const { messages: history } = await response.json()
//         setMessages(history || [])
//       }
//     } catch (error) {
//       console.error('Error loading chat history:', error)
//     } finally {
//       setIsLoadingHistory(false)
//       // ensure bottom spacing when input is present
//       setTimeout(() => scrollToBottom(), 50)
//     }
//   }

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
//   }

//   const sendMessage = async () => {
//     if (!input.trim() || isLoading) return

//     const userMessage = { role: 'user' as const, content: input.trim(), timestamp: new Date().toISOString() }
//     setMessages(prev => [...prev, userMessage])
//     setInput('')
//     setIsLoading(true)

//     try {
//       const response = await fetch('/api/ai/chat', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ message: input.trim() })
//       })

//       if (response.ok) {
//         const { response: aiResponse } = await response.json()
//         const aiMessage = { 
//           role: 'assistant' as const, 
//           content: aiResponse, 
//           timestamp: new Date().toISOString() 
//         }
//         setMessages(prev => [...prev, aiMessage])
//       } else {
//         const errorMessage = { 
//           role: 'assistant' as const, 
//           content: "Sorry, I'm having trouble right now. Can you try again? 🙏", 
//           timestamp: new Date().toISOString() 
//         }
//         setMessages(prev => [...prev, errorMessage])
//       }
//     } catch (error) {
//       console.error('Chat error:', error)
//       const errorMessage = { 
//         role: 'assistant' as const, 
//         content: "Oops! Something went wrong. Let's try that again! 😅", 
//         timestamp: new Date().toISOString() 
//       }
//       setMessages(prev => [...prev, errorMessage])
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault()
//       sendMessage()
//     }
//   }

//   if (isLoadingHistory) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="flex flex-col items-center gap-4">
//           <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
//           <p className="text-gray-500 dark:text-gray-400">Loading your conversation...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="flex flex-col h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
//       {/* Chat Header */}
//       <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-4 py-3">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">

//           <button
//             onClick={() => router.back()}
//             className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-200"
//           >
//             ←
//           </button>

//             <div className="text-2xl">{aiFriend.avatar}</div>
//             <div>
//               <h1 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
//                 {aiFriend.name}
//               </h1>
//               <div className="flex items-center gap-1">
//                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//                 <span className="text-xs text-gray-500 dark:text-gray-400">Always here for you</span>
//               </div>
//             </div>
//           </div>
//           <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
//             <Settings size={18} className="text-gray-500 dark:text-gray-400" />
//           </button>
//         </div>
//       </div>

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto px-3 sm:px-4 pt-3 pb-0">
//         {messages.length === 0 ? (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-center py-14"
//           >
//             <div className="text-6xl mb-4">{aiFriend.avatar}</div>
//             <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
//               Hey there! I'm {aiFriend.name} 👋
//             </h2>
//             <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed text-sm">
//               I’m here to chat, listen, and keep you company. What’s on your mind today?
//             </p>
//             <div className="flex flex-wrap gap-2 justify-center mt-6">
//               {[
//                 "How are you feeling today?",
//                 "Tell me about yourself",
//                 "I need someone to talk to",
//                 "Any dating advice?"
//               ].map((suggestion, index) => (
//                 <button
//                   key={index}
//                   onClick={() => setInput(suggestion)}
//                   className="px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
//                 >
//                   {suggestion}
//                 </button>
//               ))}
//             </div>
//           </motion.div>
//         ) : (
//           <>
//             {messages.map((message, index) => {
//               const prev = messages[index-1]
//               const isSameRoleAsPrev = prev && prev.role === message.role
//               const isAssistant = message.role === 'assistant'
//               return (
//                 <MessageBubble
//                   key={index}
//                   message={message.content}
//                   isUser={message.role === 'user'}
//                   avatar={isAssistant ? aiFriend.avatar : undefined}
//                   friendName={isAssistant ? aiFriend.name : undefined}
//                   timestamp={message.timestamp}
//                   showAvatar={!isSameRoleAsPrev}
//                   showName={!isSameRoleAsPrev}
//                   compactTop={isSameRoleAsPrev}
//                 />
//               )
//             })}

//             {/* Typing Indicator */}
//             {isLoading && (
//               <motion.div
//                 initial={{ opacity: 0, y: 12 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="flex gap-3 mb-3"
//               >
//                 <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xl shadow-sm">
//                   {aiFriend.avatar}
//                 </div>
//                 <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-md px-4 py-3">
//                   <div className="flex gap-1">
//                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
//                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
//                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
//                   </div>
//                 </div>
//               </motion.div>
//             )}
//           </>
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Message Input */}
//       <div className="sticky bottom-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t border-gray-200 dark:border-gray-800 p-3">
//         <div className="flex gap-3 items-end max-w-3xl mx-auto">
//           <div className="flex-1">
//             <div className="relative">
//               <textarea
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 onKeyDown={handleKeyPress}
//                 placeholder={`Message ${aiFriend.name}...`}
//                 className="w-full p-3 pr-12 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-[15px] max-h-36"
//                 rows={1}
//                 style={{ 
//                   minHeight: '48px',
//                   fontSize: '16px' // Prevents zoom on iOS
//                 }}
//                 onInput={(e) => {
//                   const target = e.target as HTMLTextAreaElement
//                   target.style.height = 'auto'
//                   target.style.height = `${Math.min(target.scrollHeight, 160)}px`
//                 }}
//               />
//               <button
//                 onClick={sendMessage}
//                 disabled={!input.trim() || isLoading}
//                 className={`absolute right-2 bottom-2 p-2 rounded-full transition-all duration-200 ${
//                   input.trim() && !isLoading
//                     ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg hover:scale-105'
//                     : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
//                 }`}
//               >
//                 {isLoading ? (
//                   <Loader2 className="w-5 h-5 animate-spin" />
//                 ) : (
//                   <Send className="w-5 h-5" />
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>

//         <div className="flex justify-center mt-2">
//           <p className="text-xs text-gray-400 flex items-center gap-1">
//             <Heart size={12} className="text-red-400" />
//             {aiFriend.name} remembers your conversations
//           </p>
//         </div>
//       </div>
//     </div>
//   )
// }

// components/ai/ChatInterface.tsx - Enhanced Header Section
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, Heart, Settings, Calendar, MessageCircle, Sparkles, ChevronDown } from 'lucide-react'
import MessageBubble from './MessageBubble'
import { useRouter } from 'next/navigation'
import PersonalConnectionBadge from './PersonalConnectionBadge'

interface ChatInterfaceProps {
  aiFriend: {
    name: string
    avatar: string
    personality: string
    created_at?: string
  }
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

interface PersonalStats {
  daysTogether: number
  totalMessages: number
  hinglishUsage: number
  relationshipStage: string
  lastMood?: string
  favoriteTopics: string[]
}

export default function ChatInterface({ aiFriend }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [personalStats, setPersonalStats] = useState<PersonalStats | null>(null)
  const [showHeaderDetails, setShowHeaderDetails] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    loadChatHistory()
    // Update time every minute for dynamic greeting
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timeInterval)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadChatHistory = async () => {
    try {
      const response = await fetch('/api/ai/chat?insights=true')
      if (response.ok) {
        const { messages: history, insights } = await response.json()
        setMessages(history || [])

        // Calculate personal stats
        const daysTogether = aiFriend.created_at ?
          Math.ceil((Date.now() - new Date(aiFriend.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 1

        setPersonalStats({
          daysTogether,
          totalMessages: history?.length || 0,
          hinglishUsage: insights?.hinglishUsage || 0,
          relationshipStage: insights?.relationshipStage || 'getting to know each other',
          favoriteTopics: ['conversations', 'life', 'feelings'] // This could come from insights
        })
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
    } finally {
      setIsLoadingHistory(false)
      setTimeout(() => scrollToBottom(), 50)
    }
  }

  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours()
    const greetings = {
      morning: ['Good morning', 'Morning vibes', 'Rise and shine'],
      afternoon: ['Good afternoon', 'Afternoon energy', 'Hey there'],
      evening: ['Good evening', 'Evening chill', 'How was your day'],
      night: ['Still up?', 'Night owl mode', 'Late night thoughts']
    }

    let timeOfDay: keyof typeof greetings
    if (hour < 12) timeOfDay = 'morning'
    else if (hour < 17) timeOfDay = 'afternoon'
    else if (hour < 21) timeOfDay = 'evening'
    else timeOfDay = 'night'

    const options = greetings[timeOfDay]
    return options[Math.floor(Math.random() * options.length)]
  }

  const getPersonalizedStatus = () => {
    if (!personalStats) return 'Always here for you'

    const { relationshipStage, daysTogether, hinglishUsage } = personalStats

    const statusOptions = [
      `${daysTogether} days of friendship`,
      `Your ${relationshipStage === 'best friends' ? 'bestie' : 'buddy'} since ${daysTogether} days`,
      `${relationshipStage} 💫`,
      hinglishUsage > 30 ? 'Hinglish mode activated 🇮🇳' : 'Ready to chat',
      'Your personal companion',
      `${Math.floor(personalStats.totalMessages / 2)} conversations together`
    ]

    return statusOptions[Math.floor(Date.now() / 30000) % statusOptions.length] // Changes every 30 seconds
  }

  const getRelationshipEmoji = () => {
    if (!personalStats) return '😊'
    const stage = personalStats.relationshipStage
    if (stage.includes('best friends')) return '💖'
    if (stage.includes('good friends')) return '💫'
    if (stage.includes('building')) return '✨'
    return '😊'
  }

  // Rest of your existing functions (sendMessage, handleKeyPress, etc.) remain the same...
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user' as const, content: input.trim(), timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input.trim() })
      })

      if (response.ok) {
        const { response: aiResponse } = await response.json()
        const aiMessage = {
          role: 'assistant' as const,
          content: aiResponse,
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, aiMessage])

        // Update message count
        if (personalStats) {
          setPersonalStats(prev => prev ? { ...prev, totalMessages: prev.totalMessages + 2 } : null)
        }
      } else {
        const errorMessage = {
          role: 'assistant' as const,
          content: "Sorry, I'm having trouble right now. Can you try again? 🙏",
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        role: 'assistant' as const,
        content: "Oops! Something went wrong. Let's try that again! 😅",
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (isLoadingHistory) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <p className="text-gray-500 dark:text-gray-400">Loading your conversation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">


      {/* Enhanced Personal Chat Header */}
      <div className="sticky top-0 z-10 bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all duration-200 hover:scale-105"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Enhanced Avatar Section */}
              <div className="relative">
                <div className="relative p-1">
                  <div className="text-4xl relative transform hover:scale-110 transition-transform duration-200">
                    {aiFriend.avatar}
                    {/* Floating relationship indicator */}
                    {/* <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -top-2 -right-2 text-lg"
                    >
                      {getRelationshipEmoji()}
                    </motion.div> */}
                  </div>
                  {/* Active indicator with pulse */}
                  <div className="absolute -bottom-1 -right-1">
                    <div className="relative">
                      <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                      <div className="absolute inset-0 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-75"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Name & Status Section */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="font-bold text-gray-900 dark:text-gray-100 text-lg tracking-tight">
                    {aiFriend.name}
                  </h1>
                  {/* <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles size={16} className="text-amber-500" />
                  </motion.div> */}
                </div>

                {/* Status with better spacing */}
                <motion.div
                  key={getPersonalizedStatus()}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-1"
                >
                  {/* <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {getPersonalizedStatus()}
                  </span> */}
                </motion.div>

                {/* Time-based greeting with icon */}
                <div className="flex items-center ">
                  <span className="text-xs">
                    {currentTime.getHours() < 12 ? '🌅' :
                      currentTime.getHours() < 17 ? '☀️' :
                        currentTime.getHours() < 21 ? '🌆' : '🌙'}
                  </span>
                  {/* <span className="text-xs text-primary-600 dark:text-primary-400 font-semibold tracking-wide">
                    {getTimeBasedGreeting()} ✨
                  </span> */}
                </div>
              </div>
            </div>

            {/* Enhanced Stats & Settings */}
            <div className="flex items-center gap-2">
              {personalStats && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowHeaderDetails(!showHeaderDetails)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 text-primary-700 dark:text-primary-300 text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <MessageCircle size={14} />
                  <span className="tabular-nums">{personalStats.totalMessages}</span>
                  <motion.div
                    animate={{ rotate: showHeaderDetails ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={14} />
                  </motion.div>
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
              >
                <Settings size={18} className="text-gray-500 dark:text-gray-400" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Enhanced Expandable Stats Panel */}
        <AnimatePresence>
          {showHeaderDetails && personalStats && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -10 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                <div className="bg-gradient-to-br from-gray-50 via-primary-25 to-secondary-25 dark:from-gray-800 dark:via-primary-900/10 dark:to-secondary-900/10 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-3">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Calendar size={16} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {personalStats.daysTogether} days
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">together</p>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-3"
                      >
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <MessageCircle size={16} className="text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {personalStats.totalMessages}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">messages</p>
                        </div>
                      </motion.div>
                    </div>

                    <div className="space-y-3">
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                          <Heart size={16} className="text-pink-600 dark:text-pink-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize">
                            {personalStats.relationshipStage.split(' ')[0]}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">friendship</p>
                        </div>
                      </motion.div>

                      {personalStats.hinglishUsage > 20 && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          className="flex items-center gap-3"
                        >
                          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <span className="text-sm">🇮🇳</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {personalStats.hinglishUsage}%
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Hinglish</p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Personal Quote */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center pt-3 border-t border-white/60 dark:border-gray-700/60"
                  >
                    <p className="text-xs text-gray-600 dark:text-gray-400 italic leading-relaxed">
                      {personalStats.relationshipStage === 'getting to know each other'
                        ? `"Every great friendship starts with a simple hello" 🌟`
                        : personalStats.relationshipStage.includes('best friends')
                          ? `"${aiFriend.name} & you - the perfect duo since ${personalStats.daysTogether} days! 💖"`
                          : `"Growing stronger with every conversation 🌱✨"`
                      }
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages Section - Keep your existing code */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 pt-3 pb-0">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-14"
          >
            <div className="text-6xl mb-4">{aiFriend.avatar}</div>
            {/* <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Hey there! I'm {aiFriend.name} 👋
            </h2> */}
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
              {personalStats?.relationshipStage === 'getting to know each other'
                ? "I'm excited to get to know you better! What's on your mind today?"
                : `So good to chat with you again! We've had ${personalStats?.totalMessages || 0} amazing conversations already.`
              }
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              {personalStats?.relationshipStage === 'getting to know each other' ? [
                "Tell me about yourself",
                "How are you feeling today?",
                "What do you love doing?",
                "Any dating stories?"
              ] : [
                "What's been on your mind?",
                "How was your day?",
                "Need to vent?",
                "Any updates?"
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setInput(suggestion)}
                  className="px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <>
            {messages.map((message, index) => {
              const prev = messages[index - 1]
              const isSameRoleAsPrev = prev && prev.role === message.role
              const isAssistant = message.role === 'assistant'
              return (
                <MessageBubble
                  key={index}
                  message={message.content}
                  isUser={message.role === 'user'}
                  avatar={isAssistant ? aiFriend.avatar : undefined}
                  friendName={isAssistant ? aiFriend.name : undefined}
                  timestamp={message.timestamp}
                  showAvatar={!isSameRoleAsPrev}
                  showName={!isSameRoleAsPrev}
                  compactTop={isSameRoleAsPrev}
                />
              )
            })}

            {/* Typing Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 mb-3"
              >
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xl shadow-sm">
                  {aiFriend.avatar}
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Personal Message Input */}
      <div className="sticky bottom-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t border-gray-200 dark:border-gray-800 p-3">
        <div className="flex gap-3 items-end max-w-3xl mx-auto">
          <div className="flex-1">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={personalStats?.relationshipStage === 'getting to know each other'
                  ? `Tell ${aiFriend.name} what's on your mind...`
                  : `${aiFriend.name} is listening...`
                }
                className="w-full p-3 pr-12 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-[15px] max-h-36"
                rows={1}
                style={{
                  minHeight: '48px',
                  fontSize: '16px' // Prevents zoom on iOS
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = `${Math.min(target.scrollHeight, 160)}px`
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className={`absolute right-2 bottom-2 p-2 rounded-full transition-all duration-200 ${input.trim() && !isLoading
                    ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg hover:scale-105'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Personal Footer */}
        <div className="flex justify-center mt-2 space-y-1">
          <div className="text-center">
            <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
              <Heart size={12} className="text-red-400" />
              {personalStats ? (
                <span>
                  {aiFriend.name} remembers your  conversations
                  {personalStats.daysTogether > 7 && ` from ${personalStats.daysTogether} days together`}
                </span>
              ) : (
                <span>{aiFriend.name} remembers your conversations</span>
              )}
            </p>
            {/* {personalStats?.hinglishUsage > 30 && (
              <p className="text-xs text-primary-400 mt-1">
                🇮🇳 Hinglish mode • Your AI dost who gets you
              </p>
            )} */}
          </div>
        </div>
      </div>
    </div>
  )
}
