// src/app/contact/page.tsx
'use client'
import { useState } from 'react'
import { Mail, MessageCircle, Phone, MapPin, Send, Sparkles, Clock, HelpCircle } from 'lucide-react'
import SimpleTopNav from '@/components/shared/SimpleTopNav'
import SimpleBottomNav from '@/components/shared/SimpleBottomNav'
import Footer from '@/components/shared/Footer'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <SimpleTopNav />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full px-6 py-2 mb-8">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-bold">CONTACT US</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Get in
              <span className="block text-red-600 dark:text-red-400">Touch</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto">
              Have questions, feedback, or need support? We're here to help! 
              Reach out to us and we'll get back to you as soon as possible.
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-20 px-4 md:px-8 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg text-center">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Email Support
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                  Get help with your account
                </p>
                <a href="mailto:support@blindcharm.com" className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium">
                  support@blindcharm.com
                </a>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg text-center">
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Help Center
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                  Find answers to common questions
                </p>
                <a href="#" className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 font-medium">
                  Browse FAQs
                </a>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg text-center">
                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Live Chat
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                  Chat with our support team
                </p>
                <button className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium">
                  Start Chat
                </button>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg text-center">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Response Time
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                  We typically respond within
                </p>
                <span className="text-red-600 dark:text-red-400 font-bold">
                  24 hours
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-20 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Send us a Message
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-12">
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Message Sent!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Thank you for contacting us. We'll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="account">Account Issues</option>
                      <option value="safety">Safety Concerns</option>
                      <option value="feedback">Feedback</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4 md:px-8 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Quick answers to common questions about BlindCharm.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
                  How does BlindCharm work?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  BlindCharm uses a unique lobby system where you connect with people based on personality 
                  and interests before seeing their photos. This helps create more meaningful connections.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Is BlindCharm free to use?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  BlindCharm offers both free and premium features. You can create a profile and start 
                  connecting for free, with additional features available through our premium subscription.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
                  How do I report inappropriate behavior?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  You can report any user or content that violates our community guidelines using the 
                  report button in conversations or profiles. Our safety team reviews all reports promptly.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Can I delete my account?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes, you can delete your account at any time through your account settings. 
                  This will permanently remove your profile and data from our platform.
                </p>
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