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
      
      {/* Main Content with proper spacing - no gap between navbar and content */}
      <main className="flex-1 pt-16 pb-16 md:pt-0 md:pb-0">
        {children}
      </main>
      
      {/* Mobile Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}