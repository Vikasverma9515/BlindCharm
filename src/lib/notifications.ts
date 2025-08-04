// Notification service for sending different types of notifications

export interface NotificationPayload {
  title: string;
  body: string;
  type?: 'match' | 'message' | 'lobby' | 'general' | 'broadcast';
  url?: string;
  matchId?: string;
  image?: string;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
}

export class NotificationService {
  private static async sendNotification(
    payload: NotificationPayload & {
      userId?: string;
      userIds?: string[];
      broadcast?: boolean;
    }
  ) {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Failed to send notification: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  // Send match notification
  static async sendMatchNotification(userId: string, matchId: string, matchName?: string) {
    return this.sendNotification({
      userId,
      title: '💕 New Match!',
      body: matchName 
        ? `You matched with ${matchName}! Start chatting now.`
        : 'You have a new match! Start chatting now.',
      type: 'match',
      url: `/matches/${matchId}`,
      matchId,
      actions: [
        {
          action: 'view',
          title: 'View Match',
          icon: '/icon-72x72.png'
        },
        {
          action: 'chat',
          title: 'Start Chat',
          icon: '/icon-72x72.png'
        }
      ],
      requireInteraction: true
    });
  }

  // Send message notification
  static async sendMessageNotification(
    userId: string, 
    matchId: string, 
    senderName: string, 
    messagePreview: string
  ) {
    return this.sendNotification({
      userId,
      title: `💬 ${senderName}`,
      body: messagePreview.length > 50 
        ? `${messagePreview.substring(0, 50)}...`
        : messagePreview,
      type: 'message',
      url: `/whispers/${matchId}`,
      matchId,
      actions: [
        {
          action: 'reply',
          title: 'Reply',
          icon: '/icon-72x72.png'
        },
        {
          action: 'view',
          title: 'View Chat',
          icon: '/icon-72x72.png'
        }
      ]
    });
  }

  // Send lobby notification
  static async sendLobbyNotification(userId: string, lobbyName: string, lobbyId?: string) {
    return this.sendNotification({
      userId,
      title: '🎯 Lobby Activity',
      body: `New activity in ${lobbyName}! Join the conversation.`,
      type: 'lobby',
      url: lobbyId ? `/lobby/${lobbyId}` : '/lobby',
      actions: [
        {
          action: 'join',
          title: 'Join Lobby',
          icon: '/icon-72x72.png'
        }
      ]
    });
  }

  // Send general notification to specific user
  static async sendGeneralNotification(
    userId: string, 
    title: string, 
    body: string, 
    url?: string
  ) {
    return this.sendNotification({
      userId,
      title,
      body,
      type: 'general',
      url: url || '/'
    });
  }

  // Send broadcast notification to all users
  static async sendBroadcastNotification(
    title: string, 
    body: string, 
    url?: string,
    image?: string
  ) {
    return this.sendNotification({
      broadcast: true,
      title,
      body,
      type: 'broadcast',
      url: url || '/',
      image,
      requireInteraction: true
    });
  }

  // Send notification to multiple users
  static async sendBulkNotification(
    userIds: string[], 
    title: string, 
    body: string, 
    type?: NotificationPayload['type'],
    url?: string
  ) {
    return this.sendNotification({
      userIds,
      title,
      body,
      type: type || 'general',
      url: url || '/'
    });
  }

  // Send welcome notification to new users
  static async sendWelcomeNotification(userId: string, userName?: string) {
    return this.sendNotification({
      userId,
      title: '🎉 Welcome to BlindCharm!',
      body: userName 
        ? `Hi ${userName}! Ready to find your perfect match? Start exploring now.`
        : 'Ready to find your perfect match? Start exploring now.',
      type: 'general',
      url: '/lobby',
      actions: [
        {
          action: 'explore',
          title: 'Start Exploring',
          icon: '/icon-72x72.png'
        }
      ],
      requireInteraction: true
    });
  }

  // Send reminder notification
  static async sendReminderNotification(userId: string, type: 'inactive' | 'pending_matches') {
    const notifications = {
      inactive: {
        title: '💭 Missing You!',
        body: 'Your perfect match might be waiting. Come back and explore!',
        url: '/lobby'
      },
      pending_matches: {
        title: '💕 You Have Pending Matches!',
        body: 'Check out your new matches and start chatting.',
        url: '/matches'
      }
    };

    const notification = notifications[type];
    return this.sendNotification({
      userId,
      title: notification.title,
      body: notification.body,
      type: 'general',
      url: notification.url
    });
  }
}

// Helper function to check if notifications are supported
export const isNotificationSupported = (): boolean => {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
};

// Helper function to get notification permission status
export const getNotificationPermission = (): NotificationPermission => {
  if ('Notification' in window) {
    return Notification.permission;
  }
  return 'default';
};