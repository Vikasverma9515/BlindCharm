// src/app/page.tsx
'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, MessageCircle, Users, Sparkles, ArrowRight, Star, Zap, X, Coffee, Music, Book, Camera } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SimpleTopNav from '@/components/shared/SimpleTopNav'
import SimpleBottomNav from '@/components/shared/SimpleBottomNav'
import Footer from '@/components/shared/Footer'
import CardSwap, { Card } from '@/components/ui/CardSwap'
import InfiniteScroll from '@/components/ui/InfiniteScroll'
import PixelCard from '@/blocks/Components/PixelCard/PixelCard'
import Silk from '@/components/ui/Silk'

// const AnimatedBackground = () => {
//   // Use state to store window dimensions
//   const [dimensions, setDimensions] = useState({ width: 1000, height: 1000 });

//   useEffect(() => {
//     // Update dimensions after mount
//     setDimensions({
//       width: window.innerWidth,
//       height: window.innerHeight
//     });

//     const handleResize = () => {
//       setDimensions({
//         width: window.innerWidth,
//         height: window.innerHeight
//       });
//     };

//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   return (
//     <div className="fixed inset-0 -z-10 overflow-hidden">
//       <div className="absolute inset-0 opacity-5">
//         <div 
//           className="absolute inset-0" 
//           style={{
//             backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,0,0,0.2) 2px, transparent 0)',
//             backgroundSize: '40px 40px',
//           }}
//         />
//       </div>
      
//       {[...Array(5)].map((_, i) => {
//         const width = 64 + Math.floor(Math.random() * 64);
//         const height = 64 + Math.floor(Math.random() * 64);
        
//         return (
//           <motion.div
//             key={i}
//             initial={{ x: width, y: height }}
//             animate={{
//               x: [width, dimensions.width - width],
//               y: [height, dimensions.height - height],
//             }}
//             transition={{
//               duration: 20,
//               repeat: Infinity,
//               repeatType: "reverse",
//               ease: "linear"
//             }}
//             className="absolute rounded-full mix-blend-multiply filter blur-xl opacity-10"
//             style={{
//               width: `${width}px`,
//               height: `${height}px`,
//               background: i % 2 ? '#FF3366' : '#FFD700',
//             }}
//           />
//         );
//       })}
//     </div>
//   );
// };

const LobbyCardSwap = () => {
  return (
    // <div className="w-full h-[600px] sm:h-[500px] lg:h-[600px] flex items-center justify-center">
    <div className="w-full h-[600px] sm:h-[500px] lg:h-[600px] flex items-center justify-start -ml-20 sm:justify-center sm:ml-0">
      <CardSwap
        cardDistance={40}
        verticalDistance={50}
        delay={5000}
        pauseOnHover={true}
        width={280}
        height={380}
        easing="elastic"
      >
        <Card className="bg-gradient-to-br from-amber-400 to-orange-500 border-white/20 shadow-2xl">
          <div className="h-full p-4 sm:p-6 flex flex-col text-white">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Coffee className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold">Morning Brew</h3>
                <p className="text-white/80 text-xs sm:text-sm">Coffee Chat</p>
              </div>
            </div>
            <p className="text-white/90 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 flex-1">
              Start your day with meaningful conversations over virtual coffee
            </p>
            <div className="flex gap-1 sm:gap-2 flex-wrap mb-3 sm:mb-4">
              {["Casual", "Morning", "Coffee"].map(tag => (
                <span key={tag} className="px-2 sm:px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-white/80" />
                <span className="text-white/80 text-xs sm:text-sm">48 members</span>
              </div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
              Join Lobby
            </motion.button>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-pink-500 border-white/20 shadow-2xl">
          <div className="h-full p-4 sm:p-6 flex flex-col text-white">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Music className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold">Melody Match</h3>
                <p className="text-white/80 text-xs sm:text-sm">Music Lovers</p>
              </div>
            </div>
            <p className="text-white/90 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 flex-1">
              Share your favorite tunes and discover new artists together
            </p>
            <div className="flex gap-1 sm:gap-2 flex-wrap mb-3 sm:mb-4">
              {["Music", "Creative", "Sharing"].map(tag => (
                <span key={tag} className="px-2 sm:px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-white/80" />
                <span className="text-white/80 text-xs sm:text-sm">56 members</span>
              </div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
              Join Lobby
            </motion.button>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 border-white/20 shadow-2xl">
          <div className="h-full p-4 sm:p-6 flex flex-col text-white">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Book className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold">Page Turners</h3>
                <p className="text-white/80 text-xs sm:text-sm">Book Club</p>
              </div>
            </div>
            <p className="text-white/90 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 flex-1">
              Dive deep into literature and share your reading journey
            </p>
            <div className="flex gap-1 sm:gap-2 flex-wrap mb-3 sm:mb-4">
              {["Books", "Literature", "Deep"].map(tag => (
                <span key={tag} className="px-2 sm:px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-white/80" />
                <span className="text-white/80 text-xs sm:text-sm">24 members</span>
              </div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
              Join Lobby
            </motion.button>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-400 to-teal-500 border-white/20 shadow-2xl">
          <div className="h-full p-4 sm:p-6 flex flex-col text-white">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold">Lens & Light</h3>
                <p className="text-white/80 text-xs sm:text-sm">Photography</p>
              </div>
            </div>
            <p className="text-white/90 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 flex-1">
              Capture moments and share your perspective through photos
            </p>
            <div className="flex gap-1 sm:gap-2 flex-wrap mb-3 sm:mb-4">
              {["Art", "Visual", "Creative"].map(tag => (
                <span key={tag} className="px-2 sm:px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-white/80" />
                <span className="text-white/80 text-xs sm:text-sm">10 members</span>
              </div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
              Join Lobby
            </motion.button>
          </div>
        </Card>
      </CardSwap>
    </div>
  );
};

export default function Home() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    
    <div className="relative min-h-screen overflow-hidden transition-colors duration-300 ">
      {/* Silk Background */}
      <div className="fixed inset-0 -z-10">
        <Silk
          speed={5}
          scale={2}
          color="#7B7481"
          noiseIntensity={2}
          rotation={0}
        />
        <div className="absolute inset-0 bg-white/20 dark:bg-gray-900/30" />
      </div>
      
<SimpleTopNav />
      
      
      <div className="pt-0 pb-8 md:pt-0 md:pb-0 lg:pt-0 lg:pb-0">
        <main className="relative">
          {/* Hero Section */}
          <section className="min-h-screen flex items-center justify-center px-4 md:px-8 bg-amber-400">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center pt-16 md:pt-8 lg:pt-0">
              <div className="text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full px-6 py-2 mb-8">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-bold">NEW WAY TO CONNECT</span>
                  </div>
                  
                  <h1 className="text-5xl md:text-7xl font-black mb-6 text-gray-900 dark:text-gray-100">
                    Find Love
                    <span className="block text-red-600 dark:text-red-400">Beyond Looks</span>
                  </h1>
                  
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                    Join our innovative lobby system where personalities match first. Experience dating that starts with genuine connections.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      <Heart className="w-5 h-5" />
                      Join the Lobby
                    </Link>
                    <Link
                      href="/how-it-works"
                      className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-full font-semibold text-lg border border-gray-300 dark:border-gray-600 hover:shadow-lg transition-all duration-300"
                    >
                      How it Works
                    </Link>
                  </div>
                </motion.div>
              </div>
              
              <div className="relative flex justify-center lg:justify-end sm:mt-8 lg:mt-0">
                <LobbyCardSwap />
              </div>
            </div>
          </section>

          {/* Why Choose BlindCharm Section */}
          <section className="py-20 px-4 md:px-8 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Left Content */}
                <div className="w-full lg:pr-8">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                  >
                    <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full px-6 py-2 mb-6">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm font-bold">WHY BLINDCHARM?</span>
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-bold text-black dark:text-gray-100 mb-6">
                      Love Beyond
                      <span className="block text-red-600 dark:text-red-400">First Impressions</span>
                    </h2>
                    
                    <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
                      Experience dating that prioritizes personality over photos. Connect with people who share your values, interests, and dreams.
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-8 w-full">
                      <div className="bg-white dark:bg-gray-700 rounded-2xl p-4 sm:p-6 text-center shadow-lg border border-red-200 dark:border-red-800">
                        <div className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400 mb-1">Anonymous</div>
                        <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-semibold">Whispers</div>
                      </div>
                      <div className="bg-white dark:bg-gray-700 rounded-2xl p-4 sm:p-6 text-center shadow-lg border border-red-200 dark:border-red-800">
                        <div className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400 mb-1">Verified</div>
                        <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-semibold">Users</div>
                      </div>
                    </div>

                    <Link
                      href="/register"
                      className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      <Heart className="w-5 h-5" />
                      Start Your Journey
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </motion.div>
                </div>

                {/* Right Content - Infinite Scroll */}
                <div className="relative w-full mt-8 lg:mt-0 flex items-center justify-center">
                  <div className="rounded-2xl border-2 border-red-200 dark:border-red-800 dark:bg-gray-900 overflow-hidden shadow-lg w-full max-w-md">
                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      viewport={{ once: true }}
                      className="flex justify-center w-full"
                    >
                      <div style={{ height: '500px', position: 'relative', width: '100%' }}>
                      <InfiniteScroll
                        items={[
                          {
                            content: (
                              <div className="bg-blue-400 dark:bg-gray-700 rounded-2xl p-4 sm:p-6 shadow-lg border border-red-200 dark:border-red-800 mx-4">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-600 rounded-full flex items-center justify-center">
                                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-black dark:text-gray-100 text-sm sm:text-base">Deep Conversations</h3>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Meaningful connections</p>
                                  </div>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                                  Skip the small talk. Our platform encourages conversations that reveal your true personality.
                                </p>
                              </div>
                            )
                          },
                          {
                            content: (
                              <div className="bg-purple-400 dark:bg-gray-700 rounded-2xl p-4 sm:p-6 shadow-lg border border-red-200 dark:border-red-800 mx-4">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-600 rounded-full flex items-center justify-center">
                                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-black dark:text-gray-100 text-sm sm:text-base">Smart Matching</h3>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">AI-powered compatibility</p>
                                  </div>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                                  Our algorithm matches you based on personality compatibility, not just photos.
                                </p>
                              </div>
                            )
                          },
                          {
                            content: (
                              <div className="bg-yellow-400 dark:bg-gray-700 rounded-2xl p-4 sm:p-6 shadow-lg border border-red-200 dark:border-red-800 mx-4">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-600 rounded-full flex items-center justify-center">
                                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-black dark:text-gray-100 text-sm sm:text-base">Safe Community</h3>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Verified & moderated</p>
                                  </div>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                                  Join a verified community of genuine people looking for real connections.
                                </p>
                              </div>
                            )
                          },
                          {
                            content: (
                              <div className="bg-green-400 dark:bg-gray-700 rounded-2xl p-4 sm:p-6 shadow-lg border border-red-200 dark:border-red-800 mx-4">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-600 rounded-full flex items-center justify-center">
                                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-black dark:text-gray-100 text-sm sm:text-base">Authentic Love</h3>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Real relationships</p>
                                  </div>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                                  Find love that goes beyond physical attraction and builds lasting connections.
                                </p>
                              </div>
                            )
                          },
                          {
                            content: (
                              <div className="bg-fuchsia-400 dark:bg-gray-700 rounded-2xl p-4 sm:p-6 shadow-lg border border-red-200 dark:border-red-800 mx-4">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-600 rounded-full flex items-center justify-center">
                                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-black dark:text-gray-100 text-sm sm:text-base">Success Stories</h3>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Proven results</p>
                                  </div>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                                  Join thousands of couples who found their perfect match through BlindCharm.
                                </p>
                              </div>
                            )
                          },
                          {
                            content: (
                              <div className="bg-white dark:bg-gray-700 rounded-2xl p-4 sm:p-6 shadow-lg border border-red-200 dark:border-red-800 mx-4">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-600 rounded-full flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-black dark:text-gray-100 text-sm sm:text-base">Unique Experience</h3>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Revolutionary approach</p>
                                  </div>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                                  Experience dating reimagined with our innovative lobby-based matching system.
                                </p>
                              </div>
                            )
                          }
                        ]}
                        width="100%"
                        maxHeight="500px"
                        itemMinHeight={100}
                        isTilted={true}
                        tiltDirection="left"
                        autoplay={true}
                        autoplaySpeed={0.8}
                        autoplayDirection="down"
                        pauseOnHover={true}
                      />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section - Ready to Find Your Perfect Match */}
          <section className="relative py-32 px-4 md:px-8 bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
            {/* Animated Background Grid */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
                backgroundSize: '50px 50px'
              }}></div>
            </div>

            {/* Floating Orbs */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="relative max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                {/* Left Content */}
                <div className="text-center lg:text-left">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                  >
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm border border-pink-500/30 text-pink-300 rounded-full px-6 py-3 mb-8">
                      <Sparkles className="w-5 h-5" />
                      <span className="text-sm font-bold tracking-wide">DISCOVER YOUR SOULMATE</span>
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 text-white leading-tight">
                      Ready to Find Your
                      <br />
                      <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                        Perfect Match?
                      </span>
                    </h2>
                    
                    <p className="text-lg md:text-xl text-gray-300 mb-12 leading-relaxed">
                      Experience the future of dating where authentic connections bloom through 
                      <span className="text-pink-400 font-semibold"> genuine conversations</span> and 
                      <span className="text-purple-400 font-semibold"> shared interests</span>.
                    </p>

                    {/* Call to Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                      <Link
                        href="/register"
                        className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 hover:from-pink-700 hover:via-purple-700 hover:to-blue-700 text-white px-10 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-pink-500/25 transform hover:scale-105 transition-all duration-300 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <Heart className="w-5 h-5 relative z-10" />
                        <span className="relative z-10">Join BlindCharm</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                      </Link>
                      
                      <Link
                        href="/about"
                        className="group inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/30 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300"
                      >
                        <Sparkles className="w-5 h-5" />
                        Learn More
                      </Link>
                    </div>
                    
                    {/* Status Indicators */}
                    <div className="flex flex-wrap justify-center lg:justify-start items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-400 font-semibold">Free to Join</span>
                      </div>
                      <div className="w-1 h-1 bg-gray-500 rounded-full hidden sm:block"></div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        <span className="text-yellow-400 font-semibold">Easy to Use</span>
                      </div>
                      <div className="w-1 h-1 bg-gray-500 rounded-full hidden sm:block"></div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        <span className="text-purple-400 font-semibold">Genuine</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Right Content - PixelCard Showcase */}
                <div className="flex justify-center lg:justify-end">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
                    whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="relative"
                  >
                    {/* Glow effect behind card */}
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-[30px] blur-2xl scale-110 animate-pulse"></div>
                    
                    <PixelCard 
                      variant="pink" 
                      className="relative z-10 h-[500px] w-[350px] bg-black/40 backdrop-blur-xl border-pink-500/30 shadow-2xl"
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                        {/* Profile Card Content */}
                        <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-pink-500/30 shadow-xl">
                          <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <Heart className="w-10 h-10 text-white" />
                          </div>
                          
                          <h3 className="text-2xl font-bold text-white mb-2">
                            Your Perfect Match
                          </h3>
                          
                          <p className="text-pink-300 text-sm mb-4">
                            Awaits in our lobby system
                          </p>
                          
                          <div className="flex flex-wrap gap-2 justify-center mb-4">
                            {["Genuine", "Authentic", "Real"].map((tag, index) => (
                              <span 
                                key={tag} 
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  index === 0 ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' :
                                  index === 1 ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                                  'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                }`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                            <Users className="w-4 h-4" />
                            <span>Join 1000+ members</span>
                          </div>
                        </div>
                        
                        {/* Interactive hint */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm text-pink-300 px-4 py-2 rounded-full border border-pink-500/30 text-xs">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></span>
                            Hover to see the magic
                          </span>
                        </div>
                      </div>
                    </PixelCard>
                  </motion.div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
      
      <SimpleBottomNav />
    </div>
  )
}