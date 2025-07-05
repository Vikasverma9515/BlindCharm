// src/app/about-me/page.tsx
import Link from 'next/link'
import { Heart, Mail, Github, Linkedin } from 'lucide-react'
import SimpleTopNav from '@/components/shared/SimpleTopNav'
import SimpleBottomNav from '@/components/shared/SimpleBottomNav'
import Footer from '@/components/shared/Footer'

export default function AboutMePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <SimpleTopNav />
      
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              About Me
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Hi, I'm Vikas Verma - the creator behind BlindCharm
            </p>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none">
            {/* Who Am I */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Who Am I?
              </h2>
              <div className="text-gray-600 dark:text-gray-300 space-y-4">
                <p>
                  I'm a passionate full-stack developer with a love for creating meaningful digital experiences. 
                  With expertise in modern web technologies like React, Next.js, and TypeScript, I enjoy building 
                  applications that solve real-world problems and bring people together.
                </p>
                <p>
                  When I'm not coding, you'll find me exploring new technologies, contributing to open-source projects, 
                  or thinking about how technology can create more authentic human connections in our increasingly 
                  digital world.
                </p>
              </div>
            </section>

            {/* The Idea Behind BlindCharm */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                The Idea Behind BlindCharm
              </h2>
              <div className="bg-red-50 dark:bg-gray-800 p-6 rounded-lg border border-red-100 dark:border-gray-700">
                <div className="flex items-start gap-4">
                  <Heart className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                  <div className="text-gray-700 dark:text-gray-300 space-y-4">
                    <p>
                      BlindCharm was born from a simple observation: most dating apps focus on superficial attraction 
                      rather than genuine compatibility. I wanted to create a platform where personality, interests, 
                      and authentic conversations take center stage.
                    </p>
                    <p>
                      The concept is revolutionary yet simple - connect people based on who they are, not how they look. 
                      By removing photos from the initial matching process, BlindCharm encourages users to engage in 
                      meaningful conversations and discover compatibility through shared values, interests, and personalities.
                    </p>
                    <p>
                      It's about bringing back the art of conversation and the excitement of getting to know someone 
                      for who they truly are - creating connections that are built on substance rather than surface-level attraction.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Why I Built BlindCharm */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Why I Built BlindCharm
              </h2>
              <div className="text-gray-600 dark:text-gray-300 space-y-4">
                <p>
                  In today's swipe-heavy dating culture, I noticed that meaningful connections were becoming increasingly 
                  rare. People were making split-second decisions based on photos alone, missing out on potentially 
                  amazing relationships with people who might not photograph well but have incredible personalities.
                </p>
                <p>
                  I believe that the strongest relationships are built on emotional and intellectual compatibility, 
                  shared values, and genuine understanding. BlindCharm is my attempt to shift the focus back to these 
                  fundamental aspects of human connection.
                </p>
                <p>
                  My goal is to create a platform where introverts can shine, where personality matters more than 
                  appearance, and where people can fall in love with minds and hearts before faces. It's about 
                  giving everyone a fair chance at finding their perfect match.
                </p>
              </div>
            </section>

            {/* How to Connect */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Let's Connect
              </h2>
              <div className="text-gray-600 dark:text-gray-300 mb-6">
                <p>
                  I love connecting with fellow developers, entrepreneurs, and anyone passionate about building 
                  meaningful technology. Whether you want to discuss BlindCharm, collaborate on projects, or just 
                  chat about tech and life, I'm always open to new connections.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href="mailto:vikas@blindcharm.com"
                  className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-red-300 dark:hover:border-red-600 transition-colors"
                >
                  <Mail className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Email</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">vikas@blindcharm.com</p>
                  </div>
                </a>
                
                <a
                  href="https://github.com/vikasverma"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-red-300 dark:hover:border-red-600 transition-colors"
                >
                  <Github className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">GitHub</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">@vikasverma</p>
                  </div>
                </a>
                
                <a
                  href="https://linkedin.com/in/vikasverma"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-red-300 dark:hover:border-red-600 transition-colors"
                >
                  <Linkedin className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">LinkedIn</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Connect with me</p>
                  </div>
                </a>
              </div>
            </section>

            {/* Final Note */}
            <section className="text-center">
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                <p className="text-gray-600 dark:text-gray-300 italic">
                  "Technology should bring people closer together, not further apart. BlindCharm is my contribution 
                  to a world where authentic connections flourish and everyone has a chance to find their perfect match."
                </p>
                <p className="text-red-600 dark:text-red-400 font-medium mt-4">
                  - Vikas Verma, Founder of BlindCharm
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
      <SimpleBottomNav />
    </div>
  )
}