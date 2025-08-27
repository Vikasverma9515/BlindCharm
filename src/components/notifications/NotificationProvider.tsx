'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useFirebaseAuth } from '@/providers/FirebaseAuthProvider';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { NotificationService } from '@/lib/notifications';

interface NotificationContextType {
  isEnabled: boolean;
  isSupported: boolean;
  enableNotifications: () => Promise<boolean>;
  disableNotifications: () => Promise<boolean>;
  sendMatchNotification: (matchId: string, matchName?: string) => Promise<void>;
  sendMessageNotification: (matchId: string, senderName: string, message: string) => Promise<void>;
  sendLobbyNotification: (lobbyName: string, lobbyId?: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { data: session } = useSession();
  const { user: fbUser } = useFirebaseAuth();
  const userId = session?.user?.id || fbUser?.uid || null;
  const userName = (session?.user as any)?.name || fbUser?.displayName || undefined;

  const {
    isSupported,
    isSubscribed,
    subscribe,
    unsubscribe,
    permission
  } = usePushNotifications();

  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    setIsEnabled(isSubscribed && permission.granted);
  }, [isSubscribed, permission.granted]);

  const enableNotifications = async (): Promise<boolean> => {
    if (!userId) return false;
    
    const success = await subscribe();
    if (success) {
      setIsEnabled(true);
      // Send welcome notification
      await NotificationService.sendWelcomeNotification(userId, userName);
    }
    return success;
  };

  const disableNotifications = async (): Promise<boolean> => {
    const success = await unsubscribe();
    if (success) {
      setIsEnabled(false);
    }
    return success;
  };

  const sendMatchNotification = async (matchId: string, matchName?: string): Promise<void> => {
    if (!userId || !isEnabled) return;
    
    try {
      await NotificationService.sendMatchNotification(userId, matchId, matchName);
    } catch (error) {
      console.error('Failed to send match notification:', error);
    }
  };

  const sendMessageNotification = async (
    matchId: string, 
    senderName: string, 
    message: string
  ): Promise<void> => {
    if (!userId || !isEnabled) return;
    
    try {
      await NotificationService.sendMessageNotification(userId, matchId, senderName, message);
    } catch (error) {
      console.error('Failed to send message notification:', error);
    }
  };

  const sendLobbyNotification = async (lobbyName: string, lobbyId?: string): Promise<void> => {
    if (!userId || !isEnabled) return;
    
    try {
      await NotificationService.sendLobbyNotification(userId, lobbyName, lobbyId);
    } catch (error) {
      console.error('Failed to send lobby notification:', error);
    }
  };

  const value: NotificationContextType = {
    isEnabled,
    isSupported,
    enableNotifications,
    disableNotifications,
    sendMatchNotification,
    sendMessageNotification,
    sendLobbyNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};