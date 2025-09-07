"use client"

import { useEffect, useRef, useState } from 'react'

interface Props {
  userId: string
}

type Message = { role: 'user' | 'assistant'; content: string }

export default function CompanionChat({ userId }: Props) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hey! I'm your BlindCharm companion. What's on your mind today?" },
  ])
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    if (!input.trim()) return
    const userText = input.trim()
    setMessages(prev => [...prev, { role: 'user', content: userText }])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/companion/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message: userText }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${e.message}` }])
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') send()
  }

  return (
    <div className="max-w-2xl mx-auto w-full h-[70vh] flex flex-col border rounded-2xl p-4 bg-white/70 dark:bg-gray-900/50">
      <div className="flex-1 overflow-y-auto space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`p-3 rounded-xl ${m.role === 'user' ? 'bg-primary-50 self-end' : 'bg-gray-100 dark:bg-gray-800'}`}>
            <p className="whitespace-pre-wrap text-sm">{m.content}</p>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type a message..."
          className="flex-1 border rounded-xl px-3 py-2 bg-white dark:bg-gray-800"
        />
        <button onClick={send} disabled={loading} className="px-4 py-2 rounded-xl bg-primary-500 text-white disabled:opacity-50">
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  )
}