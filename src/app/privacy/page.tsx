// src/app/privacy/page.tsx
import { Lock, Shield, Eye, Database, Sparkles } from 'lucide-react'
import SimpleTopNav from '@/components/shared/SimpleTopNav'
import SimpleBottomNav from '@/components/shared/SimpleBottomNav'
import Footer from '@/components/shared/Footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <SimpleTopNav />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full px-6 py-2 mb-8">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-bold">PRIVACY POLICY</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Your Privacy
              <span className="block text-red-600 dark:text-red-400">Matters to Us</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              This Privacy Policy explains how BlindCharm collects, uses, and protects your personal information.
            </p>
            
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-20 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none text-gray-600 dark:text-gray-400">
              
              {/* Information We Collect */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Database className="w-8 h-8 text-red-500" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 m-0">
                    Information We Collect
                  </h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Information You Provide
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                      <li>• Account information (name, email, password)</li>
                      <li>• Profile information (interests, preferences, bio)</li>
                      <li>• Messages and communications with other users</li>
                      <li>• Photos and other content you upload</li>
                      <li>• Feedback and support communications</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Information We Collect Automatically
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                      <li>• Device information (IP address, browser type, operating system)</li>
                      <li>• Usage data (pages visited, features used, time spent)</li>
                      <li>• Location information (if you enable location services)</li>
                      <li>• Cookies and similar tracking technologies</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* How We Use Information */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Eye className="w-8 h-8 text-yellow-500" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 m-0">
                    How We Use Your Information
                  </h2>
                </div>
                
                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                  <p>We use your information to:</p>
                  <ul className="space-y-2">
                    <li>• Provide and improve our dating services</li>
                    <li>• Match you with compatible users</li>
                    <li>• Facilitate communication between users</li>
                    <li>• Ensure safety and security of our platform</li>
                    <li>• Send you important updates and notifications</li>
                    <li>• Analyze usage patterns to improve our services</li>
                    <li>• Comply with legal obligations</li>
                  </ul>
                </div>
              </div>

              {/* Information Sharing */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-8 h-8 text-red-600" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 m-0">
                    Information Sharing
                  </h2>
                </div>
                
                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                  <p>We may share your information in the following circumstances:</p>
                  <ul className="space-y-2">
                    <li>• <strong>With Other Users:</strong> Profile information you choose to make visible</li>
                    <li>• <strong>Service Providers:</strong> Third-party companies that help us operate our service</li>
                    <li>• <strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                    <li>• <strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
                    <li>• <strong>With Your Consent:</strong> When you explicitly agree to share information</li>
                  </ul>
                  
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg p-4 mt-6">
                    <p className="text-red-700 dark:text-red-300 font-medium">
                      <strong>Important:</strong> We never sell your personal information to third parties for marketing purposes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Security */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Lock className="w-8 h-8 text-red-500" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 m-0">
                    Data Security
                  </h2>
                </div>
                
                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                  <p>We implement industry-standard security measures to protect your information:</p>
                  <ul className="space-y-2">
                    <li>• Encryption of data in transit and at rest</li>
                    <li>• Regular security audits and assessments</li>
                    <li>• Access controls and authentication measures</li>
                    <li>• Secure data centers and infrastructure</li>
                    <li>• Employee training on data protection</li>
                  </ul>
                  
                  <p>
                    While we strive to protect your information, no method of transmission over the internet 
                    is 100% secure. We encourage you to use strong passwords and be cautious about sharing 
                    personal information.
                  </p>
                </div>
              </div>

              {/* Your Rights */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-8 h-8 text-yellow-500" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 m-0">
                    Your Rights and Choices
                  </h2>
                </div>
                
                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                  <p>You have the following rights regarding your personal information:</p>
                  <ul className="space-y-2">
                    <li>• <strong>Access:</strong> Request a copy of your personal information</li>
                    <li>• <strong>Correction:</strong> Update or correct inaccurate information</li>
                    <li>• <strong>Deletion:</strong> Request deletion of your account and data</li>
                    <li>• <strong>Portability:</strong> Request a copy of your data in a portable format</li>
                    <li>• <strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                    <li>• <strong>Restriction:</strong> Limit how we process your information</li>
                  </ul>
                  
                  <p>
                    To exercise these rights, please contact us through our support channels. 
                    We will respond to your request within 30 days.
                  </p>
                </div>
              </div>

              {/* Data Retention */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Data Retention
                </h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                  <p>
                    We retain your information for as long as necessary to provide our services and 
                    comply with legal obligations. When you delete your account, we will delete or 
                    anonymize your personal information within 30 days, except where we are required 
                    to retain it for legal purposes.
                  </p>
                </div>
              </div>

              {/* Cookies */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Cookies and Tracking
                </h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                  <p>
                    We use cookies and similar technologies to enhance your experience, analyze usage, 
                    and provide personalized content. You can control cookie settings through your 
                    browser preferences, though some features may not work properly if cookies are disabled.
                  </p>
                </div>
              </div>

              {/* Children's Privacy */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Children's Privacy
                </h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                  <p>
                    BlindCharm is not intended for users under 18 years of age. We do not knowingly 
                    collect personal information from children under 18. If we become aware that we 
                    have collected such information, we will delete it immediately.
                  </p>
                </div>
              </div>

              {/* Changes to Policy */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Changes to This Policy
                </h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                  <p>
                    We may update this Privacy Policy from time to time. We will notify you of any 
                    material changes by posting the new policy on our website and sending you an 
                    email notification. Your continued use of our services after such changes 
                    constitutes acceptance of the updated policy.
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Contact Us
                </h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                  <p>
                    If you have any questions about this Privacy Policy or our data practices, 
                    please contact us at:
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="font-medium text-gray-900 dark:text-gray-100">BlindCharm Privacy Team</p>
                    <p>Email: privacy@blindcharm.com</p>
                    <p>Address: [Your Company Address]</p>
                  </div>
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