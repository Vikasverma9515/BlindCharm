// // src/lib/services/LobbyScheduler.ts
// import { supabase } from '@/lib/supabase'
// import { addHours, format } from 'date-fns'
// import { parse } from 'date-fns'

// const MATCHING_TIMES = ['12:00', '15:00', '18:00', '21:00'] // 12pm, 3pm, 6pm, 9pm

// export class LobbyScheduler {
//   static async getCurrentOrNextMatchingTime() {
//     const now = new Date()
//     const currentTime = format(now, 'HH:mm')
    
//     // Find the next matching time
//     const nextTime = MATCHING_TIMES.find(time => time > currentTime) || MATCHING_TIMES[0]
    
//     // Calculate time until next match
//     const [hours, minutes] = nextTime.split(':').map(Number)
//     const nextMatchTime = new Date(now)
//     nextMatchTime.setHours(hours, minutes, 0, 0)
//     if (nextTime <= currentTime) {
//       // If we've passed all times today, get first time tomorrow
//       nextMatchTime.setDate(nextMatchTime.getDate() + 1)
//     }
    
//     return {
//       nextMatchTime,
//       timeUntilMatch: nextMatchTime.getTime() - now.getTime()
//     }
//   }

//   static async createMatch(userId1: string, userId2: string, lobbyId: string) {
//     const { data: match, error } = await supabase
//       .from('matches')
//       .insert({
//         user1_id: userId1,
//         user2_id: userId2,
//         lobby_id: lobbyId,
//         status: 'active'
//       })
//       .select()
//       .single()

//     if (error) throw error
//     return match
//   }

//   static async performMatching(lobbyId: string) {
//     const { data: participants, error } = await supabase
//       .from('users')
//       .select('id, gender')
//       .eq('current_lobby_id', lobbyId)
//       .eq('is_in_lobby', true)

//     if (error) throw error

//     // Simple matching algorithm (can be enhanced)
//     const males = participants.filter(p => p.gender === 'male')
//     const females = participants.filter(p => p.gender === 'female')

//     const matches = []
//     const maxMatches = Math.min(males.length, females.length)

//     for (let i = 0; i < maxMatches; i++) {
//       matches.push(await this.createMatch(males[i].id, females[i].id, lobbyId))
//     }

//     return matches
//   }
// }