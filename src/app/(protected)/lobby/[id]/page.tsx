// src/app/(protected)/lobby/[id]/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase'
import WaitingRoom from '@/components/lobby/WaitingRoom'

interface LobbyData {
  id: string
  name: string
  theme: string
  start_time: string
  end_time: string
}

export default function LobbyPage() {
  const params = useParams()
  const { data: session } = useSession()
  const [lobbyData, setLobbyData] = useState<LobbyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const lobbyId = params.id as string

  useEffect(() => {
    if (!session) {
      console.error('Session not initialized or user not authenticated');
      return;
    }

    if (!session.user?.id) {
      console.error('User ID not found in session');
      return;
    }

    if (!lobbyId) {
      console.error('Lobby ID not provided');
      return;
    }

    const setupLobby = async () => {
      try {
        console.log('Fetching existing participation...');
        const { data: existingParticipation, error: participationError } = await supabase
          .from('lobby_participants')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (participationError) {
          console.error('Error fetching existing participation:', participationError);
        } else {
          console.log('Existing participation:', existingParticipation);
        }

        if (existingParticipation) {
          // If user is already in this lobby, just get lobby data
          if (existingParticipation.lobby_id === lobbyId) {
            const { data: lobby } = await supabase
              .from('lobbies')
              .select('*')
              .eq('id', lobbyId)
              .single()

            setLobbyData(lobby)
            return
          } else {
            // If user is in a different lobby, remove them first
            await supabase
              .from('lobby_participants')
              .delete()
              .eq('user_id', session.user.id)
          }
        }

        console.log('Fetching lobby data...');
        const { data: lobby, error: lobbyError } = await supabase
          .from('lobbies')
          .select('*')
          .eq('id', lobbyId)
          .single();

        if (lobbyError) {
          console.error('Error fetching lobby data:', lobbyError);
          throw lobbyError;
        } else {
          console.log('Lobby data:', lobby);
        }

        // Join lobby using upsert to handle potential duplicates
        console.log('Joining lobby...');
        const { error: joinError } = await supabase
          .from('lobby_participants')
          .upsert(
            {
              lobby_id: lobbyId,
              user_id: session.user.id,
              joined_at: new Date().toISOString(),
              status: 'waiting'
            },
            {
              onConflict: 'lobby_id,user_id',
              ignoreDuplicates: true
            }
          )

        if (joinError) {
          console.error('Error joining lobby:', joinError);
          throw joinError;
        }

        // Update lobby participant count
        console.log('Incrementing participant count...');
        const { error: incrementError } = await supabase.rpc('increment_lobby_participants', { lobby_id: lobbyId });

        if (incrementError) {
          console.error('Error incrementing participant count:', incrementError);
          throw incrementError;
        }

        setLobbyData(lobby)
      } catch (error: any) {
        console.error('Lobby setup error:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    setupLobby()

    // Cleanup function
    return () => {
      if (session?.user?.id) {
        const cleanup = async () => {
          try {
            console.log('Removing participant from lobby...');
            const { error: deleteError } = await supabase
              .from('lobby_participants')
              .delete()
              .match({
                lobby_id: lobbyId,
                user_id: session.user.id,
              });

            if (deleteError) {
              console.error('Error removing participant:', deleteError);
            }

            console.log('Decrementing participant count...');
            const { error: decrementError } = await supabase.rpc('decrement_lobby_participants', { lobby_id: lobbyId });

            if (decrementError) {
              console.error('Error decrementing participant count:', decrementError);
            }
          } catch (error) {
            console.error('Cleanup error:', error);
          }
        };
        cleanup();
      }
    }
  }, [lobbyId, session])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-red-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  if (!lobbyData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Lobby not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <WaitingRoom
        lobbyId={lobbyId}
        theme={lobbyData.name}
      />
    </div>
  )
}