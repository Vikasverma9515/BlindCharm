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
    // Email/Password Authentication
    CredentialsProvider({
      id: 'credentials',
      name: 'Email & Password',
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
              email: data.user.email || '',
              name: data.user.user_metadata?.full_name,
            }
          }
          return null
        } catch (error) {
          console.error('Email auth error:', error)
          return null
        }
      }
    }),
    
    // Phone Authentication
    CredentialsProvider({
      id: 'phone',
      name: 'Phone Number',
      credentials: {
        phone: { label: "Phone", type: "text" },
        firebaseUid: { label: "Firebase UID", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.firebaseUid) return null
        
        try {
          // Find user by phone number in Supabase
          const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('phone_number', credentials.phone)
            .eq('firebase_uid', credentials.firebaseUid)
            .single()

          if (error) {
            console.error('Phone auth error:', error)
            return null
          }

          if (user) {
            return {
              id: user.id,
              email: user.email || `${user.firebase_uid}@phone.blindcharm.com`,
              name: user.full_name || user.username,
              phone: user.phone_number,
              isPhoneVerified: user.is_phone_verified
            }
          }
          return null
        } catch (error) {
          console.error('Phone auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.phone = user.phone
        token.isPhoneVerified = user.isPhoneVerified
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id
        session.user.phone = token.phone
        session.user.isPhoneVerified = token.isPhoneVerified
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