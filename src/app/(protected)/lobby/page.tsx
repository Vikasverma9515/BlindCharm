'use client'

import { useSession } from 'next-auth/react'
import { LobbyProvider } from '@/contexts/LobbyContext'
import LobbySelection from '@/components/lobby/LobbySelection'
import ActiveLobby from '@/components/lobby/ActiveLobby'
import { useLobby } from '@/contexts/LobbyContext'
import { useState } from 'react'

function LobbyContent() {
  const { activeLobby } = useLobby()
  const [error, setError] = useState<string | null>(null)

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return activeLobby ? <ActiveLobby lobbyId={activeLobby} /> : <LobbySelection />
}

export default function LobbyPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    return <div>Please log in to access the lobby.</div>
  }

  return (
    
    <LobbyProvider>
      <div className="p-8 text-center text-black">
      {/* You can add a list of matches here */}
      <div className="mt-2 backdrop-blur-2xl   rounded-lg p-6 bg-amber-300">
      <p>This is the lobby page.
        <br />
        Here you can join lobbies to find new friends.
        <br />
        
      </p>
      </div>
    </div>
      <div className="min-h-screen py-12">
        <LobbyContent />
      </div>
    </LobbyProvider>
  )
}