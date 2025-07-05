// src/app/(protected)/chat/[matchId]/page.tsx
'use client'

export default function ChatPage({ params }: { params: { matchId: string } }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Chat Coming Soon</h1>
        <p className="text-gray-600">Chat functionality will be available soon.</p>
        <p className="text-sm text-gray-500 mt-2">Match ID: {params.matchId}</p>
      </div>
    </div>
  )
}