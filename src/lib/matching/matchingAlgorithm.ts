// src/lib/matching/matchingAlgorithm.ts
interface MatchingCriteria {
    interests: string[]
    location?: {
      latitude: number
      longitude: number
    }
    preferences: {
      ageRange: [number, number]
      gender: string[]
      distance?: number
    }
  }
  
  export function calculateCompatibility(user1: MatchingCriteria, user2: MatchingCriteria): number {
    let score = 0
    const maxScore = 100
  
    // Interest matching (50% of total score)
    const commonInterests = user1.interests.filter(interest => 
      user2.interests.includes(interest)
    )
    score += (commonInterests.length / Math.max(user1.interests.length, user2.interests.length)) * 50
  
    // Location matching if available (30% of total score)
    if (user1.location && user2.location && user1.preferences.distance) {
      const distance = calculateDistance(user1.location, user2.location)
      const distanceScore = Math.max(0, 1 - (distance / user1.preferences.distance))
      score += distanceScore * 30
    }
  
    // Preference matching (20% of total score)
        const preferenceScore = calculatePreferenceMatch(user1.preferences, user2.preferences)
    
    function calculatePreferenceMatch(pref1: MatchingCriteria['preferences'], pref2: MatchingCriteria['preferences']): number {
        const ageRangeOverlap = Math.max(0, Math.min(pref1.ageRange[1], pref2.ageRange[1]) - Math.max(pref1.ageRange[0], pref2.ageRange[0]))
        const ageRangeScore = ageRangeOverlap / (pref1.ageRange[1] - pref1.ageRange[0])
    
        const genderMatch = pref1.gender.some(gender => pref2.gender.includes(gender)) ? 1 : 0
    
        return (ageRangeScore + genderMatch) / 2
    }
    score += preferenceScore * 20
  
    return Math.min(score, maxScore)
  }
  
  function calculateDistance(loc1: { latitude: number; longitude: number }, 
                           loc2: { latitude: number; longitude: number }): number {
    // Haversine formula implementation
    const R = 6371 // Earth's radius in km
    const dLat = toRad(loc2.latitude - loc1.latitude)
    const dLon = toRad(loc2.longitude - loc1.longitude)
    const lat1 = toRad(loc1.latitude)
    const lat2 = toRad(loc2.latitude)
  
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
             Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }
  
  function toRad(value: number): number {
    return value * Math.PI / 180
  }