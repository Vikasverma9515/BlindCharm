// components/chat/BlockConfirmationModal.tsx
'use client';

import { useState } from 'react';
import { UserX, AlertTriangle, Loader2 } from 'lucide-react';

interface BlockConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  otherUserName: string;
}

export default function BlockConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  otherUserName
}: BlockConfirmationModalProps) {
  const [isBlocking, setIsBlocking] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsBlocking(true);
    try {
      await onConfirm();
    } finally {
      setIsBlocking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
          <UserX className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
          Block {otherUserName}?
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
          This will permanently end your match and conversation. {otherUserName} won't be able to contact you, and you won't see each other in the app.
        </p>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              This action cannot be undone. Consider if there might be a misunderstanding first.
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isBlocking}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isBlocking}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isBlocking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Blocking...
              </>
            ) : (
              'Block User'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}