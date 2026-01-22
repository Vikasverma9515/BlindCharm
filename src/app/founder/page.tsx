'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Linkedin, Mail, Github, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FounderPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/5 py-4 md:py-6 px-4 md:px-6 lg:px-12">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm md:text-base">
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 md:py-16 px-4 md:px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 md:mb-16"
          >
            <h1 className="font-heading font-black text-3xl md:text-5xl lg:text-6xl mb-3 md:mb-4 leading-tight px-2">
              Meet the Founder
            </h1>
            <p className="text-gray-400 text-base md:text-lg lg:text-xl max-w-2xl mx-auto px-4">
              The story behind BlindCharm and the vision to revolutionize online dating
            </p>
          </motion.div>

          {/* Founder Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-16"
          >
            <div className="relative bg-white/5 rounded-3xl p-8 md:p-12 border border-white/10">
              {/* Profile Section */}
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-8">
                {/* Avatar Placeholder */}
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center border-4 border-white/20 flex-shrink-0">
                  <span className="text-5xl font-heading font-black">V</span>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h2 className="font-heading font-bold text-3xl md:text-4xl mb-2">Vikas Verma</h2>
                  <p className="text-gray-400 text-lg mb-4">Founder & Creator of BlindCharm</p>

                  {/* Social Links */}
                  <div className="flex gap-4 justify-center md:justify-start">
                    <a
                      href="https://www.linkedin.com/in/vikas-verma-264103275/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                      <span>LinkedIn</span>
                    </a>
                    <a
                      href="mailto:vikasverma951582@gmail.com"
                      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                      <span>Email</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Story */}
              <div className="space-y-4 md:space-y-6 text-gray-300 leading-relaxed text-sm md:text-base">
                <p className="text-base md:text-lg">
                  Hi, I'm Vikas Verma, the founder of BlindCharm. I built this platform because I was tired of the superficial nature of modern dating apps.
                </p>

                <p>
                  Like many of you, I experienced the frustration of endless swiping based on photos, matching with people who looked good on paper but had zero connection in real life. I realized that dating apps were optimized for engagement, not genuine connections.
                </p>

                <p>
                  So I asked myself: <span className="text-white italic">"What if we flipped the script? What if personality and vibe came first?"</span>
                </p>

                <p>
                  That's how BlindCharm was born. An AI-first dating platform where your energy, voice, and authenticity matter more than your job title or how tall you are.
                </p>

                <div className="border-l-4 border-white/20 pl-4 md:pl-6 py-3 md:py-4 my-6 md:my-8 italic text-gray-400 text-sm md:text-base">
                  "Real connections don't come from filters. They come from vibes."
                </div>

                <p>
                  BlindCharm uses AI to match you based on your current mood and personality—not a static profile you wrote months ago. Every day, you get fresh matches that align with who you are <span className="text-white">today</span>.
                </p>

                <p>
                  Building BlindCharm has been an incredible journey, and I'm excited to keep innovating and creating a platform where people feel seen, heard, and genuinely connected.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tech Stack & Vision */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          >
            {/* Vision */}
            <div className="bg-white/5 rounded-2xl p-5 md:p-6 border border-white/10">
              <h3 className="font-heading font-bold text-lg md:text-xl mb-3 md:mb-4">The Vision</h3>
              <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                To create a dating platform that people actually want to delete—because they found their person.
                A place where authentic connections happen through AI that understands you.
              </p>
            </div>

            {/* Tech Stack */}
            <div className="bg-white/5 rounded-2xl p-5 md:p-6 border border-white/10">
              <h3 className="font-heading font-bold text-lg md:text-xl mb-3 md:mb-4">Built With</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs md:text-sm">Next.js</span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs md:text-sm">TypeScript</span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs md:text-sm">Supabase</span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs md:text-sm">AI/ML</span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs md:text-sm">Tailwind CSS</span>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center mt-12 md:mt-16"
          >
            <p className="text-gray-400 mb-6 text-sm md:text-base">
              Want to connect or share feedback?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              {/* <Link
                href="/contact"
                className="bg-white text-black font-bold px-6 md:px-8 py-3 md:py-4 rounded-full hover:bg-gray-200 transition-colors text-sm md:text-base"
              >
                Get in Touch
              </Link> */}
              <a
                href="https://www.linkedin.com/in/vikas-verma-264103275/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 text-white font-bold px-6 md:px-8 py-3 md:py-4 rounded-full hover:bg-white/20 transition-colors border border-white/20 flex items-center justify-center gap-2 text-sm md:text-base"
              >
                Connect on LinkedIn
                <ExternalLink className="w-3 h-3 md:w-4 md:h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}