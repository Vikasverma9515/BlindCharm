// // src/types/chat.ts
// export interface Message {
//     id: string;
//     match_id: string;
//     sender_id: string;
//     content: string;
//     created_at: string;
//     read: boolean;
//   }
//   export interface ChatState {
//     messages: Message[];
//     isTyping: boolean;
//     isLoading: boolean;
//     error: string | null;
//   }
  
//   export interface Match {
//     id: string;
//     user1Id: string;
//     user2Id: string;
//     revealStage: 'anonymous' | 'name' | 'photo' | 'full';
//     status: 'pending' | 'active' | 'ended';
//     messages_Count: number;
//     partnerName?: string;
//   }
//   interface MessageBubbleProps {
//     message: Message;
//     revealStage: string;
//   }