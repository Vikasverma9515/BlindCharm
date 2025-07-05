// src/app/safety/page.tsx
import { Shield, Eye, Lock, AlertTriangle, Users, MessageCircle, Sparkles, CheckCircle } from 'lucide-react'
import SimpleTopNav from '@/components/shared/SimpleTopNav'
import SimpleBottomNav from '@/components/shared/SimpleBottomNav'
import Footer from '@/components/shared/Footer'

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <SimpleTopNav />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full px-6 py-2 mb-8">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-bold">SAFETY FIRST</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Your Safety is
              <span className="block text-red-600 dark:text-red-400">Our Priority</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto">
              At BlindCharm, we've built comprehensive safety measures to ensure you can 
              focus on finding meaningful connections in a secure environment.
            </p>
          </div>
        </section>

        {/* Safety Features */}
        <section className="py-20 px-4 md:px-8 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                How We Keep You Safe
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Our multi-layered approach to safety protects you at every step of your journey.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-700 rounded-2xl p-8 shadow-lg">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Profile Verification
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  All profiles go through our verification process to ensure authenticity 
                  and reduce fake accounts.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-2xl p-8 shadow-lg">
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mb-6">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Content Moderation
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our AI and human moderators monitor conversations and content to 
                  maintain a respectful environment.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-2xl p-8 shadow-lg">
                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mb-6">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Data Encryption
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  All your personal information and conversations are encrypted and 
                  stored securely using industry-standard protocols.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-2xl p-8 shadow-lg">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mb-6">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Report & Block
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Easy-to-use reporting and blocking features let you quickly address 
                  any inappropriate behavior or unwanted contact.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-2xl p-8 shadow-lg">
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Community Guidelines
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Clear community standards ensure everyone knows what behavior is 
                  expected and what won't be tolerated.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-2xl p-8 shadow-lg">
                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mb-6">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Safe Messaging
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our messaging system includes safety features like message filtering 
                  and the ability to control who can contact you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Safety Tips */}
        <section className="py-20 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Dating Safety Tips
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Follow these guidelines to ensure a safe and positive dating experience.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Trust Your Instincts
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    If something feels off about a conversation or person, trust your gut feeling. 
                    It's always better to be cautious and step back from any situation that makes you uncomfortable.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Keep Personal Information Private
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Don't share sensitive information like your home address, workplace details, 
                    or financial information until you've built trust with someone over time.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Meet in Public Places
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    When you're ready to meet in person, always choose public locations for your first few dates. 
                    Let friends or family know where you're going and when you expect to return.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Take Your Time
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Don't feel pressured to move faster than you're comfortable with. 
                    Genuine connections develop naturally over time, and the right person will respect your pace.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Report Suspicious Behavior
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    If someone makes you uncomfortable, asks for money, or exhibits suspicious behavior, 
                    report them immediately. Help us keep the community safe for everyone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Emergency Resources */}
        <section className="py-20 px-4 md:px-8 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Need Help?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                We're here to support you. Don't hesitate to reach out if you need assistance.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-700 rounded-2xl p-8 shadow-lg text-center">
                <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Report an Issue
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  If you encounter any safety concerns or inappropriate behavior, 
                  report it to our safety team immediately.
                </p>
                <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-semibold transition-colors">
                  Report Now
                </button>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-2xl p-8 shadow-lg text-center">
                <MessageCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Contact Support
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Our support team is available 24/7 to help with any questions 
                  or concerns you may have.
                </p>
                <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-full font-semibold transition-colors">
                  Get Help
                </button>
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