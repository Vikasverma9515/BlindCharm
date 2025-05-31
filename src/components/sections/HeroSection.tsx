// src/components/sections/HeroSection.tsx
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-red-50/30 to-white/80" />
        <Image
          src="/images/hero-bg.jpg" // Add a romantic/elegant background image
          alt="Background"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_0%,white_100%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mb-8 flex items-center"
            >
              <Image
                src="/logo2.png"
                alt="BlindCharm Logo"
                width={60}
                height={60}
                className="mr-4"
              />
              <span className="text-3xl font-bold text-red-600">BlindCharm</span>
            </motion.div>

            <motion.h1
              className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Find Your Perfect Match Through{' '}
              <span className="text-red-600 bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
                Meaningful Conversations
              </span>
            </motion.h1>

            <motion.p
              className="text-xl text-gray-700 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Experience dating as it should be. Connect with like-minded individuals based on:
              <br />
              <span className="inline-flex items-center mt-2">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                Personality & Values
              </span>
              <br />
              <span className="inline-flex items-center mt-2">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                Shared Interests
              </span>
              <br />
              <span className="inline-flex items-center mt-2">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                Genuine Connections
              </span>
            </motion.p>

            <motion.div
              className="flex gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <Link
                href="/register"
                className="inline-flex items-center px-8 py-3 rounded-full text-lg font-semibold bg-red-600 text-white hover:bg-red-700 transform hover:scale-105 transition-all shadow-xl hover:shadow-2xl"
              >
                Start Your Journey
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center px-8 py-3 rounded-full text-lg font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 transition-all"
              >
                Learn More
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Content - Floating Images */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="relative hidden lg:block"
          >
            <div className="relative h-[600px] w-full">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-red-100 rounded-full blur-3xl opacity-20" />
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-100 rounded-full blur-3xl opacity-20" />
              
              {/* Feature Images */}
              <motion.div
                className="absolute top-10 left-10 w-64 h-80 rounded-2xl overflow-hidden shadow-2xl"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
              >
                <Image
                  src="/images/feature1.jpg" // Add romantic/dating image
                  alt="Feature 1"
                  fill
                  className="object-cover"
                />
              </motion.div>

              <motion.div
                className="absolute top-40 right-10 w-64 h-80 rounded-2xl overflow-hidden shadow-2xl"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', delay: 0.5 }}
              >
                <Image
                  src="/images/feature2.jpg" // Add another romantic/dating image
                  alt="Feature 2"
                  fill
                  className="object-cover"
                />
              </motion.div>

              {/* Floating Elements */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  className="w-20 h-20 bg-red-500/10 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}