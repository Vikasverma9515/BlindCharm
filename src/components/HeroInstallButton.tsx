'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Smartphone, Share, Plus } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface HeroInstallButtonProps {
  className?: string;
}

export default function HeroInstallButton({ className = "" }: HeroInstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Check device type
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const android = /Android/.test(navigator.userAgent);
    setIsIOS(iOS);
    setIsAndroid(android);

    // Check if app is already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Listen for the beforeinstallprompt event (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, we can show install button if not already installed
    if (iOS && !standalone) {
      setCanInstall(true);
    }

    // For desktop/other devices, always show if not PWA
    if (!iOS && !android && !standalone) {
      setCanInstall(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      // Show iOS installation modal
      setShowIOSModal(true);
    } else if (deferredPrompt) {
      // Android/Desktop PWA install
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setCanInstall(false);
      }
    } else {
      // Fallback for desktop - could redirect to app store or show download options
      window.open('https://your-app-store-link.com', '_blank');
    }
  };

  // Don't show if already installed as PWA
  if (isStandalone || !canInstall) {
    return null;
  }

  const getButtonText = () => {
    if (isIOS) return 'Add to Home Screen';
    if (isAndroid || deferredPrompt) return 'Install App';
    return 'Download App';
  };

  const getButtonIcon = () => {
    if (isIOS) return <Plus className="w-5 h-5" />;
    if (isAndroid || deferredPrompt) return <Download className="w-5 h-5" />;
    return <Smartphone className="w-5 h-5" />;
  };

  return (
    <>
      {/* Hero Install Button */}
      <motion.button
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleInstallClick}
        className={`inline-flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
      >
        {getButtonIcon()}
        <span>{getButtonText()}</span>
      </motion.button>

      {/* iOS Installation Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    Install BlindCharm
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add to Home Screen
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Share className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">Step 1</p>
                  <p className="text-gray-600 dark:text-gray-400">Tap the Share button below</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">Step 2</p>
                  <p className="text-gray-600 dark:text-gray-400">Select "Add to Home Screen"</p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowIOSModal(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 rounded-2xl font-semibold transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Maybe Later
              </button>
              <button
                onClick={() => setShowIOSModal(false)}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-2xl font-semibold transition-all hover:from-purple-600 hover:to-pink-600"
              >
                Got it!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}