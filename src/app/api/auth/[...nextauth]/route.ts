// // src/app/api/auth/[...nextauth]/route.ts
// import NextAuth from 'next-auth'
// import CredentialsProvider from 'next-auth/providers/credentials'
// import { createClient } from '@supabase/supabase-js'

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// )

// export const authOptions = {
//   providers: [
//     CredentialsProvider({
//       name: 'Credentials',
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" }
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) return null
        
//         // Authenticate with Supabase
//         const { data, error } = await supabase.auth.signInWithPassword({
//           email: credentials.email,
//           password: credentials.password,
//         })

//         if (error) return null

//         // Store user data in Next-Auth session
//         return {
//           id: data.user.id,
//           email: data.user.email || '', // Ensure email is always a string
//           name: data.user.user_metadata?.full_name,
//         }
//       }
//     })
//   ],
//   session: {
//     strategy: 'jwt' as const,
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },
//   callbacks: {
//     async jwt({ token, user }: { token: any; user?: { id: string; email: string } }) {
//       if (user) {
//         // Add user data to JWT token
//         token.id = user.id
//         token.email = user.email
//       }
//       return token
//     },
//     async session({ session, token }: { session: any; token: any }) {
//       if (session.user) {
//         // Add user data to session
//         session.user.id = token.id
//         session.user.email = token.email
//       }
//       return session
//     }
//   },
//   pages: {
//     signIn: '/login',
//     error: '/auth/error',
//   }
// }

// const handler = NextAuth(authOptions)
// export { handler as GET, handler as POST }



// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })

          if (error) throw error

          if (data.user) {
            return {
              id: data.user.id,
              email: data.user.email || '', // Ensure email is always a string
              name: data.user.user_metadata?.full_name,
            }
          }
          return null
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: { id: string; email: string } }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }