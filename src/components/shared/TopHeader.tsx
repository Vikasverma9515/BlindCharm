// src/components/shared/TopHeader.tsx
'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

interface TopHeaderProps {
  pageName?: string
  actionButton?: ReactNode
}

export default function TopHeader({ pageName, actionButton }: TopHeaderProps) {
  return (
    <header className=" top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm md:hidden">
      <div className="flex justify-between items-center h-16 px-4">
        {/* Left side - Logo and Page Name */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <img className="h-8 w-auto" src="/logo2.png" alt="Logo" />
            <span className="ml-2 text-lg brand-font-bold text-gray-900">
              BlindCharm
            </span>
          </Link>
          {pageName && (
            <>
              <span className="mx-2 text-gray-400">•</span>
              <span className="text-lg font-semibold text-gray-900">{pageName}</span>
            </>
          )}
        </div>
        
        {/* Right side - Action Button */}
        {actionButton && (
          <div className="flex items-center">
            {actionButton}
          </div>
        )}
      </div>
    </header>
  )
}