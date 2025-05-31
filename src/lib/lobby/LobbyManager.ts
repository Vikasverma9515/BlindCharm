// src/lib/services/LobbyManager.ts
import { supabase } from '@/lib/supabase'

export class LobbyManager {
  getActiveLobbies() {
      throw new Error('Method not implemented.')
  }
  private static instance: LobbyManager
  private currentCycle: any = null
  private cycleTimer: NodeJS.Timeout | null = null

  private constructor() {
    this.initializeCycle()
  }

  static getInstance() {
    if (!LobbyManager.instance) {
      LobbyManager.instance = new LobbyManager()
    }
    return LobbyManager.instance
  }

  private async initializeCycle() {
    // Get or create current cycle
    const { data: currentCycle } = await supabase
      .from('lobby_cycles')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!currentCycle) {
      // Create new cycle
      const { data: newCycle } = await supabase.rpc('create_new_cycle')
      this.currentCycle = newCycle
    } else {
      this.currentCycle = currentCycle
    }

    this.startCycleTimer()
  }

  private startCycleTimer() {
    if (this.cycleTimer) {
      clearInterval(this.cycleTimer)
    }

    this.cycleTimer = setInterval(async () => {
      const now = new Date()
      const endTime = new Date(this.currentCycle.end_time)

      if (now >= endTime) {
        await this.handleCycleEnd()
      }
    }, 1000)
  }

  private async handleCycleEnd() {
    // Update current cycle status
    await supabase
      .from('lobby_cycles')
      .update({ status: 'completed' })
      .eq('id', this.currentCycle.id)

    // Perform matchmaking for current cycle
    await this.performMatchmaking()

    // Create new cycle
    const { data: newCycle } = await supabase.rpc('create_new_cycle')
    this.currentCycle = newCycle

    // Carry over unmatched participants
    await this.carryOverParticipants()
  }

  private async performMatchmaking() {
    const { data: participants } = await supabase
      .from('lobby_participants')
      .select('*')
      .eq('status', 'waiting')
      .order('waiting_since', { ascending: true })

    // Prioritize participants who've waited longer
    const prioritizedParticipants = participants?.sort((a, b) => {
      const aWaitTime = new Date(a.waiting_since).getTime()
      const bWaitTime = new Date(b.waiting_since).getTime()
      return bWaitTime - aWaitTime
    })

    // Create matches
    if (prioritizedParticipants && prioritizedParticipants.length >= 2) {
      for (let i = 0; i < prioritizedParticipants.length - 1; i += 2) {
        await supabase
          .from('matches')
          .insert({
            user1_id: prioritizedParticipants[i].user_id,
            user2_id: prioritizedParticipants[i + 1].user_id,
            lobby_id: prioritizedParticipants[i].lobby_id,
            status: 'matched',
            created_at: new Date().toISOString()
          })
      }
    }
  }

  private async carryOverParticipants() {
    // Update unmatched participants for next cycle
    await supabase
      .from('lobby_participants')
      .update({
        join_cycle: this.currentCycle.cycle_number
      })
      .eq('status', 'waiting')
  }

  async joinLobby(userId: string, lobbyId: string) {
    return await supabase
      .from('lobby_participants')
      .upsert({
        lobby_id: lobbyId,
        user_id: userId,
        join_cycle: this.currentCycle.cycle_number,
        waiting_since: new Date().toISOString(),
        status: 'waiting'
      })
  }

  async getCurrentCycleInfo() {
    return {
      cycle: this.currentCycle,
      timeLeft: this.getTimeLeft()
    }
  }

  private getTimeLeft(): number {
    if (!this.currentCycle) return 0
    const now = new Date()
    const endTime = new Date(this.currentCycle.end_time)
    return Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000))
  }
}