// src/components/shared/AnimatedWrapper.tsx
'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const AnimatedBackground = dynamic(
  () => import('@/components/shared/AnimatedBackground'),
  { ssr: false }
)

const FloatingShapes = dynamic(
  () => import('@/components/shared/FloatingShapes'),
  { ssr: false }
)

export default function AnimatedWrapper() {
  return (
    <Suspense fallback={null}>
      <AnimatedBackground />
      <FloatingShapes />
    </Suspense>
  )
}