// src/contexts/LobbyContext.tsx
'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useSession } from 'next-auth/react'

interface LobbyContextType {
  activeLobby: string | null
  joinLobby: (lobbyId: string) => Promise<void>
  leaveLobby: () => Promise<void>
  participants: any[]
  timeLeft: number
  status: 'waiting' | 'matching' | 'completed'
}

const LobbyContext = createContext<LobbyContextType | null>(null)

export function LobbyProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [activeLobby, setActiveLobby] = useState<string | null>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [timeLeft, setTimeLeft] = useState<number>(300)
  const [status, setStatus] = useState<'waiting' | 'matching' | 'completed'>('waiting')

  useEffect(() => {
    if (activeLobby) {
      const lobbyChannel = supabase
        .channel(`lobby:${activeLobby}`)
        .on('presence', { event: 'sync' }, () => {
          const presenceState = lobbyChannel.presenceState()
          setParticipants(Object.values(presenceState))
        })
        .subscribe()

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            clearInterval(timer)
            setStatus('matching')
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => {
        lobbyChannel.unsubscribe()
        clearInterval(timer)
      }
    }
  }, [activeLobby])

  const joinLobby = async (lobbyId: string) => {
    try {
      const userId = session?.user?.id
      if (!userId) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('lobby_participants')
        .insert({
          lobby_id: lobbyId,
          user_id: userId,
          status: 'waiting',
          joined_at: new Date().toISOString()
        })

      if (error) throw error

      setActiveLobby(lobbyId)
    } catch (error) {
      console.error('Error joining lobby:', error)
    }
  }

  const leaveLobby = async () => {
    try {
      const userId = session?.user?.id
      if (!userId || !activeLobby) return

      const { error } = await supabase
        .from('lobby_participants')
        .delete()
        .match({ lobby_id: activeLobby, user_id: userId })

      if (error) throw error

      setActiveLobby(null)
      setTimeLeft(300)
      setStatus('waiting')
    } catch (error) {
      console.error('Error leaving lobby:', error)
    }
  }

  return (
    <LobbyContext.Provider value={{
      activeLobby,
      joinLobby,
      leaveLobby,
      participants,
      timeLeft,
      status
    }}>
      {children}
    </LobbyContext.Provider>
  )
}

export const useLobby = () => {
  const context = useContext(LobbyContext)
  if (!context) {
    throw new Error('useLobby must be used within a LobbyProvider')
  }
  return context
}