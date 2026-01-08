'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-pink-500/30">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="font-medium" style={{ fontFamily: 'var(--font-outfit)' }}>Back</span>
          </button>
          <span className="font-bold text-lg" style={{ fontFamily: 'var(--font-outfit)' }}>BlindCharm</span>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="pt-32 pb-20 px-6 max-w-3xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Title Section */}
          <div className="space-y-4 text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
              Privacy Policy
            </h1>
            <p className="text-white/60" style={{ fontFamily: 'var(--font-outfit)' }}>
              Last updated: December 30, 2024
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-12 text-lg text-white/80 leading-relaxed" style={{ fontFamily: 'var(--font-outfit)' }}>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>1. Introduction</h2>
              <p>
                We appreciate that you trust us with your information and we intend to always keep that trust. This starts with making sure you understand the information we collect, why we collect it, how it is used and your choices regarding your information. This Policy describes our privacy practices in plain language, keeping legal and technical jargon to a minimum.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>2. Information We Collect</h2>
              <p>
                To help you make meaningful connections, we collect some information about you, such as basic profile details and the types of people you'd like to meet.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li><strong className="text-white">Profile Information:</strong> When you create an account, you provide us with your phone number, gender, date of birth, and other profile details.</li>
                <li><strong className="text-white">Content:</strong> We collect photos and other content you upload.</li>
                <li><strong className="text-white">Usage Information:</strong> We collect information about your activity on our services, such as how you use them (e.g., date and time you logged in, features you've been using, searches, clicks, and pages which have been shown to you).</li>
                <li><strong className="text-white">Device Information:</strong> We collect information from and about the device(s) you use to access our services.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>3. How We Use Information</h2>
              <p>
                The main reason we use your information is to deliver and improve our services. Additionally, we use your info to help keep you safe.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li>To create and manage your account.</li>
                <li>To provide you with customer support and respond to your requests.</li>
                <li>To communicate with you about our services.</li>
                <li>To detect and prevent fraud or other unauthorized or illegal activities.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>4. How We Share Information</h2>
              <p>
                Since our goal is to help you make meaningful connections, the main sharing of users' information is, of course, with other users. We may also share some users' information with service providers and partners who assist us in operating the services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>5. Your Rights</h2>
              <p>
                We want you to be in control of your information, so we have provided you with the following tools:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li><strong className="text-white">Access / Update tools:</strong> Tools and account settings that help you to access, rectify or delete information that you provided to us.</li>
                <li><strong className="text-white">Device permissions:</strong> Mobile platforms have permission systems for specific types of device data and notifications, such as phone book and location services as well as push notifications.</li>
                <li><strong className="text-white">Deletion:</strong> You can delete your account by using the corresponding functionality directly on the service.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>6. Security</h2>
              <p>
                We work hard to protect you from unauthorized access to or alteration, disclosure or destruction of your personal information. As with all technology companies, although we take steps to secure your information, we do not promise, and you should not expect, that your personal information will always remain secure.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>7. Children's Privacy</h2>
              <p>
                Our services are restricted to users who are 18 years of age or older. We do not permit users under the age of 18 on our platform and we do not knowingly collect personal information from anyone under the age of 18.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>8. Changes to this Policy</h2>
              <p>
                Because we're always looking for new and innovative ways to help you build meaningful connections, this policy may change over time. We will notify you before any material changes take effect so that you have time to review the changes.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>9. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us at privacy@blindcharm.com.
              </p>
            </section>

          </div>

        </motion.div>
      </main>
    </div>
  );
}