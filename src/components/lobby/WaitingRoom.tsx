// 'use client'

// import { useEffect, useState } from 'react'
// import { motion } from 'framer-motion'
// import { Users } from 'lucide-react'
// import { supabase } from '@/lib/supabase'
// import { useRouter } from 'next/navigation'
// import { useSession } from 'next-auth/react'

// interface WaitingRoomProps {
//   lobbyId: string
//   theme: string
// }

// interface Participant {
//   id: string
//   user_id: string
//   users: {
//     id: string
//     email: string
//     user_metadata: {
//       name?: string
//       profile_picture?: string
//     }
//   }
// }

// export default function WaitingRoom({ lobbyId, theme }: WaitingRoomProps) {
//   const router = useRouter()
//   const { data: session } = useSession()
//   const [participants, setParticipants] = useState<Participant[]>([])
//   const [timeLeft, setTimeLeft] = useState<number>(300)
//   const [endTime, setEndTime] = useState<Date | null>(null)
//   const [status, setStatus] = useState<'waiting' | 'matching' | 'completed'>('waiting')
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     let timer: NodeJS.Timeout
//     let subscription: any

//     const setupLobby = async () => {
//       try {
//         // Fetch lobby data
//         const { data: lobby, error: lobbyError } = await supabase
//           .from('lobbies')
//           .select('*')
//           .eq('id', lobbyId)
//           .single()

//         if (lobbyError) {
//           console.error('Error fetching lobby:', lobbyError)
//           setError('Failed to fetch lobby data.')
//           return
//         }

//         if (lobby) {
//           setEndTime(new Date(lobby.end_time))
//         }

//         // Subscribe to participant changes
//         subscription = supabase
//           .channel('lobby_changes')
//           .on(
//             'postgres_changes',
//             {
//               event: '*',
//               schema: 'public',
//               table: 'lobby_participants',
//               filter: `lobby_id=eq.${lobbyId}`
//             },
//             () => {
//               fetchParticipants()
//             }
//           )
//           .subscribe()

//         // Start timer
//         timer = setInterval(() => {
//           if (endTime) {
//             const now = new Date()
//             const diff = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000))
//             setTimeLeft(diff)

//             if (diff === 0 && status === 'waiting') {
//               clearInterval(timer)
//               setStatus('matching')
//               handleMatchMaking()
//             }
//           }
//         }, 1000)

//         await fetchParticipants()
//       } catch (error) {
//         console.error('Setup error:', error)
//         setError('Failed to set up the lobby.')
//       }
//     }

//     setupLobby()

//     return () => {
//       clearInterval(timer)
//       if (subscription) {
//         subscription.unsubscribe()
//       }
//     }
//   }, [lobbyId, endTime, status])

//   const fetchParticipants = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('lobby_participants')
//         .select(`
//           id,
//           user_id,
//           users (
//             id,
//             email,
//             user_metadata
//           )
//         `)
//         .eq('lobby_id', lobbyId)

//       if (error) {
//         console.error('Error fetching participants:', error)
//         setError('Failed to fetch participants.')
//         return
//       }

//       if (data) {
//         setParticipants(
//           data.map((participant) => ({
//             ...participant,
//             users: participant.users[0], // Assuming the first user in the array is the relevant one
//           }))
//         )
//       }
//     } catch (error) {
//       console.error('Error fetching participants:', error)
//       setError('Failed to fetch participants.')
//     }
//   }

//   const handleMatchMaking = async () => {
//     try {
//       // Update lobby status to 'matching'
//       const { error } = await supabase
//         .from('lobbies')
//         .update({ status: 'matching' })
//         .eq('id', lobbyId)

//       if (error) {
//         console.error('Error updating lobby status:', error)
//         setError('Failed to update lobby status.')
//         return
//       }

//       // Simulate matchmaking process
//       setTimeout(() => {
//         setStatus('completed')
//         router.push(`/chat/${lobbyId}`) // Redirect to chat page
//       }, 3000)
//     } catch (error) {
//       console.error('Error during matchmaking:', error)
//       setError('Failed during matchmaking.')
//     }
//   }

//   const handleLeaveLobby = async () => {
//     try {
//       const { error } = await supabase
//         .from('lobby_participants')
//         .delete()
//         .eq('user_id', session?.user?.id)
//         .eq('lobby_id', lobbyId)

//       if (error) {
//         console.error('Error leaving lobby:', error)
//         setError('Failed to leave the lobby.')
//         return
//       }

//       router.push('/lobby')
//     } catch (error) {
//       console.error('Error leaving lobby:', error)
//       setError('Failed to leave the lobby.')
//     }
//   }

//   const formatTime = (seconds: number) => {
//     const minutes = Math.floor(seconds / 60)
//     const remainingSeconds = seconds % 60
//     return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//         {error && <div className="text-red-500 p-4">{error}</div>}

//         {/* Header */}
//         <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6 text-white">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <span className="text-2xl">🎵</span>
//               <h2 className="text-2xl font-bold">{theme} Waiting Room</h2>
//             </div>
//             <div className="flex items-center space-x-6">
//               <div className="flex items-center space-x-2">
//                 <Users className="h-5 w-5" />
//                 <span>{participants.length} joined</span>
//               </div>
//               <div className="font-mono text-lg">{formatTime(timeLeft)}</div>
//               <button
//                 onClick={handleLeaveLobby}
//                 className="p-2 hover:bg-white/10 rounded-full transition-colors"
//               >
//                 Leave
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Participants */}
//         <div className="p-6">
//           <h3 className="text-lg font-semibold mb-4">Participants</h3>
//           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//             {participants.map((participant) => (
//               <div key={participant.id} className="bg-gray-50 rounded-lg p-4">
//                 <p className="font-medium text-gray-900">
//                   {participant.users?.user_metadata?.name || 'Anonymous'}
//                 </p>
//                 <p className="text-sm text-gray-500">Online</p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Status */}
//         <div className="p-6 border-t">
//           {status === 'waiting' && <p>Waiting for more participants...</p>}
//           {status === 'matching' && <p>Finding your perfect match...</p>}
//           {status === 'completed' && <p>Match found! Redirecting to chat...</p>}
//         </div>
//       </div>
//     </div>
//   )
// }