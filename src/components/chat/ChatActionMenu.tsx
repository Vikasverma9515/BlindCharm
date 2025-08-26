// components/chat/ChatActionsMenu.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, UserX, Flag, AlertTriangle } from 'lucide-react';

interface ChatActionsMenuProps {
  onBlock: () => void;
  onReport?: () => void;
  otherUserName: string;
}

export default function ChatActionsMenu({ onBlock, onReport, otherUserName }: ChatActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBlock = () => {
    setIsOpen(false);
    onBlock();
  };

  const handleReport = () => {
    setIsOpen(false);
    onReport?.();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        title="More options"
      >
        <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-2">
            {onReport && (
              <button
                onClick={handleReport}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Flag className="w-4 h-4 text-yellow-500" />
                Report User
              </button>
            )}
            <button
              onClick={handleBlock}
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
            >
              <UserX className="w-4 h-4" />
              Block {otherUserName}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}