// src/app/about/page.tsx
import { Heart, Users, MessageCircle, Shield, Sparkles, Target } from 'lucide-react'
import SimpleTopNav from '@/components/shared/SimpleTopNav'
import SimpleBottomNav from '@/components/shared/SimpleBottomNav'
import Footer from '@/components/shared/Footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <SimpleTopNav />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full px-6 py-2 mb-8">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-bold">ABOUT BLINDCHARM</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Dating Beyond
              <span className="block text-red-600 dark:text-red-400">Appearances</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto">
              BlindCharm revolutionizes online dating by prioritizing personality over photos. 
              We believe true connections happen when minds meet first.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 px-4 md:px-8 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                To create meaningful relationships by connecting people based on compatibility, 
                values, and genuine personality matches.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-700 rounded-2xl p-8 shadow-lg">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mb-6">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Authentic Connections
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We foster genuine relationships by encouraging users to share their true selves 
                  through thoughtful conversations and personality-based matching.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-2xl p-8 shadow-lg">
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mb-6">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Meaningful Conversations
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our platform is designed to spark deep, meaningful conversations that go beyond 
                  surface-level interactions and reveal true compatibility.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-2xl p-8 shadow-lg">
                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Safe Environment
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We maintain a secure, respectful community where users can express themselves 
                  freely while feeling protected and valued.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Our Story
              </h2>
            </div>

            <div className="prose prose-lg max-w-none text-gray-600 dark:text-gray-400">
              <p className="text-lg mb-6">
                BlindCharm was born from a simple observation: the most meaningful relationships 
                in our lives often begin with a conversation, not a photo. In a world where dating 
                apps prioritize appearance over personality, we saw an opportunity to create something different.
              </p>
              
              <p className="text-lg mb-6">
                Our innovative lobby system allows users to connect based on shared interests, 
                values, and conversation styles before revealing physical appearances. This approach 
                has led to more genuine connections and longer-lasting relationships.
              </p>
              
              <p className="text-lg">
                Today, BlindCharm continues to grow as a community of individuals who believe that 
                true love starts with understanding, respect, and genuine compatibility. We're proud 
                to be changing the way people meet and fall in love in the digital age.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 px-4 md:px-8 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Our Values
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Inclusivity
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    We welcome people of all backgrounds, orientations, and beliefs. Love knows no boundaries, 
                    and neither do we.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Authenticity
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    We encourage users to be their genuine selves, creating an environment where 
                    real personalities can shine through.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Privacy & Safety
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Your privacy and safety are our top priorities. We implement robust measures 
                    to protect your personal information and ensure a secure experience.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Innovation
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    We continuously evolve our platform to better serve our community and 
                    improve the way people connect online.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <SimpleBottomNav />
    </div>
  )
}