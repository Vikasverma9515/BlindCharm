// // components/ui/CompactSuccessPopup.tsx
// 'use client';

// import { useEffect } from 'react';

// interface CompactSuccessPopupProps {
//   isVisible: boolean;
//   message: string;
//   onClose: () => void;
//   autoClose?: number;
// }

// export default function SuccessPopup({
//   isVisible,
//   message,
//   onClose,
//   autoClose = 2000 // 2 seconds default
// }: CompactSuccessPopupProps) {
//   useEffect(() => {
//     if (isVisible && autoClose > 0) {
//       const timer = setTimeout(() => {
//         onClose();
//       }, autoClose);

//       return () => clearTimeout(timer);
//     }
//   }, [isVisible, autoClose, onClose]);

//   if (!isVisible) return null;

//   return (
//     <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-2 duration-200">
//       <div className="bg-purple-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 max-w-xs">
//         <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
//           <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
//             <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//           </svg>
//         </div>
//         <span className="font-medium text-xs leading-tight">{message}</span>
//         <button
//           onClick={onClose}
//           className="ml-1 w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
//         >
//           <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
//           </svg>
//         </button>
//       </div>
//     </div>
//   );
// }

// components/ui/CompactSuccessPopup.tsx
'use client';

import { useEffect, useCallback } from 'react';

interface CompactSuccessPopupProps {
  isVisible: boolean;
  message: string;
  onClose: () => void;
  autoClose?: number;
}

export default function SuccessPopup({
  isVisible,
  message,
  onClose,
  autoClose = 2500 // 2.5 seconds default
}: CompactSuccessPopupProps) {
  useEffect(() => {
    if (isVisible && autoClose > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoClose);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose]); // Remove onClose from dependencies

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-2 duration-200">
      <div className="bg-purple-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 max-w-xs">
        <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="font-medium text-xs leading-tight">{message}</span>
        <button
          onClick={onClose}
          className="ml-1 w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
        >
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}