// src/components/shared/Footer.tsx
'use client'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, Mail, MapPin, Instagram, ArrowUp } from 'lucide-react'

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const footerLinks = {
    company: [
      { name: 'About', href: '/about' },
      { name: 'How It Works', href: '/how-it-works' },
      { name: 'Safety', href: '/safety' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Contact Us', href: '/contact' },
    ],
  }

  return (
    <footer className="relative bg-black overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          {/* Top Section - Brand and Info */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Link href="/" className="inline-flex items-center gap-3 mb-6">
              <div className="bg-white rounded-b-full p-2">
                <Image
                  src="/logo2.png"
                  alt="BlindCharm Logo"
                  width={100}
                  height={100}
                  className="w-20 h-12 "
                />
                </div>
                <span className="text-3xl font-black text-white">
                  BlindCharm
                </span>
              </Link>
              
              <p className="text-gray-400 text-lg leading-relaxed mb-6 max-w-2xl mx-auto">
                Where authentic connections begin. Experience dating beyond appearances through our innovative lobby system.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Building connections worldwide</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:hello@blindcharm.com" className="hover:text-white transition-colors">
                    hello@blindcharm.com
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Links Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-md mx-auto">
            {Object.entries(footerLinks).map(([category, links], index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <h3 className="text-white font-bold text-lg mb-4 capitalize">
                  {category === 'company' ? 'Company' : 'Legal'}
                </h3>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-white transition-colors duration-300"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-gray-400 mb-2">
                © {new Date().getFullYear()} BlindCharm. All rights reserved.
              </p>
              <p className="text-sm text-gray-500">
                Built with <Heart className="w-4 h-4 text-red-500 inline mx-1" /> by{' '}
                <Link 
                  href="/about-me" 
                  className="font-semibold text-gray-400 hover:text-white transition-colors"
                >
                  Vikas Verma
                </Link>
              </p>
            </div>

            {/* Social Links & Scroll to Top */}
            <div className="flex items-center gap-4">
              <motion.a
                href="https://www.instagram.com/bbaking_brain"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-pink-400 transition-all duration-300 hover:scale-110"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Instagram className="w-5 h-5" />
              </motion.a>

              <motion.button
                onClick={scrollToTop}
                className="w-10 h-10 bg-white hover:bg-gray-200 rounded-full flex items-center justify-center text-black transition-all duration-300 hover:scale-110"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowUp className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}