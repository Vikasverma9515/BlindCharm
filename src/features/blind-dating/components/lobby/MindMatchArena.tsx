// // // src/components/lobby/MindMatchArena.tsx - Simplified Version
// 'use client'

// import { useState, useEffect } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { Brain, Heart, Zap, Trophy, Timer, Users, Sparkles, Target, Clock } from 'lucide-react'
// import { MindMatchPrompt, MindMatchAnswer, VibeMatch } from '@/types/mindmatch'
// import { User } from '@/types/lobby'
// import { MindMatchService } from '@/lib/services/MindMatchService'

// interface MindMatchArenaProps {
//   lobbyId: string;
//   currentUser: User | null;
//   participants: User[];
//   onVibeMatch: (match: VibeMatch) => void;
// }

// export default function MindMatchArena({ lobbyId, currentUser, participants, onVibeMatch }: MindMatchArenaProps) {
//   const [gameState, setGameState] = useState<'waiting' | 'playing' | 'results'>('waiting');
//   const [currentQuestion, setCurrentQuestion] = useState<MindMatchPrompt | null>(null);
//   const [questionNumber, setQuestionNumber] = useState(1);
//   const [roundId, setRoundId] = useState<string>('');
//   const [timeLeft, setTimeLeft] = useState(30);
//   const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
//   const [vibeMatches, setVibeMatches] = useState<VibeMatch[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [nextResetTime, setNextResetTime] = useState<Date>(new Date());

//   const getMatchTypeIcon = (type: string) => {
//     switch (type) {
//       case 'deep_connection': return <Brain className="w-5 h-5 text-purple-500" />;
//       case 'mind_lock': return <Zap className="w-5 h-5 text-yellow-500" />;
//       case 'vibe_sync': return <Heart className="w-5 h-5 text-pink-500" />;
//       default: return <Sparkles className="w-5 h-5 text-blue-500" />;
//     }
//   };

//   const getMatchTypeColor = (type: string) => {
//     switch (type) {
//       case 'deep_connection': return 'from-purple-500 to-indigo-600';
//       case 'mind_lock': return 'from-yellow-500 to-orange-600';
//       case 'vibe_sync': return 'from-pink-500 to-rose-600';
//       default: return 'from-blue-500 to-cyan-600';
//     }
//   };

//   const formatTimeUntilReset = (resetTime: Date) => {
//     const now = new Date();
//     const diff = resetTime.getTime() - now.getTime();
//     const hours = Math.floor(diff / (1000 * 60 * 60));
//     const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
//     return `${hours}h ${minutes}m`;
//   };

//   const startNewRound = async () => {
//     if (!currentUser) {
//       setError('User not found');
//       return;
//     }
    
//     setLoading(true);
//     try {
//       const newRoundId = await MindMatchService.startNewRound(lobbyId);
//       if (!newRoundId) {
//         throw new Error('Failed to start new round');
//       }
      
//       setRoundId(newRoundId);
//       setError(null);
      
//       // Check for the first question
//       setTimeout(() => {
//         const pollForQuestion = async () => {
//           try {
//             const activeQuestion = await MindMatchService.getCurrentQuestion(lobbyId);
//             if (activeQuestion) {
//               setCurrentQuestion(activeQuestion.question);
//               setQuestionNumber(activeQuestion.questionNumber);
//               setTimeLeft(30);
//               setGameState('playing');
//             }
//           } catch (error) {
//             console.error('Error polling for question:', error);
//             setError('Failed to get question');
//           }
//         };
//         pollForQuestion();
//       }, 1000);
//     } catch (error) {
//       console.error('Error starting new round:', error);
//       setError('Failed to start new round');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const calculateMatches = async () => {
//     if (!currentUser || !roundId) {
//       setError('Missing required data for match calculation');
//       return;
//     }

//     setLoading(true);
//     try {
//       const matches = await MindMatchService.calculateRoundMatches(lobbyId, roundId);
//       if (!matches) {
//         throw new Error('Failed to calculate matches');
//       }

//       setVibeMatches(matches);
//       setError(null);
      
//       // Notify parent component of matches
//       matches.forEach(match => onVibeMatch(match));

//       // Update user stats
//       if (matches.length > 0) {
//         await MindMatchService.updateUserStats(currentUser.id, {
//           total_rounds_played: 1,
//           total_matches_found: matches.length,
//           charm_coins_earned: matches.length * 10
//         });
//       }
//     } catch (error) {
//       console.error('Error calculating matches:', error);
//       setError('Failed to calculate matches');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Timer effect
//   useEffect(() => {
//     if (gameState === 'playing' && timeLeft > 0) {
//       const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
//       return () => clearTimeout(timer);
//     } else if (timeLeft === 0 && gameState === 'playing') {
//       handleNextQuestion();
//     }
//   }, [timeLeft, gameState]);

//   const updateNextResetTime = () => {
//     const nextReset = MindMatchService.getNextResetTime();
//     setNextResetTime(nextReset);
//   };

//   // Update reset time on mount and every minute
//   useEffect(() => {
//     updateNextResetTime();
//     const interval = setInterval(updateNextResetTime, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   // Check for current active question and handle polling
//   useEffect(() => {
//     let pollInterval: NodeJS.Timeout;

//     const pollCurrentQuestion = async () => {
//       if (!lobbyId) {
//         setError('Lobby ID not found');
//         return;
//       }

//       try {
//         const activeQuestion = await MindMatchService.getCurrentQuestion(lobbyId);
//         if (activeQuestion) {
//           setCurrentQuestion(activeQuestion.question);
//           setQuestionNumber(activeQuestion.questionNumber);
//           setTimeLeft(30);
//           setError(null);
//         } else if (gameState === 'playing') {
//           // If no question is found during gameplay, move to results
//           setGameState('results');
//           calculateMatches();
//         }
//       } catch (error) {
//         console.error('Error polling question:', error);
//         setError('Failed to get current question');
//       }
//     };

//     if (gameState === 'playing') {
//       // Initial poll
//       pollCurrentQuestion();
//       // Set up polling interval
//       pollInterval = setInterval(pollCurrentQuestion, 3000);
//     }

//     return () => {
//       if (pollInterval) {
//         clearInterval(pollInterval);
//       }
//     };
//   }, [gameState, lobbyId]);

//   const handleAnswer = async (answer: string) => {
//     if (!currentUser || !roundId || !currentQuestion) {
//       setError('Missing required data for answer submission');
//       return;
//     }

//     setLoading(true);
//     try {
//       const success = await MindMatchService.submitAnswer(roundId, currentUser.id, currentQuestion.id, answer);
//       if (!success) {
//         throw new Error('Failed to submit answer');
//       }
//       setError(null);
//       handleNextQuestion();
//     } catch (error) {
//       console.error('Error submitting answer:', error);
//       setError('Failed to submit answer');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleNextQuestion = async () => {
//     if (!roundId) {
//       setError('Round ID not found');
//       return;
//     }

//     setLoading(true);
//     try {
//       const success = await MindMatchService.startNextQuestion(lobbyId, roundId, questionNumber + 1);
//       if (!success) {
//         // If no more questions, move to results
//         setGameState('results');
//         calculateMatches();
//         return;
//       }
      
//       // Reset state for next question
//       setCurrentQuestion(null);
//       setTimeLeft(30);
//       setError(null);
      
//       // Poll for next question
//       const pollForQuestion = async () => {
//         try {
//           const activeQuestion = await MindMatchService.getCurrentQuestion(lobbyId);
//           if (activeQuestion) {
//             setCurrentQuestion(activeQuestion.question);
//             setQuestionNumber(activeQuestion.questionNumber);
//           }
//         } catch (error) {
//           console.error('Error polling for next question:', error);
//           setError('Failed to get next question');
//         }
//       };
      
//       // Initial poll after a short delay
//       setTimeout(pollForQuestion, 1000);
//     } catch (error) {
//       console.error('Error starting next question:', error);
//       setError('Failed to start next question');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetGame = () => {
//     setGameState('waiting');
//     setCurrentQuestion(null);
//     setQuestionNumber(0);
//     setTimeLeft(30);
//     setRoundId(null);
//     setVibeMatches([]);
//     setError(null);
//   };

//   useEffect(() => {
//     let pollInterval: NodeJS.Timeout;
//     let resetInterval: NodeJS.Timeout;

//     const pollCurrentQuestion = async () => {
//       try {
//         setError(null);
//         const activeQuestion = await MindMatchService.getCurrentQuestion(lobbyId);
        
//         if (activeQuestion) {
//           setCurrentQuestion(activeQuestion.question);
//           setQuestionNumber(activeQuestion.questionNumber);
//           setRoundId(activeQuestion.roundId);
//           setGameState('playing');
          
//           // Calculate time left
//           const endsAt = new Date(activeQuestion.endsAt);
//           const now = new Date();
//           const timeLeftSeconds = Math.max(0, Math.floor((endsAt.getTime() - now.getTime()) / 1000));
//           setTimeLeft(timeLeftSeconds);
//         }
//       } catch (error) {
//         console.error('Error checking current question:', error);
//         setError('Failed to fetch current question');
//       }
//     };

//     // Initial check
//     pollCurrentQuestion();
//     updateNextResetTime();

//     // Set up polling intervals
//     if (gameState === 'playing') {
//       pollInterval = setInterval(pollCurrentQuestion, 3000);
//     }

//     resetInterval = setInterval(() => {
//       updateNextResetTime();
//       const now = new Date();
//       if (nextResetTime && now >= nextResetTime) {
//         resetGame();
//       }
//     }, 60000);

//     return () => {
//       if (pollInterval) clearInterval(pollInterval);
//       if (resetInterval) clearInterval(resetInterval);
//     };
//   }, [lobbyId, gameState, nextResetTime]);

//   const resetGame = () => {
//     setGameState('waiting');
//     setCurrentQuestion(null);
//     setUserAnswers({});
//     setVibeMatches([]);
//     setError(null);
//   };

//   const updateNextResetTime = () => {
//     setNextResetTime(MindMatchService.getNextResetTime());
//   };

//   const checkCurrentQuestion = async () => {
//     try {
//       const activeQuestion = await MindMatchService.getCurrentQuestion(lobbyId);
//       if (activeQuestion) {
//         setCurrentQuestion(activeQuestion.question);
//         setQuestionNumber(activeQuestion.questionNumber);
//         setRoundId(activeQuestion.roundId);
//         setGameState('playing');
        
//         // Calculate time left
//         const endsAt = new Date(activeQuestion.endsAt);
//         const now = new Date();
//         const timeLeftSeconds = Math.max(0, Math.floor((endsAt.getTime() - now.getTime()) / 1000));
//         setTimeLeft(timeLeftSeconds);
//       }
//     } catch (error) {
//       console.error('Error checking current question:', error);
//     }
//   };

//   // Timer effect
//   useEffect(() => {
//     if (gameState === 'playing' && timeLeft > 0) {
//       const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
//       return () => clearTimeout(timer);
//     } else if (timeLeft === 0 && gameState === 'playing') {
//       handleNextQuestion();
//     }
//   }, [timeLeft, gameState]);

//   const startNewRound = async () => {
//     if (!currentUser) return;
    
//     setLoading(true);
//     try {
//       const newRoundId = await MindMatchService.startNewRound(lobbyId);
//       if (newRoundId) {
//         setRoundId(newRoundId);
//         // Check for the first question
//         setTimeout(() => {
//           checkCurrentQuestion();
//         }, 1000);
//       }
//     } catch (error) {
//       console.error('Error starting new round:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

  // const handleAnswer = async (answer: string, answerIndex?: number) => {
  //   if (!currentUser || !currentQuestion || !roundId) {
  //     setError('Missing required data for answer submission');
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     const newAnswers = {
  //       ...userAnswers,
  //       [currentQuestion.id]: answer
  //     };
  //     setUserAnswers(newAnswers);

  //     // Save answer to database
  //     const result = await MindMatchService.submitAnswer(
  //       lobbyId,
  //       currentUser.id,
  //       currentQuestion.id,
  //       roundId,
  //       {
  //         text: answer,
  //         optionIndex: answerIndex,
  //         timeTaken: 30 - timeLeft
  //       }
  //     );

  //     if (!result) {
  //       throw new Error('Failed to submit answer');
  //     }

  //     setError(null);
  //     // Auto-advance after answering
  //     setTimeout(() => {
  //       handleNextQuestion();
  //     }, 1500);

  //   } catch (error) {
  //     console.error('Error saving answer:', error);
  //     setError('Failed to submit answer');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleNextQuestion = async () => {
  //   setLoading(true);
  //   try {
  //     if (questionNumber < 5) {
  //       // Start next question
  //       const success = await MindMatchService.startNextQuestion(lobbyId, roundId, questionNumber + 1);
  //       if (success) {
  //         setError(null);
  //         // Poll for new question
  //         const pollForQuestion = async () => {
  //           const activeQuestion = await MindMatchService.getCurrentQuestion(lobbyId);
  //           if (activeQuestion) {
  //             setCurrentQuestion(activeQuestion.question);
  //             setQuestionNumber(activeQuestion.questionNumber);
  //             setTimeLeft(30);
  //           }
  //         };
          
  //         setTimeout(pollForQuestion, 1000);
  //       } else {
  //         throw new Error('Failed to start next question');
  //       }
  //     } else {
  //       // Round finished, calculate matches
  //       await calculateMatches();
  //       setGameState('results');
  //     }
  //   } catch (error) {
  //     console.error('Error handling next question:', error);
  //     setError('Failed to proceed to next question');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const calculateMatches = async () => {
  //   if (!currentUser || !roundId) {
  //     setError('Missing required data for match calculation');
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     const matches = await MindMatchService.calculateRoundMatches(lobbyId, roundId);
  //     if (!matches) {
  //       throw new Error('Failed to calculate matches');
  //     }

  //     setVibeMatches(matches);
  //     setError(null);
      
  //     // Notify parent component of matches
  //     matches.forEach(match => onVibeMatch(match));

  //     // Update user stats
  //     if (matches.length > 0) {
  //       await MindMatchService.updateUserStats(currentUser.id, {
  //         total_rounds_played: 1,
  //         total_matches_found: matches.length,
  //         charm_coins_earned: matches.length * 10
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Error calculating matches:', error);
  //     setError('Failed to calculate matches');
  //   } finally {
  //     setLoading(false);
  //   }
  //  };

//   const getMatchTypeIcon = (type: string) => {
//     switch (type) {
//       case 'deep_connection': return <Brain className="w-5 h-5 text-purple-500" />;
//       case 'mind_lock': return <Zap className="w-5 h-5 text-yellow-500" />;
//       case 'vibe_sync': return <Heart className="w-5 h-5 text-pink-500" />;
//       default: return <Sparkles className="w-5 h-5 text-blue-500" />;
//     }
//   };

//   const getMatchTypeColor = (type: string) => {
//     switch (type) {
//       case 'deep_connection': return 'from-purple-500 to-indigo-600';
//       case 'mind_lock': return 'from-yellow-500 to-orange-600';
//       case 'vibe_sync': return 'from-pink-500 to-rose-600';
//       default: return 'from-blue-500 to-cyan-600';
//     }
//   };

//   const formatTimeUntilReset = (resetTime: Date) => {
//     const now = new Date();
//     const diff = resetTime.getTime() - now.getTime();
//     const hours = Math.floor(diff / (1000 * 60 * 60));
//     const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
//     return `${hours}h ${minutes}m`;
//   };

//   // Error display component
//   const ErrorDisplay = ({ message }: { message: string }) => (
//     <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
//       <p className="text-red-600 text-sm">{message}</p>
//     </div>
//   );

//   if (gameState === 'waiting') {
//     return (
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 border border-purple-100"
//       >
//         {error && <ErrorDisplay message={error} />}
// //         <div className="text-center">
// //           <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
// //             <Brain className="w-8 h-8 text-white" />
// //           </div>
          
// //           <h2 className="text-2xl font-bold text-gray-800 mb-2">MindMatch Arena</h2>
// //           <p className="text-gray-600 mb-4">Your answers, your vibe, your people.</p>
          
// //           {/* Next Reset Timer */}
// //           <div className="bg-white rounded-2xl p-4 mb-6 border border-purple-100">
// //             <div className="flex items-center justify-center gap-2 mb-2">
// //               <Clock className="w-5 h-5 text-blue-500" />
// //               <span className="font-medium text-gray-700">Next Reset</span>
// //             </div>
// //             <div className="text-2xl font-bold text-blue-600">
// //               {formatTimeUntilReset(nextResetTime)}
// //             </div>
// //             <div className="text-sm text-gray-500 mt-1">
// //               Resets every 3 hours (12, 3, 6, 9)
// //             </div>
// //           </div>
          
// //           <div className="bg-white rounded-2xl p-4 mb-6 border border-purple-100">
// //             <div className="flex items-center justify-center gap-2 mb-3">
// //               <Users className="w-5 h-5 text-purple-500" />
// //               <span className="font-medium text-gray-700">{participants.length} players ready</span>
// //             </div>
            
// //             <div className="grid grid-cols-2 gap-4 text-sm">
// //               <div className="flex items-center gap-2">
// //                 <Target className="w-4 h-4 text-green-500" />
// //                 <span>5 Quick Questions</span>
// //               </div>
// //               <div className="flex items-center gap-2">
// //                 <Timer className="w-4 h-4 text-blue-500" />
// //                 <span>30s Each</span>
// //               </div>
// //               <div className="flex items-center gap-2">
// //                 <Zap className="w-4 h-4 text-yellow-500" />
// //                 <span>Real-time Matching</span>
// //               </div>
// //               <div className="flex items-center gap-2">
// //                 <Trophy className="w-4 h-4 text-purple-500" />
// //                 <span>Earn CharmCoins</span>
// //               </div>
// //             </div>
// //           </div>

//           <button
//             onClick={startNewRound}
//             disabled={participants.length < 2 || loading}
//             className={`bg-gradient-to-r ${error ? 'from-red-500 to-red-600' : 'from-purple-500 to-pink-500'} text-white px-8 py-3 rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
//           >
//             {loading ? (
//               <div className="flex items-center gap-2">
//                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                 <span>Starting...</span>
//               </div>
//             ) : error ? (
//               <div className="flex items-center gap-2">
//                 <span>Try Again</span>
//               </div>
//             ) : participants.length < 2 ? 'Need 2+ Players' : 'Start New Round! 🧠'}
//           </button>
//         </div>
//       </motion.div>
//     );
//   }
//         </div>
//       </motion.div>
//     );
//   }

//   if (gameState === 'playing') {
//     return (
//       <motion.div
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-6 border border-blue-100"
//       >
//         {error && <ErrorDisplay message={error} />}

//         {/* Progress Bar */}
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
//               <span className="text-white font-bold">{questionNumber}</span>
//             </div>
//             <div>
//               <p className="text-sm text-gray-600">Question {questionNumber} of 5</p>
//               <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
//                 <div 
//                   className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
//                   style={{ width: `${(questionNumber / 5) * 100}%` }}
//                 />
//               </div>
//             </div>
//           </div>
          
//           <div className="flex items-center gap-2">
//             <Timer className="w-5 h-5 text-orange-500" />
//             <span className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-700'}`}>
//               {timeLeft}s
//             </span>
//           </div>
//         </div>

//         {currentQuestion ? (
//           <>
//             {/* Question */}
//             <div className="text-center mb-8">
//               <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm text-gray-600 mb-4">
//                 <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
//                 {currentQuestion.category.replace('_', ' ').toUpperCase()}
//               </div>
              
//               <h3 className="text-2xl font-bold text-gray-800 mb-2">
//                 {currentQuestion.question}
//               </h3>
//             </div>

//             {/* Answer Options */}
//             <div className="grid grid-cols-1 gap-3">
//               {(Array.isArray(currentQuestion.options) ? currentQuestion.options : [])?.map((option, index) => (
//                 <motion.button
//                   key={index}
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={() => handleAnswer(option, index)}
//                   disabled={loading}
//                   className={`bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-2 ${loading ? 'border-gray-200 opacity-50 cursor-not-allowed' : 'border-gray-200 hover:border-blue-300'} rounded-2xl p-4 text-left transition-all duration-300 shadow-sm hover:shadow-md`}
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
//                       {String.fromCharCode(65 + index)}
//                     </div>
//                     <span className="font-medium text-gray-700">{option}</span>
//                   </div>
//                 </motion.button>
//               ))}
//             </div>

//             {/* Skip Button */}
//             <div className="text-center mt-6">
//               <button
//                 onClick={handleNextQuestion}
//                 disabled={loading}
//                 className={`text-gray-500 hover:text-gray-700 text-sm underline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
//               >
//                 Skip this question
//               </button>
//             </div>
//           </>
//         ) : (
//           <div className="text-center py-12">
//             <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//             <p className="text-gray-600">Loading question...</p>
//           </div>
//         )}
//       </motion.div>
//     );
//   }

//   if (gameState === 'results') {
//     return (
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-6 border border-green-100"
//       >
//         {error && <ErrorDisplay message={error} />}
        
//         <div className="text-center mb-6">
//           <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
//             <Trophy className="w-8 h-8 text-white" />
//           </div>
          
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Round Complete!</h2>
//           <p className="text-gray-600">
//             {loading ? 'Calculating matches...' : `Found ${vibeMatches.length} vibe matches`}
//           </p>
//         </div>

//         {loading ? (
//           <div className="text-center py-8">
//             <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//             <p className="text-gray-600">Analyzing your answers...</p>
//           </div>
//         ) : vibeMatches.length > 0 ? (
//           <div className="space-y-3 mb-6">
//             {vibeMatches.map((match, index) => {
//               const otherUser = participants.find(p => 
//                 p.id === (match.user1_id === currentUser?.id ? match.user2_id : match.user1_id)
//               );
//               return (
//                 <motion.div
//                   key={match.id}
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ delay: index * 0.1 }}
//                   className={`bg-gradient-to-r ${getMatchTypeColor(match.match_type)} p-4 rounded-2xl text-white shadow-lg hover:shadow-xl transition-shadow duration-300`}
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       {getMatchTypeIcon(match.match_type)}
//                       <div>
//                         <p className="font-semibold">
//                           {match.match_type.replace('_', ' ').toUpperCase()} with {otherUser?.full_name || 'Someone'}
//                         </p>
//                         <p className="text-sm opacity-90">
//                           {match.shared_answers}/{match.total_answers} answers matched ({Math.round(match.compatibility_score)}%)
//                         </p>
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <div className="text-2xl font-bold">{Math.round(match.compatibility_score)}%</div>
//                       <div className="text-xs opacity-75">compatibility</div>
//                     </div>
//                   </div>
//                 </motion.div>
//               );
//             })}
//           </div>
//         ) : (
//           <div className="text-center py-8">
//             <div className="text-6xl mb-4">🤔</div>
//             <p className="text-gray-600 mb-4">No matches this round</p>
//             <p className="text-sm text-gray-500">Try the next round for better luck!</p>
//           </div>
//         )}

//         <div className="text-center">
//           <button
//             onClick={() => {
//               setGameState('waiting');
//               setCurrentQuestion(null);
//               setUserAnswers({});
//               setVibeMatches([]);
//               setError(null);
//             }}
//             disabled={loading}
//             className={`bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-full font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300 shadow-lg ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'}`}
//           >
//             Play Again
//           </button>
//         </div>
//       </motion.div>
//     );
//   }

//   const getMatchTypeIcon = (type: string) => {
//     switch (type) {
//       case 'deep_connection': return <Brain className="w-5 h-5 text-purple-500" />;
//       case 'mind_lock': return <Zap className="w-5 h-5 text-yellow-500" />;
//       case 'vibe_sync': return <Heart className="w-5 h-5 text-pink-500" />;
//       default: return <Sparkles className="w-5 h-5 text-blue-500" />;
//     }
//   };

//   const getMatchTypeColor = (type: string) => {
//     switch (type) {
//       case 'deep_connection': return 'from-purple-500 to-indigo-600';
//       case 'mind_lock': return 'from-yellow-500 to-orange-600';
//       case 'vibe_sync': return 'from-pink-500 to-rose-600';
//       default: return 'from-blue-500 to-cyan-600';
//     }
//   };

//   const formatTimeUntilReset = (resetTime: Date) => {
//     const now = new Date();
//     const diff = resetTime.getTime() - now.getTime();
//     const hours = Math.floor(diff / (1000 * 60 * 60));
//     const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
//     return `${hours}h ${minutes}m`;
//   };

//   const updateNextResetTime = () => {
//     setNextResetTime(MindMatchService.getNextResetTime());
//   };

//   // Timer effect
//   useEffect(() => {
//     if (gameState === 'playing' && timeLeft > 0) {
//       const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
//       return () => clearTimeout(timer);
//     } else if (timeLeft === 0 && gameState === 'playing') {
//       handleNextQuestion();
//     }
//   }, [timeLeft, gameState]);

//   const startNewRound = async () => {
//     if (!currentUser) {
//       setError('User not found');
//       return;
//     }
    
//     setLoading(true);
//     try {
//       const newRoundId = await MindMatchService.startNewRound(lobbyId);
//       if (!newRoundId) {
//         throw new Error('Failed to start new round');
//       }
      
//       setRoundId(newRoundId);
//       setError(null);
      
//       // Check for the first question
//       setTimeout(() => {
//         const pollForQuestion = async () => {
//           try {
//             const activeQuestion = await MindMatchService.getCurrentQuestion(lobbyId);
//             if (activeQuestion) {
//               setCurrentQuestion(activeQuestion.question);
//               setQuestionNumber(activeQuestion.questionNumber);
//               setTimeLeft(30);
//               setGameState('playing');
//             }
//           } catch (error) {
//             console.error('Error polling for question:', error);
//             setError('Failed to get question');
//           }
//         };
//         pollForQuestion();
//       }, 1000);
//     } catch (error) {
//       console.error('Error starting new round:', error);
//       setError('Failed to start new round');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return null;
// }