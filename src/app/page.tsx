// src/app/page.tsx
'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X } from 'lucide-react' // Install lucide-react for icons
import { useState } from 'react'
import Background from '@/components/shared/Background'
import BackgroundPattern from '@/components/shared/BackgroundPattern'
import DynamicBackground from '@/components/shared/DynamicBackground'
import FloatingShapes from '@/components/shared/FloatingShapes'
import Navbar from '@/components/shared/Navbar'

 // Import the Background component

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="relative min-h-screen">
      {/* <Navbar/> */}


      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-24 md:pt-32">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-20">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
            MEANINGFUL CHATS
            <br />
            PERFECT MATCHES
            <span className="text-red-500 inline-block ml-2">✨</span>
          </h1>
        </div>

        {/* Cards Section */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 mb-12 md:mb-24">
          {/* Chat Card */}
          <div className="bg-red-100 rounded-2xl md:rounded-3xl p-6 md:p-8 hover:shadow-lg transition-all">
            <div className="text-red-500 mb-4 text-2xl">💬</div>
            <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-900">Start Chatting</h3>
            <p className="text-gray-700 text-sm md:text-base">
              Connect through meaningful conversations
            </p>
          </div>

          {/* Match Card */}
          <div className="bg-yellow-100 rounded-2xl md:rounded-3xl p-6 md:p-8 hover:shadow-lg transition-all">
            <div className="text-yellow-500 mb-4 text-2xl">❤️</div>
            <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-900">Find Your Match</h3>
            <p className="text-gray-700 text-sm md:text-base">
              Based on who you truly are
            </p>
          </div>

          {/* Community Card */}
          <div className="bg-blue-100 rounded-2xl md:rounded-3xl p-6 md:p-8 hover:shadow-lg transition-all sm:col-span-2 md:col-span-1">
            <div className="text-blue-500 mb-4 text-2xl">👥</div>
            <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-900">Join the Fun</h3>
            <p className="text-gray-700 text-sm md:text-base">
              Be part of our growing community
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-12 shadow-lg mb-12 md:mb-20">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Chat Deeper.
                <br />
                Match Better.
              </h2>
              <p className="text-gray-700 mb-6 text-sm md:text-base">
                Experience meaningful connections through personality-first matching
              </p>
              <Link
                href="/register"
                className="inline-flex items-center px-6 md:px-8 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all text-sm md:text-base"
              >
                Get Started →
              </Link>
            </div>

            <div className="relative">
              <Image
                src="/images/hero-image.png"
                alt="Couple illustration"
                width={500}
                height={400}
                className="rounded-2xl md:rounded-3xl"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-fuchsia-10">
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/logo2.png"
                  alt="BlindCharm"
                  // width={24}
                  // height={24}
                  layout="intrinsic"
                  width={56}
                  height={56}
                  className="rounded-full"
                />
                <span className="font-semibold text-gray-900">BlindCharm</span>
              </div>
              <p className="text-sm text-gray-600">
                Find meaningful connections through conversations.
              </p>
            </div>

            {/* Footer Links */}
            {[
              {
                title: "Company",
                links: [
                  { name: "About", href: "/about" },
                  { name: "Careers", href: "/careers" },
                  { name: "Blog", href: "/blog" },
                ]
              },
              {
                title: "Support",
                links: [
                  { name: "Help Center", href: "/help" },
                  { name: "Safety Center", href: "/safety" },
                  { name: "Community", href: "/community" },
                ]
              },
              {
                title: "Legal",
                links: [
                  { name: "Privacy", href: "/privacy" },
                  { name: "Terms", href: "/terms" },
                  { name: "Cookies", href: "/cookies" },
                ]
              }
            ].map((section) => (
              <div key={section.title}>
                <h3 className="font-semibold mb-4 text-sm md:text-base text-gray-900">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-gray-600 hover:text-gray-900 text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t text-center text-xs md:text-sm text-gray-600">
            © {new Date().getFullYear()} BlindCharm. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}