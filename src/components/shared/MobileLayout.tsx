// src/components/shared/MobileLayout.tsx
'use client'

import { ReactNode } from 'react'
import TopHeader from './TopHeader'
import BottomNavigation from './BottomNavigation'
import DesktopNavbar from './DesktopNavbar'

interface MobileLayoutProps {
  children: ReactNode
  pageName?: string
  actionButton?: ReactNode
}

export default function MobileLayout({ children, pageName, actionButton }: MobileLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Desktop Navigation */}
      <DesktopNavbar />
      
      {/* Mobile Top Header */}
      <TopHeader pageName={pageName} actionButton={actionButton} />
      
      {/* Main Content with proper spacing - account for safe area + header height */}
      <main className="flex-1 pt-[calc(4rem+env(safe-area-inset-top))] pb-[calc(4rem+env(safe-area-inset-bottom))] md:pt-0 md:pb-0">
        {children}
      </main>
      
      {/* Mobile Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}