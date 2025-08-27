// src/app/(protected)/lobby/[id]/page.tsx
'use client'

import { use, useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import LobbyChat from '@/components/lobby/LobbyChat'
import { Loader2, Users, Clock, Heart, BookHeart, MessagesSquare, MessageCircle, Info, ArrowLeft, Weight, Settings, LucideVolumeOff, LucideMove3D, HeartIcon } from 'lucide-react'
import { Message, LobbyParticipant, User } from '@/types/lobby'
import { MatchingService } from '@/lib/services/MatchingService'
import ErrorBoundary from '@/components/ErrorBoundary'
import { MatchSuccessModal } from '@/components/lobby/MatchSuccessModal'
import Navbar from '@/components/shared/Navbar'
import { motion, AnimatePresence } from 'framer-motion'
import SimpleBottomNav from '@/components/shared/SimpleBottomNav'
import LobbySelection from '@/components/lobby/LobbySelection'
import LobbyCard from '@/components/lobby/LobbyCard'
import { boldonse } from '@/app/fonts'
// import MindMatchArena from '@/components/lobby/MindMatchArena'
// import VibeView from '@/components/lobby/VibeView'
// import MatchLeaderboard from '@/components/lobby/MatchLeaderboard'
// import HotAnswersFeed from '@/components/lobby/HotAnswersFeed'
import { VibeMatch } from '@/types/mindmatch'
// import MindMatchArena from '@/components/lobby/MindMatchArena/index'
// import QuestionDisplay from '@/components/lobby/MindMatchArena/QuestionDisplay'
// import ResultsDisplay from '@/components/lobby/MindMatchArena/ResultsDisplay'
// import WaitingRoom from '@/components/lobby/MindMatchArena/WaitingRoom'
// import { MindMatchService } from '@/lib/services/MindMatchService'
import { Brain } from 'lucide-react'
// import { CurrentQuestion } from '@/types/mindmatch'
// import type { MindMatchAnswer } from '@/types/mindmatch';
// import CompatibilityBoard from '@/components/lobby/CompatibilityBoard';
import AdminBadge from '@/components/ui/AdminBadge'
import CacheStats from '@/components/debug/CacheStats'
import LobbyBanner from '@/components/announcement/LobbyBanner'
import AnnouncementBar from '@/components/announcement/AnnouncementBar'
import GirlQuestionSystem from '@/components/lobby/GirlQuestionSystem'
import { Trophy, HelpCircle, RefreshCw } from 'lucide-react'
import { FlameKindling } from '@/blocks/Components/icons/flame'

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
  image_url?: string | null
}

interface UserProfile {
  additional_photo_1: string | null;
  additional_photo_2: string | null;
  
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
  const [activeTab, setActiveTab] = useState<'chat' | 'questions' | 'mindmatch' | 'vibeview' | 'leaderboard' | 'hotfeed'>('chat');
  const [vibeMatches, setVibeMatches] = useState<VibeMatch[]>([]);
  const [showMindMatchArena, setShowMindMatchArena] = useState(false);
  // const [currentQuestion, setCurrentQuestion] = useState<CurrentQuestion | null>(null);
  const [roundId, setRoundId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'results'>('waiting');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    participants: string;
    messages: string;
    matches: string;
  }>({
    participants: 'DISCONNECTED',
    messages: 'DISCONNECTED',
    matches: 'DISCONNECTED'
  })

  const participantsSubscription = useRef<any>(null);
  const messagesSubscription = useRef<any>(null);
  const matchSubscription = useRef<any>(null);

  // MindMatch state
  const [mindMatchRoundId, setMindMatchRoundId] = useState<string | null>(null);
  // const [mindMatchAnswers, setMindMatchAnswers] = useState<MindMatchAnswer[]>([]);
  // const [mindMatchCurrentQuestion, setMindMatchCurrentQuestion] = useState<CurrentQuestion | null>(null);
  const [mindMatchLoading, setMindMatchLoading] = useState(false);
  const [mindMatchState, setMindMatchState] = useState<'waiting' | 'playing' | 'results'>('waiting');



  // Add this before the main component function
// const generateRandomName = (userId: string, gender?: string): string => {
//   const maleNames = ['Alex', 'Chris', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Morgan', 'Quinn', 'Avery', 'Parker'];
//   const femaleNames = ['Sam', 'Blake', 'Drew', 'Sage', 'River', 'Phoenix', 'Sky', 'Ocean', 'Luna', 'Nova'];
//   const neutralNames = ['Mystery', 'Enigma', 'Curious', 'Wonder', 'Secret', 'Hidden', 'Unknown', 'Puzzle', 'Riddle', 'Quest'];
  
//   // Use userId as seed for consistent random name per user
//   const seed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
//   let names = neutralNames;
//   if (gender === 'male') names = maleNames;
//   else if (gender === 'female') names = femaleNames;
  
//   return names[seed % names.length];
// };
const generateRandomName = (userId: string, gender?: string): string => {
  const maleNames = [
    "MisterMystery",
    "CharmKing",
    "CaptainFlirt",
    "SirGiggles",
    "CoffeeKnight",
    "CosmicHero",
    "LaughLord",
    "MidnightRider",
    "PrincePuzzle",
    "MrSecret",
    "GalaxyGuy",
    "SilentStorm",
    "CharmWizard",
    "MaskedMaverick",
    "DreamCatcher",
    "ShadowKnight",
    "NovaNomad",
    "WittyWolf",
    "HiddenHero",
    "RogueSmile"
  ];

  const femaleNames = [
    "LadyWhisper",
    "CharmQueen",
    "MissMystery",
    "GiggleGoddess",
    "CoffeeFairy",
    "LunaDreamer",
    "SparkleMuse",
    "VelvetVibe",
    "QueenPuzzle",
    "SecretSiren",
    "GalaxyGirl",
    "TwilightMuse",
    "CharmWitch",
    "MaskedMermaid",
    "DreamDancer",
    "ShadowRose",
    "NovaStar",
    "WittyWillow",
    "HiddenHalo",
    "RogueSmileys"
  ];
  const neutralNames = ['Mystery', 'Enigma', 'Curious', 'Wonder', 'Secret', 'Hidden', 'Unknown', 'Puzzle', 'Riddle', 'Quest'];

  // Use userId as seed for consistent random name per user
  const seed = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  let names = [...maleNames, ...femaleNames];
  if (gender === "male") names = maleNames;
  else if (gender === "female") names = femaleNames;

  return names[seed % names.length];
};


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

  // Check admin status when session is available
  useEffect(() => {
    if (session?.user?.id) {
      console.log('🔍 Checking admin status for user:', session.user.id);
      checkAdminStatus();
    }
  }, [session?.user?.id]);

  // Debug admin status changes
  useEffect(() => {
    console.log('👑 Admin status updated:', isAdmin);
  }, [isAdmin]);

  // Add these handler functions
  // const handleStartRound = async (lobbyId: string) => {
  //   setIsLoading(true);
  //   try {
  //     const newRoundId = await MindMatchService.startNewRound(lobbyId);
  //     if (newRoundId) {
  //       setRoundId(newRoundId);
  //       setGameState('playing');
  //     }
  //   } catch (error) {
  //     console.error('Failed to start round:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  

  const checkAdminStatus = async () => {
    if (!session?.user?.id) return

    try {
      const { data, error } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', session.user.id)
        .single()

      if (error) throw error
      setIsAdmin(data?.is_admin || false)
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
    }
  }


  // const handleAnswer = async (answer: string, optionIndex?: number) => {
  //   if (!currentQuestion || !roundId) return;

  //   setIsLoading(true);
  //   try {
  //     await MindMatchService.submitAnswer(
  //       lobbyId,
  //       currentUser?.id || '',
  //       currentQuestion.question.id,
  //       roundId,
  //       {
  //         text: answer,
  //         optionIndex,
  //         timeTaken: getTimeLeft(currentQuestion.endsAt)
  //       }
  //     );

  //     if (currentQuestion.questionNumber === 5) {
  //       setGameState('results');
  //     }
  //   } catch (error) {
  //     console.error('Failed to submit answer:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const getTimeLeft = (endsAt: string): number => {
    const end = new Date(endsAt).getTime();
    const now = new Date().getTime();
    return Math.max(0, Math.floor((end - now) / 1000));
  };
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
          fetchParticipants().catch(err => {
            console.error('❌ Error refreshing participants after blur update:', err);
          });
        } else {
          console.warn('⚠️ Update succeeded but no data returned');
          // Still refresh participants
          fetchParticipants().catch(err => {
            console.error('❌ Error refreshing participants after blur update:', err);
          });
        }
      } catch (err) {
        console.error('💥 Error saving blur preference to database:', err);
        // Revert the local state if there's an error
        setBlurMyProfile(!newValue);
        localStorage.setItem('blurMyProfile', JSON.stringify(!newValue));
      }
    }
  };

  // Handle vibe match from MindMatch Arena
  const handleVibeMatch = (match: VibeMatch) => {
    setVibeMatches(prev => [...prev, match]);

    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  // Handle sending vibe wave
  const handleSendVibeWave = (userId: string) => {
    console.log('Sending VibeWave to user:', userId);

    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }

    // Here you would implement the actual VibeWave sending logic
    // For now, we'll just show a notification
    // You could add a toast notification here
  };

  // Handle reacting to hot answers
  const handleReactToAnswer = (answerId: string) => {
    console.log('Reacting to answer:', answerId);

    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Here you would implement the actual reaction logic
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
    if (isMatching) {
      console.log('⚠️ Matching already in progress, skipping...');
      return;
    }

    console.log('🚀 Starting matchmaking process...');
    console.log('📊 Current participants:', participants.length);
    console.log('🎯 Lobby ID:', lobbyId);
    console.log('👤 Current user:', session?.user?.id);

    setIsMatching(true);
    try {
      console.log('🎯 Triggering matching for lobby:', lobbyId);
      const result = await MatchingService.matchParticipants(lobbyId);
      console.log('📋 Matching result:', result);

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

  // Check actual participant count and gender distribution from database
  const checkActualParticipantCount = async () => {
    try {
      const { data, error } = await supabase
        .from('lobby_participants')
        .select(`
          id, 
          user_id,
          user:user_id (
            id,
            username,
            gender
          )
        `)
        .eq('lobby_id', lobbyId)
        .eq('status', 'waiting');

      if (error) {
        console.error('Error fetching participant count:', error);
        return { total: 0, males: 0, females: 0, canMatch: false };
      }

      const participants = data || [];
      const males = participants.filter(p => {
        const userObj = Array.isArray(p.user) ? p.user[0] : p.user;
        return userObj?.gender?.toLowerCase() === 'male';
      });
      const females = participants.filter(p => {
        const userObj = Array.isArray(p.user) ? p.user[0] : p.user;
        return userObj?.gender?.toLowerCase() === 'female';
      });

      const canMatch = males.length >= 1 && females.length >= 1;

      return {
        total: participants.length,
        males: males.length,
        females: females.length,
        canMatch
      };
    } catch (err) {
      console.error('Error checking participant count:', err);
      return { total: 0, males: 0, females: 0, canMatch: false };
    }
  };

  // Check for automatic matching at scheduled times
  const checkMatchingTime = async () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();

    // Match times: 11:00, 12:00, 15:00, 18:00, 21:00, 22:00
    const matchHours = [11, 12, 15, 16, 18, 19, 20, 21, 22, 24];

    // Debug: Log current time every minute
    if (currentSecond === 0) {
      console.log(`⏰ Current time: ${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}:${currentSecond.toString().padStart(2, '0')}`);
      console.log(`🎯 Is match hour? ${matchHours.includes(currentHour)}, Is minute 0? ${currentMinute === 0}`);
    }

    // Trigger matching at the exact minute (within first 5 seconds for reliability)
    if (matchHours.includes(currentHour) && currentMinute === 0 && currentSecond <= 5) {
      const timeKey = `${currentHour}:${currentMinute}`;

      // Prevent multiple triggers in the same minute
      if (!window.matchTriggered || window.matchTriggered !== timeKey) {
        window.matchTriggered = timeKey;
        console.log('🕐 Automatic matching triggered at:', `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}:${currentSecond.toString().padStart(2, '0')}`);

        // Get fresh participant count from database
        const participantInfo = await checkActualParticipantCount();
        console.log('📊 Local participants state:', participants.length);
        console.log('📊 Actual participants in DB:', participantInfo.total);
        console.log('👨 Males:', participantInfo.males, '👩 Females:', participantInfo.females);
        console.log('🎯 Can match:', participantInfo.canMatch);
        console.log('🎯 Lobby ID:', lobbyId);

        if (participantInfo.canMatch) {
          console.log('✅ Sufficient participants found with proper gender distribution, triggering matching...');
          triggerMatching();
        } else {
          console.log('⚠️ Cannot match participants - need at least 1 male and 1 female');
          console.log(`   Current: ${participantInfo.males} males, ${participantInfo.females} females`);
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
        .select('id, theme, name, participant_count, status, created_at, ends_at, description, image_url')
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
      console.log('🔄 Fetching participants for lobby:', lobbyId);
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
            additional_photo_1,
            additional_photo_2,
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
            additional_photo_1: userObj?.additional_photo_1,
            additional_photo_2: userObj?.additional_photo_2,
            bio: userObj?.bio,
            interests: userObj?.interests
          }
        }
      });

      console.log('✅ Participants fetched:', transformedParticipants.length, 'participants');
      console.log('👥 Participant usernames:', transformedParticipants.map(p => p.user?.username));
      setParticipants(transformedParticipants);
    } catch (err) {
      console.error('❌ Error fetching participants:', err);
      setError('Failed to load participants');
    }
  };

  // Manual refresh function for debugging or fallback
  const manualRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    try {
      await Promise.all([
        fetchParticipants(),
        fetchMessages()
      ]);
      console.log('✅ Manual refresh completed');
    } catch (err) {
      console.error('❌ Error in manual refresh:', err);
    }
  };


  useEffect(() => {
    if (lobby) {
      console.log('lobby data loaded:', lobby);
      console.log('Image URL:', lobby.image_url);
    }
  }, [lobby]);

  // Expose functions to window for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).debugLobby = {
        manualRefresh,
        fetchParticipants,
        checkActualParticipantCount,
        triggerMatching,
        lobbyId,
        participantCount: participants.length,
        participants: participants.map(p => ({
          username: p.user?.username,
          gender: p.user?.gender,
          blur_profile: p.blur_profile
        }))
      };
    }
  }, [participants, lobbyId]);

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
            profile_picture,
            additional_photo_1,
            additional_photo_2
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
          additional_photo_1: msg.user?.additional_photo_1 || null,
          additional_photo_2: msg.user?.additional_photo_2 || null,
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

    console.log('🔗 Setting up real-time subscriptions for lobby:', lobbyId);
    console.log('👤 Current user ID:', session.user.id);

    // Set up subscriptions with unique channel names
    const participantsChannelName = `lobby_participants_${lobbyId}_${Date.now()}`;
    console.log('📡 Creating participants subscription channel:', participantsChannelName);

    const participantsSubscription = supabase
      .channel(participantsChannelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lobby_participants',
          filter: `lobby_id=eq.${lobbyId}`
        },
        (payload) => {
          console.log('🔔 Participants change detected:', {
            eventType: payload.eventType,
            table: payload.table,
            schema: payload.schema,
            old: payload.old,
            new: payload.new,
            errors: payload.errors
          });

          // Add a small delay to ensure database consistency
          setTimeout(() => {
            fetchParticipants().catch(err => {
              console.error('❌ Error refetching participants after change:', err);
            });
          }, 100);
        }
      )
      .subscribe((status) => {
        console.log('📡 Participants subscription status:', status);
        setSubscriptionStatus(prev => ({ ...prev, participants: status }));

        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to participants changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error subscribing to participants changes');
        } else if (status === 'TIMED_OUT') {
          console.error('⏰ Participants subscription timed out');
        } else if (status === 'CLOSED') {
          console.warn('🔒 Participants subscription closed');
        }
      });

    const messagesChannelName = `lobby_messages_${lobbyId}_${Date.now()}`;
    const messagesSubscription = supabase
      .channel(messagesChannelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lobby_messages',
          filter: `lobby_id=eq.${lobbyId}`
        },
        (payload) => {
          console.log('💬 New message detected:', payload);
          fetchMessages().catch(err => {
            console.error('❌ Error refetching messages after change:', err);
          });
        }
      )
      .subscribe((status) => {
        console.log('📡 Messages subscription status:', status);
        setSubscriptionStatus(prev => ({ ...prev, messages: status }));

        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to message changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error subscribing to message changes');
        }
      });

    // Listen for match notifications - we'll check both user1_id and user2_id
    const matchChannelName = `matches_${session.user.id}_${Date.now()}`;
    const matchSubscription = supabase
      .channel(matchChannelName)
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
      .subscribe((status) => {
        console.log('📡 Match subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to match changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error subscribing to match changes');
        }
      });

    // Initial fetch
    Promise.all([
      fetchLobby(),
      fetchParticipants(),
      fetchMessages()
    ]).finally(() => setLoading(false))

    return () => {
      participantsSubscription?.unsubscribe?.();
      messagesSubscription?.unsubscribe?.();
      matchSubscription?.unsubscribe?.();
    };
  }, [session?.user?.id, lobbyId]);

  // Update match time and current time
  useEffect(() => {
    const updateMatchTime = () => {
      const now = new Date()
      const hours = [11, 12, 15, 16, 18, 19, 20, 21, 22, 24]
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
    const matchingTimer = setInterval(() => {
      checkMatchingTime().catch(err => {
        console.error('Error in automatic matching check:', err);
      });
    }, 1000);

    // Update match time every second for real-time display
    const timeUpdateTimer = setInterval(updateMatchTime, 1000);

    // Add periodic refresh as fallback (every 30 seconds)
    const refreshTimer = setInterval(() => {
      console.log('🔄 Periodic refresh of participants (fallback)');
      fetchParticipants().catch(err => {
        console.error('❌ Error in periodic refresh:', err);
      });
    }, 30000);

    return () => {
      console.log('🧹 Cleaning up subscriptions and timers');

      // Safely unsubscribe from subscriptions
      if (participantsSubscription.current) {
        participantsSubscription.current.unsubscribe();
      }

      if (messagesSubscription.current) {
        messagesSubscription.current.unsubscribe();
      }

      if (matchSubscription.current) {
        matchSubscription.current.unsubscribe();
      }

      clearInterval(matchingTimer);
      clearInterval(timeUpdateTimer);
      clearInterval(refreshTimer);
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

  // Fetch current question and answers for MindMatch
  // useEffect(() => {
  //   if (!lobbyId || !currentUser || !currentUser.id) return;
  //   const fetchMindMatch = async () => {
  //     setMindMatchLoading(true);
  //     const question = await MindMatchService.getCurrentQuestion(lobbyId);
  //     setMindMatchCurrentQuestion(question);
  //     if (question) setMindMatchRoundId(question.roundId);
  //     if (question) {
  //       const answers = await MindMatchService.getUserRoundAnswers(lobbyId, currentUser.id, question.roundId);
  //       setMindMatchAnswers(answers);
  //       if (answers.length >= 5) setMindMatchState('results');
  //       else setMindMatchState('playing');
  //     } else {
  //       setMindMatchState('waiting');
  //     }
  //     setMindMatchLoading(false);
  //   };
  //   fetchMindMatch();
  // }, [lobbyId, currentUser]);

  // // Handle answer
  // const handleMindMatchAnswer = async (answer: string, optionIndex?: number) => {
  //   if (!mindMatchCurrentQuestion || !mindMatchRoundId || !currentUser || !currentUser.id) return;
  //   setMindMatchLoading(true);
  //   if (!currentUser || !currentUser.id) return;
  //   await MindMatchService.submitAnswer(
  //     lobbyId,
  //     currentUser.id,
  //     mindMatchCurrentQuestion.question.id,
  //     mindMatchRoundId,
  //     { text: answer, optionIndex }
  //   );
  //   // Refetch answers and question
  //   const answers = await MindMatchService.getUserRoundAnswers(lobbyId, currentUser.id, mindMatchRoundId);
  //   setMindMatchAnswers(answers);
  //   if (answers.length >= 5) setMindMatchState('results');
  //   else setMindMatchState('playing');
  //   const question = await MindMatchService.getCurrentQuestion(lobbyId);
  //   setMindMatchCurrentQuestion(question);
  //   setMindMatchLoading(false);
  // };

  // // Start new round
  // const handleStartMindMatchRound = async () => {
  //   setMindMatchLoading(true);
  //   const roundId = await MindMatchService.startNewRound(lobbyId);
  //   setMindMatchRoundId(roundId);
  //   setMindMatchState('playing');
  //   const question = await MindMatchService.getCurrentQuestion(lobbyId);
  //   setMindMatchCurrentQuestion(question);
  //   setMindMatchLoading(false);
  // };

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
          {/* Debug lobby data */}
          {/* {console.log('🔍 Header Debug - Lobby data:', { 
            lobby: lobby, 
            image_url: lobby?.image_url, 
            name: lobby?.name 
          })} */}
          <div className="fixed top-0 left-0 right-0 z-40 h-[80px] dark:bg-gray-800 backdrop-blur-md border-b border-gray-200 shadow-sm rounded-b-2xl overflow-hidden">
            {/* <div className="relative w-full z-10 flex-shrink-0"> */}
            <div className="absolute inset-0 z-10">
              {lobby?.image_url ? (
                <div className="relative w-full">
                  <img
                    src={lobby?.image_url}
                    alt={lobby.name || 'Lobby'}
                    className="w-full h-24 md:h-32 object-cover object-center rounded-b-2xl"
                    style={{
                      // willChange: 'transform',
                      // backfaceVisibility: 'hidden',
                      filter: 'brightness(0.5) blur(0px)'
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-24 md:h-32 bg-red-500 flex items-center justify-center rounded-b-2xl">
                  <div className="w-10 h-10 text-white" />
                </div>
              )}
            </div>

            <div className='relative z-20'>
              {/* Mobile Header */}
              <div className="absolute top-0 left-0 right-0 p-20 z-50">
                {isMobile ? (
                  <div className="absolute inset-0 flex flex-col justify-between p-4 text-white bg-black/30 rounded-b-2xl">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => router.push('/lobby')}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <ArrowLeft className="w-5 h-5 text-white dark:text-white" />
                        </button>

                        {/* Lobby Image */}
                        {/* <div className="flex-shrink-0 relative z-30">
                      {lobby?.image_url ? (
                        <>
                          <img
                            src={lobby?.image_url}
                            alt={lobby.name || 'Lobby'}
                            className="w-8 h-8 rounded-lg object-cover border-2 border-white shadow-sm relative z-30"
                            onError={(e) => {
                              console.error('Mobile header: Error loading lobby image:', lobby?.image_url);
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) {
                                fallback.style.display = 'flex';
                                fallback.classList.remove('hidden');
                              }
                            }}
                          />
                          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center shadow-sm  absolute top-0 left-0 z-30">
                            <MessageCircle className="w-4 h-4 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center shadow-sm relative z-30">
                          <MessageCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div> */}

                        <div>
                          <h1 className={` ${boldonse.className} text-sm font-semibold text-amber-400 dark:text-white`}>{lobby?.name ? `${lobby.name} Chat` : 'Lobby Chat'}</h1>
                          <p className="text-xs text-shadow-amber-200 dark:text-white/90">{participants.length} participants</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => window.location.reload()}
                          className="p-2 rounded-full transition-all duration-200 ease-in-out hover:bg-gray-100 text-white"
                          title="Reload page"
                        >
                          <RefreshCw className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setShowInfo(!showInfo)}
                          className={`p-2 rounded-full transition-all duration-200 ease-in-out ${showInfo ? 'bg-lime-600 text-primary-600' : 'hover:bg-gray-100 text-white '
                            }`}
                        >
                          <Settings className="w-5 h-5 dark:text-white " />
                        </button>
                      </div>

                    </div>
                    <div className=" absolute bottom-0 left-0 right-0 flex items-center justify-between gap-2 p-4 bg-white/20 backdrop-blur-md rounded-xl">
                      <p className="text-xs text-white/80">Get to know each other before matching!</p>
                      <div className="flex gap-2 flex-1">
                        <button
                          onClick={() => setActiveTab('chat')}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === 'chat'
                            ? 'bg-primary-500 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Chat</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('questions')}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === 'questions'
                            ? 'bg-primary-500 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                          <Brain className="w-4 h-4" />
                          <span>Q&A</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Desktop Header */
                  // <div className="absolute top-0 left-0 right-0 max-w-6xl mx-auto flex items-center justify-between p-4">
                  //   <div className="absolute top-0 left-0 right-0 flex items-center gap-4">
                  //     <button
                  //       onClick={() => router.push('/lobby')}
                  //       className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  //     >
                  //       <ArrowLeft className="w-5 h-5 text-gray-600" />
                  //     </button>
                  //     <div className="flex items-center gap-3">
                  //       {/* Lobby Image */}
                  //       {/* <div className="flex-shrink-0 relative z-30">
                  //         {lobby?.image_url ? (
                  //           <>
                  //             <img
                  //               src={lobby.image_url}
                  //               alt={lobby.name || 'Lobby'}
                  //               className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-soft relative z-30"
                  //               onError={(e) => {
                  //                 console.error('Desktop header: Error loading lobby image:', lobby?.image_url);
                  //                 e.currentTarget.style.display = 'none';
                  //                 const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  //                 if (fallback) {
                  //                   fallback.style.display = 'flex';
                  //                   fallback.classList.remove('hidden');
                  //                 }
                  //               }}
                  //             />
                  //             <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-soft  absolute top-0 left-0 z-30">
                  //               <MessageCircle className="w-5 h-5 text-white" />
                  //             </div>
                  //           </>
                  //         ) : (
                  //           <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-soft relative z-30">
                  //             <MessageCircle className="w-5 h-5 text-white" />
                  //           </div>
                  //         )}
                  //       </div> */}
                  //       <div>
                  //         <h1 className="text-xl font-semibold text-neutral-850">
                  //           {lobby?.name ? `${lobby.name} Chat` : 'Lobby Chat'}
                  //         </h1>
                  //         <p className="text-sm text-neutral-750">Get to know each other before matching!</p>
                  //       </div>
                  //     </div>
                  //   </div>

                  //   <div className="flex items-center gap-6 text-neutral-750">
                  //     <div className="flex items-center gap-2">
                  //       <Users className="w-4 h-4" />
                  //       <span className="text-sm font-medium">{participants.length} online</span>
                  //     </div>
                  //     <div className="flex items-center gap-2">
                  //       <Clock className="w-4 h-4" />
                  //       <span className="text-sm font-medium">Next: {nextMatchTime}</span>
                  //     </div>
                  //     <div className="flex items-center gap-2 text-xs text-neutral-600">
                  //       <span>Now: {currentTime}</span>
                  //     </div>
                  //     {/* Manual trigger for testing - only show if admin or in development */}
                  //     {(process.env.NODE_ENV === 'development' || session?.user?.email?.includes('admin')) && (
                  //       <>
                  //         <button
                  //           onClick={triggerMatching}
                  //           disabled={isMatching || participants.length < 2}
                  //           className="px-3 py-1 text-xs bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  //         >
                  //           {isMatching ? 'Matching...' : 'Test Match'}
                  //         </button>
                  //         {/* <button
                  //           // onClick={() => MatchingService.testMatchInsertion(lobbyId)}
                  //           onClick={triggerMatching}
                  //           disabled={isMatching || participants.length < 2}
                  //           className="px-3 py-1 text-xs bg-yellow-500 text-white rounded-full hover:bg-yellow-600"
                  //         >
                  //           Test DB
                  //         </button> */}
                  //       </>
                  //     )}
                  //   </div>
                  // </div>

                  // <div className="absolute top-0 z-50 w-full bg-white/80 backdrop-blur-lg border-b border-gray-100">
                  //   <div className="absolute top-0 left-0 right-0 max-w-6xl mx-auto px-4 py-3">
                  //     <div className=" absolute flex items-center justify-between">
                  <div className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-lg border-b border-gray-100">
                    <div className="absolute top-0 left-0 right-0 max-w-6xl mx-auto px-4 py-3">
                      <div className="flex items-center justify-between w-full">
                        {/* Left Side - Back Button & Lobby Info */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => router.push('/lobby')}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors dark:hover:bg-gray-700"
                          >
                            <ArrowLeft className="w-5 h-5 text-white" />
                          </button>

                          <div>
                            <h1 className="text-xl font-blindcharm-brand text-amber-400 dark:amber-400">
                              {lobby?.name ? `${lobby.name} Chat` : 'Lobby Chat'}
                            </h1>
                            <p className="text-sm text-white">
                              Get to know each other before matching!
                            </p>
                          </div>
                        </div>



                        <div className="ml-auto flex items-center gap-3 ">
                          {/* Online Users Pill */}
                          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                            <Users className="w-4 h-4" />
                            <span className="text-sm font-medium">{participants.length} online</span>
                          </div>

                          {/* Next Time Pill */}
                          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">Next: {nextMatchTime}</span>
                          </div>

                          {/* Current Time Pill */}
                          {/* <div className="px-4 py-2 bg-white rounded-full shadow-sm">
                            <span className="text-sm">Now: {currentTime}</span>
                          </div> */}

                          {/* Refresh Button */}
                          <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200
                     bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700
                     rounded-full transition-colors shadow-sm border border-gray-200 dark:border-gray-600"
                            title="Reload page"
                          >
                            <RefreshCw className="w-4 h-4 inline mr-2" />
                            Refresh
                          </button>

                          {/* Test Match Button */}
                          {(process.env.NODE_ENV === 'development' ||
                            session?.user?.email?.includes('admin')) && (
                              <button
                                onClick={triggerMatching}
                                disabled={isMatching || participants.length < 2}
                                className="px-4 py-2 text-sm font-medium text-white 
                     bg-rose-500 hover:bg-rose-600 
                     rounded-full transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Test Match
                              </button>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className={`${isMobile ? 'pt-[80px] pb-[50px] h-[100dvh]' : 'pt-20 pb-8'} `}>
            {isMobile ? (
              // Mobile Layout with Tabs
              <div className="h-full relative">
                {/* Tab Navigation */}

                <div className='p-0 px-0' >
                  <div className='pt-1'>
                    <LobbyBanner />
                  </div>
                  <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex h-14 px-4">
                      {/* Chat Tab */}
                      <button
                        onClick={() => setActiveTab('chat')}
                        className="relative flex-1 flex flex-col items-center justify-center py-2"
                      >
                        {/* Badge positioned like your image */}
                        <div className="absolute -top-0 left-1/2 transform translate-x-3 w-2 h-2 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold text-[10px]">

                        </div>

                        <div className={`p-1 rounded-lg transition-all duration-200 ${activeTab === 'chat'
                          ? 'bg-purple-100 dark:bg-purple-900/50'
                          : ''
                          }`}>
                          <MessagesSquare
                            size={20}
                            className={`transition-colors duration-200 ${activeTab === 'chat'
                              ? 'text-purple-600 dark:text-purple-400'
                              : 'text-gray-500 dark:text-gray-400'
                              }`}
                          />
                        </div>
                        <span className={`text-xs font-medium mt-0.5 transition-colors duration-200 ${activeTab === 'chat'
                          ? 'text-purple-600 dark:text-purple-400'
                          : 'text-gray-500 dark:text-gray-400'
                          }`}>
                          Chat
                        </span>
                      </button>

                      {/* Questions Tab */}
                      <button
                        onClick={() => setActiveTab('questions')}
                        className="flex-1 flex flex-col items-center justify-center py-2"
                      >
                        <div className={`p-1 rounded-lg transition-all duration-200 ${activeTab === 'questions'
                          ? 'bg-gray-100 dark:bg-gray-800'
                          : ''
                          }`}>
                          <BookHeart
                            size={20}
                            className={`transition-colors duration-200 ${activeTab === 'questions'
                              ? 'text-purple-600 dark:text-purple-400'
                              : 'text-gray-500 dark:text-gray-400'
                              }`}
                          />
                        </div>
                        <span className={`text-xs font-medium mt-0.5 transition-colors duration-200 ${activeTab === 'questions'
                          ? 'text-purple-600 dark:text-purple-400'
                          : 'text-gray-500 dark:text-gray-400'
                          }`}>
                          Questions
                        </span>
                      </button>
                    </div>

                    {/* Safe area for phones with home indicator */}
                    <div className="h-1 sm:h-0" />
                  </div>
                </div>
                {/* Tab Content */}
                <div className="h-[calc(100%-80px)] mx-4 ">
                  <AnimatePresence mode="wait">
                    {activeTab === 'chat' && (
                      <motion.div
                        key="chat"
                        // initial={{ opacity: 0, x: -20 }}
                        // animate={{ opacity: 1, x: 0 }}
                        // exit={{ opacity: 0, x: -20 }}
                        className="h-full"
                      >
                        <div className="bg-white rounded-3xl h-full overflow-hidden flex flex-col dark:bg-gray-800">
                          <LobbyChat
                            lobbyId={lobbyId}
                            currentUser={currentUser}
                            participants={participants}
                          />
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'questions' && (
                      <motion.div
                        key="questions"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="h-full"
                      >
                        <div className="bg-gray-100/20 rounded-2xl h-full overflow-hidden flex flex-col dark:bg-gray-800">
                          <GirlQuestionSystem
                            lobbyId={lobbyId}
                            currentUser={currentUser}
                            participants={participants}
                            nextMatchTime={nextMatchTime}
                            onMatchTriggered={triggerMatching}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* {activeTab === 'mindmatch' && (
                    <motion.div
                      key="mindmatch"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="h-full overflow-y-auto"
                    >
                      <div className="space-y-4">
                        <MindMatchArena
                          lobbyId={lobbyId}
                          currentUser={currentUser}
                          participants={participants}
                          onVibeMatch={handleVibeMatch}
                        />
                        
                        {vibeMatches.length > 0 && (
                          <VibeView
                            vibeMatches={vibeMatches}
                            participants={participants}
                            currentUserId={currentUser?.id || ''}
                            onSendVibeWave={handleSendVibeWave}
                          />
                        )}
                        
                        <MatchLeaderboard
                          lobbyId={lobbyId}
                          participants={participants}
                          vibeMatches={vibeMatches}
                          currentUserId={currentUser?.id || ''}
                        />
                        
                        <HotAnswersFeed
                          lobbyId={lobbyId}
                          participants={participants}
                          currentUserId={currentUser?.id || ''}
                          onReactToAnswer={handleReactToAnswer}
                        />
                      </div>
                    </motion.div>
                  )} */}
                    {/* {activeTab === 'mindmatch' && (
    <motion.div
      key="mindmatch"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="h-full"
    >
      <div className="h-full">
        {currentUser && currentUser.id ? (
          mindMatchState === 'waiting' ? (
            <WaitingRoom
              participants={participants}
              onStart={handleStartMindMatchRound}
              isLoading={mindMatchLoading}
            />
          ) : mindMatchState === 'playing' && mindMatchCurrentQuestion && mindMatchAnswers.length < 5 ? (
            <QuestionDisplay
              question={mindMatchCurrentQuestion}
              onAnswer={handleMindMatchAnswer}
              timeLeft={0}
              isLoading={mindMatchLoading}
            />
          ) : mindMatchState === 'results' && mindMatchRoundId ? (
            <CompatibilityBoard
              lobbyId={lobbyId}
              roundId={mindMatchRoundId}
              participants={participants}
            />
          ) : null
        ) : (
          <div className="flex items-center justify-center h-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Loading Arena</h2>
              <p className="text-gray-600">Please wait...</p>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  )} */}
                  </AnimatePresence>
                </div>

                {/* Info Panel (accessible via header button) */}
                <AnimatePresence>
                  {showInfo && (
                    <motion.div
                      initial={{ opacity: 0, x: '100%' }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: '100%' }}
                      className="absolute inset-0 z-50 dark:bg-gray-900 bg-white"
                    >
                      <div className="h-full p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-soft border border-gray-100 p-6 h-full overflow-hidden flex flex-col">
                          <div className="flex items-center gap-3 mb-6">
                            <Users className="w-6 h-6 text-primary-500" />
                            <h2 className="text-xl font-semibold text-neutral-850 dark:text-white">Participants ({participants.length})</h2>
                          </div>

                          <div className="flex-1 overflow-y-auto min-h-0">
                            <div className="space-y-3">
                              {participants.map((participant) => (
                                <motion.div
                                  key={participant.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 dark:bg-gray-700 dark:border-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                  {participant.user?.additional_photo_1 ? (
                                    <img
                                      src={participant.user.additional_photo_1}
                                      // alt={participant.user.username || 'User'}
                                      alt={generateRandomName(participant.user_id, participant.user?.gender)}
                                      className={`w-12 h-12 rounded-full object-cover ring-2 ring-primary-200 transition-all duration-300 ${participant.blur_profile
                                        ? 'blur-[1px] opacity-85'
                                        : ''
                                        }`}
                                    />
                                  ) : (
                                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold shadow-soft transition-all duration-300 ${participant.blur_profile
                                      ? 'blur-[1px] opacity-85'
                                      : ''
                                      }`}>
                                      {/* {participant.user?.username?.[0]?.toUpperCase() || '(ᵕ—ᴗ—)'} */}
                                      ☕︎
                                      {/* {generateRandomName(participant.user_id, participant.user?.gender)} */}
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium text-neutral-850 truncate dark:text-white">
                                        {/* {participant.user?.username || 'Anonymous'} */}
                                        {generateRandomName(participant.user_id, participant.user?.gender)}
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
                                    <p className="text-sm text-neutral-750 dark:text-amber-200">
                                      {/* {participant.user?.gender === 'male' ? '♂️ Male' : participant.user?.gender === 'female' ? '♀️ Female' : '⚧️ Other'} */}
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
                          <div className="flex-shrink-0 mt-6 pt-6 border-t border-gray-200 ">
                            <div className="bg-gray-100 rounded-2xl p-4 dark:bg-gray-700">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${blurMyProfile ? 'bg-primary-500' : 'bg-gray-500'
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
                                    <p className="text-sm font-medium text-neutral-850 dark:text-emerald-400">Blur My Profile</p>
                                    <p className="text-xs text-neutral-650">Hide your profile picture for privacy</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => toggleBlurProfile(!blurMyProfile)}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 hover:scale-105 ${blurMyProfile ? 'bg-primary-500 shadow-lg' : 'bg-gray-300'
                                    }`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 shadow-sm ${blurMyProfile ? 'translate-x-6 scale-110' : 'translate-x-1'
                                      }`}
                                  />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Next Match Info */}
                          <div className="flex-shrink-0 mt-6 pt-6 border-t border-gray-200">
                            <div className="text-center bg-purple-500 rounded-2xl p-4">
                              <div className="flex items-center justify-center gap-2 mb-2">
                                <Clock className="w-5 h-5 text-white" />
                                <span className="text-sm font-medium text-white">Next Match</span>
                              </div>
                              <p className="text-2xl font-bold text-white">{nextMatchTime}</p>
                              <p className="text-xs text-white mt-1">
                                Matches happen every few hours
                              </p>

                              {/* Test Match Button - Only show in development */}
                              {isAdmin && (
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
                                    'Match Now'
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // Desktop Layout

              // <div className="max-w-[1600px] mx-auto px-4  lg:pt-4 lg:pb-0  ">
              <div className="max-w-[1600px] mx-auto px-10 h-[calc(85vh-40px)] pt-1 pb-0">
                <div className='pt-0'>
                  <LobbyBanner />
                </div>
                {/* <div className="flex gap-6 h-[calc(90vh-40px)] bg-blue-600"> */}
                <div className="flex gap-6 h-full">
                  {/* Information Section - Left side */}
                  <div className="w-80 flex-shrink-0 ">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-soft border border-gray-100 h-full flex flex-col overflow-hidden">
                      {/* Header - Fixed at top */}
                      <div className="p-6 flex-shrink-0 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <Users className="w-6 h-6 text-primary-500" />
                          <h2 className="text-xl font-semibold text-neutral-850 dark:text-white">Participants ({participants.length})</h2>
                        </div>

                      </div>
                      {/* <div className='pt-1'>
                  <LobbyBanner />
                  </div> */}
                      {/* Scrollable participants list */}
                      <div className="flex-1 overflow-y-auto min-h-0 ">
                        <div className="p-6 space-y-3">
                          {participants.map((participant) => (
                            <motion.div
                              key={participant.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-colors"
                            >
                              {participant.user?.additional_photo_1 ?(
                                <img
                                  src={participant.user.additional_photo_1}
                                  // alt={participant.user.username || 'User'}
                                  alt={generateRandomName(participant.user_id, participant.user?.gender)}
                                  className={`w-12 h-12 rounded-full object-cover ring-2 ring-primary-200 transition-all duration-300 ${participant.blur_profile
                                    ? 'blur-[1px] opacity-85'
                                    : ''
                                    }`}
                                />
                              ) : (
                                <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold shadow-soft transition-all duration-300 ${participant.blur_profile
                                  ? 'blur-[1px] opacity-85'
                                  : ''
                                  }`}>
                                  {/* {participant.user?.username?.[0]?.toUpperCase() || 'U'} */}
                                  ☕︎
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-neutral-850 dark:text-lime-400 truncate">
                                    {/* {participant.user?.username || 'Anonymous'} */}
                                    {generateRandomName(participant.user_id, participant.user?.gender)}
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
                                <p className="text-sm text-neutral-750 dark:text-amber-200">
                                  {/* {participant.user?.gender === 'male' ? '♂️ Male' : participant.user?.gender === 'female' ? '♀️ Female' : '⚧️ Other'} */}
                                  {' • '}Waiting for match...
                                </p>
                              </div>
                            </motion.div>
                          ))}

                          {participants.length === 0 && (
                            <div className="text-center py-12">
                              <Users className="w-16 h-16 text-gray-300  mx-auto mb-4" />
                              <p className="text-neutral-750 font-medium">No participants yet</p>
                              <p className="text-neutral-650 text-sm">Be the first to join!</p>
                            </div>
                          )}
                        </div>
                      </div>


                      {/* Fixed bottom section with settings and match info */}
                      <div className="flex-shrink-0 border-t border-gray-100 ">
                        {/* Privacy Settings */}
                        <div className="p-6">
                          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-300  rounded-2xl p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${blurMyProfile ? 'bg-primary-500' : 'bg-gray-500'
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
                                  <p className="text-sm font-medium text-neutral-850 dark:text-lime-400">Blur My Profile</p>
                                  <p className="text-xs text-neutral-650">Hide your profile picture for privacy</p>
                                </div>
                              </div>
                              <button
                                onClick={() => toggleBlurProfile(!blurMyProfile)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 hover:scale-105 ${blurMyProfile ? 'bg-primary-500 shadow-lg' : 'bg-gray-300'
                                  }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 shadow-sm ${blurMyProfile ? 'translate-x-6 scale-110' : 'translate-x-1'
                                    }`}
                                />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Next Match Info */}
                        <div className="px-6 pb-6">
                          <div className="text-center bg-purple-500 rounded-2xl p-4">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <Clock className="w-5 h-5 text-white" />
                              <span className="text-sm font-medium text-white">Next Match</span>
                            </div>
                            <p className="text-2xl font-bold text-amber-300">{nextMatchTime}</p>
                            <p className="text-xs text-white mt-1">
                              Matches happen every few hours
                            </p>

                            {/* Test Match Button - Only show in development */}
                            {isAdmin && (
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
                                  'Match Now'
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>


                  {/* Chat Section - Center */}
                  <div className="flex-1 min-w-0">
                    <div className="bg-white rounded-3xl shadow-soft border border-gray-100 h-full overflow-hidden flex flex-col dark:bg-gray-800">
                      <LobbyChat
                        lobbyId={lobbyId}
                        currentUser={currentUser}
                        participants={participants}
                      />
                    </div>

                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-white rounded-3xl shadow-soft border border-gray-100 h-full overflow-hidden flex flex-col dark:bg-gray-800">
                      {/* <LobbyChat
                        lobbyId={lobbyId}
                        currentUser={currentUser}
                        participants={participants}
                      /> */}
                      <GirlQuestionSystem
                        lobbyId={lobbyId}
                        currentUser={currentUser}
                        participants={participants}
                        nextMatchTime={nextMatchTime}
                        onMatchTriggered={triggerMatching}
                      />
                    </div>

                  </div>





                  {/* MindMatch Arena - Right side */}
                  {/* <div className="w-96 flex-shrink-0">
                  <div className="h-full overflow-y-auto space-y-6">
                    <MindMatchArena
                      lobbyId={lobbyId}
                      currentUser={currentUser}
                      participants={participants}
                      onVibeMatch={handleVibeMatch}
                    />
                    
                    {vibeMatches.length > 0 && (
                      <VibeView
                        vibeMatches={vibeMatches}
                        participants={participants}
                        currentUserId={currentUser?.id || ''}
                        onSendVibeWave={handleSendVibeWave}
                      />
                    )}
                    
                    <MatchLeaderboard
                      lobbyId={lobbyId}
                      participants={participants}
                      vibeMatches={vibeMatches}
                      currentUserId={currentUser?.id || ''}
                    />
                    
                    <HotAnswersFeed
                      lobbyId={lobbyId}
                      participants={participants}
                      currentUserId={currentUser?.id || ''}
                      onReactToAnswer={handleReactToAnswer}
                    />
                  </div>
                </div> */}
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

          {/* Cache Statistics (Debug) - Only show for admins */}
          {/* {isAdmin && <CacheStats />} */}
        </div>
        {/* <SimpleBottomNav /> */}
      </>
    </ErrorBoundary >
  )
}
