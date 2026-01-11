// // src/middleware.ts
// export { default } from 'next-auth/middleware'

// export const config = {
//   matcher: ['/lobby/:path*', '/profile/:path*', '/chat/:path*']
// }


// src/middleware.ts
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // console.log('Middleware - Path:', req.nextUrl.pathname)
    // console.log('Middleware - Token:', req.nextauth.token)

    const isAuthenticated = !!req.nextauth.token
    const isAuthPage = req.nextUrl.pathname.startsWith('/login') ||
      req.nextUrl.pathname.startsWith('/register')

    // Explicit list of protected paths
    const isProtectedPage =
      req.nextUrl.pathname.startsWith('/lobby') ||
      req.nextUrl.pathname.startsWith('/profile') ||
      req.nextUrl.pathname.startsWith('/matches') ||
      req.nextUrl.pathname.startsWith('/whispers') ||
      req.nextUrl.pathname.startsWith('/chat') ||
      req.nextUrl.pathname.startsWith('/galaxy') ||
      req.nextUrl.pathname.startsWith('/discovery') ||
      req.nextUrl.pathname.startsWith('/companion') ||
      req.nextUrl.pathname.startsWith('/join-lobby')

    // 1. Authenticated User trying to access Auth Pages (Login/Register) -> Redirect to Galaxy
    if (isAuthenticated && isAuthPage) {
      const url = new URL('/galaxy', req.url)
      if (process.env.NODE_ENV === 'production') {
        url.protocol = 'https:'
      }
      return NextResponse.redirect(url)
    }

    // 2. Unauthenticated User trying to access Protected Pages -> Redirect to Login with HTTPS Callback
    if (!isAuthenticated && isProtectedPage) {
      const loginUrl = new URL('/login', req.url)

      // Force HTTPS for the login URL itself
      if (process.env.NODE_ENV === 'production') {
        loginUrl.protocol = 'https:'
      }

      // Construct the Callback URL (where they wanted to go)
      const callbackUrl = new URL(req.nextUrl.pathname, req.url)
      if (process.env.NODE_ENV === 'production') {
        callbackUrl.protocol = 'https:'
      }

      loginUrl.searchParams.set('callbackUrl', callbackUrl.toString())
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // Return true to let the middleware function handle the logic
      // This prevents the default NextAuth unauth redirect which might be insecure (HTTP)
      authorized: () => true,
    },
  }
)

export const config = {
  matcher: [
    '/login',
    '/register',
    '/lobby/:path*',
    '/profile/:path*',
    '/matches/:path*',
    '/whispers/:path*',
    '/chat/:path*',
    '/galaxy/:path*',
    '/discovery/:path*',
    '/companion/:path*',
    '/join-lobby/:path*'
  ]
}
