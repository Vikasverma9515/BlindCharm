// src/lib/services/ConnectService.ts
import { supabase } from '@/lib/supabase'

export type ConnectStatus = 'pending' | 'accepted' | 'declined' | 'cancelled' | 'expired'

export class ConnectService {
  // Create or get existing pending request between two users in a lobby
  static async requestConnect(lobbyId: string, fromUserId: string, toUserId: string) {
    if (fromUserId === toUserId) throw new Error("Can't connect to yourself")

    // First check if there's already a pending request either direction
    const { data: existing, error: existingError } = await supabase
      .from('lobby_connect_requests')
      .select('*')
      .eq('lobby_id', lobbyId)
      .in('status', ['pending'])
      .or(`and(from_user_id.eq.${fromUserId},to_user_id.eq.${toUserId}),and(from_user_id.eq.${toUserId},to_user_id.eq.${fromUserId}))`)
      .maybeSingle()

    if (!existingError && existing) return { request: existing, created: false }

    const { data, error } = await supabase
      .from('lobby_connect_requests')
      .insert({ lobby_id: lobbyId, from_user_id: fromUserId, to_user_id: toUserId })
      .select('*')
      .single()

    if (error) throw error
    return { request: data, created: true }
  }

  // Accept request and create a match chat
  static async accept(requestId: string) {
    // Mark as accepted
    const { data: updated, error: updateError } = await supabase
      .from('lobby_connect_requests')
      .update({ status: 'accepted', responded_at: new Date().toISOString() })
      .eq('id', requestId)
      .select('*')
      .single()

    if (updateError) throw updateError

    // Create a match row consistent with existing private chat system
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .insert({
        user1_id: updated.from_user_id,
        user2_id: updated.to_user_id,
        status: 'active',
        user1_revealed: false,
        user2_revealed: false,
        lobby_id: updated.lobby_id
      })
      .select('id')
      .single()

    if (matchError) throw matchError
    return { matchId: match.id }
  }

  static async decline(requestId: string) {
    const { error } = await supabase
      .from('lobby_connect_requests')
      .update({ status: 'declined', responded_at: new Date().toISOString() })
      .eq('id', requestId)
    if (error) throw error
  }

  static async cancel(requestId: string) {
    const { error } = await supabase
      .from('lobby_connect_requests')
      .update({ status: 'cancelled', responded_at: new Date().toISOString() })
      .eq('id', requestId)
    if (error) throw error
  }

  static async listMyPending(lobbyId: string, userId: string) {
    const { data, error } = await supabase
      .from('lobby_connect_requests')
      .select('id, lobby_id, from_user_id, to_user_id, status, created_at')
      .eq('lobby_id', lobbyId)
      .eq('to_user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  static async listMyOutgoingPending(lobbyId: string, userId: string) {
    const { data, error } = await supabase
      .from('lobby_connect_requests')
      .select('id, lobby_id, from_user_id, to_user_id, status, created_at')
      .eq('lobby_id', lobbyId)
      .eq('from_user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  static subscribe(lobbyId: string, cb: (payload: any) => void) {
    return supabase
      .channel(`lobby_connect_${lobbyId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lobby_connect_requests', filter: `lobby_id=eq.${lobbyId}` }, cb)
      .subscribe()
  }
}