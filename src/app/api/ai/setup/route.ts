// app/api/ai/setup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { AIMemoryService } from '@/lib/ai/memory'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, personality, avatar } = await request.json()

    const { data, error } = await AIMemoryService.createAIFriend(
      session.user.id,
      name,
      personality,
      avatar
    )

    if (error) {
      return NextResponse.json({ error: 'Failed to create AI friend' }, { status: 500 })
    }

    return NextResponse.json({ data })

  } catch (error) {
    console.error('AI Setup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const aiFriend = await AIMemoryService.getAIFriend(session.user.id)
    return NextResponse.json({ aiFriend })

  } catch (error) {
    console.error('AI Setup fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



// import { NextRequest, NextResponse } from 'next/server'
// import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
// import { cookies } from 'next/headers'
// import { SmartMemoryService } from '@/lib/ai/smart-memory'

// export async function POST(request: NextRequest) {
//   try {
//     const supabase = createRouteHandlerClient({ cookies })
//     const { data: { session } } = await supabase.auth.getSession()

//     if (!session) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     const { name, personality, avatar } = await request.json()

//     // Validate input
//     if (!name?.trim() || !personality || !avatar) {
//       return NextResponse.json({ 
//         error: 'Name, personality, and avatar are required' 
//       }, { status: 400 })
//     }

//     if (name.trim().length > 20) {
//       return NextResponse.json({ 
//         error: 'Name must be 20 characters or less' 
//       }, { status: 400 })
//     }

//     const userId = session.user.id

//     // Check if user already has an AI friend
//     const existingFriend = await SmartMemoryService.getAIFriend(userId)
//     if (existingFriend) {
//       return NextResponse.json({ 
//         error: 'You already have an AI friend. Only one friend per user is allowed.' 
//       }, { status: 400 })
//     }

//     // Create AI friend
//     const { data, error } = await SmartMemoryService.createAIFriend(
//       userId,
//       name.trim(),
//       personality,
//       avatar
//     )

//     if (error) {
//       console.error('Database error creating AI friend:', error)
//       return NextResponse.json({ 
//         error: 'Failed to create your AI friend. Please try again.' 
//       }, { status: 500 })
//     }

//     return NextResponse.json({ 
//       data,
//       message: `${name} is ready to be your best friend! 🎉`
//     })
    
//   } catch (error) {
//     console.error('AI Setup API Error:', error)
//     return NextResponse.json({ 
//       error: 'Something went wrong. Please try again.' 
//     }, { status: 500 })
//   }
// }

// export async function GET(request: NextRequest) {
//   try {
//     const supabase = createRouteHandlerClient({ cookies })
//     const { data: { session } } = await supabase.auth.getSession()

//     if (!session) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     const friend = await SmartMemoryService.getAIFriend(session.user.id)
    
//     return NextResponse.json({ data: friend })
    
//   } catch (error) {
//     console.error('AI Setup GET Error:', error)
//     return NextResponse.json({ error: 'Failed to fetch AI friend' }, { status: 500 })
//   }
// }