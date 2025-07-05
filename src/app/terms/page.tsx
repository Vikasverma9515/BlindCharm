// src/app/terms/page.tsx
import { FileText, Shield, AlertTriangle, Users, Sparkles } from 'lucide-react'
import SimpleTopNav from '@/components/shared/SimpleTopNav'
import SimpleBottomNav from '@/components/shared/SimpleBottomNav'
import Footer from '@/components/shared/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <SimpleTopNav />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full px-6 py-2 mb-8">
              <FileText className="w-4 h-4" />
              <span className="text-sm font-bold">TERMS OF SERVICE</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Terms of
              <span className="block text-red-600 dark:text-red-400">Service</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              These Terms of Service govern your use of BlindCharm and outline our mutual rights and responsibilities.
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
              
              {/* Acceptance */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  1. Acceptance of Terms
                </h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                  <p>
                    By accessing or using BlindCharm ("the Service"), you agree to be bound by these 
                    Terms of Service ("Terms"). If you do not agree to these Terms, you may not use 
                    our Service.
                  </p>
                  <p>
                    These Terms constitute a legally binding agreement between you and BlindCharm. 
                    We may update these Terms from time to time, and your continued use of the Service 
                    constitutes acceptance of any changes.
                  </p>
                </div>
              </div>

              {/* Eligibility */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-8 h-8 text-red-500" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 m-0">
                    2. Eligibility
                  </h2>
                </div>
                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                  <p>To use BlindCharm, you must:</p>
                  <ul className="space-y-2">
                    <li>• Be at least 18 years old</li>
                    <li>• Have the legal capacity to enter into these Terms</li>
                    <li>• Not be prohibited from using the Service under applicable law</li>
                    <li>• Not have been previously banned from the Service</li>
                    <li>• Provide accurate and truthful information</li>
                  </ul>
                  
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg p-4 mt-6">
                    <p className="text-red-700 dark:text-red-300 font-medium">
                      <strong>Important:</strong> You must be single and legally able to enter into romantic relationships.
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Responsibilities */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-8 h-8 text-yellow-500" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 m-0">
                    3. Account Responsibilities
                  </h2>
                </div>
                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                  <p>When creating and maintaining your account, you agree to:</p>
                  <ul className="space-y-2">
                    <li>• Provide accurate, current, and complete information</li>
                    <li>• Maintain and update your information as needed</li>
                    <li>• Keep your login credentials secure and confidential</li>
                    <li>• Notify us immediately of any unauthorized access</li>
                    <li>• Be responsible for all activities under your account</li>
                    <li>• Use only one account per person</li>
                  </ul>
                </div>
              </div>

              {/* Prohibited Conduct */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 m-0">
                    4. Prohibited Conduct
                  </h2>
                </div>
                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                  <p>You agree not to:</p>
                  <ul className="space-y-2">
                    <li>• Harass, abuse, or harm other users</li>
                    <li>• Post false, misleading, or deceptive information</li>
                    <li>• Use the Service for commercial purposes without permission</li>
                    <li>• Share inappropriate, offensive, or illegal content</li>
                    <li>• Attempt to access other users' accounts</li>
                    <li>• Use automated systems or bots</li>
                    <li>• Circumvent our safety measures</li>
                    <li>• Solicit money or personal information from other users</li>
                    <li>• Engage in any form of discrimination</li>
                  </ul>
                </div>
              </div>

              {/* Content Guidelines */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  5. Content Guidelines
                </h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                  <p>All content you share on BlindCharm must:</p>
                  <ul className="space-y-2">
                    <li>• Be appropriate and respectful</li>
                    <li>• Not violate any laws or regulations</li>
                    <li>• Not infringe on others' intellectual property rights</li>
                    <li>• Not contain explicit or inappropriate material</li>
                    <li>• Be your own original content or properly licensed</li>
                  </ul>
                  
                  <p>
                    We reserve the right to remove any content that violates these guidelines 
                    or our community standards.
                  </p>
                </div>
              </div>

              {/* Privacy and Data */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  6. Privacy and Data Use
                </h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                  <p>
                    Your privacy is important to us. Our Privacy Policy explains how we collect, 
                    use, and protect your information. By using our Service, you consent to our 
                    data practices as described in our Privacy Policy.
                  </p>
                  <p>
                    You grant us the right to use your profile information and content to provide 
                    and improve our matching services.
                  </p>
                </div>
              </div>

              {/* Subscription and Payments */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  7. Subscription and Payments
                </h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                  <p>
                    BlindCharm offers both free and premium subscription services. Premium features 
                    require payment and are subject to the following terms:
                  </p>
                  <ul className="space-y-2">
                    <li>• Subscriptions automatically renew unless cancelled</li>
                    <li>• You can cancel your subscription at any time</li>
                    <li>• Refunds are provided according to our refund policy</li>
                    <li>• Prices may change with advance notice</li>
                    <li>• Payment information must be accurate and current</li>
                  </ul>
                </div>
              </div>

              {/* Termination */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  8. Termination
                </h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                  <p>
                    Either party may terminate this agreement at any time. You can delete your 
                    account through your account settings. We may suspend or terminate your 
                    account if you violate these Terms.
                  </p>
                  <p>
                    Upon termination, your right to use the Service ceases immediately, and we 
                    may delete your account and data according to our data retention policies.
                  </p>
                </div>
              </div>

              {/* Disclaimers */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  9. Disclaimers
                </h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                  <p>
                    BlindCharm is provided "as is" without warranties of any kind. We do not 
                    guarantee that you will find a romantic partner or that the Service will 
                    meet your expectations.
                  </p>
                  <p>
                    We are not responsible for the conduct of other users or the accuracy of 
                    information they provide. You interact with other users at your own risk.
                  </p>
                </div>
              </div>

              {/* Limitation of Liability */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  10. Limitation of Liability
                </h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                  <p>
                    To the maximum extent permitted by law, BlindCharm shall not be liable for 
                    any indirect, incidental, special, or consequential damages arising from 
                    your use of the Service.
                  </p>
                  <p>
                    Our total liability to you for any claims related to the Service shall not 
                    exceed the amount you paid us in the 12 months preceding the claim.
                  </p>
                </div>
              </div>

              {/* Governing Law */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  11. Governing Law
                </h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                  <p>
                    These Terms are governed by the laws of [Your Jurisdiction]. Any disputes 
                    arising from these Terms or your use of the Service will be resolved in 
                    the courts of [Your Jurisdiction].
                  </p>
                </div>
              </div>

              {/* Changes to Terms */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  12. Changes to Terms
                </h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                  <p>
                    We may modify these Terms at any time. We will notify you of material changes 
                    by posting the updated Terms on our website and sending you an email notification. 
                    Your continued use of the Service after such changes constitutes acceptance 
                    of the new Terms.
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  13. Contact Information
                </h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                  <p>
                    If you have any questions about these Terms, please contact us at:
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="font-medium text-gray-900 dark:text-gray-100">BlindCharm Legal Team</p>
                    <p>Email: legal@blindcharm.com</p>
                    <p>Address: [Your Company Address]</p>
                  </div>
                </div>
              </div>

              {/* Acknowledgment */}
              <div className="mb-12">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg p-6">
                  <p className="text-red-700 dark:text-red-300 font-medium">
                    By using BlindCharm, you acknowledge that you have read, understood, and 
                    agree to be bound by these Terms of Service.
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