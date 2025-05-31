// // src/app/api/profile/route.ts
// import { getServerSession } from 'next-auth/next'
// import { authOptions } from '../auth/[...nextauth]/route'
// import { NextResponse } from 'next/server'
// import { getUserProfile } from '@/lib/user' // Adjust the path based on your project structure

// export async function GET() {
//   const session = await getServerSession(authOptions)

//   if (!session) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//   }

//   // Get user profile from database
//   const profile = await getUserProfile(session.user.id)
//   return NextResponse.json(profile)
// }