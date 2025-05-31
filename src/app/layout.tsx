// src/app/layout.tsx
import { Inter } from 'next/font/google'
import AuthProvider from '@/providers/SessionProvider'
import './globals.css'
import FloatingShapes from '@/components/shared/FloatingShapes'
import BackgroundPattern from '@/components/shared/BackgroundPattern'
import Navbar from '@/components/shared/Navbar'
import ErrorBoundary from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        
        <AuthProvider>
        
        <Navbar />
        <ErrorBoundary>
      <FloatingShapes />
      <BackgroundPattern />
      
          {children}
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  )
}
// // src/app/layout.tsx
// import { Inter } from 'next/font/google'
// import { AuthProvider } from '@/providers/AuthProvider'
// import FloatingShapes from '@/components/shared/FloatingShapes'
// import BackgroundPattern from '@/components/shared/BackgroundPattern'
// import './globals.css'

// const inter = Inter({ subsets: ['latin'] })

// // Make it a client component if needed
// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="en">
//       <body className={`${inter.className} relative`}>
//         <AuthProvider>
//           <FloatingShapes />
//           <BackgroundPattern />
//           {children}
//         </AuthProvider>
//       </body>
//     </html>
//   )
// }