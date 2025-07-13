// src/app/fonts.ts
import { 
  Inter, 
  Poppins, 
  Montserrat, 
  Playfair_Display,
  Dancing_Script,
  Quicksand,
  Nunito,
  Comfortaa,
  Raleway,
   Caveat,
  Righteous,
  Fredoka,
  Outfit,
  Space_Grotesk,
  Orbitron,
  Kalam,
  Pacifico
  
} from 'next/font/google'

import localFont from 'next/font/local'

// ===== LOCAL FONTS =====
// Boldonse - Perfect for BlindCharm branding
export const boldonse = localFont({
  src: [
    {
      path: './fonts/Bitcount_Grid_Double,Boldonse,Special_Gothic_Condensed_One/Boldonse/Boldonse-Regular.ttf',
      weight: '400',
      style: 'normal',
    }
  ],
  variable: '--font-boldonse',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif']
})

// Bitcount Grid Double - Modern tech/digital aesthetic
export const bitcountGrid = localFont({
  src: [
    {
      path: './fonts/Bitcount_Grid_Double,Boldonse,Special_Gothic_Condensed_One/Bitcount_Grid_Double/static/BitcountGridDouble_Roman-Thin.ttf',
      weight: '100',
      style: 'normal',
    },
    {
      path: './fonts/Bitcount_Grid_Double,Boldonse,Special_Gothic_Condensed_One/Bitcount_Grid_Double/static/BitcountGridDouble-ExtraLight.ttf',
      weight: '200',
      style: 'normal',
    },
    {
      path: './fonts/Bitcount_Grid_Double,Boldonse,Special_Gothic_Condensed_One/Bitcount_Grid_Double/static/BitcountGridDouble-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/Bitcount_Grid_Double,Boldonse,Special_Gothic_Condensed_One/Bitcount_Grid_Double/static/BitcountGridDouble_Roman-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Bitcount_Grid_Double,Boldonse,Special_Gothic_Condensed_One/Bitcount_Grid_Double/static/BitcountGridDouble_Roman-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/Bitcount_Grid_Double,Boldonse,Special_Gothic_Condensed_One/Bitcount_Grid_Double/static/BitcountGridDouble-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/Bitcount_Grid_Double,Boldonse,Special_Gothic_Condensed_One/Bitcount_Grid_Double/static/BitcountGridDouble_Roman-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/Bitcount_Grid_Double,Boldonse,Special_Gothic_Condensed_One/Bitcount_Grid_Double/static/BitcountGridDouble-ExtraBold.ttf',
      weight: '800',
      style: 'normal',
    },
    {
      path: './fonts/Bitcount_Grid_Double,Boldonse,Special_Gothic_Condensed_One/Bitcount_Grid_Double/static/BitcountGridDouble_Roman-Black.ttf',
      weight: '900',
      style: 'normal',
    },
    // Cursive variants
    {
      path: './fonts/Bitcount_Grid_Double,Boldonse,Special_Gothic_Condensed_One/Bitcount_Grid_Double/static/BitcountGridDouble_Cursive-Regular.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: './fonts/Bitcount_Grid_Double,Boldonse,Special_Gothic_Condensed_One/Bitcount_Grid_Double/static/BitcountGridDouble_Cursive-Bold.ttf',
      weight: '700',
      style: 'italic',
    }
  ],
  variable: '--font-bitcount',
  display: 'swap',
  fallback: ['monospace', 'system-ui']
})

// Special Gothic Condensed - For impact and headlines
export const specialGothic = localFont({
  src: [
    {
      path: './fonts/Bitcount_Grid_Double,Boldonse,Special_Gothic_Condensed_One/Special_Gothic_Condensed_One/SpecialGothicCondensedOne-Regular.ttf',
      weight: '400',
      style: 'normal',
    }
  ],
  variable: '--font-special-gothic',
  display: 'swap',
  fallback: ['Impact', 'Arial Black', 'sans-serif']
})

// Main body font - clean and readable
export const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  preload: true,
  adjustFontFallback: true,
  variable: '--font-inter'
})

// Modern sans-serif for UI elements
export const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  preload: true,
  adjustFontFallback: true
})

// Bold headings and branding
export const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  preload: true,
  adjustFontFallback: true
})

// Elegant serif for BlindCharm logo and special headings
export const playfair = Playfair_Display({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-playfair',
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
  preload: true,
  adjustFontFallback: true
})

// Script font for romantic touches and special elements
export const dancing = Dancing_Script({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dancing',
  display: 'swap',
  fallback: ['cursive'],
  preload: true,
  adjustFontFallback: true
})

// Modern rounded font for friendly UI elements
export const quicksand = Quicksand({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-quicksand',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  preload: true,
  adjustFontFallback: true
})

// Friendly and approachable font
export const nunito = Nunito({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-nunito',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  preload: true,
  adjustFontFallback: true
})

// Comfortable reading font
export const comfortaa = Comfortaa({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-comfortaa',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  preload: true,
  adjustFontFallback: true
})

// Elegant and sophisticated
export const raleway = Raleway({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-raleway',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  preload: true,
  adjustFontFallback: true
})

// ===== UNIQUE GOOGLE FONTS FOR BLINDCHARM =====

// Handwritten casual font - perfect for personal touches
export const caveat = Caveat({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-caveat',
  display: 'swap',
  fallback: ['cursive'],
  preload: true,
  adjustFontFallback: true
})

// Bold display font - great for impact statements
export const righteous = Righteous({ 
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-righteous',
  display: 'swap',
  fallback: ['Impact', 'Arial Black', 'sans-serif'],
  preload: true,
  adjustFontFallback: true
})

// Playful rounded font - perfect for fun elements
export const fredoka = Fredoka({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-fredoka',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
  preload: true,
  adjustFontFallback: true
})

// Modern geometric font - clean and contemporary
export const outfit = Outfit({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
  preload: true,
  adjustFontFallback: true
})

// Futuristic tech font - great for modern elements
export const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
  preload: true,
  adjustFontFallback: true
})

// Sci-fi inspired font - unique and memorable
export const orbitron = Orbitron({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-orbitron',
  display: 'swap',
  fallback: ['monospace', 'system-ui'],
  preload: true,
  adjustFontFallback: true
})

// Handwritten natural font - personal and authentic
export const kalam = Kalam({ 
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-kalam',
  display: 'swap',
  fallback: ['cursive'],
  preload: true,
  adjustFontFallback: true
})

// Playful script font - fun and energetic
export const pacifico = Pacifico({ 
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-pacifico',
  display: 'swap',
  fallback: ['cursive'],
  preload: true,
  adjustFontFallback: true
})