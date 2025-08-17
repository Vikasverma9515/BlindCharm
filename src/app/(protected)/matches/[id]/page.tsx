// src/app/(protected)/matches/[id]/page.tsx
'use client'

import { use, useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { boldonse, inter, poppins } from '@/app/fonts'
import MobileLayout from '@/components/shared/MobileLayout'
import { LucideVoicemail, Mic, Play, Pause } from 'lucide-react';
import { uploadVoiceMessage } from '@/lib/supabase-storage';
import { getVoiceMessageUrl } from '@/utils/voice'


interface MatchParams {
  params: { id: string }
}

// interface Match {
//   id: string
//   user1_id: string
//   user2_id: string
//   status: string
//   created_at: string
//   user1: {
//     id: string
//     username: string
//     profile_picture: string | null
//   }
//   user2: {
//     id: string
//     username: string
//     profile_picture: string | null
//   }
// }

// export interface User {
//   id: string
//   username: string
//   full_name: string
//   gender: 'male' | 'female' | 'other'
//   dob: string
//   bio: string
//   interests: string[]
//   profile_picture: string | null
//   created_at: string
//   updated_at: string
// }

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

  // All useState hooks at the top
  const [match, setMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [bothRevealed, setBothRevealed] = useState(false);
  const [myProfile, setMyProfile] = useState<ExtendedUserProfile | null>(null);
  const [otherUserProfile, setOtherUserProfile] = useState<ExtendedUserProfile | null>(null);
  const [isUser1, setIsUser1] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const recordingStartTime = useRef<number>(0);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

  // Voice recording logic
  const startRecording = async () => {
    try {
      // Check if browser supports MediaRecorder
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Voice recording is not supported in your browser');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Check for supported MIME types
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ''; // Let browser choose
          }
        }
      }

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      
      audioChunks.current = []; // Clear previous chunks

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunks.current, { 
            type: mimeType || 'audio/webm' 
          });
          setAudioBlob(audioBlob);
          setIsProcessingVoice(true);
          await handleVoiceMessage(audioBlob);
        } catch (error) {
          console.error('Error handling voice message:', error);
          alert('Failed to send voice message. Please try again.');
        } finally {
          setIsProcessingVoice(false);
        }
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      recordingStartTime.current = Date.now();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          alert('Microphone access denied. Please allow microphone access to send voice messages.');
        } else if (error.name === 'NotFoundError') {
          alert('No microphone found. Please connect a microphone to send voice messages.');
        } else {
          alert('Error accessing microphone. Please try again.');
        }
      } else {
        alert('Error accessing microphone. Please try again.');
      }
    }
  };

const stopRecording = () => {
  if (mediaRecorder && isRecording) {
    try {
      const recordingDuration = Date.now() - recordingStartTime.current;
      
      // Check minimum recording duration (500ms to prevent accidental taps)
      if (recordingDuration < 500) {
        // Cancel recording if too short
        mediaRecorder.stop();
        setIsRecording(false);
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        audioChunks.current = []; // Clear chunks
        return;
      }

      mediaRecorder.stop();
      setIsRecording(false);
      // Stop all audio tracks
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  }
};
const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

  // Helper to get audio duration
  const getAudioDuration = (blob: Blob): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.src = URL.createObjectURL(blob);
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(audio.src);
        resolve(audio.duration);
      };
    });
  };

  // Upload and send voice message
  const handleVoiceMessage = async (blob: Blob) => {
    if (!match?.id || !session?.user?.id) return;

    try {
      // Determine file extension based on blob type
      let extension = 'webm';
      if (blob.type.includes('mp4')) extension = 'mp4';
      else if (blob.type.includes('wav')) extension = 'wav';
      else if (blob.type.includes('ogg')) extension = 'ogg';

      // Convert Blob to File
      const file = new File([blob], `voice-${Date.now()}.${extension}`, {
        type: blob.type
      });

      // Get audio duration
      const duration = await getAudioDuration(blob);

      // Upload to Supabase storage
      const uploadResult = await uploadVoiceMessage(file, match.id);
      if (!uploadResult?.path) throw new Error('Upload failed');

      // Get the public URL
      const audioUrl = getVoiceMessageUrl(uploadResult.path);

      // Create message in database
      const { data: messageData, error: messageError } = await supabase
        .from('match_messages')
        .insert({
          match_id: match.id,
          sender_id: session.user.id,
          content: '🎤 Voice message',
          type: 'voice',
          metadata: {
            audio_url: audioUrl,
            duration: duration,
            file_type: blob.type
          }
        })
        .select('*, sender:sender_id(*)')
        .single();

      if (messageError) throw messageError;

      // Update messages state with proper sender info
      if (messageData) {
        const newVoiceMessage: Message = {
          ...messageData,
          sender: {
            id: session.user.id,
            username: session.user.name || 'You',
            profile_picture: null
          },
          type: 'voice',
          metadata: messageData.metadata ?? undefined
        };
        setMessages(prev => [...prev, newVoiceMessage]);
        setTimeout(() => scrollToBottom(), 100);
      }

      // Send push notification to the other user
      try {
        const otherUserId = match.user1_id === session.user.id ? match.user2_id : match.user1_id;
        const senderName = session.user.name || 'Someone';

        await fetch('/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: otherUserId,
            title: `🎤 ${senderName}`,
            body: 'Sent you a voice message',
            type: 'voice_message',
            url: `/matches/${match.id}`,
            matchId: match.id
          })
        });
      } catch (notificationError) {
        console.error('Failed to send push notification:', notificationError);
        // Don't throw here - message was sent successfully
      }

    } catch (error) {
      console.error('Error sending voice message:', error);
      alert('Failed to send voice message. Please try again.');
    }
  };

  // All useRef hooks
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages on mount and when matchId changes
  useEffect(() => {
    if (!matchId) return;
    fetchMessages();
  }, [matchId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages.length]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!matchId) return;

    const channel = supabase
      .channel(`match_messages_${matchId}_${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_messages',
          filter: `match_id=eq.${matchId}`
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [matchId]);

  // Fetch match info and poll messages
  useEffect(() => {
    if (!session?.user?.id || !matchId) return;

    fetchMatch();
    const interval = setInterval(fetchMessages, 3000);

    return () => clearInterval(interval);
  }, [session?.user?.id, matchId]);

  // Fetch reveal status and profiles
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

      // Then, fetch user profiles separately only if both have revealed
      if (matchData.user1_revealed && matchData.user2_revealed) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select(`
          id, username, profile_picture, bio, interests, age, education, gender,
          full_name, height, occupation, languages, hobbies, looking_for, 
          personality_tags, lifestyle_tags, location, photos, dob
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
      } else {
        // Clear profiles if not both revealed
        setMyProfile(null);
        setOtherUserProfile(null);
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

  // Helper functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('match_messages')
      .select('id, content, sender_id, created_at, type, metadata, sender:sender_id(id, username, profile_picture)')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      const transformed: Message[] = data.map(msg => ({
        ...msg,
        sender: Array.isArray(msg.sender) ? msg.sender[0] : msg.sender,
        type: msg.type ?? 'text',
        metadata: msg.metadata ?? undefined
      }));
      setMessages(transformed);
      // Use setTimeout to ensure DOM is updated before scrolling
      setTimeout(() => scrollToBottom(), 100);
    } else if (error) {
      console.error('Error fetching messages:', error);
    }
  };

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
    if (!newMessage.trim() || !session?.user?.id || !match?.id) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    try {
      const { data, error } = await supabase
        .from('match_messages')
        .insert({
          match_id: match.id,
          sender_id: session.user.id,
          content: messageContent
        })
        .select('id, content, sender_id, created_at, metadata')
        .single();

      if (error) throw error;

      // Immediately add the message to the local state for instant feedback
      if (data) {
        const newMsg: Message = {
          ...data,
          sender: {
            id: session.user.id,
            username: session.user.name || 'You',
            profile_picture: null
          },
          type: 'text',
          metadata: data.metadata ?? undefined
        };
        setMessages(prev => [...prev, newMsg]);
        setTimeout(() => scrollToBottom(), 100);
      }

      // Also fetch all messages to ensure consistency
      await fetchMessages();

      // Send push notification to the other user
      try {
        const otherUserId = match.user1_id === session.user.id ? match.user2_id : match.user1_id;
        const senderName = session.user.name || 'Someone';

        await fetch('/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: otherUserId,
            title: ` ${senderName} 💥`,
            body: messageContent.length > 50
              ? `${messageContent.substring(0, 50)}...`
              : messageContent,
            type: 'message',
            url: `/matches/${match.id}`,
            matchId: match.id
          })
        });
      } catch (notificationError) {
        console.error('Failed to send push notification:', notificationError);
        // Don't throw here - message was sent successfully, notification is just a bonus
      }
    } catch (err) {
      console.error('Error sending message:', err);
      // Restore the message in input if there was an error
      setNewMessage(messageContent);
    }
  };


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


  // const VoiceMessage = ({ url, duration, isOwn }: { url: string, duration?: number, isOwn?: boolean }) => {
  //   const audioRef = useRef<HTMLAudioElement>(null);
  //   const [isPlaying, setIsPlaying] = useState(false);
  //   const [currentTime, setCurrentTime] = useState(0);
  //   const [isLoaded, setIsLoaded] = useState(false);

  //   useEffect(() => {
  //     if (audioRef.current) {
  //       audioRef.current.addEventListener('loadedmetadata', () => setIsLoaded(true));
  //       audioRef.current.addEventListener('timeupdate', () =>
  //         setCurrentTime(audioRef.current?.currentTime || 0)
  //       );
  //       audioRef.current.addEventListener('ended', () => setIsPlaying(false));
  //     }

  //     return () => {
  //       if (audioRef.current) {
  //         audioRef.current.removeEventListener('loadedmetadata', () => setIsLoaded(true));
  //         audioRef.current.removeEventListener('timeupdate', () =>
  //           setCurrentTime(audioRef.current?.currentTime || 0)
  //         );
  //         audioRef.current.removeEventListener('ended', () => setIsPlaying(false));
  //       }
  //     };
  //   }, []);

  //   const togglePlay = async () => {
  //     if (!audioRef.current) return;

  //     try {
  //       if (isPlaying) {
  //         await audioRef.current.pause();
  //       } else {
  //         await audioRef.current.play();
  //       }
  //       setIsPlaying(!isPlaying);
  //     } catch (error) {
  //       console.error('Playback error:', error);
  //     }
  //   };


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





    // return (
    //   <div className="flex flex-col h-screen  ">
    //     {/* Chat Header with safe area support */}
    //     <div className="bg-white border-b border-gray-200 dark:bg-black px-4 py-3  flex items-center justify-between fixed top-0 left-0 right-0 z-50">
    //       <div className="flex items-center space-x-3">
    //         <button
    //           onClick={() => router.push('/matches')}
    //           className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white rounded-full transition-colors"
    //         >
    //           <svg className="w-5 h-5 text-gray-600 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    //           </svg>
    //         </button>

    //         <div className="flex items-center space-x-3">
    //           <div className="relative">
    //             {bothRevealed && otherUserProfile?.profile_picture ? (
    //               <img
    //                 src={otherUserProfile.profile_picture}
    //                 alt={otherUserProfile.username}
    //                 className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover object-center"
    //               />
    //             ) : (
    //               <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black flex border dark:text-amber-50 border-red-500 items-center justify-center">
    //                 <span className="text-white font-semibold text-sm sm:text-base">
    //                   {bothRevealed && otherUserProfile?.username
    //                     ? otherUserProfile.username[0].toUpperCase()
    //                     : '?'}
    //                 </span>
    //               </div>
    //             )}
    //             <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border border-white"></div>
    //           </div>

    //           <div className="min-w-0">
    //             <h1 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
    //               {bothRevealed && otherUserProfile?.username
    //                 ? otherUserProfile.username
    //                 : 'Anonymous Match'}
    //             </h1>
    //             <p className="text-xs text-gray-500 dark:text-gray-400">
    //               {bothRevealed ? 'Online' : 'Identity hidden'}
    //             </p>
    //           </div>
    //         </div>
    //       </div>

    //       <div className="flex items-center space-x-1 sm:space-x-2">
    //         {!hasRevealed ? (
    //           // < div className="inline-flex gap-2">
    //           <div className="flex items-center space-x-2">
    //             {/* Tooltip trigger */}
    //             <div className="">
    //               <button
    //                 onClick={() => setShowTooltip(!showTooltip)}
    //                 className="w-5 h-5 flex items-center justify-center rounded-full bg-yellow-300 text-black text-xs font-bold hover:bg-yellow-400 transition-colors">
    //                 ?
    //               </button>
    //               {/* {showTooltip && (
    //             <div className="absolute z-20 w-64 px-3 py-2 text-xs text-gray-700 bg-white border border-gray-200 rounded-md shadow-md left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
    //               You're chatting anonymously for now. When you're ready, tap <span className="font-semibold text-red-500">Reveal</span>. <br />
    //               <span className="italic text-gray-500">Both people must tap Reveal to see each other’s profiles.</span>
    //             </div>
    //              )} */}

    //               {showTooltip && (
    //                 <div className="absolute top-15 z-20 w-64 px-3 py-2 text-xs text-gray-700 bg-white border border-gray-200 rounded-md shadow-md dark:bg-gray-800 dark:text-white left-1/2 transform -translate-x-1/2 mt-2">
    //                   You're chatting anonymously for now. When you're ready, tap <span className="font-semibold text-red-500">Reveal</span>.
    //                   <br />
    //                   <span className="italic text-gray-500 dark:text-gray-300">
    //                     Both people must tap Reveal to see each other’s profiles.
    //                   </span>
    //                 </div>
    //               )}
    //             </div>
    //             <button
    //               onClick={handleReveal}
    //               className="bg-red-500 text-white   px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-red-600 transition-colors"
    //             >
    //               Reveal
    //             </button>

    //           </div>


    //         ) : !bothRevealed ? (
    //           <div className="flex items-center space-x-1 sm:space-x-2">
    //             <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full animate-pulse"></div>
    //             <span className="text-xs text-gray-500 dark:text-white hidden sm:inline">Waiting...</span>
    //             <span className="text-xs text-gray-500 dark:text-white sm:hidden">...</span>
    //           </div>
    //         ) : (
    //           <button
    //             onClick={() => setShowProfile(!showProfile)}
    //             className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${showProfile
    //               ? 'bg-red-500 text-white hover:bg-red-600'
    //               : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-lime-500 dark:text-white dark:hover:bg-gray-600'
    //               }`}
    //           >
    //             <span className="hidden sm:inline">{showProfile ? 'Hide Profile' : 'View Profile'}</span>
    //             <span className="sm:hidden">{showProfile ? 'Hide' : 'View 👀' }</span>
    //           </button>
    //         )}
    //       </div>
    //     </div>

    //     {/* Reveal Status Banner */}
    //     {hasRevealed && !bothRevealed && (
    //       <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
    //         <div className="flex items-center justify-center space-x-2">
    //           <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
    //           <p className="text-amber-700 text-sm font-medium">
    //             You've revealed your identity. Waiting for your match to reveal theirs...
    //           </p>
    //         </div>
    //       </div>
    //     )}

    //     {bothRevealed && (
    //       <div className="bg-green-50 border-b border-green-200 px-4 py-2">
    //         <div className="flex items-center justify-center space-x-2">
    //           <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
    //             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    //           </svg>
    //           <p className="text-green-700 text-sm font-medium">
    //             Both identities revealed! You can now see each other's profiles.
    //           </p>
    //         </div>
    //       </div>
    //     )}
    //     {/* {!bothRevealed && (
    //     <div className="mx-4 mt-3 mb-2 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm text-sm text-yellow-800">
    //       <p className="font-semibold mb-1">🔓 Reveal Rule</p>
    //       <p>
    //         You can chat freely while anonymous. Once you vibe, tap <span className="text-red-500 font-semibold">Reveal</span> to unmask your identity.
    //       </p>
    //       <p className="text-xs text-gray-600 italic mt-1">
    //         Both of you need to reveal to unlock each other's profiles 💫
    //       </p>
    //     </div>
    //   )} */}


    //     {/* Enhanced Profile Section */}
    //     {bothRevealed && showProfile && otherUserProfile && (
    //       <div className="bg-gray-50 border-b border-gray-200 dark:bg-black max-h-200 sm:max-h-96 md:max-h-[32rem] lg:max-h-[40rem] xl:max-h-[44rem] overflow-y-auto">
    //         <div className="p-4 sm:p-2 md:p-4 max-w-4xl mx-auto ">
    //           <EnhancedProfileCard user={otherUserProfile} />
    //         </div>
    //       </div>
    //     )}

    //     {/* Messages Area */}
    //     <div className="pt-15 flex-1 overflow-y-auto bg-gray-50 dark:bg-black px-4 py-2">
    //       {messages.length === 0 ? (
    //         <div className="flex flex-col items-center justify-center h-full text-center">
    //           {/* <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4"> */}

    //           {/* <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    //           </svg> */}
    //           <div className='inline-flex scale-75 items-center justify-center mb-4 gap-3'>
    //             <div className='bg-amber-300 shadow-2xl  rounded-2xl w-28 h-20 flex items-center justify-center animate-floaty'>
    //               {/* <span className='text-red-500 text-xl font-semibold '>
    //               ( ˶°ㅁ°) !!
    //             </span> */}
    //               <span className='text-red-500 text-xl font-semibold transition-all duration-300'>
    //                 {boyFaces[faceIndex]}
    //               </span>
    //             </div>
    //             <div className='bg-amber-300 shadow-2xl  rounded-2xl w-28 h-20 flex items-center justify-center animate-floaty'>
    //               {/* <span className='text-red-500 text-xl font-semibold'>
    //               (*ᴗ͈ˬᴗ͈)ꕤ*
    //             </span> */}
    //               <span className='text-red-500 text-xl font-semibold transition-all duration-300'>
    //                 {girlFaces[faceIndex]}
    //               </span>
    //             </div>
    //             <br />
    //           </div>
    //           <h3 className="text-lg font-blindcharm-tech text-gray-900 dark:text-amber-100 mb-2">No messages yet</h3>
    //           <p className="text-red-500 text-sm max-w-xs font-bold italic">
    //             Your story hasn’t started yet...
    //             <br />
    //             <span className="font-semibold">Tip: </span>Say hey, share a thought — let the vibe flow ♡

    //           </p>
    //         </div>
    //       ) : (
    //         <div className="space-y-3 py-2">
    //           {messages.map((message) => (
    //             <div
    //               key={message.id}
    //               className={`flex ${message.sender_id === session?.user?.id ? 'justify-end' : 'justify-start'}`}
    //             >
    //               <div className={`max-w-[75%] ${message.sender_id === session?.user?.id ? 'order-2' : 'order-1'}`}>
    //                 <div
    //                   className={`px-4 py-2 rounded-2xl ${
    //                     message.sender_id === session?.user?.id
    //                       ? 'bg-red-500 text-white rounded-br-md'
    //                       : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
    //                   }`}
    //                 >
    //                   {message.type === 'voice' && message.metadata?.audio_url ? (
    //                     <VoiceMessage
    //                       url={message.metadata.audio_url}
    //                       duration={message.metadata.duration}
    //                       isOwn={message.sender_id === session?.user?.id}
    //                     />
    //                   ) : (
    //                     <p className="text-sm leading-relaxed">{message.content}</p>
    //                   )}
    //                 </div>
    //                 <div className={`flex items-center mt-1 space-x-1 ${message.sender_id === session?.user?.id ? 'justify-end' : 'justify-start'
    //                   }`}>
    //                   <span className="text-xs text-gray-400">
    //                     {new Date(message.created_at).toLocaleTimeString([], {
    //                       hour: '2-digit',
    //                       minute: '2-digit'
    //                     })}
    //                   </span>
    //                   {message.sender_id === session?.user?.id && (
    //                     <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
    //                       <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    //                     </svg>
    //                   )}
    //                 </div>
    //               </div>
    //             </div>
    //           ))}
    //           <div ref={messagesEndRef} />
    //         </div>
    //       )}
    //     </div>

    //     {/* Message Input */}
    //     <div className="bg-white border-t border-gray-200 dark:border-gray-100 dark:bg-black px-4 py-3 rounded-2xl">
    //       <form onSubmit={sendMessage} className="flex items-center space-x-3">
    //         <div className="flex-1 relative">
    //           <input
    //             type="text"
    //             value={newMessage}
    //             onChange={(e) => setNewMessage(e.target.value)}
    //             placeholder="Type a message..."
    //             className="w-full bg-gray-100 dark:bg-gray-900 dark:text-amber-50 rounded-2xl px-4 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
    //           />
    //           <button
    //             type="button"
    //             onMouseDown={startRecording}
    //             onMouseUp={stopRecording}
    //             onTouchStart={startRecording}
    //             onTouchEnd={stopRecording}
    //             className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full transition-all duration-200 ${
    //               isRecording 
    //                 ? 'bg-red-500 text-white animate-pulse scale-110' 
    //                 : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
    //             }`}
    //             title={isRecording ? 'Release to send voice message' : 'Hold to record voice message'}
    //           >
    //             <Mic className={`w-4 h-4 ${isRecording ? 'text-white' : ''}`} />
    //           </button>
    //         </div>
            
    //         {/* Voice Recording/Processing Indicator */}
    //         {isRecording && (
    //           <div className="flex items-center space-x-2 text-red-500 animate-pulse">
    //             <div className="w-2 h-2 bg-red-500 rounded-full"></div>
    //             <span className="text-sm font-medium">Recording...</span>
    //           </div>
    //         )}
            
    //         {isProcessingVoice && (
    //           <div className="flex items-center space-x-2 text-blue-500">
    //             <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    //             <span className="text-sm font-medium">Sending...</span>
    //           </div>
    //         )}
            
    //         <button
    //           type="submit"
    //           disabled={!newMessage.trim()}
    //           className="bg-red-500 text-white p-2.5 rounded-full hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    //         >
    //           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    //           </svg>
    //         </button>
    //       </form>
    //     </div>
    //   </div>
    // );
    return (
  <div className="flex flex-col h-screen">
    {/* Chat Header with safe area support */}
    <div className="bg-white border-b border-gray-200 dark:bg-black px-4 py-3 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
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
          </div>

          <div className="min-w-0">
            <h1 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
              {bothRevealed && otherUserProfile?.username
                ? otherUserProfile.username
                : 'Anonymous Match'}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {bothRevealed ? 'Online' : 'Identity hidden'}
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
                <div className="absolute top-8 z-20 w-64 px-3 py-2 text-xs text-gray-700 bg-white border border-gray-200 rounded-md shadow-md dark:bg-gray-800 dark:text-white left-1/2 transform -translate-x-1/2">
                  You're chatting anonymously for now. When you're ready, tap <span className="font-semibold text-red-500">Reveal</span>.
                  <br />
                  <span className="italic text-gray-500 dark:text-gray-300">
                    Both people must tap Reveal to see each other's profiles.
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
      </div>
    </div>

    {/* Main Content Area - Add top padding to account for fixed navbar */}
    <div className="flex-1 flex flex-col pt-16"> {/* pt-16 accounts for navbar height */}
      
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

      {bothRevealed && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-2">
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-green-700 text-sm font-medium">
              Both identities revealed! You can now see each other's profiles.
            </p>
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

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black px-4 py-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className='inline-flex scale-75 items-center justify-center mb-4 gap-3'>
              <div className='bg-amber-300 shadow-2xl rounded-2xl w-28 h-20 flex items-center justify-center animate-floaty'>
                <span className='text-red-500 text-xl font-semibold transition-all duration-300'>
                  {boyFaces[faceIndex]}
                </span>
              </div>
              <div className='bg-amber-300 shadow-2xl rounded-2xl w-28 h-20 flex items-center justify-center animate-floaty'>
                <span className='text-red-500 text-xl font-semibold transition-all duration-300'>
                  {girlFaces[faceIndex]}
                </span>
              </div>
              <br />
            </div>
            <h3 className="text-lg font-blindcharm-tech text-gray-900 dark:text-amber-100 mb-2">No messages yet</h3>
            <p className="text-red-500 text-sm max-w-xs font-bold italic">
              Your story hasn't started yet...
              <br />
              <span className="font-semibold">Tip: </span>Say hey, share a thought — let the vibe flow ♡
            </p>
          </div>
        ) : (
          <div className="space-y-3 py-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === session?.user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] ${message.sender_id === session?.user?.id ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      message.sender_id === session?.user?.id
                        ? 'bg-red-500 text-white rounded-br-md'
                        : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
                    }`}
                  >
                    {message.type === 'voice' && message.metadata?.audio_url ? (
                      <VoiceMessage
                        url={message.metadata.audio_url}
                        duration={message.metadata.duration}
                        isOwn={message.sender_id === session?.user?.id}
                      />
                    ) : (
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    )}
                  </div>
                  <div className={`flex items-center mt-1 space-x-1 ${message.sender_id === session?.user?.id ? 'justify-end' : 'justify-start'
                    }`}>
                    <span className="text-xs text-gray-400">
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {message.sender_id === session?.user?.id && (
                      <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 dark:border-gray-100 dark:bg-black px-4 py-3 rounded-2xl">
        <form onSubmit={sendMessage} className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-gray-100 dark:bg-gray-900 dark:text-amber-50 rounded-2xl px-4 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
            />
            <button
              type="button"
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full transition-all duration-200 ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse scale-110' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
              title={isRecording ? 'Release to send voice message' : 'Hold to record voice message'}
            >
              <Mic className={`w-4 h-4 ${isRecording ? 'text-white' : ''}`} />
            </button>
          </div>
          
          {/* Voice Recording/Processing Indicator */}
          {isRecording && (
            <div className="flex items-center space-x-2 text-red-500 animate-pulse">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium">Recording...</span>
            </div>
          )}
          
          {isProcessingVoice && (
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

  // Enhanced Profile Card Component
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
      <div className="bg-gray-200 dark:bg-black border border-gray-200 dark:border-gray-100 rounded-2xl shadow-lg overflow-hidden">
        {/* Header with main photo - Responsive */}
        <div className="relative h-100 sm:h-72 md:h-80 lg:h-96 xl:h-[28rem] bg-gradient-to-br from-red-400 to-pink-500 overflow-hidden">
          {user.profile_picture ? (
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-300 hover:scale-105"
              style={{
                backgroundImage: `url(${user.profile_picture})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center center'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold">
                  {user.username?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 sm:p-5 md:p-6 xl:p-8">
            <h1 className="text-white font-blindcharm-tech text-xl sm:text-2xl md:text-3xl xl:text-4xl  mb-1 leading-tight drop-shadow-lg">
              {user.full_name || user.username}
              {age && <span className="text-lg sm:text-xl md:text-2xl xl:text-3xl font-normal ml-2">{age}</span>}
            </h1>
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

        <div className="p-4 sm:p-5 md:p-6 xl:p-8 space-y-4 sm:space-y-5 md:space-y-6 xl:space-y-8">
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

  // Add this at the bottom of your file
  function ProfileCard({ user, bothRevealed }: { user: UserProfile & { bio?: string; interests?: string[]; age?: number; education?: string }, bothRevealed: boolean }) {
    if (!user) return null;
    return (
      <div className="flex flex-col items-center bg-white rounded-lg shadow p-4 w-full max-w-xs">
        <img
          src={user.profile_picture || '/default-avatar.png'}
          alt={user.username}
          className={`w-20 h-20 rounded-full object-cover mb-2 transition-all duration-300 ${!bothRevealed ? 'blur-sm grayscale' : ''}`}
        />
        <h3 className="font-bold text-lg">{user.username}</h3>
        {bothRevealed && (
          <>
            <p className="text-gray-500">{user.bio}</p>
            <p className="text-gray-400 text-sm">Age: {user.age}</p>
            <p className="text-gray-400 text-sm">Education: {user.education}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {user.interests?.map((interest: string) => (
                <span key={interest} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">{interest}</span>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }


// Helper function for formatting duration
function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// VoiceMessage playback component
// const VoiceMessage = ({ url, duration, isOwn }: { url: string, duration?: number, isOwn?: boolean }) => {
//   const audioRef = useRef<HTMLAudioElement>(null);
//   const [isPlaying, setIsPlaying] = useState(false);

//   const togglePlay = () => {
//     if (audioRef.current) {
//       if (isPlaying) {
//         audioRef.current.pause();
//       } else {
//         audioRef.current.play();
//       }
//       setIsPlaying(!isPlaying);
//     }
//   };

//   return (
//     <div className="flex items-center space-x-2">
//       <button
//         onClick={togglePlay}
//         className={`p-2 rounded-full ${isPlaying ? 'bg-red-600' : 'bg-red-500'} text-white`}
//       >
//         {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
//       </button>
//       <audio
//         ref={audioRef}
//         src={url}
//         onEnded={() => setIsPlaying(false)}
//         className="hidden"
//       />
//       <span className="text-xs text-gray-500">{duration ? `${Math.round(duration)}s` : ''}</span>
//     </div>
//   );
// };

// Create a separate VoiceMessage component at the bottom of the file
const VoiceMessage = ({ url, duration, isOwn }: { url: string, duration?: number, isOwn?: boolean }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setIsLoaded(true);
      setHasError(false);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setHasError(true);
      setIsLoaded(false);
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [url]);

  const togglePlay = async () => {
    if (!audioRef.current || hasError) return;
    
    try {
      if (isPlaying) {
        await audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Playback error:', error);
      setHasError(true);
      setIsPlaying(false);
    }
  };

  if (hasError) {
    return (
      <div className="flex items-center space-x-2 min-w-[120px] text-gray-500">
        <div className="p-2 rounded-full bg-gray-300">
          <LucideVoicemail className="w-4 h-4" />
        </div>
        <span className="text-xs">Voice message unavailable</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3 min-w-[160px]">
      <button
        onClick={togglePlay}
        disabled={!isLoaded}
        className={`p-2 rounded-full transition-all ${
          isOwn 
            ? (isPlaying ? 'bg-red-700' : 'bg-red-600') + ' text-white'
            : (isPlaying ? 'bg-gray-700' : 'bg-gray-600') + ' text-white'
        } hover:opacity-90 ${
          !isLoaded ? 'opacity-50 cursor-not-allowed animate-pulse' : ''
        }`}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {!isLoaded ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </button>
      
      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
      />
      
      <div className="flex-1 min-w-0">
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1">
          <div
            className={`h-full transition-all duration-100 ${
              isOwn ? 'bg-red-300' : 'bg-gray-400'
            }`}
            style={{
              width: `${duration ? (currentTime / duration) * 100 : 0}%`
            }}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className={`text-xs ${isOwn ? 'text-red-100' : 'text-gray-600'}`}>
            {formatDuration(currentTime)}
          </span>
          <span className={`text-xs ${isOwn ? 'text-red-200' : 'text-gray-500'}`}>
            {formatDuration(duration || 0)}
          </span>
        </div>
      </div>
    </div>
  );
};