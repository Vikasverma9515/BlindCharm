'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface LogoProps {
  id: number
  size: number
  x: number
  y: number
  duration: number
  delay: number
  direction: number // 1 or -1 for left/right float
}

const FloatingLogo: React.FC<LogoProps> = ({ size, x, y, duration, delay, direction }) => {
  return (
    <div
      className="floating-logo"
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: size,
        height: size,
        opacity: 0.60,
        pointerEvents: 'none',
        animation: `floatY ${duration}s ease-in-out infinite, floatX ${duration * 1.5}s ease-in-out infinite`,
        animationDelay: `${delay}s, ${delay / 2}s`,
        transform: `scale(${direction})`,
        willChange: 'transform, opacity, left, top',
      }}
    >
      <Image
        src="/logo2.png"
        alt="Floating Logo"
        width={size}
        height={size}
        style={{ width: '100%', height: '100%', userSelect: 'none', pointerEvents: 'none' }}
        draggable={false}
        priority={false}
      />
    </div>
  )
}

const FloatingShapes: React.FC = () => {
  const [logos, setLogos] = useState<LogoProps[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sizes = [40, 60, 80, 100, 120]
      const newLogos = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        size: sizes[Math.floor(Math.random() * sizes.length)],
        x: Math.random() * (window.innerWidth - 120),
        y: Math.random() * (window.innerHeight - 120),
        duration: 6 + Math.random() * 6, // 6-12s
        delay: Math.random() * 4,
        direction: Math.random() > 0.5 ? 1 : -1,
      }))
      setLogos(newLogos)
    }
  }, [])

  return (
    <div
      className="shapes-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: -1,
        overflow: 'hidden',
      }}
    >
      {logos.map((logo) => (
        <FloatingLogo key={logo.id} {...logo} />
      ))}
      <style jsx global>{`
        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-40px); }
        }
        @keyframes floatX {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(30px); }
        }
      `}</style>
    </div>
  )
}

export default FloatingShapes