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
      <div className="min-h-screen py-12">
        <LobbyContent />
      </div>
    </LobbyProvider>
  )
}