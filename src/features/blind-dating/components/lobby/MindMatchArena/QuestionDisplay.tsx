// // // src/components/lobby/MindMatchArena/QuestionDisplay.tsx
// // import { motion, AnimatePresence } from 'framer-motion';
// // import { CurrentQuestion } from '@/types/mindmatch';
// // interface QuestionDisplayProps {
// //   question: CurrentQuestion;
// //   onAnswer: (answer: string, optionIndex?: number) => void;
// //   timeLeft: number;
// // }

// // export default function QuestionDisplay({ question, onAnswer, timeLeft }: QuestionDisplayProps) {
// //   return (
// //     <motion.div
// //       initial={{ opacity: 0, y: 20 }}
// //       animate={{ opacity: 1, y: 0 }}
// //       exit={{ opacity: 0, y: -20 }}
// //       className="bg-white rounded-xl p-6 shadow-lg"
// //     >
// //       {/* Question Header */}
// //       <div className="flex justify-between items-center mb-6">
// //         <div>
// //           <span className="text-sm text-gray-500">
// //             Question {question.questionNumber}/5
// //           </span>
// //           <h3 className="text-xl font-bold mt-1">
// //             {question.question.question}
// //           </h3>
// //         </div>
        
// //         <div className={`text-2xl font-bold ${
// //           timeLeft <= 10 ? 'text-red-500' : 'text-gray-700'
// //         }`}>
// //           {timeLeft}s
// //         </div>
// //       </div>

// //       {/* Answer Options */}
// //       <div className="space-y-3">
// //         {question.question.options?.map((option, index) => (
// //           <button
// //             key={index}
// //             onClick={() => onAnswer(option, index)}
// //             className="w-full p-4 text-left bg-gray-50 hover:bg-purple-50 
// //                      rounded-lg transition-colors duration-200"
// //           >
// //             {option}
// //           </button>
// //         ))}
// //       </div>
// //     </motion.div>
// //   );
// // }

// // // src/components/lobby/MindMatch/Arena/QuestionDisplay.tsx
// // import { motion } from 'framer-motion';
// // import { Timer } from 'lucide-react';

// // interface QuestionDisplayProps {
// //   question: {
// //     question: {
// //       question: string;
// //       options?: string[];
// //       category: string;
// //     };
// //     questionNumber: number;
// //   };
// //   onAnswer: (answer: string, optionIndex?: number) => void;
// //   timeLeft: number;
// //   isLoading: boolean;
// // }

// // export default function QuestionDisplay({
// //   question,
// //   onAnswer,
// //   timeLeft,
// //   isLoading
// // }: QuestionDisplayProps) {

// //     console.log('Question data:', question);
// //   return (
// //     <motion.div
// //       initial={{ opacity: 0, y: 20 }}
// //       animate={{ opacity: 1, y: 0 }}
// //       exit={{ opacity: 0, y: -20 }}
// //       className="bg-white rounded-3xl p-6 shadow-soft border border-purple-100"
// //     >
// //       {/* Question Header */}
// //       <div className="flex justify-between items-center mb-6">
// //         <div>
// //           <span className="text-sm text-gray-500">
// //             Question {question.questionNumber}/5
// //           </span>
// //           <h3 className="text-xl font-bold mt-1">
// //             {question.question.question}
// //           </h3>
// //         </div>
        
// //         <div className="flex items-center gap-2">
// //           <Timer className="w-5 h-5 text-purple-500" />
// //           <span className={`text-2xl font-bold ${
// //             timeLeft <= 10 ? 'text-red-500' : 'text-purple-600'
// //           }`}>
// //             {timeLeft}s
// //           </span>
// //         </div>
// //       </div>

// //       {/* Answer Options */}
// //       <div className="space-y-3">
// //         {question.question.options?.map((option, index) => (
// //           <button
// //             key={index}
// //             onClick={() => !isLoading && onAnswer(option, index)}
// //             disabled={isLoading}
// //             className={`w-full p-4 text-left bg-white border-2 rounded-xl transition-all duration-200 ${
// //               isLoading
// //                 ? 'opacity-50 cursor-not-allowed'
// //                 : 'hover:bg-purple-50 hover:border-purple-300 hover:shadow-md'
// //             } border-gray-200`}
// //           >
// //             <div className="flex items-center gap-3">
// //               <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
// //                 {String.fromCharCode(65 + index)}
// //               </div>
// //               <span className="font-medium text-gray-800">{option}</span>
// //             </div>
// //           </button>
// //         ))}
// //       </div>
// //     </motion.div>
// //   );
// // }

// import { motion } from 'framer-motion';
// import { Timer, AlertCircle } from 'lucide-react';
// import { CurrentQuestion } from '@/types/mindmatch';

// interface QuestionDisplayProps {
//   question: CurrentQuestion;
//   onAnswer: (answer: string, optionIndex?: number) => void;
//   timeLeft: number;
//   isLoading: boolean;
// }

// export default function QuestionDisplay({
//   question,
//   onAnswer,
//   timeLeft,
//   isLoading
// }: QuestionDisplayProps) {
//   if (!question || !question.question) {
//     return (
//       <div className="flex items-center justify-center p-6 bg-white rounded-3xl shadow-soft border border-red-100">
//         <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
//         <span className="text-red-500">Question data not available</span>
//       </div>
//     );
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -20 }}
//       className="bg-white rounded-3xl p-6 shadow-soft border border-purple-100"
//     >
//       {/* Question Header */}
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <span className="text-sm text-gray-500">
//             Question {question.questionNumber}/5
//           </span>
//           <h3 className="text-xl font-bold mt-1">
//             {question.question.question}
//           </h3>
//         </div>
        
//         <div className="flex items-center gap-2">
//           <Timer className="w-5 h-5 text-purple-500" />
//           <span className={`text-2xl font-bold ${
//             timeLeft <= 10 ? 'text-red-500' : 'text-purple-600'
//           }`}>
//             {timeLeft}s
//           </span>
//         </div>
//       </div>

//       {/* Answer Options */}
//       <div className="space-y-3">
//         {question.question.type === 'this_or_that' && Array.isArray(question.question.options) ? (
//           // This or That format
//           <div className="grid grid-cols-2 gap-4">
//             {question.question.options.map((option, index) => (
//               <button
//                 key={index}
//                 onClick={() => !isLoading && onAnswer(option, index)}
//                 disabled={isLoading}
//                 className={`p-6 text-center bg-white border-2 rounded-xl transition-all duration-200 ${
//                   isLoading
//                     ? 'opacity-50 cursor-not-allowed'
//                     : 'hover:bg-purple-50 hover:border-purple-300 hover:shadow-md'
//                 } border-gray-200 flex flex-col items-center justify-center min-h-[120px]`}
//               >
//                 <span className="font-medium text-gray-800 text-lg">{option}</span>
//               </button>
//             ))}
//           </div>
//         ) : (
//           // Standard format for other question types
//           Array.isArray(question.question.options) && question.question.options.map((option, index) => (
//           <button
//             key={index}
//             onClick={() => !isLoading && onAnswer(option, index)}
//             disabled={isLoading}
//             className={`w-full p-4 text-left bg-white border-2 rounded-xl transition-all duration-200 ${
//               isLoading
//                 ? 'opacity-50 cursor-not-allowed'
//                 : 'hover:bg-purple-50 hover:border-purple-300 hover:shadow-md'
//             } border-gray-200`}
//           >
//             <div className="flex items-center gap-3">
//               <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
//                 {String.fromCharCode(65 + index)}
//               </div>
//               <span className="font-medium text-gray-800">{option}</span>
//             </div>
//           </button>
//         ))
//         )}
//       </div>
//     </motion.div>
//   );
// }