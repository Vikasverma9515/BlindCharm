// components/ui/CuteFaceBubble.tsx
'use client'

import { useState, useEffect } from 'react'

export default function CuteFaceBubble({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const [faceIndex, setFaceIndex] = useState(0)

  const boyFaces = ['( ˶°ㅁ°) !!', '( ˶–ㅁ–) zZ', '( ˶⚆_⚆) !!']
  const girlFaces = ['(*ᴗ‿ᴗ)ꕤ*', '(*-ᴗ-*) zZ', '(*≣ω≣)♡']

  useEffect(() => {
    const interval = setInterval(() => {
      setFaceIndex((prev) => (prev + 1) % boyFaces.length)
    }, 1200)
    return () => clearInterval(interval)
  }, [])

  const sizeClasses = {
    sm: 'w-20 h-16 text-lg',
    md: 'w-28 h-20 text-xl',
    lg: 'w-36 h-28 text-2xl',
  }

  return (
    <div className="inline-flex items-center justify-center gap-4 scale-90 md:scale-100 animate-fade-in">
      <div
        className={`bg-amber-300 shadow-2xl rounded-2xl flex items-center justify-center animate-floaty transition-all duration-300 ${sizeClasses[size]}`}
      >
        <span className="text-red-500 font-semibold">{boyFaces[faceIndex]}</span>
      </div>
      <div
        className={`bg-amber-300 shadow-2xl rounded-2xl flex items-center justify-center animate-floaty transition-all duration-300 ${sizeClasses[size]}`}
      >
        <span className="text-red-500 font-semibold">{girlFaces[faceIndex]}</span>
      </div>
    </div>
  )
}  
