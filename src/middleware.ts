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
    console.log('Middleware - Path:', req.nextUrl.pathname)
    console.log('Middleware - Token:', req.nextauth.token)

    const isAuthenticated = !!req.nextauth.token
    const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                      req.nextUrl.pathname.startsWith('/register')
    const isProtectedPage = req.nextUrl.pathname.startsWith('/lobby') || 
                          req.nextUrl.pathname.startsWith('/profile')

    // If user is authenticated and tries to access auth pages (login/register)
    if (isAuthenticated && isAuthPage) {
      return NextResponse.redirect(new URL('/lobby', req.url))
    }

    // If user is not authenticated and tries to access protected pages
    if (!isAuthenticated && isProtectedPage) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Allow public access to auth pages
        if (req.nextUrl.pathname.startsWith('/login') || 
            req.nextUrl.pathname.startsWith('/register')) {
          return true
        }
        // Require authentication for protected pages
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/login',
    '/register',
    '/lobby/:path*',
    '/profile/:path*',
  ]
}
