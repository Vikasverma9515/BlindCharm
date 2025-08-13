// src/components/debug/DataLoadingDiagnostic.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase'
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

interface DiagnosticResult {
  test: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: any
}

export default function DataLoadingDiagnostic() {
  const { data: session } = useSession()
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addResult = (test: string, status: 'success' | 'error' | 'warning', message: string, details?: any) => {
    setResults(prev => [...prev, { test, status, message, details }])
  }

  const runDiagnostics = async () => {
    setIsRunning(true)
    setResults([])

    try {
      // Test 1: Session Check
      if (!session?.user?.id) {
        addResult('Session Check', 'error', 'No active session found', { session })
        setIsRunning(false)
        return
      }
      addResult('Session Check', 'success', `Session active for user: ${session.user.id}`)

      // Test 2: Supabase Connection
      try {
        const { data: { session: supabaseSession } } = await supabase.auth.getSession()
        if (!supabaseSession) {
          addResult('Supabase Auth', 'error', 'No Supabase session found')
        } else {
          addResult('Supabase Auth', 'success', `Supabase session active: ${supabaseSession.user.id}`)
        }
      } catch (error) {
        addResult('Supabase Auth', 'error', 'Failed to get Supabase session', error)
      }

      // Test 3: User Profile Access
      try {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('id, email, username, full_name')
          .eq('id', session.user.id)
          .single()

        if (profileError) {
          addResult('Profile Access', 'error', `Cannot access user profile: ${profileError.message}`, profileError)
        } else if (!profile) {
          addResult('Profile Access', 'error', 'User profile not found in database')
        } else {
          addResult('Profile Access', 'success', `Profile loaded successfully: ${profile.username || profile.email}`)
        }
      } catch (error) {
        addResult('Profile Access', 'error', 'Exception accessing profile', error)
      }

      // Test 4: Lobby Participants Access
      try {
        const { data: lobbyData, error: lobbyError } = await supabase
          .from('lobby_participants')
          .select('*')
          .eq('user_id', session.user.id)
          .limit(5)

        if (lobbyError) {
          addResult('Lobby Access', 'error', `Cannot access lobby data: ${lobbyError.message}`, lobbyError)
        } else {
          addResult('Lobby Access', 'success', `Lobby data accessible (${lobbyData?.length || 0} records)`)
        }
      } catch (error) {
        addResult('Lobby Access', 'error', 'Exception accessing lobby data', error)
      }

      // Test 5: Matches Access
      try {
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .select('*')
          .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`)
          .limit(5)

        if (matchError) {
          addResult('Matches Access', 'error', `Cannot access matches: ${matchError.message}`, matchError)
        } else {
          addResult('Matches Access', 'success', `Matches accessible (${matchData?.length || 0} records)`)
        }
      } catch (error) {
        addResult('Matches Access', 'error', 'Exception accessing matches', error)
      }

      // Test 6: Whispers Access
      try {
        const { data: whisperData, error: whisperError } = await supabase
          .from('whispers')
          .select('*')
          .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
          .limit(5)

        if (whisperError) {
          addResult('Whispers Access', 'error', `Cannot access whispers: ${whisperError.message}`, whisperError)
        } else {
          addResult('Whispers Access', 'success', `Whispers accessible (${whisperData?.length || 0} records)`)
        }
      } catch (error) {
        addResult('Whispers Access', 'error', 'Exception accessing whispers', error)
      }

      // Test 7: Token Refresh Test
      try {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
        if (refreshError) {
          addResult('Token Refresh', 'warning', `Token refresh failed: ${refreshError.message}`, refreshError)
        } else {
          addResult('Token Refresh', 'success', 'Token refresh successful')
        }
      } catch (error) {
        addResult('Token Refresh', 'error', 'Exception during token refresh', error)
      }

      // Test 8: Database Connection Test
      try {
        const { data, error } = await supabase
          .from('users')
          .select('count')
          .limit(1)

        if (error) {
          addResult('Database Connection', 'error', `Database connection failed: ${error.message}`, error)
        } else {
          addResult('Database Connection', 'success', 'Database connection working')
        }
      } catch (error) {
        addResult('Database Connection', 'error', 'Exception testing database connection', error)
      }

    } catch (error) {
      addResult('General Error', 'error', 'Unexpected error during diagnostics', error)
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  // Auto-run diagnostics on mount if there are issues
  useEffect(() => {
    if (session?.user?.id) {
      // Auto-run after a short delay
      const timer = setTimeout(() => {
        runDiagnostics()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [session?.user?.id])

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Data Loading Diagnostics</h2>
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'Running...' : 'Run Diagnostics'}
        </button>
      </div>

      {results.length === 0 && !isRunning && (
        <div className="text-center py-8 text-gray-500">
          Click "Run Diagnostics" to check for data loading issues
        </div>
      )}

      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
          >
            <div className="flex items-start gap-3">
              {getStatusIcon(result.status)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{result.test}</h3>
                </div>
                <p className="text-gray-700 mb-2">{result.message}</p>
                {result.details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                      Show Details
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {results.length > 0 && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Troubleshooting Guide</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>If you see "Cannot access" errors:</strong> This is likely a Row Level Security (RLS) policy issue. Run the SQL fix script in Supabase.</p>
            <p><strong>If you see "No session" errors:</strong> Try logging out and logging back in, or clear your browser cache.</p>
            <p><strong>If you see "User profile not found":</strong> Your account may have been deleted or there's a sync issue between auth and database.</p>
            <p><strong>If you see "Token refresh failed":</strong> Your session may have expired. Try logging out and back in.</p>
          </div>
        </div>
      )}
    </div>
  )
}