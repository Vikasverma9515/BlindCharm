'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  MessageCircle, 
  Brain, 
  Trophy, 
  Star, 
  Crown,
  CheckCircle,
  Edit3,
  PenTool,
  Target
} from 'lucide-react'

export default function GirlQuestionDemo() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Girl Question System Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            An interactive matchmaking feature where girls create questions for boys to answer, 
            creating engaging competition and better matches based on compatibility and effort.
          </p>
        </div>

        {/* Mobile and Desktop Views */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Mobile View */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 rounded"></div>
              Mobile Experience
            </h2>
            
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden max-w-sm mx-auto">
              {/* Mobile Header */}
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Coffee Lovers Chat</h3>
                      <p className="text-xs opacity-90">12 participants</p>
                    </div>
                  </div>
                </div>
                
                {/* Tab Navigation */}
                <div className="flex gap-2 mt-4 bg-white/20 rounded-xl p-1">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-white/20">
                    <MessageCircle className="w-4 h-4" />
                    Chat
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-white text-purple-600">
                    <Brain className="w-4 h-4" />
                    Q&A
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-4 space-y-4">
                {/* For Girls - Create Tab */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 px-3 rounded-lg text-sm bg-green-100 text-green-800 flex items-center justify-center gap-1">
                      <PenTool className="w-3 h-3" />
                      Written
                    </button>
                    <button className="flex-1 py-2 px-3 rounded-lg text-sm bg-gray-100 text-gray-600 flex items-center justify-center gap-1">
                      <Target className="w-3 h-3" />
                      MCQ
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-2">Question (3/5)</p>
                    <div className="bg-white rounded border p-2 text-sm">
                      What's your ideal first date activity?
                    </div>
                  </div>
                  
                  <button className="w-full py-2 bg-purple-500 text-white rounded-lg text-sm font-medium">
                    Create Question
                  </button>
                </div>

                {/* Leaderboard Preview */}
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-3 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-4 h-4" />
                    <span className="text-sm font-semibold">Current Leader</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">@alex_m</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        <span className="text-sm">47 points</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs opacity-90">Next match</p>
                      <p className="font-bold">15:00</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop View */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded"></div>
              Desktop Experience
            </h2>
            
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Desktop Header */}
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Coffee Lovers Chat</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>12 online</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      <span>Next: 15:00</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-gray-200 p-4">
                <div className="flex gap-2 bg-gray-100 rounded-xl p-1 max-w-md">
                  <button className="flex-1 py-2 px-4 rounded-lg text-sm font-medium text-gray-600">
                    <MessageCircle className="w-4 h-4 inline mr-2" />
                    Chat
                  </button>
                  <button className="flex-1 py-2 px-4 rounded-lg text-sm font-medium bg-white text-gray-900 shadow-sm">
                    <Brain className="w-4 h-4 inline mr-2" />
                    Q&A System
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Question Creation */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Create Questions (Girls)</h4>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="flex gap-2">
                        <button className="px-3 py-1 rounded-lg text-xs bg-green-500 text-white">Written Answer</button>
                        <button className="px-3 py-1 rounded-lg text-xs bg-gray-200 text-gray-600">Multiple Choice</button>
                      </div>
                      <textarea 
                        className="w-full p-2 border rounded-lg text-sm resize-none" 
                        rows={2}
                        placeholder="What's your ideal first date activity?"
                        value="What's your ideal first date activity?"
                        readOnly
                      />
                      <button className="w-full py-2 bg-purple-500 text-white rounded-lg text-sm font-medium">
                        Create Question (3/5)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Answer Questions (Boys)</h4>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">What's your ideal first date activity?</p>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Written Answer (0-10 pts)</span>
                        </div>
                      </div>
                      <textarea 
                        className="w-full p-2 border rounded-lg text-sm resize-none" 
                        rows={2}
                        placeholder="Type your answer here..."
                      />
                      <button className="w-full py-2 bg-blue-500 text-white rounded-lg text-sm font-medium">
                        Submit Answer
                      </button>
                    </div>
                  </div>
                </div>

                {/* Leaderboard */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Live Leaderboard</h4>
                  <div className="space-y-2">
                    {[
                      { rank: 1, name: 'alex_m', points: 47, questions: 5, isLeader: true },
                      { rank: 2, name: 'mike_j', points: 42, questions: 4, isLeader: false },
                      { rank: 3, name: 'david_k', points: 38, questions: 5, isLeader: false },
                    ].map((user) => (
                      <div key={user.rank} className={`flex items-center gap-4 p-3 rounded-xl ${user.isLeader ? 'bg-gradient-to-r from-yellow-100 to-orange-100 ring-2 ring-yellow-400' : 'bg-gray-50'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${user.rank === 1 ? 'bg-yellow-400 text-white' : user.rank === 2 ? 'bg-gray-400 text-white' : user.rank === 3 ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-600'}`}>
                          {user.rank}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">@{user.name}</p>
                            {user.isLeader && <Crown className="w-4 h-4 text-yellow-500" />}
                          </div>
                          <p className="text-sm text-gray-500">{user.questions} questions answered</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-bold">{user.points}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto">
              <Edit3 className="w-8 h-8 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold">Girls Create Questions</h3>
            <p className="text-gray-600">
              Create up to 5 questions (MCQ or written) to learn about potential matches
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
              <PenTool className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold">Boys Answer & Compete</h3>
            <p className="text-gray-600">
              Answer questions to earn points and climb the leaderboard for better matching priority
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold">Smart Matching</h3>
            <p className="text-gray-600">
              Top performers get matched first, ensuring effort and compatibility are rewarded
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto font-bold">1</div>
              <h4 className="font-semibold">Girls Create</h4>
              <p className="text-sm text-gray-600">Girls create up to 5 questions (MCQ auto-scored, written manually reviewed)</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto font-bold">2</div>
              <h4 className="font-semibold">Boys Answer</h4>
              <p className="text-sm text-gray-600">Boys answer questions to earn points and show their personality</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto font-bold">3</div>
              <h4 className="font-semibold">Girls Review</h4>
              <p className="text-sm text-gray-600">Girls review written answers and award points (0-10) based on their preference</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-yellow-500 text-white rounded-full flex items-center justify-center mx-auto font-bold">4</div>
              <h4 className="font-semibold">Smart Match</h4>
              <p className="text-sm text-gray-600">Top scorer gets matched first when the timer hits</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}