

// src/lib/services/LobbyService.ts

import { supabase } from '@/lib/supabase'
export class LobbyService {
  static async joinLobby(userId: string, lobbyId: string) {
    try {
      // Update user's lobby status
      const { error: userError } = await supabase
        .from('users')
        .update({
          current_lobby_id: lobbyId,
          is_in_lobby: true
        })
        .eq('id', userId)

      if (userError) throw userError

      // Add to lobby_participants
      const { error: participantError } = await supabase
        .from('lobby_participants')
        .insert({
          user_id: userId,
          lobby_id: lobbyId,
          status: 'waiting'
        })

      if (participantError) throw participantError

      return { error: null }
    } catch (error) {
      console.error('Error joining lobby:', error)
      return { error }
    }
  }

  static async leaveLobby(userId: string) {
    try {
      // Update user's lobby status
      const { error: userError } = await supabase
        .from('users')
        .update({
          current_lobby_id: null,
          is_in_lobby: false
        })
        .eq('id', userId)

      if (userError) throw userError

      // Remove from lobby_participants
      const { error: participantError } = await supabase
        .from('lobby_participants')
        .delete()
        .eq('user_id', userId)

      if (participantError) throw participantError

      return { error: null }
    } catch (error) {
      console.error('Error leaving lobby:', error)
      return { error }
    }
  }

  static async getLobbyParticipants(lobbyId: string) {
    const { data, error } = await supabase
      .from('lobby_participants')
      .select(`
        id,
        lobby_id,
        user_id,
        status,
        joined_at,
        user:user_id (
          id,
          username,
          gender,
          profile_picture,
          bio,
          interests
        )
      `)
      .eq('lobby_id', lobbyId)
      .eq('status', 'waiting');

    if (error) throw error;
    return data;
  }

  static async getLobbyChat(lobbyId: string) {
    const { data, error } = await supabase
      .from('lobby_messages')
      .select(`
        id,
        content,
        user_id,
        lobby_id,
        created_at,
        user:user_id (
          id,
          username,
          profile_picture,
          gender
        )
      `)
      .eq('lobby_id', lobbyId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  static async sendLobbyMessage(userId: string, lobbyId: string, content: string) {
    const { data, error } = await supabase
      .from('lobby_messages')
      .insert({
        user_id: userId,
        lobby_id: lobbyId,
        content
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}