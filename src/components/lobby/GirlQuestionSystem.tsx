'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Edit3, 
  Send, 
  Trophy, 
  Heart, 
  Clock, 
  Users, 
  Star,
  CheckCircle,
  XCircle,
  MessageSquare,
  PenTool,
  Target,
  Crown,
  Sparkles,
  Timer,
  Award
} from 'lucide-react'
import { User, LobbyParticipant, Question, Answer } from '@/types/lobby'
import { supabase } from '@/lib/supabase'

interface GirlQuestionSystemProps {
  lobbyId: string
  currentUser: User | null
  participants: LobbyParticipant[]
  nextMatchTime: string
  onMatchTriggered?: () => void
}

interface LeaderboardEntry {
  boy: User
  totalPoints: number
  answeredQuestions: number
}



export default function GirlQuestionSystem({
  lobbyId,
  currentUser,
  participants,
  nextMatchTime,
  onMatchTriggered
}: GirlQuestionSystemProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [activeTab, setActiveTab] = useState<'create' | 'review' | 'leaderboard'>('create')
  const [loading, setLoading] = useState(false)
  const [userGender, setUserGender] = useState<string>('');
  
  // Question creation state
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    type: 'written' as 'mcq' | 'written',
    options: ['', '', '', ''],
    correctAnswer: ''
  })
  useEffect(() => {
    const fetchGender = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("users")
          .select("gender")
          .eq("id", user.id) // assumes your users table has same id as auth
          .single();

        if (!error && data) {
          setUserGender(data.gender?.toLowerCase());
        }
      }
    };

    fetchGender();
  }, []);

  const isGirl = userGender === "female";
  const isBoy = userGender === "male";


  // const currentUser: User | null = session?.user ? {
  //     id: session.user.id,
  //     username: session.user.name || session.user.email || 'Unknown',
  //     profile_picture: (session.user as any).image || null,
  //     gender: (session.user as any).gender || 'other'
  //   } : null;

  // const isGirl = currentUser?.gender?.toLowerCase() === 'female'
  // const isBoy = currentUser?.gender?.toLowerCase() === 'male'
  

// console.log("Gender from DB:", currentUser?.gender)


  // Fetch questions and answers
  useEffect(() => {
    if (lobbyId) {
      fetchQuestions()
      fetchAnswers()
      
      // Set up real-time subscriptions
      const questionsSubscription = supabase
        .channel(`questions-${lobbyId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'girl_questions',
          filter: `lobby_id=eq.${lobbyId}`
        }, () => {
          fetchQuestions()
        })
        .subscribe()

      const answersSubscription = supabase
        .channel(`answers-${lobbyId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'question_answers',
          filter: `lobby_id=eq.${lobbyId}`
        }, () => {
          fetchAnswers()
        })
        .subscribe()

      return () => {
        questionsSubscription.unsubscribe()
        answersSubscription.unsubscribe()
      }
    }
  }, [lobbyId])

  // Update leaderboard when answers change
  useEffect(() => {
    updateLeaderboard()
  }, [answers, participants])

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('girl_questions')
        .select('*')
        .eq('lobby_id', lobbyId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setQuestions(data || [])
    } catch (error) {
      console.error('Error fetching questions:', error)
    }
  }

  const fetchAnswers = async () => {
    try {
      const { data, error } = await supabase
        .from('question_answers')
        .select(`
          *,
          boy:boy_id (
            id,
            username,
            profile_picture,
            gender
          )
        `)
        .eq('lobby_id', lobbyId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setAnswers(data || [])
    } catch (error) {
      console.error('Error fetching answers:', error)
    }
  }

  const updateLeaderboard = () => {
    const boys = participants.filter(p => p.user.gender?.toLowerCase() === 'male')
    const leaderboardData: LeaderboardEntry[] = boys.map(participant => {
      const boyAnswers = answers.filter(a => a.boy_id === participant.user_id)
      const totalPoints = boyAnswers.reduce((sum, answer) => sum + answer.points_awarded, 0)
      
      return {
        boy: participant.user,
        totalPoints,
        answeredQuestions: boyAnswers.length
      }
    }).sort((a, b) => b.totalPoints - a.totalPoints)

    setLeaderboard(leaderboardData)
  }

  const createQuestion = async () => {
    if (!currentUser || !isGirl || !newQuestion.text.trim()) return
    
    // Check if girl already has 5 questions
    const girlQuestions = questions.filter(q => q.girl_id === currentUser.id)
    if (girlQuestions.length >= 5) {
      alert('You can only create up to 5 questions!')
      return
    }

    setLoading(true)
    try {
      const questionData = {
        girl_id: currentUser.id,
        lobby_id: lobbyId,
        question_text: newQuestion.text,
        question_type: newQuestion.type,
        options: newQuestion.type === 'mcq' ? newQuestion.options.filter(opt => opt.trim()) : null,
        correct_answer: newQuestion.type === 'mcq' ? newQuestion.correctAnswer : null
      }

      const { error } = await supabase
        .from('girl_questions')
        .insert([questionData])

      if (error) throw error

      // Reset form
      setNewQuestion({
        text: '',
        type: 'written',
        options: ['', '', '', ''],
        correctAnswer: ''
      })

      // Add haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(100)
      }
    } catch (error) {
      console.error('Error creating question:', error)
      alert('Failed to create question. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const submitAnswer = async (questionId: string, answerText: string, optionIndex?: number) => {
    if (!currentUser || !isBoy) return

    setLoading(true)
    try {
      const question = questions.find(q => q.id === questionId)
      if (!question) return

      let points = 0
      if (question.question_type === 'mcq' && optionIndex !== undefined) {
        // Auto-score MCQ
        const correctIndex = question.options?.indexOf(question.correct_answer || '')
        points = correctIndex === optionIndex ? 10 : 0
      }
      // Written answers start with 0 points, to be reviewed by girls

      const answerData = {
        question_id: questionId,
        boy_id: currentUser.id,
        lobby_id: lobbyId,
        answer_text: answerText,
        option_index: optionIndex,
        points_awarded: points,
        is_reviewed: question.question_type === 'mcq'
      }

      const { error } = await supabase
        .from('question_answers')
        .insert([answerData])

      if (error) throw error

      // Add haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      alert('Failed to submit answer. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const reviewAnswer = async (answerId: string, points: number) => {
    if (!currentUser || !isGirl) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('question_answers')
        .update({
          points_awarded: points,
          is_reviewed: true
        })
        .eq('id', answerId)

      if (error) throw error

      // Add haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100])
      }
    } catch (error) {
      console.error('Error reviewing answer:', error)
      alert('Failed to review answer. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getTopPerformer = () => {
    return leaderboard.length > 0 ? leaderboard[0] : null
  }

  const renderQuestionCreation = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Create Your Questions
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Create up to 5 questions for boys to answer ({questions.filter(q => q.girl_id === currentUser?.id).length}/5)
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-sm">
        <div className="space-y-4">
          {/* Question Type Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setNewQuestion(prev => ({ ...prev, type: 'written' }))}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
                newQuestion.type === 'written'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              
                          
                        
              {/* <PenTool className="w-3 h-3 flex-inline mr-0 " /> */}
              
              Written Answer
            </button>
            
            <button
              onClick={() => setNewQuestion(prev => ({ ...prev, type: 'mcq' }))}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                newQuestion.type === 'mcq'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {/* <Target className="w-3 h-3 flex-inline mr-0" /> */}
              Multiple Choice
            </button>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Question
            </label>
            <textarea
              value={newQuestion.text}
              onChange={(e) => setNewQuestion(prev => ({ ...prev, text: e.target.value }))}
              placeholder="What would you like to ask?"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              rows={3}
            />
          </div>

          {/* MCQ Options */}
          {newQuestion.type === 'mcq' && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Answer Options
              </label>
              {newQuestion.options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...newQuestion.options]
                      newOptions[index] = e.target.value
                      setNewQuestion(prev => ({ ...prev, options: newOptions }))
                    }}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={() => setNewQuestion(prev => ({ ...prev, correctAnswer: option }))}
                    className={`p-2 rounded-lg transition-colors ${
                      newQuestion.correctAnswer === option
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Click the checkmark to set the correct answer
              </p>
            </div>
          )}

          {/* Create Button */}
          <button
            onClick={createQuestion}
            disabled={loading || !newQuestion.text.trim() || (newQuestion.type === 'mcq' && !newQuestion.correctAnswer)}
            className="w-full py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Create Question
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Existing Questions */}
      {questions.filter(q => q.girl_id === currentUser?.id).length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-white">Your Questions</h4>
          {questions.filter(q => q.girl_id === currentUser?.id).map((question, index) => (
            <div key={question.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white font-medium">{question.question_text}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      question.question_type === 'mcq'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {question.question_type === 'mcq' ? 'Multiple Choice' : 'Written Answer'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {answers.filter(a => a.question_id === question.id).length} answers
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderBoyQuestions = () => {
    const availableQuestions = questions.filter(q => 
      !answers.some(a => a.question_id === q.id && a.boy_id === currentUser?.id)
    )

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Answer Questions
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Answer questions to earn points and improve your ranking
          </p>
        </div>

        {availableQuestions.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No new questions available. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {availableQuestions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                onSubmitAnswer={submitAnswer}
                loading={loading}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderReviewAnswers = () => {
    const myQuestions = questions.filter(q => q.girl_id === currentUser?.id)
    const writtenAnswers = answers.filter(a => 
      myQuestions.some(q => q.id === a.question_id) && 
      !a.is_reviewed &&
      questions.find(q => q.id === a.question_id)?.question_type === 'written'
    )

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Review Answers
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Review written answers and award points (0-10 points each)
          </p>
        </div>

        {writtenAnswers.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No answers to review right now
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {writtenAnswers.map((answer) => {
              const question = questions.find(q => q.id === answer.question_id)
              return (
                <AnswerReviewCard
                  key={answer.id}
                  answer={answer}
                  question={question}
                  onReview={reviewAnswer}
                  loading={loading}
                />
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const renderLeaderboard = () => {
    const topPerformer = getTopPerformer()

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Leaderboard
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Top performer gets matched first at {nextMatchTime}
          </p>
        </div>

        {/* Top Performer Highlight */}
        {topPerformer && topPerformer.totalPoints > 0 && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Crown className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg">Current Leader</h4>
                <p className="text-white/90">@{topPerformer.boy.username}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="w-4 h-4" />
                  <span className="font-semibold">{topPerformer.totalPoints} points</span>
                </div>
              </div>
              <div className="text-center">
                <Timer className="w-6 h-6 mx-auto mb-1" />
                <p className="text-sm text-white/90">Next match</p>
                <p className="font-bold">{nextMatchTime}</p>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.boy.id}
              className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm ${
                index === 0 && entry.totalPoints > 0 ? 'ring-2 ring-yellow-400' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  index === 0 ? 'bg-yellow-400 text-white' :
                  index === 1 ? 'bg-gray-400 text-white' :
                  index === 2 ? 'bg-orange-400 text-white' :
                  'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {index + 1}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-white">
                      @{entry.boy.username}
                    </p>
                    {index === 0 && entry.totalPoints > 0 && (
                      <Crown className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {entry.answeredQuestions} questions answered
                  </p>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-bold text-gray-900 dark:text-white">
                      {entry.totalPoints}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No participants yet. Be the first to answer questions!
            </p>
          </div>
        )}
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="text-center py-8">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Please log in to participate</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex-shrink-0 p-4">
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {isGirl && (
          
            <>
              <button
                onClick={() => setActiveTab('create')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'create'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Edit3 className="w-4 h-4 inline mr-2" />
                Create
              </button>
              
              <button
                onClick={() => setActiveTab('review')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'review'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <CheckCircle className="w-4 h-4 inline mr-2" />
                Review
              </button>
            </>
          )}
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'leaderboard'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Trophy className="w-4 h-4 inline mr-2" />
            Leaderboard
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <AnimatePresence mode="wait">
          {activeTab === 'create' && isGirl && (
          
          
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {renderQuestionCreation()}
            </motion.div>
          )}

          {activeTab === 'review' && isGirl && (
          
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {renderReviewAnswers()}
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {renderLeaderboard()}
            </motion.div>
          )}

          {isBoy && (
         
            <motion.div
              key="boy-questions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {renderBoyQuestions()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Question Card Component for Boys
function QuestionCard({ 
  question, 
  index, 
  onSubmitAnswer, 
  loading 
}: { 
  question: Question
  index: number
  onSubmitAnswer: (questionId: string, answer: string, optionIndex?: number) => void
  loading: boolean
}) {
  const [answer, setAnswer] = useState('')
  const [selectedOption, setSelectedOption] = useState<number | null>(null)

  const handleSubmit = () => {
    if (question.question_type === 'mcq' && selectedOption !== null) {
      const selectedAnswer = question.options?.[selectedOption] || ''
      onSubmitAnswer(question.id, selectedAnswer, selectedOption)
    } else if (question.question_type === 'written' && answer.trim()) {
      onSubmitAnswer(question.id, answer)
      setAnswer('')
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
          {index + 1}
        </div>
        <div className="flex-1">
          <p className="text-gray-900 dark:text-white font-medium text-lg">
            {question.question_text}
          </p>
          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
            question.question_type === 'mcq'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }`}>
            {question.question_type === 'mcq' ? 'Multiple Choice (10 pts)' : 'Written Answer (0-10 pts)'}
          </span>
        </div>
      </div>

      {question.question_type === 'mcq' ? (
        <div className="space-y-3">
          {question.options?.map((option, optionIndex) => (
            <button
              key={optionIndex}
              onClick={() => setSelectedOption(optionIndex)}
              className={`w-full p-3 text-left rounded-xl border-2 transition-colors ${
                selectedOption === optionIndex
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedOption === optionIndex
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {selectedOption === optionIndex && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-gray-900 dark:text-white">{option}</span>
              </div>
            </button>
          ))}
          
          <button
            onClick={handleSubmit}
            disabled={loading || selectedOption === null}
            className="w-full py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit Answer'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            rows={4}
          />
          
          <button
            onClick={handleSubmit}
            disabled={loading || !answer.trim()}
            className="w-full py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit Answer'}
          </button>
        </div>
      )}
    </div>
  )
}

// Answer Review Card Component for Girls
function AnswerReviewCard({ 
  answer, 
  question, 
  onReview, 
  loading 
}: { 
  answer: Answer
  question: Question | undefined
  onReview: (answerId: string, points: number) => void
  loading: boolean
}) {
  const [selectedPoints, setSelectedPoints] = useState<number | null>(null)

  const pointOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  const handleReview = () => {
    if (selectedPoints !== null) {
      onReview(answer.id, selectedPoints)
    }
  }

  if (!question) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          {question.question_text}
        </h4>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Answer by @{answer.boy.username}
          </span>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-4">
        <p className="text-gray-900 dark:text-white">{answer.answer_text}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Award Points (0-10)
          </label>
          <div className="flex gap-2 flex-wrap">
            {pointOptions.map((points) => (
              <button
                key={points}
                onClick={() => setSelectedPoints(points)}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                  selectedPoints === points
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {points}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleReview}
          disabled={loading || selectedPoints === null}
          className="w-full py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Reviewing...' : `Award ${selectedPoints} Points`}
        </button>
      </div>
    </div>
  )
}