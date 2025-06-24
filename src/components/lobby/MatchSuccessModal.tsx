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

export const MatchSuccessModal = ({ otherUser, onClose }: { otherUser: string; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center">
        <div className="mb-4">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800">Match Found!</h2>
        </div>
        <p className="text-lg text-gray-700 mb-4">
          You've been matched with <span className="font-bold text-blue-600">{otherUser}</span>!
        </p>
        <p className="text-sm text-gray-500">
          Redirecting to your private chat...
        </p>
        <div className="mt-4">
          <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    </div>
  );
};