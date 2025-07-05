// src/app/how-it-works/page.tsx
import { UserPlus, MessageCircle, Heart, Users, Eye, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import SimpleTopNav from '@/components/shared/SimpleTopNav'
import SimpleBottomNav from '@/components/shared/SimpleBottomNav'
import Footer from '@/components/shared/Footer'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <SimpleTopNav />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full px-6 py-2 mb-8">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-bold">HOW IT WORKS</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Find Love in
              <span className="block text-red-600 dark:text-red-400">4 Simple Steps</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto">
              BlindCharm's unique approach helps you connect with people based on personality 
              and compatibility, not just photos.
            </p>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-20 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="space-y-20">
              {/* Step 1 */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      1
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      Create Your Profile
                    </h2>
                  </div>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                    Sign up and tell us about yourself. Share your interests, values, and what 
                    you're looking for in a relationship. The more authentic you are, the better 
                    your matches will be.
                  </p>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Share your personality and interests
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Set your relationship preferences
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Add conversation starters
                    </li>
                  </ul>
                </div>
                <div className="order-1 md:order-2">
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-3xl p-8 text-center">
                    <UserPlus className="w-24 h-24 text-red-500 mx-auto mb-4" />
                    <div className="text-gray-700 dark:text-gray-300 font-medium">
                      Build your authentic profile
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-3xl p-8 text-center">
                    <Users className="w-24 h-24 text-yellow-500 mx-auto mb-4" />
                    <div className="text-gray-700 dark:text-gray-300 font-medium">
                      Join the lobby system
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      2
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      Enter the Lobby
                    </h2>
                  </div>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                    Join our unique lobby system where you can interact with other users through 
                    conversations and activities without seeing their photos. Focus on personality 
                    and compatibility first.
                  </p>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      Engage in anonymous conversations
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      Participate in fun activities
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      Discover shared interests
                    </li>
                  </ul>
                </div>
              </div>

              {/* Step 3 */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      3
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      Make Connections
                    </h2>
                  </div>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                    When you find someone you connect with, express your interest. If the feeling 
                    is mutual, you'll both be notified and can choose to reveal your photos and 
                    continue the conversation.
                  </p>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      Express interest in compatible matches
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      Get notified of mutual connections
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      Choose when to reveal photos
                    </li>
                  </ul>
                </div>
                <div className="order-1 md:order-2">
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-3xl p-8 text-center">
                    <MessageCircle className="w-24 h-24 text-red-600 mx-auto mb-4" />
                    <div className="text-gray-700 dark:text-gray-300 font-medium">
                      Connect through conversation
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-3xl p-8 text-center">
                    <Heart className="w-24 h-24 text-red-500 mx-auto mb-4" />
                    <div className="text-gray-700 dark:text-gray-300 font-medium">
                      Build meaningful relationships
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      4
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      Start Dating
                    </h2>
                  </div>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                    Once you've connected, take your relationship to the next level. Plan dates, 
                    continue meaningful conversations, and build a genuine connection based on 
                    mutual understanding and compatibility.
                  </p>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Move to private messaging
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Plan real-world dates
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Build lasting relationships
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why It Works Section */}
        <section className="py-20 px-4 md:px-8 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Why This Approach Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
              Our method is backed by relationship psychology and real success stories.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg">
                <Eye className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Reduces Bias
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  By removing photos initially, we eliminate superficial judgments and 
                  encourage deeper connections.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg">
                <MessageCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Better Conversations
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Users focus on meaningful dialogue, leading to stronger emotional 
                  connections and compatibility.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg">
                <Heart className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Lasting Relationships
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Relationships built on personality compatibility tend to be more 
                  stable and fulfilling long-term.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Ready to Find Your Perfect Match?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Join thousands of users who have found meaningful connections through BlindCharm.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Heart className="w-5 h-5" />
              Start Your Journey
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
      <SimpleBottomNav />
    </div>
  )
}