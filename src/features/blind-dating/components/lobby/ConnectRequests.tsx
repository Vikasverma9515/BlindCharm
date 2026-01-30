// src/components/lobby/ConnectRequests.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ConnectService } from '@/lib/services/ConnectService'
import { Loader2, Bell } from 'lucide-react'

interface ConnectRequestsProps {
  lobbyId: string
  currentUserId: string
}

export default function ConnectRequests({ lobbyId, currentUserId }: ConnectRequestsProps) {
  const [incoming, setIncoming] = useState<any[]>([])
  const [outgoing, setOutgoing] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()

  // Close on outside click / Esc
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    let subscription: any

    const load = async () => {
      try {
        const [incomingData, outgoingData] = await Promise.all([
          ConnectService.listMyPending(lobbyId, currentUserId),
          ConnectService.listMyOutgoingPending(lobbyId, currentUserId)
        ])
        setIncoming(incomingData)
        setOutgoing(outgoingData)
      } finally {
        setLoading(false)
      }
    }
    load()

    subscription = ConnectService.subscribe(lobbyId, () => {
      Promise.all([
        ConnectService.listMyPending(lobbyId, currentUserId),
        ConnectService.listMyOutgoingPending(lobbyId, currentUserId)
      ]).then(([inData, outData]) => {
        setIncoming(inData)
        setOutgoing(outData)
      })
    })

    return () => {
      if (subscription) subscription.unsubscribe()
    }
  }, [lobbyId, currentUserId])

  if (loading) return null
  if (incoming.length === 0 && outgoing.length === 0) return null

  return (
    <div className="absolute top-3 right-3 z-20">
      {/* Bell with badge */}
      <div className="relative" ref={dropdownRef}>
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-soft hover:bg-white"
          aria-label="Connection notifications"
          onClick={() => setOpen(v => !v)}
        >
          <Bell className="w-5 h-5 text-neutral-700 dark:text-gray-200" />
          {(incoming.length + outgoing.length) > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-primary-600 text-white text-[10px] flex items-center justify-center">
              {incoming.length + outgoing.length}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 mt-2 w-[320px] max-w-[90vw] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
            <div className="max-h-[50vh] overflow-auto divide-y divide-gray-100 dark:divide-gray-800">
              {/* Incoming section */}
              {incoming.length > 0 && (
                <div className="p-3">
                  <p className="text-xs font-semibold text-neutral-600 dark:text-gray-300 mb-2">Pending requests</p>
                  <div className="space-y-2">
                    {incoming.map((req) => (
                      <div key={req.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-neutral-800 dark:text-gray-100">Someone wants to connect privately.</p>
                          <p className="text-[11px] text-neutral-600 dark:text-gray-400">Sent {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="px-2 py-1 rounded-full text-[11px] bg-gray-200 dark:bg-gray-700 text-neutral-800 dark:text-gray-100"
                            onClick={async () => {
                              try { await ConnectService.decline(req.id) } catch (e) { console.error(e) }
                            }}
                          >
                            Not now
                          </button>
                          <button
                            className="px-2 py-1 rounded-full text-[11px] bg-primary-600 hover:bg-primary-700 text-white"
                            onClick={async () => {
                              try {
                                const { matchId } = await ConnectService.accept(req.id)
                                router.push(`/matches/${matchId}`)
                              } catch (e) { console.error(e) }
                            }}
                          >
                            Accept
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Outgoing section */}
              {outgoing.length > 0 && (
                <div className="p-3">
                  <p className="text-xs font-semibold text-neutral-600 dark:text-gray-300 mb-2">Sent requests</p>
                  <div className="space-y-2">
                    {outgoing.map((req) => (
                      <div key={req.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" aria-hidden />
                          <div>
                            <p className="text-sm text-neutral-800 dark:text-gray-100">Waiting for response…</p>
                            <p className="text-[11px] text-neutral-600 dark:text-gray-400">Sent {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="px-2 py-1 rounded-full text-[11px] bg-gray-200 dark:bg-gray-700 text-neutral-800 dark:text-gray-100"
                            onClick={async () => {
                              try { await ConnectService.cancel(req.id) } catch (e) { console.error(e) }
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {incoming.length === 0 && outgoing.length === 0 && (
                <div className="p-4 text-sm text-neutral-600 dark:text-gray-400">No connection notifications</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}