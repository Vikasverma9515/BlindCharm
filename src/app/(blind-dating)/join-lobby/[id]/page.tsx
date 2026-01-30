import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import JoinLobbyClient from './JoinLobbyClient'

// Generate metadata for rich previews
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const { data: lobby } = await supabase
      .from('lobbies')
      .select(`
        name, 
        description, 
        theme,
        lobby_participants!inner(id, status)
      `)
      .eq('id', params.id)
      .eq('lobby_participants.status', 'waiting')
      .single()

    if (!lobby) {
      return {
        title: 'Join Lobby - BlindCharm',
        description: 'Connect through personality, not photos'
      }
    }

    const participantCount = lobby.lobby_participants?.length || 0
    const description = lobby.description || 'Connect with amazing people through authentic conversations'
    
    const ogImageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/og-lobby?name=${encodeURIComponent(lobby.name)}&theme=${encodeURIComponent(lobby.theme)}&count=${participantCount}&description=${encodeURIComponent(description)}`

    return {
      title: `🎯 Join "${lobby.name}" on BlindCharm!`,
      description: `💫 ${description} • 🔥 ${participantCount} people already joined • 🎨 ${lobby.theme} theme`,
      openGraph: {
        title: `🎯 Join "${lobby.name}" on BlindCharm!`,
        description: `💫 ${description}\n🔥 ${participantCount} people already joined\n🎨 ${lobby.theme} theme`,
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `Join ${lobby.name} on BlindCharm`
          }
        ],
        type: 'website',
        siteName: 'BlindCharm'
      },
      twitter: {
        card: 'summary_large_image',
        title: `🎯 Join "${lobby.name}" on BlindCharm!`,
        description: `💫 ${description} • 🔥 ${participantCount} members • 🎨 ${lobby.theme}`,
        images: [ogImageUrl]
      }
    }
  } catch (error) {
    console.error('Metadata generation error:', error)
    return {
      title: 'Join Lobby - BlindCharm',
      description: 'Connect through personality, not photos'
    }
  }
}

// Main page component
export default function JoinLobbyPage({ params }: { params: { id: string } }) {
  return <JoinLobbyClient lobbyId={params.id} />
}