// src/components/shared/FloatingShapes.tsx
'use client'

import { useEffect, useState } from 'react'

interface ShapeProps {
  id: number
  color: string
  size: number
  x: number
  y: number
  duration: number
  delay: number
}

const Shape: React.FC<ShapeProps> = ({ color, size, x, y, duration, delay }) => {
  return (
    <div
      className="floating-shape"
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: size,
        height: size,
        animation: `float ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 50 50"
        style={{ display: 'block' }}
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill={color}
          opacity="0.6"
        />
      </svg>
    </div>
  )
}

const FloatingShapes: React.FC = () => {
  const [shapes, setShapes] = useState<ShapeProps[]>([])

  useEffect(() => {
    // Soft, romantic colors suitable for dating apps
    const colors = [
      'rgba(236, 72, 153, 0.1)', // Soft pink
      'rgba(219, 39, 119, 0.08)', // Rose
      'rgba(168, 85, 247, 0.06)', // Soft purple  
      'rgba(244, 114, 182, 0.09)', // Light pink
      'rgba(196, 181, 253, 0.07)', // Lavender
      'rgba(251, 207, 232, 0.12)', // Very light pink
    ]
    const sizes = [15, 25, 35] // Slightly smaller for subtlety

    if (typeof window !== 'undefined') {
      const newShapes = Array.from({ length: 8 }, (_, i) => ({ // Fewer shapes for cleaner look
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: sizes[Math.floor(Math.random() * sizes.length)],
        x: Math.random() * (window.innerWidth * 0.9),
        y: Math.random() * (window.innerHeight * 0.9),
        duration: 4 + Math.random() * 3, // Slower, more relaxed movement (4-7s)
        delay: Math.random() * 3, // Random delay between 0-3s
      }))

      setShapes(newShapes)
    }
  }, [])

  return (
    <div
      className="shapes-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -1,
        overflow: 'hidden',
      }}
    >
      {shapes.map((shape) => (
        <Shape key={shape.id} {...shape} />
      ))}
    </div>
  )
}

export default FloatingShapes