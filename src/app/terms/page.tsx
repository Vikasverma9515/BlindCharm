'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function TermsPage() {
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
              Terms of Service
            </h1>
            <p className="text-white/60" style={{ fontFamily: 'var(--font-outfit)' }}>
              Last updated: January 4, 2026
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-12 text-lg text-white/80 leading-relaxed" style={{ fontFamily: 'var(--font-outfit)' }}>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>1. Introduction</h2>
              <p>
                Welcome to BlindCharm. By accessing or using our mobile application, website, and services (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>2. Eligibility</h2>
              <p>
                You must be at least 18 years of age to use BlindCharm. By creating an account and using the Service, you represent and warrant that:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li>You can form a binding contract with BlindCharm.</li>
                <li>You are not a person who is barred from using the Service under the laws of the United States or any other applicable jurisdiction.</li>
                <li>You will comply with this Agreement and all applicable local, state, national, and international laws, rules, and regulations.</li>
                <li>You have never been convicted of a felony or indicted for any crime comprising sexual misconduct, violence, or threatening behavior.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>3. Your Account</h2>
              <p>
                To use BlindCharm, you may need to create an account via your phone number. You are responsible for maintaining the confidentiality of your login credentials and are solely responsible for all activities that occur under your account. If you think someone has gained access to your account, please immediately contact us.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>4. Community Rules</h2>
              <p>
                BlindCharm is designed to be a safe and respectful place for connection. You agree that you will not:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li>Use the Service for any purpose that is illegal or prohibited by these Terms.</li>
                <li>Harm or harass other users.</li>
                <li>Use the Service to distribute unsolicited commercial email ("spam") or advertisements.</li>
                <li>Impersonate any person or entity or post any images of another person without his or her permission.</li>
                <li>Bully, stalk, intimidate, assault, harass, mistreat, or defame any person.</li>
                <li>Post any content that violates or infringes anyone's rights, including rights of publicity, privacy, copyright, trademark, or other intellectual property or contract rights.</li>
                <li>Post any content that is hate speech, threatening, sexually explicit, or pornographic.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>5. Objectionable Content & Reporting</h2>
              <p>
                BlindCharm has a zero-tolerance policy for objectionable content and abusive behavior. This includes, but is not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li>Sexually explicit or pornographic material (including nudity).</li>
                <li>Content that promotes violence, hate speech, or discrimination based on race, ethnicity, religion, gender, or sexual orientation.</li>
                <li>Harassment, bullying, or threats against any individual.</li>
                <li>Illegal activities or promotion of illegal goods.</li>
              </ul>
              <p>
                <strong>Reporting & Blocking:</strong> We provide tools to block and report users who violate these terms. Reports are reviewed by our moderation team within 24 hours. Users found violating these policies will be suspended or permanently banned. You can report any user directly from their profile or chat menu.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>6. Content</h2>
              <p>
                You are solely responsible for the content you post or transmit on the Service. You grant BlindCharm a worldwide, transferable, sub-licensable, royalty-free right and license to host, store, use, copy, display, reproduce, adapt, edit, publish, modify, and distribute information you authorize us to access, as well as any information you post, upload, display or otherwise make available on the Service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>6. Safety</h2>
              <p>
                We strive to encourage a respectful user experience, but we are not responsible for the conduct of any user on or off the Service. You agree to use caution in all interactions with other users, particularly if you decide to communicate off the Service or meet in person.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>7. Disclaimer</h2>
              <p>
                THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. BLINDCHARM EXPRESSLY DISCLAIMS ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>8. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at help@blindcharm.com.
              </p>
            </section>

          </div>

        </motion.div>
      </main>
    </div >
  );
}