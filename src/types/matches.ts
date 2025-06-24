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