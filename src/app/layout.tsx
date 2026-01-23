// // src/app/layout.tsx
// import { Inter, Poppins, Montserrat } from 'next/font/google'
// import AuthProvider from '@/providers/SessionProvider'
// import './globals.css'
// import FloatingShapes from '@/components/shared/FloatingShapes'
// import BackgroundPattern from '@/components/shared/BackgroundPattern'
// import ModernNavbar from '@/components/shared/ModernNavbar'
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


import { Viewport } from 'next';
import AuthProvider from '@/providers/SessionProvider'
import { ThemeProvider } from '@/contexts/ThemeContext'
import './globals.css'
import BackgroundPattern from '@/components/shared/BackgroundPattern'
import ErrorBoundary from '@/components/ErrorBoundary'
import {
  boldonse, bitcountGrid, specialGothic,
  inter, poppins, montserrat, playfair, dancing, quicksand, nunito, comfortaa, raleway,
  caveat, righteous, fredoka, outfit, spaceGrotesk, orbitron, kalam, pacifico
} from './fonts'
import { Toaster } from 'sonner';
import { NotificationProvider } from '@/components/notifications/NotificationProvider';
import { FirebaseAuthProvider } from '@/providers/FirebaseAuthProvider'
import QueryProvider from '@/providers/QueryProvider'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#000000',
};

export const metadata = {
  metadataBase: new URL("https://blindcharm.com"),
  title: "BlindCharm - AI-First Social Discovery",
  description: "Experience authentic connections with Hero Avatars and Galaxy View. The AI-first dating app where charm comes first.",
  applicationName: "BlindCharm",
  appleWebApp: {
    capable: true,
    title: "BlindCharm",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "BlindCharm - AI-First Social Discovery",
    description: "Connect authentically with Hero Avatars and verified vibes. The next generation of social discovery, powered by AI.",
    url: "https://blindcharm.com",
    siteName: "BlindCharm",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BlindCharm - AI-First Dating",
      },
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "BlindCharm Icon",
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BlindCharm - AI-First Social Discovery",
    description: "Experience authentic connections with Hero Avatars and Galaxy View.",
    images: ["/android-chrome-512x512.png"],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-config": "/browserconfig.xml",
    "msapplication-TileColor": "#000000",
    "msapplication-tap-highlight": "no",
  },
};

import AppContainer from '@/components/layout/AppContainer'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const fontClasses = [
    inter.className,
    boldonse.variable,
    bitcountGrid.variable,
    specialGothic.variable,
    poppins.variable,
    montserrat.variable,
    playfair.variable,
    dancing.variable,
    quicksand.variable,
    nunito.variable,
    comfortaa.variable,
    raleway.variable,
    caveat.variable,
    righteous.variable,
    fredoka.variable,
    outfit.variable,
    spaceGrotesk.variable,
    orbitron.variable,
    kalam.variable,
    pacifico.variable
  ].join(' ');

  return (
    <html lang="en" className="dark">
      <body className={`${fontClasses} bg-black min-h-screen text-white antialiased selection:bg-purple-500/30`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "url": "https://blindcharm.com",
              "logo": "https://blindcharm.com/android-chrome-512x512.png"
            }),
          }}
        />
        <ThemeProvider>
          <AuthProvider>
            <FirebaseAuthProvider>
              <NotificationProvider>
                <QueryProvider>
                  <ErrorBoundary>
                    <AppContainer>
                      {children}
                    </AppContainer>
                    <Toaster />
                  </ErrorBoundary>
                </QueryProvider>
              </NotificationProvider>
            </FirebaseAuthProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}