// src/components/MatchSuccessModal.tsx
import { motion, AnimatePresence } from 'framer-motion';

interface MatchSuccessModalProps {
  otherUser: string;
  onClose: () => void;
}

// export function MatchSuccessModal({ otherUser, onClose }: MatchSuccessModalProps) {
//   return (
//     <AnimatePresence>
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
//       >
//         <motion.div
//           initial={{ scale: 0.5, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0.5, opacity: 0 }}
//           className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl"
//         >
//           <div className="text-center">
//             <div className="text-5xl mb-4">🎉</div>
//             <h2 className="text-2xl font-bold mb-4">Congratulations!</h2>
//             <p className="text-lg mb-6">
//               You've been matched with <span className="font-semibold text-blue-600">{otherUser}</span>!
//             </p>
//             <div className="space-y-4">
//               <p className="text-gray-600">
//                 Start a conversation and get to know each other better!
//               </p>
//               <button
//                 onClick={onClose}
//                 className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors w-full"
//               >
//                 Start Chatting
//               </button>
//             </div>
//           </div>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// }

// In your MatchSuccessModal component

export const MatchSuccessModal = ({ 
  isOpen, 
  otherUserName, 
  onClose 
}: { 
  isOpen: boolean; 
  otherUserName: string; 
  onClose: () => void 
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
          className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl text-center max-w-md w-full mx-4 border border-white/20"
        >
          {/* Animated Hearts Background */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <div className="absolute top-4 left-4 text-primary-200 animate-pulse">💕</div>
            <div className="absolute top-8 right-6 text-secondary-200 animate-bounce" style={{ animationDelay: '0.5s' }}>💖</div>
            <div className="absolute bottom-6 left-8 text-primary-300 animate-pulse" style={{ animationDelay: '1s' }}>💝</div>
            <div className="absolute bottom-4 right-4 text-secondary-300 animate-bounce" style={{ animationDelay: '1.5s' }}>💗</div>
          </div>

          {/* Main Content */}
          <div className="relative z-10">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", duration: 0.8 }}
              className="w-20 h-20 bg-amber-400 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", duration: 0.5 }}
                className="text-3xl"
              >
                ✨
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold bg-red-500 to-secondary-600 bg-clip-text text-transparent mb-4"
            >
              Perfect Match!
            </motion.h2>

            {/* Match Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <p className="text-lg text-neutral-700 mb-2">
                You've been matched with
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 border border-red-100 dark:border-red-700/50">
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {otherUserName}
                </span>
              </div>
            </motion.div>

            {/* Loading Animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              <p className="text-sm text-neutral-600 font-medium">
                Preparing your private chat room...
              </p>
              
              {/* Enhanced Loading Spinner */}
              <div className="flex items-center justify-center space-x-2">
                <div className="relative">
                  <div className="w-8 h-8 border-4 border-primary-200 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-8 h-8 border-4 border-transparent border-t-primary-500 rounded-full animate-spin"></div>
                </div>
                <div className="flex space-x-1">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                    className="w-2 h-2 bg-primary-500 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                    className="w-2 h-2 bg-secondary-500 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                    className="w-2 h-2 bg-primary-500 rounded-full"
                  />
                </div>
              </div>

              {/* Progress Steps */}
              <div className="space-y-2 text-xs text-neutral-500">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  className="flex items-center justify-center space-x-2"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Match confirmed</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5 }}
                  className="flex items-center justify-center space-x-2"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Creating chat room</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 2 }}
                  className="flex items-center justify-center space-x-2"
                >
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span>Almost ready...</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};