'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Users } from 'lucide-react'
import { LobbyService } from '@/lib/services/LobbyService'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Lobby {
  id: string
  theme: string
  name: string
  participant_count: number
  status: string
  created_at: string
  ends_at: string
  description?: string
  lobby_participants?: any[]
}

interface LobbyParticipant {
  id: string
  lobby_id: string
  user_id: string
  status: string
}

export default function LobbySelection() {
  const { data: session } = useSession()
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState<number>(300)
  const [activeLobbies, setActiveLobbies] = useState<Lobby[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [userJoinedLobbyId, setUserJoinedLobbyId] = useState<string | null>(null)

  // Subscribe to lobby changes
  useEffect(() => {
    const channel = supabase
      .channel('lobby_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'lobbies' 
        }, 
        () => {
          fetchLobbies()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const fetchLobbies = async () => {
    try {
      const { data, error } = await supabase
        .from('lobbies')
        .select(`
          *,
          lobby_participants (
            id,
            user_id,
            status
          )
        `)
        .eq('status', 'waiting')

      if (error) throw error

      const lobbiesWithCount = data.map(lobby => ({
        ...lobby,
        participant_count: lobby.lobby_participants?.length || 0
      }))

      setActiveLobbies(lobbiesWithCount)
    } catch (err) {
      console.error('Error fetching lobbies:', err)
      setError('Failed to fetch active lobbies.')
    }
  }

  const checkUserLobbyStatus = async () => {
    if (!session?.user?.id) return

    try {
      const { data, error } = await supabase
        .from('lobby_participants')
        .select('lobby_id')
        .eq('user_id', session.user.id)
        .eq('status', 'waiting')
        .maybeSingle() // <-- fix here

      if (error && error.code !== 'PGRST116') throw error
      setUserJoinedLobbyId(data?.lobby_id || null)
    } catch (err) {
      console.error('Error checking user lobby status:', err)
    }
  }

  useEffect(() => {
    let timer: NodeJS.Timeout

    const updateInfo = async () => {
      await Promise.all([
        checkUserLobbyStatus(),
        fetchLobbies()
      ])
    }

    updateInfo()
    timer = setInterval(updateInfo, 3000)

    return () => clearInterval(timer)
  }, [session])

  const handleJoinLobby = async (lobbyId: string) => {
    if (!session?.user) {
      router.push('/login')
      return
    }

    setLoading(lobbyId)

    try {
      const { error } = await supabase
        .from('lobby_participants')
        .insert({
          user_id: session.user.id,
          lobby_id: lobbyId,
          status: 'waiting'
        })

      if (error) throw error

      setUserJoinedLobbyId(lobbyId)
      await fetchLobbies()
    } catch (err) {
      console.error('Error joining lobby:', err)
      setError('Failed to join the lobby.')
    } finally {
      setLoading(null)
    }
  }

  const handleLeaveLobby = async (lobbyId: string) => {
    if (!session?.user) return

    setLoading(lobbyId)

    try {
      const { error } = await supabase
        .from('lobby_participants')
        .delete()
        .match({ 
          user_id: session.user.id, 
          lobby_id: lobbyId 
        })

      if (error) throw error

      setUserJoinedLobbyId(null)
      await fetchLobbies()
    } catch (err) {
      console.error('Error leaving lobby:', err)
      setError('Failed to leave the lobby.')
    } finally {
      setLoading(null)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  console.log('session.user.id', session?.user?.id);
  useEffect(() => {
    const fetchAuthUser = async () => {
      const { data: authUser } = await supabase.auth.getUser();
      console.log('supabase.auth.getUser()', authUser);
    };
    fetchAuthUser();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Available Lobbies</h2>
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-gray-600" />
            <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-600" />
            <span className="text-lg">{activeLobbies.length} active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeLobbies.map((lobby) => (
          <motion.div
            key={lobby.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-xl p-6 shadow-sm relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{lobby.name}</h3>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-600" />
                <span className="text-gray-600">{lobby.participant_count}</span>
              </div>
            </div>

            <p className="text-gray-600 mb-4">{lobby.description}</p>

            <div className="flex justify-end">
              {userJoinedLobbyId === lobby.id ? (
                <>
                  <button
                    onClick={() => router.push(`/lobby/${lobby.id}`)}
                    className="mr-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    disabled={loading === lobby.id}
                  >
                    Enter Lobby
                  </button>
                  <button
                    onClick={() => handleLeaveLobby(lobby.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    disabled={loading === lobby.id}
                  >
                    Leave
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleJoinLobby(lobby.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  disabled={loading === lobby.id || userJoinedLobbyId !== null}
                >
                  Join
                </button>
              )}
            </div>

            {loading === lobby.id && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}