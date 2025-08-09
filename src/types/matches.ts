interface UserProfile {
  id: string;
  username: string;
  profile_picture: string | null;
  gender?: string;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender: UserProfile;
  type: 'text' | 'voice' | 'image' ;
  metadata?: Record<string, any>;
}

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  status: string;
  created_at: string;
  user1: UserProfile;
  user2: UserProfile;
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