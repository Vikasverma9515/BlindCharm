// // src/components/lobby/MindMatchArena/index.tsx
// import { useState, useEffect, useCallback } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { MindMatchService } from '@/lib/services/MindMatchService';
// import QuestionDisplay from './QuestionDisplay';
// import ResultsDisplay from './ResultsDisplay';
// import WaitingRoom from './WaitingRoom';
// // import { useToast } from '@/components/ui/Toast';
// import { toast } from 'sonner';
// import { supabase } from '@/lib/supabase';
// import type { 
//   User, 
//   LobbyParticipant 
// } from '@/types/lobby';
// import type { 
//   CurrentQuestion, 
//   VibeMatch,
//   MindMatchAnswer 
// } from '@/types/mindmatch';

// interface MindMatchArenaProps {
//   lobbyId: string;
//   currentUser: User;
//   participants: LobbyParticipant[];
// }

// export default function MindMatchArena({ 
//   lobbyId, 
//   currentUser, 
//   participants 
// }: MindMatchArenaProps) {
//   const [currentQuestion, setCurrentQuestion] = useState<CurrentQuestion | null>(null);
//   const [roundId, setRoundId] = useState<string | null>(null);
//   const [gameState, setGameState] = useState<'waiting' | 'playing' | 'results'>('waiting');
//   const [isLoading, setIsLoading] = useState(false);
//   const [timeLeft, setTimeLeft] = useState(30);
//   const [answersCount, setAnswersCount] = useState<number>(0);

//   // Check if user has already answered all questions for this round
//   const checkIfShowResults = useCallback(async (roundIdToCheck?: string) => {
//     if (!lobbyId || !currentUser?.id || !roundIdToCheck) return;
//     const answers = await MindMatchService.getUserRoundAnswers(lobbyId, currentUser.id, roundIdToCheck);
//     setAnswersCount(answers.length);
//     if (answers.length >= 5) {
//       setGameState('results');
//       setCurrentQuestion(null);
//     }
//   }, [lobbyId, currentUser?.id]);

//   const handleQuestionUpdate = useCallback(async (_payload: any) => {
//     try {
//       const question = await MindMatchService.getCurrentQuestion(lobbyId);
//       if (question) {
//         setCurrentQuestion(question);
//         setRoundId(question.roundId);
//         // Check if user already answered all questions for this round
//         checkIfShowResults(question.roundId);
//         if (gameState !== 'results') setGameState('playing');
//       } else {
//         setCurrentQuestion(null);
//         if (gameState === 'playing') setGameState('results');
//       }
//     } catch (error) {
//       console.error('Error handling question update:', error);
//       toast.error('Failed to load question');
//     }
//   }, [lobbyId, gameState, checkIfShowResults]);

//   useEffect(() => {
//     const channel = supabase
//       .channel(`mindmatch_updates_${lobbyId}`)
//       .on(
//         'postgres_changes',
//         { 
//           event: '*', 
//           schema: 'public', 
//           table: 'current_active_question',
//           filter: `lobby_id=eq.${lobbyId}`
//         },
//         handleQuestionUpdate
//       )
//       .subscribe();

//     // Initial question fetch
//     if (gameState === 'playing') {
//       handleQuestionUpdate({});
//     }

//     return () => {
//       channel.unsubscribe();
//     };
//   }, [lobbyId, handleQuestionUpdate, gameState]);

//   // Fallback polling: fetch current question every 2s while playing
//   useEffect(() => {
//     if (gameState !== 'playing') return;
//     const interval = setInterval(() => {
//       handleQuestionUpdate({});
//     }, 2000);
//     return () => clearInterval(interval);
//   }, [gameState, handleQuestionUpdate]);

//   // Timer effect (just for countdown)
//   useEffect(() => {
//     if (currentQuestion && gameState === 'playing') {
//       const interval = setInterval(() => {
//         const timeRemaining = getTimeLeft(currentQuestion.endsAt);
//         setTimeLeft(timeRemaining);
//       }, 1000);
//       return () => clearInterval(interval);
//     }
//   }, [currentQuestion, gameState]);

//   // On mount, check if user already finished a round
//   useEffect(() => {
//     if (roundId && gameState !== 'results') {
//       checkIfShowResults(roundId);
//     }
//   }, [roundId, gameState, checkIfShowResults]);

//   const handleStartRound = async () => {
//     setIsLoading(true);
//     try {
//       const roundId = await MindMatchService.startNewRound(lobbyId);
//       setRoundId(roundId);
//       setGameState('playing');
//       toast.success('Round started! Get ready for questions!');
//     } catch (error) {
//       console.error('Failed to start round:', error);
//       toast.error('Failed to start the round. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleAnswer = async (answer: string, optionIndex?: number) => {
//     if (!currentQuestion || !roundId) return;
//     setIsLoading(true);
//     try {
//       await MindMatchService.submitAnswer(
//         lobbyId,
//         currentUser.id,
//         currentQuestion.question.id,
//         roundId,
//         {
//           text: answer,
//           optionIndex,
//           timeTaken: getTimeLeft(currentQuestion.endsAt)
//         }
//       );
//       // Optimistically fetch the next question after a short delay
//       setTimeout(() => {
//         handleQuestionUpdate({});
//         checkIfShowResults(roundId);
//       }, 400); // 400ms delay to allow backend to update
//     } catch (error) {
//       toast.error('Failed to submit answer. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Remove handleNextQuestion entirely

//   const getTimeLeft = (endsAt: string): number => {
//     const end = new Date(endsAt).getTime();
//     const now = new Date().getTime();
//     return Math.max(0, Math.floor((end - now) / 1000));
//   };

//   return (
//     <AnimatePresence mode="wait">
//       {gameState === 'waiting' && (
//         <WaitingRoom
//           participants={participants}
//           onStart={handleStartRound}
//           isLoading={isLoading}
//         />
//       )}

//       {gameState === 'playing' && currentQuestion && answersCount < 5 && (
//         <QuestionDisplay
//           question={currentQuestion}
//           onAnswer={handleAnswer}
//           timeLeft={getTimeLeft(currentQuestion.endsAt)}
//           isLoading={isLoading}
//         />
//       )}

//       {(gameState === 'results' || answersCount >= 5) && roundId && (
//         <ResultsDisplay
//           lobbyId={lobbyId}
//           roundId={roundId}
//           currentUserId={currentUser.id}
//           onPlayAgain={() => {
//             setGameState('waiting');
//             setCurrentQuestion(null);
//             setRoundId(null);
//             setAnswersCount(0);
//           }}
//         />
//       )}
//     </AnimatePresence>
//   );
// }