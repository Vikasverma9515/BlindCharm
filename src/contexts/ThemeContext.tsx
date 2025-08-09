'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('blindcharm-theme') as Theme
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const initialTheme = savedTheme || systemTheme
    
    setThemeState(initialTheme)
    setMounted(true)
  }, [])

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    localStorage.setItem('blindcharm-theme', theme)
  }, [theme, mounted])

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light')
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}


// 'use client'

// import React, { createContext, useContext, useEffect, useState } from 'react'

// type Theme = 'light' | 'dark'

// interface ThemeContextType {
//   theme: Theme
//   toggleTheme: () => void
//   setTheme: (theme: Theme) => void
// }

// const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// export function ThemeProvider({ children }: { children: React.ReactNode }) {
//   // Initialize with light theme
//   const [theme, setThemeState] = useState<Theme>('light')
//   const [mounted, setMounted] = useState(false)

//   // Initialize theme only from localStorage, ignore system preference
//   useEffect(() => {
//     const savedTheme = localStorage.getItem('blindcharm-theme') as Theme
//     // Always default to light if no saved theme
//     const initialTheme = savedTheme || 'light'
    
//     setThemeState(initialTheme)
//     setMounted(true)

//     // Force light theme in localStorage if none exists
//     if (!savedTheme) {
//       localStorage.setItem('blindcharm-theme', 'light')
//     }
//   }, [])

//   // Apply theme to document
//   useEffect(() => {
//     if (!mounted) return

//     const root = document.documentElement
    
//     // Remove dark class by default
//     root.classList.remove('dark')
    
//     // Only add dark class if explicitly set to dark
//     if (theme === 'dark') {
//       root.classList.add('dark')
//     }
    
//     localStorage.setItem('blindcharm-theme', theme)

//     // Optional: Force light color scheme
//     document.documentElement.style.colorScheme = 'light'
//   }, [theme, mounted])

//   // Override system dark mode preference
//   useEffect(() => {
//     // Create style element to force light theme
//     const style = document.createElement('style')
//     style.textContent = `
//       @media (prefers-color-scheme: dark) {
//         html {
//           color-scheme: light !important;
//         }
//       }
//     `
//     document.head.appendChild(style)

//     return () => {
//       document.head.removeChild(style)
//     }
//   }, [])

//   const toggleTheme = () => {
//     setThemeState(prev => prev === 'light' ? 'dark' : 'light')
//   }

//   const setTheme = (newTheme: Theme) => {
//     setThemeState(newTheme)
//   }

//   // Force light theme on initial render
//   useEffect(() => {
//     setThemeState('light')
//   }, [])

//   // Prevent hydration mismatch
//   if (!mounted) {
//     return (
//       <div className="light">
//         {children}
//       </div>
//     )
//   }

//   return (
//     <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
//       <div className={theme}>
//         {children}
//       </div>
//     </ThemeContext.Provider>
//   )
// }

// export function useTheme() {
//   const context = useContext(ThemeContext)
//   if (context === undefined) {
//     throw new Error('useTheme must be used within a ThemeProvider')
//   }
//   return context
// }