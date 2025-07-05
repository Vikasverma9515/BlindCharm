// src/components/lobby/ReelStyleLobby.tsx
'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase'
import { useLobby } from '@/contexts/LobbyContext'
import { Clock, Users, MessageCircle, Heart, Zap, Send, User as UserIcon } from 'lucide-react'

interface ReelStyleLobbyProps {
  lobbyId: string
}

interface Message {
  id: string
  content: string
  user_id: string
  lobby_id: string
  created_at: string
  username?: string
  user?: {
    id: string
    username: string
    profile_picture: string | null
    gender: string
  }
}

interface User {
  id: string
  username: string
  profile_picture: string | null
  gender: string
}

export default function ReelStyleLobby({ lobbyId }: ReelStyleLobbyProps) {
  const { data: session } = useSession()
  const { participants, timeLeft, status } = useLobby()
  const [currentSection, setCurrentSection] = useState<'chat' | 'info'>('chat')
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Validate lobbyId
  if (!lobbyId || lobbyId === 'undefined' || lobbyId === 'null') {
    return (
      <div className="h-screen bg-red-600 dark:bg-red-800 flex items-center justify-center transition-colors duration-300">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Invalid Lobby</h1>
          <p>The lobby ID is invalid or missing.</p>
        </div>
      </div>
    )
  }

  // Current user for chat
  const currentUser: User | null = session?.user ? {
    id: session.user.id,
    username: session.user.name || session.user.email?.split('@')[0] || 'Anonymous',
    profile_picture: (session.user as any).image || null,
    gender: 'other'
  } : null

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Generate user colors based on user ID
  const getUserColor = useCallback((userId: string) => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-green-400 to-green-600', 
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-yellow-400 to-yellow-600',
      'from-indigo-400 to-indigo-600',
      'from-red-400 to-red-600',
      'from-teal-400 to-teal-600'
    ]
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    return colors[index]
  }, [])

  useEffect(() => {
    if (!lobbyId || !currentUser?.id) return

    // Fetch initial messages with user info
    fetchMessages()

    // Subscribe to new messages
    const channel = supabase
      .channel(`lobby_messages_${lobbyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lobby_messages',
          filter: `lobby_id=eq.${lobbyId}`
        },
        async (payload) => {
          const newMsg = payload.new
          
          // Fetch user info for the new message
          const { data: userData } = await supabase
            .from('users')
            .select('username, profile_picture')
            .eq('id', newMsg.user_id)
            .single()

          setMessages(prev => {
            if (prev.some(msg => msg.id === newMsg.id)) return prev
            const message: Message = {
              id: newMsg.id,
              content: newMsg.content,
              user_id: newMsg.user_id,
              lobby_id: newMsg.lobby_id,
              created_at: newMsg.created_at,
              username: userData?.username || 'Anonymous',
              user: {
                id: newMsg.user_id,
                username: userData?.username || 'Anonymous',
                profile_picture: userData?.profile_picture || null,
                gender: 'other'
              }
            }
            return [...prev, message]
          })
          setTimeout(scrollToBottom, 100)
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [lobbyId, currentUser?.id, scrollToBottom])

  const fetchMessages = async () => {
    if (!lobbyId) return
    
    try {
      const { data, error } = await supabase
        .from('lobby_messages')
        .select(`
          id,
          content,
          user_id,
          lobby_id,
          created_at,
          username,
          users!lobby_messages_user_id_fkey (
            username,
            profile_picture
          )
        `)
        .eq('lobby_id', lobbyId)
        .order('created_at', { ascending: true })
        .limit(50)

      if (error) throw error

      const transformedMessages = (data || []).map(m => ({
        id: m.id,
        content: m.content,
        user_id: m.user_id,
        lobby_id: m.lobby_id,
        created_at: m.created_at,
        username: m.username || (m.users as any)?.username || 'Anonymous',
        user: {
          id: m.user_id,
          username: m.username || (m.users as any)?.username || 'Anonymous',
          profile_picture: (m.users as any)?.profile_picture || null,
          gender: 'other' as const
        }
      }))

      setMessages(transformedMessages)
      setTimeout(scrollToBottom, 100)
    } catch (err) {
      console.error('Error fetching messages:', err)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser?.id || !newMessage.trim() || sending || !lobbyId) return

    setSending(true)
    try {
      const { error } = await supabase
        .from('lobby_messages')
        .insert({
          lobby_id: lobbyId,
          user_id: currentUser.id,
          content: newMessage.trim(),
          username: currentUser.username
        })

      if (error) throw error
      setNewMessage('')
    } catch (err) {
      console.error('Error sending message:', err)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="h-screen bg-slate-900 dark:bg-gray-900 flex flex-col transition-colors duration-300">
      {/* Header with Section Toggle */}
      <div className="bg-black/20 dark:bg-gray-800/50 backdrop-blur-sm border-b border-white/10 dark:border-gray-700/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white dark:text-gray-100">Lobby Chat</h1>
          </div>
          
          {/* Section Toggle */}
          <div className="flex bg-white/10 dark:bg-gray-700/50 rounded-full p-1 border border-white/20 dark:border-gray-600/50">
            <button
              onClick={() => setCurrentSection('chat')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                currentSection === 'chat'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <MessageCircle className="w-4 h-4 inline mr-2" />
              Chat
            </button>
            <button
              onClick={() => setCurrentSection('info')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                currentSection === 'info'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Info
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentSection === 'chat' ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col"
            >
              {/* Chat Header */}
              <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 px-6 py-4">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-semibold text-white">Group Chat</h2>
                  <div className="ml-auto flex items-center gap-3">
                    <span className="text-xs text-white/60 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                      {messages.length} messages
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-white/60">{participants.length} online</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {!currentUser ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                      <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Please log in to chat</h3>
                    <p className="text-white/60 text-sm max-w-sm px-4">
                      You need to be logged in to participate in the group chat.
                    </p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                      <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Start the conversation!</h3>
                    <p className="text-white/60 text-sm max-w-sm px-4">
                      Break the ice and get to know each other before matching!
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => {
                      const isOwnMessage = message.user_id === currentUser?.id
                      const username = message.username || message.user?.username || 'Anonymous'
                      
                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          {/* User Avatar */}
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getUserColor(message.user_id)} flex items-center justify-center flex-shrink-0 mt-1`}>
                            <span className="text-white text-xs font-bold">
                              {username[0]?.toUpperCase() || 'A'}
                            </span>
                          </div>
                          
                          {/* Message Content */}
                          <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                            {/* Username and Time */}
                            <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                              <span className="text-xs font-medium text-white/80">
                                {isOwnMessage ? 'You' : username}
                              </span>
                              <span className="text-xs text-white/50">
                                {new Date(message.created_at).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                            
                            {/* Message Bubble */}
                            <div className={`rounded-2xl px-4 py-3 ${
                              isOwnMessage 
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-md' 
                                : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-bl-md'
                            }`}>
                              <p className="break-words leading-relaxed text-sm">{message.content}</p>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              {currentUser && (
                <div className="p-4 bg-black/20 backdrop-blur-sm border-t border-white/10">
                  <form onSubmit={sendMessage} className="flex gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="w-full rounded-full border border-white/20 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/10 backdrop-blur-sm transition-all duration-200 text-base text-white placeholder-white/50"
                        disabled={sending}
                        maxLength={500}
                        style={{ fontSize: '16px' }}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-white/40">
                        {newMessage.length}/500
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-lg border border-white/20"
                    >
                      {sending ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </form>
                  
                  {/* Typing indicator placeholder */}
                  <div className="mt-2 h-4 flex items-center">
                    <span className="text-xs text-white/40">
                      {sending ? 'Sending...' : ''}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col"
            >
              {/* Info Header */}
              <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 px-6 py-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-semibold text-white">Match Information</h2>
                </div>
              </div>

              {/* Info Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Timer Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 text-center text-white border border-white/20"
                >
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Clock className="w-8 h-8 text-yellow-400" />
                    <div>
                      <h3 className="text-2xl font-bold text-white">{formatTime(timeLeft)}</h3>
                      <p className="text-white/60 text-sm">Until next matching</p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-white/20 rounded-full h-3 mb-4 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-1000 shadow-sm"
                      style={{ width: `${Math.max(0, (timeLeft / 300) * 100)}%` }}
                    />
                  </div>

                  {status === 'waiting' && (
                    <p className="text-white/60 text-sm">
                      Gathering participants for the next round...
                    </p>
                  )}
                  {status === 'matching' && (
                    <div className="flex items-center justify-center gap-2 text-green-400">
                      <Zap className="w-4 h-4 animate-pulse" />
                      <p className="font-medium">Finding your perfect match...</p>
                    </div>
                  )}
                </motion.div>

                {/* Participants Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 text-white border border-white/20"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-6 h-6 text-blue-400" />
                    <h3 className="text-xl font-bold text-white">Participants ({participants.length})</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                    <AnimatePresence>
                      {participants.map((participant, index) => (
                        <motion.div
                          key={participant.id || index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white/10 rounded-2xl p-4 flex items-center gap-3 border border-white/10"
                        >
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getUserColor(participant.id || 'default')} flex items-center justify-center text-white font-bold`}>
                            {participant.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">
                              {participant.name || 'Anonymous'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <p className="text-xs text-white/60">
                                Online
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {participants.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-white/30 mx-auto mb-3" />
                      <p className="text-white/60">No participants yet</p>
                      <p className="text-white/40 text-sm">Be the first to join!</p>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}