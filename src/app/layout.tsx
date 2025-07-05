// // src/app/layout.tsx
// import { Inter, Poppins, Montserrat } from 'next/font/google'
// import AuthProvider from '@/providers/SessionProvider'
// import './globals.css'
// import FloatingShapes from '@/components/shared/FloatingShapes'
// import BackgroundPattern from '@/components/shared/BackgroundPattern'
// import Navbar from '@/components/shared/Navbar'
// import ErrorBoundary from '@/components/ErrorBoundary'
// import FloatingLogo from '@/components/FloatingLogo'


// const inter = Inter({ subsets: ['latin'] })

// // Bold Google Fonts for branding
// const poppins = Poppins({ 
//   subsets: ['latin'],
//   weight: ['400', '600', '700', '800', '900'],
//   variable: '--font-poppins'
// })

// const montserrat = Montserrat({ 
//   subsets: ['latin'],
//   weight: ['400', '600', '700', '800', '900'],
//   variable: '--font-montserrat'
// })

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="en">
//       <body className={`${inter.className} ${poppins.variable} ${montserrat.variable}`}>
        
//         <AuthProvider>
//           <div className="flex flex-col min-h-screen">
//             {/* <Navbar /> */}
//             <ErrorBoundary>
//               {/* <FloatingShapes /> */}
//               {/* <FloatingLogo /> */}
//               <BackgroundPattern />
              
//               {/* Main content area that fills space between navbar elements */}
//               <main className="flex-1 pt-4 pb-4 md:pt-6 md:pb-6">
//                 <div className="min-h-full">
//                   {children}
//                 </div>
//               </main>
//             </ErrorBoundary>
//           </div>
//         </AuthProvider>
//       </body>
//     </html>
//   )
// }
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


// src/app/layout.tsx
import AuthProvider from '@/providers/SessionProvider'
import { ThemeProvider } from '@/contexts/ThemeContext'
import './globals.css'
import FloatingShapes from '@/components/shared/FloatingShapes'
import BackgroundPattern from '@/components/shared/BackgroundPattern'
import Navbar from '@/components/shared/Navbar'
import ErrorBoundary from '@/components/ErrorBoundary'
import FloatingLogo from '@/components/FloatingLogo'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import { inter, poppins, montserrat } from './fonts'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="BlindCharm" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BlindCharm" />
        <meta name="description" content="Connect with people through personality, not just photos. Anonymous dating reimagined." />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#FF6B6B" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#FF6B6B" />

        {/* Viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />

        {/* Icons */}
        <link rel="apple-touch-icon" href="/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-152x152.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/icon.svg" color="#FF6B6B" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Splash Screens for iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Font optimization */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="BlindCharm - Anonymous Dating App" />
        <meta property="og:description" content="Connect with people through personality, not just photos. Anonymous dating reimagined." />
        <meta property="og:image" content="/icon-512x512.png" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="BlindCharm - Anonymous Dating App" />
        <meta property="twitter:description" content="Connect with people through personality, not just photos. Anonymous dating reimagined." />
        <meta property="twitter:image" content="/icon-512x512.png" />
      </head>
      <body className={`${inter.className} ${poppins.variable} ${montserrat.variable}`}>
        <ThemeProvider>
          <AuthProvider>
            <div className="flex flex-col min-h-screen relative bg-white dark:bg-gray-900 transition-colors duration-300" >
              {/* <Navbar /> */}
              <ErrorBoundary>
                {/* Main content area */}
                <div className="flex-1 relative">
                  {children}
                </div>
              </ErrorBoundary>
              <PWAInstallPrompt />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}