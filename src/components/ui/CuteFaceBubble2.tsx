'use client'

import { useState, useEffect } from 'react'

export default function CuteFaceBubble({ 
  size = 'md', 
  style = 'default',
  animated = true 
}: { 
  size?: 'sm' | 'md' | 'lg'
  style?: 'default' | 'love' | 'shy' | 'excited'
  animated?: boolean 
}) {
  const [faceIndex, setFaceIndex] = useState(0)

  // More varied cute faces for different emotions
  const faces = {
    default: {
      boy: ['( ˶°ㅁ°) !!', '( ˶–ㅁ–) zZ', '( ˶⚆_⚆) !!', '(｡◕‿◕｡)', '(◕‿◕✿)'],
      girl: ['(*ᴗ‿ᴗ)ꕤ*', '(*-ᴗ-*) zZ', '(*≣ω≣)♡', '(◡‿◡✿)', '(✿◠‿◠)']
    },
    love: {
      boy: ['(♥️ω♥️)', '(｡♥‿♥｡)', '(◍•ᴗ•◍)❤', '(◕‿◕)♡', '(づ｡◕‿‿◕｡)づ'],
      girl: ['(｡♥‿♥｡)', '(◕‿◕)♡', '(♡˙︶˙♡)', '(◍•ᴗ•◍)♡', '(≧◡≦) ♡']
    },
    shy: {
      boy: ['(｡ﾉω＼｡)', '(///∇///)', '(〃∀〃)', '(｡･ω･｡)', '(´･ω･`)'],
      girl: ['(∩︎//▽//∩︎)', '(///◕‿◕///)', '(♡´▽`♡)', '(〃▽〃)', '(＊ᵒ̶̶̷̀ω˂̶́)']
    },
    excited: {
      boy: ['\\(★ω★)/', '(⌒▽⌒)☆', '(ᗒᗨᗕ)', '(｢`･ω･)｢', '\\(^o^)/'],
      girl: ['｡ﾟ(ﾟ^∀^ﾟ)ﾟ｡', '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', '(★^O^★)', '(๑>◡<๑)', '٩(◕‿◕｡)۶']
    }
  }

  useEffect(() => {
    if (!animated) return
    
    const interval = setInterval(() => {
      setFaceIndex((prev) => (prev + 1) % faces[style].boy.length)
    }, 1200)
    return () => clearInterval(interval)
  }, [animated, style])

  const sizeClasses = {
    sm: 'w-20 h-16 text-lg',
    md: 'w-28 h-20 text-xl',
    lg: 'w-36 h-28 text-2xl',
  }

  const backgroundColors = {
    default: 'bg-amber-300',
    love: 'bg-pink-200',
    shy: 'bg-purple-200',
    excited: 'bg-yellow-200'
  }

  const HeartDecoration = () => (
    <div className="absolute -top-2 -right-2 text-red-500 animate-bounce">❤️</div>
  )

  const SparkleDecoration = () => (
    <div className="absolute -top-2 -left-2 animate-spin-slow">✨</div>
  )

  return (
    <div className="inline-flex items-center justify-center gap-4 scale-90 md:scale-100 animate-fade-in">
      <div className="relative">
        <div
          className={`${backgroundColors[style]} shadow-2xl rounded-2xl flex items-center justify-center animate-floaty transition-all duration-300 ${sizeClasses[size]}`}
        >
          <span className="text-red-500 font-semibold">{faces[style].boy[faceIndex]}</span>
        </div>
        {style === 'love' && <HeartDecoration />}
        {style === 'excited' && <SparkleDecoration />}
      </div>

      <div className="relative">
        <div
          className={`${backgroundColors[style]} shadow-2xl rounded-2xl flex items-center justify-center animate-floaty transition-all duration-300 ${sizeClasses[size]}`}
        >
          <span className="text-red-500 font-semibold">{faces[style].girl[faceIndex]}</span>
        </div>
        {style === 'love' && <HeartDecoration />}
        {style === 'excited' && <SparkleDecoration />}
      </div>
    </div>
  )
}