// // src/lib/chat/ChatService.ts
// import { io, Socket } from 'socket.io-client';
// import { supabase } from '@/lib/supabase';
// import { Message, Match } from '@/types/chat';

// export class ChatService {
//   private socket: Socket;
//   private currentUserId: string | null;

//   constructor(userId: string) {
//     if (!process.env.NEXT_PUBLIC_WS_URL) {
//       throw new Error('WebSocket URL not configured');
//     }
    
//     this.currentUserId = userId;
//     this.socket = io(process.env.NEXT_PUBLIC_WS_URL);
//     this.initializeSocketListeners();
//   }

//   private initializeSocketListeners(): void {
//     this.socket.on('message:received', this.handleNewMessage.bind(this));
//     this.socket.on('user:typing', this.handleUserTyping.bind(this));
//     this.socket.on('message:read', this.handleMessageRead.bind(this));
//   }

//   private handleNewMessage(message: Message): void {
//     // Implement message handling logic
//     console.log('New message received:', message);
//   }

//   private handleUserTyping(data: { userId: string; matchId: string }): void {
//     // Implement typing indicator logic
//     console.log('User typing:', data);
//   }

//   private handleMessageRead(data: { messageId: string; readBy: string }): void {
//     // Implement read receipt logic
//     console.log('Message read:', data);
//   }

//   public async sendMessage(matchId: string, content: string): Promise<Message> {
//     try {
//       if (!this.currentUserId) {
//         throw new Error('User not authenticated');
//       }

//       if (!content.trim()) {
//         throw new Error('Message content cannot be empty');
//       }

//       const { data: message, error } = await supabase
//         .from('messages')
//         .insert({
//           match_id: matchId,
//           sender_id: this.currentUserId,
//           content: content.trim(),
//           read: false,
//         })
//         .select()
//         .single();

//       if (error) throw error;
//       if (!message) throw new Error('Failed to create message');

//       // Emit the message through socket
//       this.socket.emit('message:sent', message);

//       // Update match reveal stage
//       await this.updateMatchRevealStage(matchId);
      
//       return message;
//     } catch (error) {
//       console.error('Error sending message:', error);
//       throw error;
//     }
//   }

//   private async updateMatchRevealStage(matchId: string): Promise<void> {
//     try {
//       const { data: match, error } = await supabase
//         .from('matches')
//         .select('messages_count, reveal_stage')
//         .eq('id', matchId)
//         .single();

//       if (error) throw error;
//       if (!match) throw new Error('Match not found');

//       let newStage = match.reveal_stage;
//       if (match.messages_count >= 15) newStage = 'full';
//       else if (match.messages_count >= 10) newStage = 'photo';
//       else if (match.messages_count >= 5) newStage = 'name';

//       if (newStage !== match.reveal_stage) {
//         const { error: updateError } = await supabase
//           .from('matches')
//           .update({ 
//             reveal_stage: newStage,
//             updated_at: new Date().toISOString()
//           })
//           .eq('id', matchId);

//         if (updateError) throw updateError;
//       }
//     } catch (error) {
//       console.error('Error updating match reveal stage:', error);
//       throw error;
//     }
//   }

//   public async markMessageAsRead(messageId: string): Promise<void> {
//     try {
//       const { error } = await supabase
//         .from('messages')
//         .update({ read: true })
//         .eq('id', messageId);

//       if (error) throw error;

//       this.socket.emit('message:read', {
//         messageId,
//         readBy: this.currentUserId
//       });
//     } catch (error) {
//       console.error('Error marking message as read:', error);
//       throw error;
//     }
//   }

//   public emitTyping(matchId: string, isTyping: boolean): void {
//     if (!this.currentUserId) return;

//     this.socket.emit('user:typing', {
//       matchId,
//       userId: this.currentUserId,
//       isTyping
//     });
//   }

//   public disconnect(): void {
//     this.socket.disconnect();
//   }

//   public reconnect(): void {
//     if (!this.socket.connected) {
//       this.socket.connect();
//     }
//   }
// }