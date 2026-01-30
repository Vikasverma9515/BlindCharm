// src/app/(protected)/matches/[id]/page.tsx
'use client'

import { use, useEffect, useState, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { boldonse, inter, poppins } from '@/app/fonts'
import MobileLayout from '@/components/shared/MobileLayout'
import { LucideVoicemail, Mic, Play, Pause, Send, Square, Zap } from 'lucide-react';
// import { uploadVoiceMessage } from '@/lib/supabase-storage';
// import { getVoiceMessageUrl } from '@/utils/voice'
import { uploadVoiceMessage, getVoiceMessageUrl } from '@/lib/voice-upload'
import VoiceMessage from '@/components/chat/VoiceMessage'
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'
import { useMatchChat } from '@/hooks/useMatchChat'
import MatchMessages from '@/components/chat/MatchMessages'
import ChatActionsMenu from '@/components/chat/ChatActionMenu'
import BlockConfirmationModal from '@/components/chat/BlockConfirmationModal'

import ChallengeCard from '@/components/chat/VoiceChallenge/ChallengeCard'
import ChallengeRecorder from '@/components/chat/VoiceChallenge/ChallengeRecorder'
import { getRandomChallenge } from '@/lib/voiceChallenges'
// import EnhancedChallengeCard from '@/components/chat/VoiceChallenge/EnhancedChallengeCard'
import { VoiceChallenge } from '@/hooks/useMatchChat'
import PersonalizedChallengeCard from '@/components/chat/VoiceChallenge/PersonalizedChallengeCard'
import SuccessPopup from '@/components/chat/SuccessPopup'




interface MatchParams {
  params: { id: string }
}


interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  sender: {
    id: string
    username: string
    profile_picture: string | null
  }
  type: 'text' | 'voice' | 'image'
  metadata?: Record<string, any>
}

interface VoiceMessage extends Message {
  type: 'voice';
  metadata: {
    audio_url: string;
    duration: number;
    waveform?: number[];
    transcription?: string;
  };
}


interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  status: string;
  created_at: string;
  user1_revealed: boolean;
  user2_revealed: boolean;
  user1: UserProfile;
  user2: UserProfile;
}

interface UserProfile {
  id: string;
  username: string;
  profile_picture: string | null;
  bio?: string;
  interests?: string[];
  age?: number;
  education?: string;
  face_verified?: boolean;
  college_verified?: boolean;
  college_name?: string;
  additional_photo_1?: string | null;
  additional_photo_2?: string | null;
  is_admin?: boolean;
}

interface ExtendedUserProfile extends UserProfile {
  full_name?: string;
  gender?: 'male' | 'female' | 'other';
  height?: string;
  occupation?: string;
  languages?: string[];
  hobbies?: string[];
  looking_for?: string[];
  personality_tags?: string[];
  lifestyle_tags?: string[];
  location?: string | { city: string; country: string };
  photos?: string[];
  dob?: string;
}


interface PageProps {
  params: Promise<{ id: string }>
};




export default function MatchChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: matchId } = use(params);
  const { data: session } = useSession();
  const router = useRouter();

  const {
    messages,
    loading: messagesLoading,
    error: messageError,
    sendMessage: sendChatMessage,
    loadMoreMessages,
    hasMoreMessages,
    refreshMessages,
    clearError,
    blockUser,
    createVoiceChallenge,
    respondToChallenge,
    currentChallenge,
    acceptChallenge,
    skipChallenge

  } = useMatchChat({
    matchId,
    userId: session?.user?.id,
    enabled: !!matchId && !!session?.user?.id,
    pageSize: 20
  });

  // All useState hooks at the top
  const [match, setMatch] = useState<Match | null>(null);
  // const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [bothRevealed, setBothRevealed] = useState(false);
  const [myProfile, setMyProfile] = useState<ExtendedUserProfile | null>(null);
  const [otherUserProfile, setOtherUserProfile] = useState<ExtendedUserProfile | null>(null);
  const [isUser1, setIsUser1] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  // const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const recordingStartTime = useRef<number>(0);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  // const [isAtBottom, setIsAtBottom] = useState(true);
  // const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  // const [unreadCount, setUnreadCount] = useState(0);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');








  const { isRecording, isProcessing, startRecording, stopRecording, cancelRecording } = useVoiceRecorder();
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  // const [isAtBottom, setIsAtBottom] = useState(true);
  // const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  // const messgaesContainerRef = useRef<HTMLDivElement>(null);


  // Add these new states in your MatchChatPage component

  const [hasInitiallyScrolled, setHasInitiallyScrolled] = useState(false);
  const [showChallengeRecorder, setShowChallengeRecorder] = useState(false);
  const MESSAGES_PER_PAGE = 20; // Load 20 messages at a time



  const [showRevealedBanner, setShowRevealedBanner] = useState(() => {
    // Check localStorage on initial load - make it match-specific
    if (typeof window !== 'undefined' && matchId) {
      const dismissed = localStorage.getItem(`dismissed-reveal-banner-${matchId}`);
      return dismissed !== 'true'; // If dismissed is 'true', don't show banner
    }
    return true; // Default to showing the banner
  });

  // Function to dismiss banner and save to localStorage
  const dismissRevealedBanner = () => {
    setShowRevealedBanner(false);
    if (typeof window !== 'undefined' && matchId) {
      localStorage.setItem(`dismissed-reveal-banner-${matchId}`, 'true');
    }
  };




  const handleAcceptChallenge = () => {

    setShowChallengeRecorder(true);
  };

  const handleSkipChallenge = async () => {
    if (currentChallenge) {
      // Mark challenge as skipped
      await supabase
        .from('voice_challenges')
        .update({ status: 'skipped' })
        .eq('id', currentChallenge.id);
    }
  };

  const handleChallengeComplete = async (audioBlob: Blob, duration: number) => {
    if (currentChallenge) {
      try {
        await respondToChallenge(currentChallenge.id, audioBlob, duration);
        setShowChallengeRecorder(false);
      } catch (error) {
        console.error('Failed to complete challenge:', error);
        alert('Failed to send challenge response. Please try again.');
      }
    }
  };



  const handleBlockUser = async () => {
    try {
      await blockUser();
      setShowBlockModal(false);

      // Redirect to matches page after blocking
      router.push('/matches');

      // Optional: Show success message
      // You can use a toast library here
      console.log('User blocked successfully');
    } catch (error) {
      console.error('Failed to block user:', error);
      // Optional: Show error message
      alert('Failed to block user. Please try again.');
    }
  };

  // Cleanup effect for voice recording
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        try {
          mediaRecorder.stop();
          if (mediaRecorder.stream) {
            mediaRecorder.stream.getTracks().forEach(track => {
              track.stop();
              track.enabled = false;
            });
          }
        } catch (error) {
          console.error('Error cleaning up media recorder:', error);
        }
      }
    };
  }, [mediaRecorder]);








  // Update the fetchRevealStatus function
  const fetchRevealStatus = async () => {
    if (!matchId || !session?.user?.id) return;

    try {
      // First, fetch the match reveal status
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('user1_id, user2_id, user1_revealed, user2_revealed')
        .eq('id', matchId)
        .single();

      if (matchError) {
        console.error('Error fetching match data:', matchError);
        return;
      }
      if (!matchData) return;

      const isCurrentUser1 = matchData.user1_id === session.user.id;
      setIsUser1(isCurrentUser1);
      setHasRevealed(isCurrentUser1 ? matchData.user1_revealed : matchData.user2_revealed);
      setBothRevealed(matchData.user1_revealed && matchData.user2_revealed);

      // Always fetch verification status (even during anonymous phase)
      const otherUserId = isCurrentUser1 ? matchData.user2_id : matchData.user1_id;

      // Fetch minimal data for verification badges during anonymous phase
      const { data: verificationData, error: verificationError } = await supabase
        .from('users')
        .select('id, face_verified, college_verified, college_name')
        .eq('id', otherUserId)
        .single();

      if (verificationError) {
        console.error('Error fetching verification data:', verificationError);
      } else {
        // Set basic verification info for anonymous phase
        setOtherUserProfile(prev => ({
          ...prev,
          id: verificationData.id,
          face_verified: verificationData.face_verified,
          college_verified: verificationData.college_verified,
          college_name: verificationData.college_name,
          username: prev?.username || '',
          profile_picture: prev?.profile_picture || null
        }));
      }

      // If both have revealed, fetch full profile data
      if (matchData.user1_revealed && matchData.user2_revealed) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select(`
          id, username, profile_picture, bio, interests, age, education, gender,
          full_name, height, occupation, languages, hobbies, looking_for, 
          personality_tags, lifestyle_tags, location, photos, dob, 
          face_verified, college_verified, college_name
        `)
          .in('id', [matchData.user1_id, matchData.user2_id]);

        if (userError) {
          console.error('Error fetching user data:', userError);
          return;
        }
        if (!userData) return;

        const user1Data = userData.find(u => u.id === matchData.user1_id);
        const user2Data = userData.find(u => u.id === matchData.user2_id);

        setMyProfile((isCurrentUser1 ? user1Data : user2Data) || null);
        setOtherUserProfile((isCurrentUser1 ? user2Data : user1Data) || null);
      }
    } catch (err) {
      console.error('Error in fetchRevealStatus:', err);
    }
  };

  // Poll for reveal status and profiles
  useEffect(() => {
    fetchRevealStatus();
    const interval = setInterval(fetchRevealStatus, 2000);
    return () => clearInterval(interval);
  }, [matchId, session?.user?.id]);





  const fetchMatch = async () => {
    try {
      const { data: matchData, error } = await supabase
        .from('matches')
        .select(`
          id,
          user1_id,
          user2_id,
          status,
          created_at,
          user1_revealed,
          user2_revealed,
          user1:user1_id(id, username, profile_picture),
          user2:user2_id(id, username, profile_picture)
        `)
        .eq('id', matchId)
        .single();

      if (error) throw error;

      const transformedMatch: Match = {
        id: matchData.id,
        user1_id: matchData.user1_id,
        user2_id: matchData.user2_id,
        status: matchData.status,
        created_at: matchData.created_at,
        user1_revealed: matchData.user1_revealed,
        user2_revealed: matchData.user2_revealed,
        user1: Array.isArray(matchData.user1) ? matchData.user1[0] as UserProfile : matchData.user1 as UserProfile,
        user2: Array.isArray(matchData.user2) ? matchData.user2[0] as UserProfile : matchData.user2 as UserProfile
      };

      setMatch(transformedMatch);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching match:', err);
      router.push('/lobby');
    }
  };

  const handleReveal = async () => {
    if (!matchId || !session?.user?.id) return;
    const isCurrentUser1 = match?.user1_id === session.user.id;
    const updateField = isCurrentUser1 ? 'user1_revealed' : 'user2_revealed';

    const { error } = await supabase
      .from('matches')
      .update({ [updateField]: true })
      .eq('id', matchId);

    if (!error) {
      setHasRevealed(true);
      fetchRevealStatus(); // Refresh status after reveal
    }
  };





  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🚀 Form submitted - attempting to send message');
    console.log('📝 Form data:', {
      newMessage: newMessage.trim(),
      userId: session?.user?.id,
      matchId: match?.id
    });

    if (!newMessage.trim() || !session?.user?.id || !match?.id) {
      console.log('❌ Cannot send - missing required data:', {
        hasMessage: !!newMessage.trim(),
        hasUserId: !!session?.user?.id,
        hasMatchId: !!match?.id
      });
      return;
    }

    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      console.log('📤 Calling sendChatMessage with:', messageContent);

      await sendChatMessage(messageContent, 'text');

      console.log('✅ sendChatMessage completed successfully');

      // Send push notification
      const otherUserId = match.user1_id === session.user.id ? match.user2_id : match.user1_id;
      const senderName = session.user.name || 'Someone';

      console.log('📱 Sending push notification to:', otherUserId);

      await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: otherUserId,
          title: `${senderName} 💥`,
          body: messageContent.length > 50 ? `${messageContent.substring(0, 50)}...` : messageContent,
          type: 'message',
          url: `/matches/${match.id}`,
          matchId: match.id
        })
      });

      console.log('✅ Push notification sent');
    } catch (err) {
      console.error('💥 Error in sendMessage:', err);
      setNewMessage(messageContent);
    }
  };


  const handleManualChallenge = async () => {
    console.log('🎯 Manual challenge button clicked!');

    if (!match || !session?.user?.id) {
      alert('Cannot create challenge - missing match or user data');
      return;
    }

    // Determine the other user (recipient of the challenge)
    const recipientId = match.user1_id === session.user.id ? match.user2_id : match.user1_id;
    const recipientName = bothRevealed && otherUserProfile?.username
      ? otherUserProfile.username
      : 'your match';

    const randomChallenge = getRandomChallenge();
    console.log('🎲 Random challenge selected for', recipientName, ':', randomChallenge);

    try {
      console.log('📤 Creating challenge for recipient:', recipientId);
      await createVoiceChallenge(randomChallenge.prompt, randomChallenge.timeLimit, recipientId);
      console.log('✅ Challenge created successfully!');

      // Show success popup instead of alert
      setSuccessMessage(`Voice Challenge sent to ${recipientName}!`);
      setShowSuccessPopup(true);
    } catch (error) {
      console.error('❌ Failed to create challenge:', error);
      alert('Failed to create voice challenge. Please try again.');
    }
  };
  // Add this temporary test function to your MatchChatPage
  const testDatabaseInsert = async () => {
    try {
      console.log('🧪 Testing direct database insert...');

      const { data, error } = await supabase
        .from('match_messages')
        .insert({
          match_id: matchId,
          sender_id: session?.user?.id,
          content: `Test message ${Date.now()}`,
          type: 'text'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Test insert failed:', error);
      } else {
        console.log('✅ Test insert successful:', data);
      }
    } catch (err) {
      console.error('💥 Test insert error:', err);
    }
  };



  // Add a button temporarily to test this
  // <button onClick={testDatabaseInsert}>Test DB Insert</button>

  // UPDATE your handleVoiceMessage function:
  const handleVoiceMessage = async () => {
    if (!match?.id || !session?.user?.id || isUploadingVoice) {
      return;
    }

    try {
      setIsUploadingVoice(true);
      console.log('🎤 Processing voice message...');

      await new Promise(resolve => setTimeout(resolve, 100));
      const { blob, duration } = await stopRecording();

      console.log('📝 Recording result:', { duration, size: blob.size, type: blob.type });

      if (blob.size < 1000) {
        alert('Recording too short. Please hold the button longer.');
        return;
      }

      if (blob.size > 1024 * 1024) {
        alert('Recording too long. Please record a shorter message.');
        return;
      }

      // Upload the voice message
      const uploadResult = await uploadVoiceMessage(blob, match.id, session.user.id);
      if (!uploadResult?.path) {
        throw new Error('Upload failed');
      }

      const audioUrl = getVoiceMessageUrl(uploadResult.path);

      // Use the hook's sendMessage with voice type
      await sendChatMessage('🎤 Voice message', 'voice', {
        audio_url: audioUrl,
        duration: duration,
        file_type: blob.type,
        file_size: blob.size
      });

      console.log('✅ Voice message sent successfully');

    } catch (error) {
      console.error('❌ Voice message failed:', error);
      if (error instanceof Error && error.message.includes('No audio data')) {
        console.log('Recording too short, cancelled');
      } else {
        alert('Failed to send voice message. Please try again.');
      }
    } finally {
      setIsUploadingVoice(false);
    }
  };

  useEffect(() => {
    if (!session?.user?.id || !matchId) return;
    fetchMatch();
  }, [session?.user?.id, matchId]);

  useEffect(() => {
    if (messages.length > 0 && !messagesLoading) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages.length > 0, messagesLoading]);

  const [faceIndex, setFaceIndex] = useState(0)





  const faces = ['( ˶°ㅁ°) !!', '( ˶–ㅁ–) zZ', '( ˶°ㅁ°) !!'] // Add more if you want!
  const boyFaces = ['( ˶°ㅁ°) !!', '( ˶–ㅁ–) zZ', '( ˶⚆_⚆) !!']
  const girlFaces = ['(*ᴗ͈ˬᴗ͈)ꕤ*', '(*-ᴗ-*) zZ', '(*≧ω≦)♡']

  useEffect(() => {
    const interval = setInterval(() => {
      setFaceIndex((prev) => (prev + 1) % faces.length)
    }, 1000) // 1 second cycle

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest('.reveal-tooltip')) {
        setShowTooltip(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isRecording) {
        cancelRecording();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isRecording, cancelRecording]);



  useEffect(() => {
    if (messages.length > 0 && !messagesLoading) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages.length > 0, messagesLoading]);


  useEffect(() => {
    // Debug subscription
    const testSubscription = () => {
      console.log('🧪 Testing subscription for match:', matchId);
      console.log('🧪 Current messages count:', messages.length);
      console.log('🧪 User ID:', session?.user?.id);
      console.log('🧪 Messages loading:', messagesLoading);
    };

    // Run test every 10 seconds
    const interval = setInterval(testSubscription, 10000);

    return () => clearInterval(interval);
  }, [matchId, messages.length, session?.user?.id, messagesLoading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mb-4 mx-auto animate-spin">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!match) return null;

  const otherUser = match.user1_id === session?.user?.id ? match.user2 : match.user1;

  return (
    <div className="flex flex-col h-screen overflow-hidden">

      <SuccessPopup
        isVisible={showSuccessPopup}
        message={successMessage}
        onClose={() => setShowSuccessPopup(false)}
      />
    
      {/* Chat Header with safe area support */}
      <div className="bg-white border-b border-gray-200 dark:bg-black px-4 py-3 flex items-center justify-between fixed top-0 left-0 right-0 z-50 ">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push('/matches')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center space-x-3">
            <div className="relative">
              {bothRevealed && otherUserProfile?.profile_picture ? (
                <img
                  src={otherUserProfile.profile_picture}
                  alt={otherUserProfile.username}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover object-center"
                />
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black flex border dark:text-amber-50 border-red-500 items-center justify-center">
                  <span className="text-white font-semibold text-sm sm:text-base">
                    {bothRevealed && otherUserProfile?.username
                      ? otherUserProfile.username[0].toUpperCase()
                      : '?'}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border border-white"></div>

              {/* Verification Badge Overlay - Show even during anonymous phase */}
              {otherUserProfile && (otherUserProfile.face_verified || otherUserProfile.college_verified) && (
                <div className="absolute -top-1 -right-1 flex space-x-0.5">
                  {/* {otherUserProfile.face_verified && (
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 border border-white rounded-full flex items-center justify-center">
                      
                      <svg className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )} */}
                  {/* {otherUserProfile.college_verified && (
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border border-white rounded-full flex items-center justify-center">
                      
                      <svg className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18M12,3L1,9L12,15L21,11V17H23V9L12,3Z" />
                      </svg>
                    </div>
                  )} */}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <h1 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                  {bothRevealed && otherUserProfile?.username
                    ? otherUserProfile.full_name
                    : 'Blind Match'}
                </h1>

                {/* Verification Badges - Show always when available */}
                {otherUserProfile && (
                  <div className="flex items-center space-x-1">
                    {/* Face Verification Badge */}
                    <div className={`flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 ${otherUserProfile.face_verified
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600'
                      }`}
                    >
                      {otherUserProfile.face_verified ? (
                        /* Face Icon - Verified */
                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      ) : (
                        /* Face Icon - Unverified */
                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      )}
                    </div>

                    {/* College Verification Badge */}
                    <div className={`flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 ${otherUserProfile.college_verified
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600'
                      }`}
                      title={otherUserProfile.college_verified ? `College Verified ✓${otherUserProfile.college_name ? ` (${otherUserProfile.college_name})` : ''}` : 'College Not Verified'}
                    >
                      {otherUserProfile.college_verified ? (
                        /* Graduation Cap Icon - Verified */
                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18M12,3L1,9L12,15L21,11V17H23V9L12,3Z" />
                        </svg>
                      ) : (
                        /* Graduation Cap Icon - Unverified */
                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18M12,3L1,9L12,15L21,11V17H23V9L12,3Z" />
                        </svg>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {bothRevealed ? (
                  <span className="flex items-center space-x-1">
                    <span>Online</span>
                    {/* Show verification status text */}
                    {otherUserProfile && (
                      <span className="hidden sm:inline text-xs">
                        {otherUserProfile.face_verified && otherUserProfile.college_verified
                          ? '• Fully Verified'
                          : otherUserProfile.face_verified && !otherUserProfile.college_verified
                            ? '• Face Verified'
                            : !otherUserProfile.face_verified && otherUserProfile.college_verified
                              ? '• College Verified'
                              : '• Unverified'
                        }
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="flex items-center space-x-1">
                    {/* Show verification status even during anonymous phase */}
                    {otherUserProfile && (
                      <span className="text-xs">
                        {otherUserProfile.face_verified && otherUserProfile.college_verified
                          ? '• Fully Verified'
                          : otherUserProfile.face_verified && !otherUserProfile.college_verified
                            ? '• Face Verified'
                            : !otherUserProfile.face_verified && otherUserProfile.college_verified
                              ? '• College Verified'
                              : '• Unverified'
                        }
                      </span>
                    )}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2">
          {!hasRevealed ? (
            <div className="flex items-center space-x-2">
              <div className="relative">
                <button
                  onClick={() => setShowTooltip(!showTooltip)}
                  className="w-5 h-5 flex items-center justify-center rounded-full bg-yellow-300 text-black text-xs font-bold hover:bg-yellow-400 transition-colors">
                  ?
                </button>

                {showTooltip && (
                  <div className="absolute top-10 z-20 w-60 px-3 py-2 text-xs text-gray-700 bg-white border border-gray-200 rounded-md shadow-md dark:bg-gray-800 dark:text-white left-1/2 transform -translate-x-1/2">
                    You're chatting anonymously for now. When you're ready, tap <span className="font-semibold text-red-500">Reveal</span>.
                    <br />
                    <span className=" text-gray-700 dark:text-gray-300 mt-1 mb-1 block">
                      👤 Blue = Face Verified, 🎓 Green = College Verified
                    </span>
                    <span className="">
                      <Zap className="w-3 h-3 inline-block text-purple-500 " /> Send Voice challenge to your match
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={handleReveal}
                className="bg-red-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Reveal
              </button>
            </div>
          ) : !bothRevealed ? (
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500 dark:text-white hidden sm:inline">Waiting...</span>
              <span className="text-xs text-gray-500 dark:text-white sm:hidden">...</span>
            </div>
          ) : (
            <button
              onClick={() => setShowProfile(!showProfile)}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${showProfile
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-lime-500 dark:text-white dark:hover:bg-gray-600'
                }`}
            >
              <span className="hidden sm:inline">{showProfile ? 'Hide Profile' : 'View Profile'}</span>
              <span className="sm:hidden">{showProfile ? 'Hide' : 'View 👀'}</span>
            </button>
          )}
          <ChatActionsMenu
            onBlock={() => setShowBlockModal(true)}
            otherUserName={
              bothRevealed && otherUserProfile?.username
                ? otherUserProfile.username
                : 'this user'
            }
          />
        </div>
      </div>

      <BlockConfirmationModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={handleBlockUser}
        otherUserName={
          bothRevealed && otherUserProfile?.username
            ? otherUserProfile.username
            : 'this user'
        }
      />


      {/* Main Content Area - Add top padding to account for fixed navbar */}
      <div className="flex-1 flex flex-col pt-16 h-full overflow-hidden"> {/* pt-16 accounts for navbar height */}

        {/* Reveal Status Banner */}
        {hasRevealed && !bothRevealed && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <p className="text-amber-700 text-sm font-medium">
                You've revealed your identity. Waiting for your match to reveal theirs...
              </p>
            </div>
          </div>
        )}

        {bothRevealed && showRevealedBanner && (
          <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/30 dark:via-emerald-900/30 dark:to-teal-900/30 border-b border-green-200 dark:border-green-700">
            <div className="px-4 py-2.5">
              <div className="flex items-center justify-between max-w-2xl mx-auto">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {/* Success animation */}
                  <div className="relative">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="absolute inset-0 w-6 h-6 bg-green-400 rounded-full animate-ping opacity-75"></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-green-800 dark:text-green-200 text-sm font-semibold">
                      🎉 Both revealed! Profiles unlocked
                    </p>
                    <p className="text-green-600 dark:text-green-300 text-xs">
                      Tap "View" to see their full details
                    </p>
                  </div>

                  {/* Quick verification preview - only show on larger screens */}
                  {otherUserProfile && (
                    <div className="hidden sm:flex items-center space-x-1 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-2 py-1 rounded-full border border-green-200 dark:border-green-700">
                      {otherUserProfile.face_verified && (
                        <div className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                      )}
                      {otherUserProfile.college_verified && (
                        <div className="w-3.5 h-3.5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18M12,3L1,9L12,15L21,11V17H23V9L12,3Z" />
                          </svg>
                        </div>
                      )}
                      {(otherUserProfile.face_verified || otherUserProfile.college_verified) && (
                        <span className="text-xs text-green-700 dark:text-green-200 font-medium">
                          Verified
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Dismiss button - Updated to use new function */}
                <button
                  onClick={dismissRevealedBanner}
                  className="ml-2 p-1.5 hover:bg-green-200/50 dark:hover:bg-green-800/50 rounded-full transition-all duration-200 flex-shrink-0 group"
                  title="Dismiss notification"
                >
                  <svg
                    className="w-4 h-4 text-green-600 dark:text-green-300 group-hover:text-green-800 dark:group-hover:text-green-100 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Profile Section */}
        {bothRevealed && showProfile && otherUserProfile && (
          <div className="bg-gray-50 border-b border-gray-200 dark:bg-black max-h-200 sm:max-h-96 md:max-h-[32rem] lg:max-h-[40rem] xl:max-h-[44rem] overflow-y-auto">
            <div className="p-4 sm:p-2 md:p-4 max-w-4xl mx-auto">
              <EnhancedProfileCard user={otherUserProfile} />
            </div>
          </div>
        )}


        {/* Messages Area - Updated with smart scrolling */}
        {/* Messages Area with Load More functionality */}
        <MatchMessages
          messages={messages}
          loading={messagesLoading}
          hasMoreMessages={hasMoreMessages}
          loadMoreMessages={loadMoreMessages}
          currentUserId={session?.user?.id}
          boyFaces={boyFaces}
          girlFaces={girlFaces}
          faceIndex={faceIndex}
        />
        
        {/* // Update your challenge display in the main component */}
        {currentChallenge && !showChallengeRecorder && (
          <div className="px-4">
            <PersonalizedChallengeCard
              challenge={currentChallenge}
              currentUserId={session?.user?.id || ''}
              senderName={bothRevealed && otherUserProfile?.username ? otherUserProfile.username : 'Your match'}
              onAccept={() => {
                acceptChallenge(currentChallenge.id);
                setShowChallengeRecorder(true);
              }}
              onSkip={() => skipChallenge(currentChallenge.id)}
            />
          </div>
        )}

        

        {showChallengeRecorder && currentChallenge && (
          <div className="px-4">
            <ChallengeRecorder
              prompt={currentChallenge.challenge_prompt}
              timeLimit={currentChallenge.time_limit}
              onComplete={handleChallengeComplete}
              onCancel={() => setShowChallengeRecorder(false)}
            />
          </div>
        )}

        {/* Message Input */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200 dark:border-gray-100 dark:bg-black px-4 py-3 rounded-2xl">

          <form onSubmit={sendMessage} className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-gray-100 dark:bg-gray-900 dark:text-amber-50 rounded-2xl px-4 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
              />
              {/* Updated Voice Button - More aggressive event handling */}
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isRecording && !isProcessing) {
                    startRecording().catch(error => {
                      console.error('Recording failed:', error);
                      alert('Failed to access microphone');
                    });
                  }
                }}
                onMouseUp={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (isRecording) {
                    handleVoiceMessage();
                  }
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isRecording && !isProcessing) {
                    startRecording().catch(error => {
                      console.error('Recording failed:', error);
                      alert('Failed to access microphone');
                    });
                  }
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (isRecording) {
                    handleVoiceMessage();
                  }
                }}
                onMouseLeave={(e) => {
                  // Stop recording if mouse leaves button while recording
                  if (isRecording) {
                    handleVoiceMessage();
                  }
                }}
                onContextMenu={(e) => e.preventDefault()}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full transition-all duration-200 ${isRecording
                  ? 'bg-red-500 text-white animate-pulse scale-110'
                  : isProcessing
                    ? 'bg-orange-500 text-white'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                disabled={isProcessing}
                title={
                  isProcessing
                    ? 'Processing...'
                    : isRecording
                      ? 'Release to send'
                      : 'Hold to record'
                }
              >
                <Mic className={`w-4 h-4 ${isRecording ? 'text-white' : ''}`} />
              </button>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleManualChallenge();
              }}
              className="p-2 text-purple-600 hover:bg-purple-100 rounded-full transition-all duration-150 
             active:scale-95 active:bg-purple-200 active:text-purple-700 
             transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-300"
              title="Send Voice Challenge"
            >
              <Zap className="w-5 h-5 transition-transform duration-150" />
            </button>
            {/* <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleManualChallenge();
              }}
              className="p-2 text-purple-600 hover:bg-purple-100 rounded-full transition-colors"
              title="Send Voice Challenge"
            >
              <Zap className="w-5 h-5" />
            </button> */}

            {/* Voice Recording/Processing Indicators */}
            {isRecording && (
              <div className="flex items-center space-x-2 text-red-500 animate-pulse">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium">Recording...</span>
              </div>
            )}

            {isProcessing && (
              <div className="flex items-center space-x-2 text-orange-500">
                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium">Processing...</span>
              </div>
            )}

            {isUploadingVoice && (
              <div className="flex items-center space-x-2 text-blue-500">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium">Sending...</span>
              </div>
            )}
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-red-500 text-white p-2.5 rounded-full hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}




// Enhanced Profile Card Component - Updated version with Verification
function EnhancedProfileCard({ user }: { user: ExtendedUserProfile }) {
  if (!user) return null;

  const calculateAge = (dob?: string): number | null => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatLocation = (location?: string | { city: string; country: string }): string | null => {
    if (!location) return null;
    if (typeof location === 'string') return location;
    if (typeof location === 'object' && location.city && location.country) {
      return `${location.city}, ${location.country}`;
    }
    return null;
  };

  const age = calculateAge(user.dob);
  const locationStr = formatLocation(user.location);

  return (
    <div className="bg-purple-400 dark:bg-black border border-gray-200 dark:border-gray-100 rounded-2xl shadow-lg overflow-hidden">
      {/* Header with main photo - Responsive with adaptive height */}
      <div className="relative bg-purple-400 dark:bg-black overflow-hidden">
        {user.profile_picture ? (
          // Mobile: Fixed height, Desktop: Adaptive height
          <div className="relative">
            {/* Mobile version - fixed height */}
            <div className="block md:hidden relative h-100 sm:h-72">
              <div
                className="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-300 hover:scale-105"
                style={{
                  backgroundImage: `url(${user.profile_picture})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center'
                }}
              />
            </div>

            {/* Desktop version - adaptive height */}
            <div className="hidden md:block">
              <img
                src={user.profile_picture}
                alt={user.full_name || user.username}
                className="w-full h-auto object-contain max-h-[70vh] transition-transform duration-300 hover:scale-105"
                style={{
                  minHeight: '400px',
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  // Fallback if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallbackDiv = target.nextElementSibling as HTMLElement;
                  if (fallbackDiv) fallbackDiv.style.display = 'flex';
                }}
              />
              {/* Fallback for desktop */}
              <div className="w-full h-96 flex items-center justify-center" style={{ display: 'none' }}>
                <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-white text-4xl font-bold">
                    {user.username?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // No profile picture - show placeholder
          <div className="h-100 sm:h-72 md:h-96 lg:h-[32rem] xl:h-[28rem] w-full flex items-center justify-center">
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold">
                {user.username?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
          </div>
        )}



        {/* Overlay with name and location */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 sm:p-5 md:p-6 xl:p-8">
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-white font-blindcharm-tech text-xl sm:text-2xl md:text-3xl xl:text-4xl leading-tight drop-shadow-lg">
              {user.full_name || user.username}
              {age && <span className="text-lg sm:text-xl md:text-2xl xl:text-3xl font-normal ml-2">{age}</span>}
            </h1>

            {/* Compact verification badges next to name */}
            <div className="flex space-x-1">
              {user.face_verified && (
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
              {user.college_verified && (
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18M12,3L1,9L12,15L21,11V17H23V9L12,3Z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {locationStr && (
            <div className="flex items-center text-white/90 text-xs sm:text-sm md:text-base font-blindcharm-logo">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="truncate drop-shadow-sm">{locationStr}</span>
            </div>
          )}
        </div>
      </div>
      {/* Verification Badges - Top left overlay */}
      <div className="relative pt-4 flex items-center justify-center  space-x-2">
        {/* Face Verification Badge */}
        <div className={`flex items-center space-x-1.5 px-3 py-2 rounded-full backdrop-blur-md border ${user.face_verified
          ? 'bg-blue-500/90 border-blue-400 text-white'
          : 'bg-white/20 border-white/30 text-white'
          }`}>
          <div className={`flex items-center justify-center w-5 h-5 rounded-full ${user.face_verified
            ? 'bg-white text-blue-500'
            : 'bg-white/10 text-white/70'
            }`}>
            {/* Face Icon */}
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <span className="text-sm font-medium">
            {user.face_verified ? 'Face Verified' : 'Face Unverified'}
          </span>
        </div>

        {/* College Verification Badge */}
        <div className={`flex items-center space-x-1.5 px-3 py-2 rounded-full backdrop-blur-md border ${user.college_verified
          ? 'bg-green-500/90 border-green-400 text-white'
          : 'bg-white/20 border-white/30 text-white'
          }`}>
          <div className={`flex items-center justify-center w-5 h-5 rounded-full ${user.college_verified
            ? 'bg-white text-green-500'
            : 'bg-white/10 text-white/70'
            }`}>
            {/* Graduation Cap Icon */}
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18M12,3L1,9L12,15L21,11V17H23V9L12,3Z" />
            </svg>
          </div>
          <span className="text-sm font-medium">
            {user.college_verified
              ? `College Verified${user.college_name ? ` (${user.college_name})` : ''}`
              : 'College Unverified'
            }
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 md:p-6 xl:p-8 space-y-4 sm:space-y-5 md:space-y-6 xl:space-y-8">


        {/* Rest of your existing profile sections... */}
        {/* Bio */}
        {user.bio && (
          <div>
            <h3 className="text-base sm:text-lg font-blindcharm-tech text-gray-900 dark:text-lime-300 mb-2">About</h3>
            <p className="text-gray-700 dark:text-white leading-relaxed text-sm sm:text-base">{user.bio}</p>
          </div>
        )}

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 xl:gap-6">
          {user.height && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-red-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
                </svg>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 dark:text-white">Height</p>
                  <p className="font-medium text-gray-900 dark:text-gray-300 text-sm sm:text-base truncate">{user.height} cm</p>
                </div>
              </div>
            </div>
          )}

          {user.occupation && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-red-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 002 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2v-8a2 2 0 012-2V8" />
                </svg>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 dark:text-white">Work</p>
                  <p className="font-medium text-gray-900 dark:text-gray-300 text-sm sm:text-base truncate">{user.occupation}</p>
                </div>
              </div>
            </div>
          )}

          {user.education && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-red-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 dark:text-white">Education</p>
                  <p className="font-medium text-gray-900 dark:text-gray-300 text-sm sm:text-base">{user.education}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Interests */}
        {user.interests && user.interests.length > 0 && (
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-lime-300 font-blindcharm-tech mb-2 sm:mb-3">Interests</h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {user.interests.map((interest: string, index: number) => (
                <span
                  key={index}
                  className="bg-red-100 dark:bg-red-600 dark:text-white text-red-700 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Personality Tags */}
        {user.personality_tags && user.personality_tags.length > 0 && (
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-lime-300 font-blindcharm-tech mb-2 sm:mb-3">Personality</h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {user.personality_tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Lifestyle Tags */}
        {user.lifestyle_tags && user.lifestyle_tags.length > 0 && (
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-lime-300 font-blindcharm-tech mb-2 sm:mb-3">Lifestyle</h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {user.lifestyle_tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="bg-green-100 text-green-700 dark:bg-green-600 dark:text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {user.languages && user.languages.length > 0 && (
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 font-blindcharm-tech dark:text-lime-300 mb-2 sm:mb-3">Languages</h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {user.languages.map((language: string, index: number) => (
                <span
                  key={index}
                  className="bg-purple-100 text-purple-700 dark:bg-purple-700 dark:text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium"
                >
                  {language}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Hobbies */}
        {user.hobbies && user.hobbies.length > 0 && (
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Hobbies</h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {user.hobbies.map((hobby: string, index: number) => (
                <span
                  key={index}
                  className="bg-yellow-100 text-yellow-700 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium"
                >
                  {hobby}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Looking For */}
        {user.looking_for && user.looking_for.length > 0 && (
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-lime-300 font-blindcharm-tech mb-2 sm:mb-3">Looking For</h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {user.looking_for.map((item: string, index: number) => (
                <span
                  key={index}
                  className="bg-pink-100 text-pink-700 dark:bg-pink-600 dark:text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}