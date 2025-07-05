// src/app/(protected)/lobby/[id]/page.tsx
'use client'

import { use, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import LobbyChat from '@/components/lobby/LobbyChat'
import { Loader2, Users, Clock, Heart, MessageCircle, Info, ArrowLeft } from 'lucide-react'
import { Message, LobbyParticipant, User } from '@/types/lobby'
import { MatchingService } from '@/lib/services/MatchingService'
import ErrorBoundary from '@/components/ErrorBoundary'
import { MatchSuccessModal } from '@/components/lobby/MatchSuccessModal'
import Navbar from '@/components/shared/Navbar'
import { motion, AnimatePresence } from 'framer-motion'
import SimpleBottomNav from '@/components/shared/SimpleBottomNav'
import LobbySelection from '@/components/lobby/LobbySelection'
import LobbyCard from '@/components/lobby/LobbyCard'

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Lobby {
  id: string
  theme: string
  name: string
  participant_count: number
  status: string
  created_at: string
  ends_at: string
  description?: string
  lobby_participants?: any[]
}
// Extend window interface for match trigger tracking
declare global {
  interface Window {
    matchTriggered?: string | null;
  }
}

export default function LobbyPage({ params }: PageProps) {
  const resolvedParams = use(params); // Unwrap the promise
  const lobbyId = resolvedParams.id;
  const { data: session, status } = useSession()
  const router = useRouter()
  const [lobby, setLobby] = useState<Lobby | null>(null)
  const [participants, setParticipants] = useState<LobbyParticipant[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [nextMatchTime, setNextMatchTime] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInfo, setShowInfo] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [matchSuccess, setMatchSuccess] = useState<{ show: boolean; otherUser: string }>({
    show: false,
    otherUser: ''
  });
  const [isMatching, setIsMatching] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [blurMyProfile, setBlurMyProfile] = useState(false);

  // Load blur preference from localStorage and database on component mount
  useEffect(() => {
    const loadBlurPreference = async () => {
      // First load from localStorage for immediate UI update
      const savedBlurPreference = localStorage.getItem('blurMyProfile');
      if (savedBlurPreference !== null) {
        setBlurMyProfile(JSON.parse(savedBlurPreference));
      }

      // Then sync with database if user is logged in
      if (session?.user?.id && lobbyId) {
        try {
          const { data, error } = await supabase
            .from('lobby_participants')
            .select('blur_profile')
            .eq('lobby_id', lobbyId)
            .eq('user_id', session.user.id)
            .single();

          if (!error && data) {
            const dbBlurPreference = data.blur_profile || false;
            setBlurMyProfile(dbBlurPreference);
            localStorage.setItem('blurMyProfile', JSON.stringify(dbBlurPreference));
          }
        } catch (err) {
          console.error('Error loading blur preference from database:', err);
        }
      }
    };

    loadBlurPreference();
  }, [session?.user?.id, lobbyId]);

  // Save blur preference to localStorage and database whenever it changes
  const toggleBlurProfile = async (newValue: boolean) => {
    console.log('🔄 Toggling blur profile to:', newValue);
    setBlurMyProfile(newValue);
    localStorage.setItem('blurMyProfile', JSON.stringify(newValue));
    
    // Add haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Update the database
    if (session?.user?.id) {
      try {
        console.log('📝 Updating database for user:', session.user.id, 'lobby:', lobbyId);
        
        // Simple direct update with better error handling
        const { error, data, count } = await supabase
          .from('lobby_participants')
          .update({ blur_profile: newValue })
          .eq('lobby_id', lobbyId)
          .eq('user_id', session.user.id)
          .select('*');

        console.log('📊 Update result:', { error, data, count });

        if (error) {
          console.error('❌ Database update failed:', error);
          // Revert the local state if database update fails
          setBlurMyProfile(!newValue);
          localStorage.setItem('blurMyProfile', JSON.stringify(!newValue));
        } else if (data && data.length > 0) {
          console.log('✅ Successfully updated blur preference:', data[0]);
          // Force refresh participants to show the change immediately
          setTimeout(() => {
            fetchParticipants();
          }, 100);
        } else {
          console.warn('⚠️ Update succeeded but no data returned');
          // Still refresh participants
          setTimeout(() => {
            fetchParticipants();
          }, 100);
        }
      } catch (err) {
        console.error('💥 Error saving blur preference to database:', err);
        // Revert the local state if there's an error
        setBlurMyProfile(!newValue);
        localStorage.setItem('blurMyProfile', JSON.stringify(!newValue));
      }
    }
  };

  // Handle match notification from broadcast
  const handleMatchNotification = (payload: any) => {
    const matchData = payload.payload;
    
    const isUser1 = matchData.user1Id === session?.user?.id;
    const otherUsername = isUser1
      ? matchData.user2Username
      : matchData.user1Username;
    
    console.log('🔔 Received match notification:', matchData);
    
    setMatchSuccess({
      show: true,
      otherUser: otherUsername
    });
    
    setIsRedirecting(true);
    
    // Remove from participants list locally
    setParticipants(prev => 
      prev.filter(p => 
        p.user_id !== matchData.user1Id && 
        p.user_id !== matchData.user2Id
      )
    );
    
    // Delay redirect
    setTimeout(() => {
      router.push(`/matches/${matchData.matchId}`);
    }, 3000);
  };

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Matchmaking function
  const triggerMatching = async () => {
    if (isMatching) return;
    
    setIsMatching(true);
    try {
      console.log('🎯 Triggering matching for lobby:', lobbyId);
      const result = await MatchingService.matchParticipants(lobbyId);
      
      if (result.success && result.matches && result.matches.length > 0) {
        console.log('✅ Matches created:', result.matches);
        
        // Check if current user got matched
        const currentUserMatch = result.matches.find(
          (match: any) => match.user1_id === session?.user?.id || match.user2_id === session?.user?.id
        );
        
        if (currentUserMatch) {
          // Get the other user's name
          const otherUserId = currentUserMatch.user1_id === session?.user?.id 
            ? currentUserMatch.user2_id 
            : currentUserMatch.user1_id;
          
          const otherParticipant = participants.find(p => p.user_id === otherUserId);
          const otherUserName = otherParticipant?.user?.username || 'Someone';
          
          // Show success modal
          setMatchSuccess({
            show: true,
            otherUser: otherUserName
          });
          
          // Redirect to match after a delay
          setTimeout(() => {
            router.push(`/matches/${currentUserMatch.id}`);
          }, 3000);
        }
      } else {
        console.log('No matches created');
      }
    } catch (error) {
      console.error('Error during matching:', error);
      setError('Failed to process matches');
    } finally {
      setIsMatching(false);
    }
  };

  // Check for automatic matching at scheduled times
  const checkMatchingTime = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    
    // Match times: 11:00, 12:00, 15:00, 18:00, 21:00, 22:00
    const matchHours = [11, 12, 15, 18, 21, 22];
    
    // Trigger matching at the exact minute (within first 5 seconds for reliability)
    if (matchHours.includes(currentHour) && currentMinute === 0 && currentSecond <= 5) {
      const timeKey = `${currentHour}:${currentMinute}`;
      
      // Prevent multiple triggers in the same minute
      if (!window.matchTriggered || window.matchTriggered !== timeKey) {
        window.matchTriggered = timeKey;
        console.log('🕐 Automatic matching triggered at:', `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}:${currentSecond.toString().padStart(2, '0')}`);
        console.log('📊 Current participants:', participants.length);
        console.log('🎯 Lobby ID:', lobbyId);
        
        if (participants.length >= 2) {
          triggerMatching();
        } else {
          console.log('⚠️ Not enough participants for matching (need at least 2)');
        }
        
        // Clear the trigger flag after 10 seconds
        setTimeout(() => {
          if (window.matchTriggered === timeKey) {
            window.matchTriggered = null;
          }
        }, 10000);
      }
    }
  };

  const fetchLobby = async () => {
    try {
      const { data, error } = await supabase
        .from('lobbies')
        .select('id, theme, name, participant_count, status, created_at, ends_at, description')
        .eq('id', lobbyId)
        .single();

      if (error) throw error;
      setLobby(data);
    } catch (err) {
      console.error('Error fetching lobby:', err);
      setError('Failed to load lobby information');
    }
  };

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('lobby_participants')
        .select(`
          id,
          lobby_id,
          user_id,
          status,
          joined_at,
          blur_profile,
          user:user_id (
            id,
            username,
            gender,
            profile_picture,
            bio,
            interests
          )
        `)
        .eq('lobby_id', lobbyId)
        .eq('status', 'waiting'); // Only get waiting participants

      if (error) throw error;

      const transformedParticipants = (data || []).map(p => {
        // Handle if p.user is an array (Supabase join can return array)
        const userObj = Array.isArray(p.user) ? p.user[0] : p.user;
        return {
          id: p.id,
          lobby_id: p.lobby_id,
          user_id: p.user_id,
          status: p.status,
          joined_at: p.joined_at,
          blur_profile: p.blur_profile || false,
          user: {
            id: userObj?.id,
            username: userObj?.username,
            gender: userObj?.gender,
            profile_picture: userObj?.profile_picture,
            bio: userObj?.bio,
            interests: userObj?.interests
          }
        }
      });
      setParticipants(transformedParticipants);
    } catch (err) {
      console.error('Error fetching participants:', err);
      setError('Failed to load participants');
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('lobby_messages')
        .select(`
          id,
          content,
          user_id,
          lobby_id,
          created_at,
          user:user_id (
            id,
            username,
            gender,
            profile_picture
          )
        `)
        .eq('lobby_id', lobbyId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const transformedMessages: Message[] = (data || []).map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        user_id: msg.user_id,
        lobby_id: msg.lobby_id,
        created_at: msg.created_at,
        user: {
          id: msg.user?.id || '',
          username: msg.user?.username || 'Unknown User',
          gender: msg.user?.gender || 'other',
          profile_picture: msg.user?.profile_picture || null,
        }
      }));

      setMessages(transformedMessages);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    }
  };

  // Verify user is in lobby
  useEffect(() => {
    const checkLobbyAccess = async () => {
      if (!session?.user?.id) return;

      try {
        // Check if user is already matched
        const { data: participantData } = await supabase
          .from('lobby_participants')
          .select('status')
          .eq('lobby_id', lobbyId)
          .eq('user_id', session.user.id)
          .single();

        if (participantData?.status === 'matched') {
          // Find their match and redirect
          const { data: matchData } = await supabase
            .from('matches')
            .select('id')
            .eq('lobby_id', lobbyId)
            .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`)
            .maybeSingle();

          if (matchData) {
            router.push(`/matches/${matchData.id}`);
            return;
          }
        }

        // If not matched but trying to join
        if (!participantData || participantData.status !== 'waiting') {
          router.push('/lobby');
        }
      } catch (err) {
        console.error('Error checking lobby access:', err);
        router.push('/lobby');
      }
    };

    checkLobbyAccess();
  }, [session, lobbyId, router])

  useEffect(() => {
    if (!session?.user?.id || !lobbyId) return

    // Set up subscriptions with unique channel names
    const participantsSubscription = supabase
      .channel(`lobby_participants_${lobbyId}_${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lobby_participants',
          filter: `lobby_id=eq.${lobbyId}`
        },
        () => fetchParticipants()
      )
      .subscribe()

    const messagesSubscription = supabase
      .channel(`lobby_messages_${lobbyId}_${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lobby_messages',
          filter: `lobby_id=eq.${lobbyId}`
        },
        () => fetchMessages()
      )
      .subscribe()

    // Listen for match notifications - we'll check both user1_id and user2_id
    const matchSubscription = supabase
      .channel(`matches_${session.user.id}_${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches'
        },
        async (payload) => {
          console.log('🎉 Match notification received:', payload);
          const match = payload.new;
          
          // Check if this match involves the current user
          if (match.user1_id === session.user.id || match.user2_id === session.user.id) {
            // Get the other user's info
            const otherUserId = match.user1_id === session.user.id ? match.user2_id : match.user1_id;
            const otherParticipant = participants.find(p => p.user_id === otherUserId);
            const otherUserName = otherParticipant?.user?.username || 'Someone';
            
            // Show success modal
            setMatchSuccess({
              show: true,
              otherUser: otherUserName
            });
            
            // Redirect after delay
            setTimeout(() => {
              router.push(`/matches/${match.id}`);
            }, 3000);
          }
        }
      )
      .subscribe()

    // Initial fetch
    Promise.all([
      fetchLobby(),
      fetchParticipants(),
      fetchMessages()
    ]).finally(() => setLoading(false))

    // Update match time and current time
    const updateMatchTime = () => {
      const now = new Date()
      const hours = [11, 12, 15, 18, 21, 22]
      const nextHour = hours.find(h => h > now.getHours()) || hours[0]
      const nextMatch = new Date(now)
      nextMatch.setHours(nextHour, 0, 0, 0)
      if (nextHour <= now.getHours()) {
        nextMatch.setDate(nextMatch.getDate() + 1)
      }
      // Use consistent 24-hour format
      const timeString = `${nextHour.toString().padStart(2, '0')}:00`
      setNextMatchTime(timeString)
      
      // Update current time
      const currentTimeString = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      })
      setCurrentTime(currentTimeString)
    }
    updateMatchTime()

    // Set up automatic matching timer (check every second)
    const matchingTimer = setInterval(checkMatchingTime, 1000);

    // Update match time every second for real-time display
    const timeUpdateTimer = setInterval(updateMatchTime, 1000);

    return () => {
      participantsSubscription.unsubscribe()
      messagesSubscription.unsubscribe()
      matchSubscription.unsubscribe()
      clearInterval(matchingTimer)
      clearInterval(timeUpdateTimer)
    }
  }, [session?.user?.id, lobbyId])

  // Broadcast subscription for match notifications
  useEffect(() => {
    if (!session?.user?.id || !lobbyId) return;
    
    const channelName = `match_notifications_${session.user.id}`;
    console.log('🔗 Subscribing to broadcast channel:', channelName);
    
    const matchChannel = supabase
      .channel(channelName)
      .on(
        'broadcast',
        { event: 'match_success' },
        handleMatchNotification
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Subscribed to ${channelName}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Error subscribing to ${channelName}`);
        }
      });

    return () => {
      console.log('🔌 Unsubscribing from broadcast channel:', channelName);
      matchChannel.unsubscribe();
    };
  }, [session?.user?.id, lobbyId]);

  const currentUser: User | null = session?.user ? {
    id: session.user.id,
    username: session.user.name || session.user.email || 'Unknown',
    profile_picture: (session.user as any).image || null,
    gender: (session.user as any).gender || 'other'
  } : null;

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16  rounded-full flex items-center justify-center mx-auto mb-4 shadow-soft animate-pulse">
            <img className="h-10 w-auto" src="/logo2.png" alt="Logo" />
            {/* <Loader2 className="w-8 h-8 animate-spin text-white" /> */}
          </div>
          <h2 className="text-xl font-semibold text-neutral-850">Loading lobby...</h2>
          <p className="text-neutral-750">Preparing your chat experience</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-soft">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-850">Oops!</h2>
          <p className="text-neutral-750 mb-4">{error}</p>
          <button
            onClick={() => router.push('/lobby')}
            className="bg-primary-500 text-white px-6 py-2 rounded-full hover:bg-primary-600 transition-colors"
          >
            Back to Lobby
          </button>
        </motion.div>
      </div>
    )
  }

  return (
        <ErrorBoundary>
    <>
      <div className="min-h-screen bg-ambient-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Lobby Chat Header - Always visible */}
        <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-800 backdrop-blur-md border-b border-gray-200 shadow-sm rounded-b-2xl">
          {/* Mobile Header */}
          {isMobile ? (
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/lobby')}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-white" />
                </button>
                <div>
                  <h1 className="text-lg font-semibold text-neutral-850 dark:text-white">Lobby Chat</h1>
                  <p className="text-xs text-neutral-750 dark:text-white/90">{participants.length} participants</p>
                </div>
              </div>
              
              <button
                onClick={() => setShowInfo(!showInfo)}
                className={`p-2 rounded-full transition-colors ${
                  showInfo ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Info className="w-5 h-5 dark:text-white" />
              </button>
            </div>
          ) : (
            /* Desktop Header */
            <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/lobby')}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center shadow-soft">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-neutral-850">
                      {lobby?.name ? `${lobby.name} Chat` : 'Lobby Chat'}
                    </h1>
                    <p className="text-sm text-neutral-750">Get to know each other before matching!</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-neutral-750">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">{participants.length} online</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Next: {nextMatchTime}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-600">
                  <span>Now: {currentTime}</span>
                </div>
                {/* Manual trigger for testing - only show if admin or in development */}
                {(process.env.NODE_ENV === 'development' || session?.user?.email?.includes('admin')) && (
                  <button
                    onClick={triggerMatching}
                    disabled={isMatching || participants.length < 2}
                    className="px-3 py-1 text-xs bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isMatching ? 'Matching...' : 'Test Match'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className={`${isMobile ? 'pt-20 pb-20' : 'pt-20 pb-8'}`}>
          {isMobile ? (
            // Mobile Layout
            <div className="h-[calc(100vh-160px)] px-0">
              <AnimatePresence mode="wait">
                {!showInfo ? (
                  // Chat View
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full mx-4"
                  >
                    <div className="bg-white rounded-3xl shadow-soft border border-gray-100 h-full overflow-hidden flex flex-col">
                      <LobbyChat 
                        lobbyId={lobbyId}
                        messages={messages}
                        setMessages={setMessages}
                        currentUser={currentUser}
                        participants={participants}
                      />
                    </div>
                  </motion.div>
                ) : (
                  // Info View
                  <motion.div
                    key="info"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="h-full mx-4"
                  >
                    <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6 h-full overflow-hidden flex flex-col">
                      <div className="flex items-center gap-3 mb-6">
                        <Users className="w-6 h-6 text-primary-500" />
                        <h2 className="text-xl font-semibold text-neutral-850">Participants ({participants.length})</h2>
                      </div>

                      <div className="flex-1 overflow-y-auto min-h-0">
                        <div className="space-y-3">
                        {participants.map((participant) => (
                          <motion.div
                            key={participant.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100"
                          >
                            {participant.user?.profile_picture ? (
                              <img 
                                src={participant.user.profile_picture}
                                alt={participant.user.username || 'User'}
                                className={`w-12 h-12 rounded-full object-cover ring-2 ring-primary-200 transition-all duration-300 ${
                                  participant.blur_profile 
                                    ? 'blur-[1px] opacity-85' 
                                    : ''
                                }`}

                              />
                            ) : (
                              <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold shadow-soft transition-all duration-300 ${
                                participant.blur_profile 
                                  ? 'blur-[1px] opacity-85' 
                                  : ''
                              }`}>
                                {participant.user?.username?.[0]?.toUpperCase() || 'U'}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-neutral-850 truncate">
                                  {participant.user?.username || 'Anonymous'}
                                </p>
                                {participant.blur_profile && (
                                  <div className="flex items-center gap-1 bg-primary-100 text-primary-600 px-2 py-1 rounded-full text-xs">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                    </svg>
                                    <span>Private</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-neutral-750">
                                {participant.user?.gender === 'male' ? '♂️ Male' : participant.user?.gender === 'female' ? '♀️ Female' : '⚧️ Other'} 
                                {' • '}Waiting for match...
                              </p>
                            </div>
                          </motion.div>
                        ))}

                        {participants.length === 0 && (
                          <div className="text-center py-12">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-neutral-750 font-medium">No participants yet</p>
                            <p className="text-neutral-650 text-sm">Be the first to join!</p>
                          </div>
                        )}
                        </div>
                      </div>

                      {/* Privacy Settings */}
                      <div className="flex-shrink-0 mt-6 pt-6 border-t border-gray-200">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                blurMyProfile ? 'bg-primary-500' : 'bg-gray-500'
                              }`}>
                                {blurMyProfile ? (
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-neutral-850">Blur My Profile</p>
                                <p className="text-xs text-neutral-650">Hide your profile picture for privacy</p>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleBlurProfile(!blurMyProfile)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 hover:scale-105 ${
                                blurMyProfile ? 'bg-primary-500 shadow-lg' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 shadow-sm ${
                                  blurMyProfile ? 'translate-x-6 scale-110' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Next Match Info */}
                      <div className="flex-shrink-0 mt-6 pt-6 border-t border-gray-200">
                        <div className="text-center bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-4">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-primary-500" />
                            <span className="text-sm font-medium text-neutral-850">Next Match</span>
                          </div>
                          <p className="text-2xl font-bold text-primary-600">{nextMatchTime}</p>
                          <p className="text-xs text-neutral-750 mt-1">
                            Matches happen every few hours
                          </p>
                          
                          {/* Test Match Button - Only show in development */}
                          {process.env.NODE_ENV === 'development' && (
                            <button
                              onClick={triggerMatching}
                              disabled={isMatching || participants.length < 2}
                              className="mt-3 w-full bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                            >
                              {isMatching ? (
                                <div className="flex items-center justify-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Matching...</span>
                                </div>
                              ) : (
                                'Test Match Now'
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            // Desktop Layout
            <div className="max-w-7xl mx-auto px-6 ">
              <div className="flex gap-8 h-[calc(100vh-90px)] ">
                {/* Information Section - Left side */}
                <div className="w-80 flex-shrink-0 ">
                  <div className="bg-white rounded-3xl shadow-soft border border-gray-100 h-full flex flex-col overflow-hidden">
                    {/* Header - Fixed at top */}
                    <div className="p-6 flex-shrink-0 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <Users className="w-6 h-6 text-primary-500" />
                        <h2 className="text-xl font-semibold text-neutral-850">Participants ({participants.length})</h2>
                      </div>
                    </div>

                    {/* Scrollable participants list */}
                    <div className="flex-1 overflow-y-auto min-h-0 ">
                      <div className="p-6 space-y-3">
                        {participants.map((participant) => (
                          <motion.div
                            key={participant.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-colors"
                          >
                            {participant.user?.profile_picture ? (
                              <img 
                                src={participant.user.profile_picture}
                                alt={participant.user.username || 'User'}
                                className={`w-12 h-12 rounded-full object-cover ring-2 ring-primary-200 transition-all duration-300 ${
                                  participant.blur_profile 
                                    ? 'blur-[1px] opacity-85' 
                                    : ''
                                }`}
                              />
                            ) : (
                              <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold shadow-soft transition-all duration-300 ${
                                participant.blur_profile 
                                  ? 'blur-[1px] opacity-85' 
                                  : ''
                              }`}>
                                {participant.user?.username?.[0]?.toUpperCase() || 'U'}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-neutral-850 truncate">
                                  {participant.user?.username || 'Anonymous'}
                                </p>
                                {participant.blur_profile && (
                                  <div className="flex items-center gap-1 bg-primary-100 text-primary-600 px-2 py-1 rounded-full text-xs">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                    </svg>
                                    <span>Private</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-neutral-750">
                                {participant.user?.gender === 'male' ? '♂️ Male' : participant.user?.gender === 'female' ? '♀️ Female' : '⚧️ Other'} 
                                {' • '}Waiting for match...
                              </p>
                            </div>
                          </motion.div>
                        ))}

                        {participants.length === 0 && (
                          <div className="text-center py-12">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-neutral-750 font-medium">No participants yet</p>
                            <p className="text-neutral-650 text-sm">Be the first to join!</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Fixed bottom section with settings and match info */}
                    <div className="flex-shrink-0 border-t border-gray-100">
                      {/* Privacy Settings */}
                      <div className="p-6">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                blurMyProfile ? 'bg-primary-500' : 'bg-gray-500'
                              }`}>
                                {blurMyProfile ? (
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-neutral-850">Blur My Profile</p>
                                <p className="text-xs text-neutral-650">Hide your profile picture for privacy</p>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleBlurProfile(!blurMyProfile)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 hover:scale-105 ${
                                blurMyProfile ? 'bg-primary-500 shadow-lg' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 shadow-sm ${
                                  blurMyProfile ? 'translate-x-6 scale-110' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Next Match Info */}
                      <div className="px-6 pb-6">
                        <div className="text-center bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-4">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-primary-500" />
                            <span className="text-sm font-medium text-neutral-850">Next Match</span>
                          </div>
                          <p className="text-2xl font-bold text-primary-600">{nextMatchTime}</p>
                          <p className="text-xs text-neutral-750 mt-1">
                            Matches happen every few hours
                          </p>
                          
                          {/* Test Match Button - Only show in development */}
                          {process.env.NODE_ENV === 'development' && (
                            <button
                              onClick={triggerMatching}
                              disabled={isMatching || participants.length < 2}
                              className="mt-3 w-full bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                            >
                              {isMatching ? (
                                <div className="flex items-center justify-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Matching...</span>
                                </div>
                              ) : (
                                'Test Match Now'
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat Section - Right side */}
                <div className="flex-1 min-w-0">
                  <div className="bg-white rounded-3xl shadow-soft border border-gray-100 h-full overflow-hidden flex flex-col">
                    <LobbyChat 
                      lobbyId={lobbyId}
                      messages={messages}
                      setMessages={setMessages}
                      currentUser={currentUser}
                      participants={participants}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Redirecting overlay */}
        {isRedirecting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-gradient-to-br from-primary-900/20 via-black/40 to-secondary-900/20 backdrop-blur-sm z-40"
          />
        )}

        {/* Match Success Modal */}
        <MatchSuccessModal 
          isOpen={matchSuccess.show}
          onClose={() => {
            setMatchSuccess({ show: false, otherUser: '' });
            setIsRedirecting(false);
          }}
          otherUserName={matchSuccess.otherUser}
        />
      </div>
      <SimpleBottomNav />
    </>
    </ErrorBoundary>
  )
}
