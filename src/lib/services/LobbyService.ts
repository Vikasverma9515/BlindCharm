// src/lib/services/LobbyService.ts
import { supabase } from '@/lib/supabase'

interface Lobby {
  id: string;
  theme: string;
  name: string;
  status: string;
  participant_count: number;
  created_at: string;
}

interface LobbyParticipant {
  id: string;
  lobby_id: string;
  user_id: string;
  status: string;
  joined_at: string;
}

export class LobbyService {
  static async getCurrentCycle() {
    try {
      const { data: cycle, error } = await supabase
        .from('lobby_cycles')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) throw error
      return cycle
    } catch (error) {
      console.error('Error fetching current cycle:', error)
      return null
    }
  }

  static async getActiveLobbies() {
    try {
      const { data: lobbies, error } = await supabase
        .from('lobbies')
        .select(`
          *,
          participants:lobby_participants(count)
        `)
        .eq('status', 'waiting')

      if (error) throw error

      return lobbies.map(lobby => ({
        ...lobby,
        participantCount: lobby.participants?.[0]?.count || 0
      }))
    } catch (error) {
      console.error('Error fetching active lobbies:', error)
      return []
    }
  }

  static async checkExistingParticipation(userId: string): Promise<LobbyParticipant | null> {
    try {
      const { data, error } = await supabase
        .from('lobby_participants')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'waiting')
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 is "no rows" error
      return data
    } catch (error) {
      console.error('Error checking existing participation:', error)
      return null
    }
  }

  static async findOrCreateLobby(themeId: string): Promise<string> {
    try {
      // First try to find an existing lobby
      const { data: existingLobby, error: findError } = await supabase
        .from('lobbies')
        .select('*')
        .eq('theme', themeId)
        .eq('status', 'waiting')
        .single()

      if (!findError && existingLobby) {
        return existingLobby.id
      }

      // If no existing lobby, create a new one
      const { data: newLobby, error: createError } = await supabase
        .from('lobbies')
        .insert({
          theme: themeId,
          name: `${themeId.charAt(0).toUpperCase() + themeId.slice(1)} Lobby`,
          status: 'waiting',
          participant_count: 0
        })
        .select()
        .single()

      if (createError) throw createError
      if (!newLobby) throw new Error('Failed to create lobby')

      return newLobby.id
    } catch (error) {
      console.error('Error finding/creating lobby:', error)
      throw error
    }
  }

  static async joinLobby(userId: string, themeId: string) {
    try {
      // Check if user is already in a lobby
      const existingParticipation = await this.checkExistingParticipation(userId)
      if (existingParticipation) {
        return {
          error: null,
          lobbyId: existingParticipation.lobby_id
        }
      }

      // Get or create a lobby
      const lobbyId = await this.findOrCreateLobby(themeId)

      // Join the lobby
      const { error: joinError } = await supabase
        .from('lobby_participants')
        .insert({
          lobby_id: lobbyId,
          user_id: userId,
          status: 'waiting',
          joined_at: new Date().toISOString()
        })

      if (joinError) throw joinError

      // Update participant count
      await supabase.rpc('increment_lobby_participants', { lobby_id: lobbyId })

      return { error: null, lobbyId }
    } catch (error) {
      console.error('Error joining lobby:', error)
      return { error: error, lobbyId: null }
    }
  }

  static async leaveLobby(userId: string, lobbyId: string) {
    try {
      const { error } = await supabase
        .from('lobby_participants')
        .delete()
        .match({ user_id: userId, lobby_id: lobbyId })

      if (error) throw error

      // Decrement participant count
      await supabase.rpc('decrement_lobby_participants', { lobby_id: lobbyId })

      return { error: null }
    } catch (error) {
      console.error('Error leaving lobby:', error)
      return { error: error }
    }
  }
}