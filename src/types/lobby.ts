// src/types/lobby.ts
export interface Lobby {
    id: string
    name: string
    theme: string
    maxParticipants: number
    currentParticipants: number
    status: 'waiting' | 'matching' | 'completed'
    timerDuration: number // in seconds
    startTime: Date
    endTime: Date
  }
  
  export interface LobbyParticipant {
    id: string
    userId: string
    lobbyId: string
    joinedAt: Date
    interests: string[]
    location?: {
      latitude: number
      longitude: number
    }
    preferences: {
      ageRange: [number, number]
      gender: string[]
      distance?: number // in km
    }
  }
  
  export interface Match {
    id: string
    user1Id: string
    user2Id: string
    compatibilityScore?: number // Optional, calculated during matchmaking
    matchedAt: Date
    status: 'pending' | 'accepted' | 'rejected'
  }