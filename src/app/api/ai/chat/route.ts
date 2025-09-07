// app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { BlindCharmAI, BlindCharmTrainer } from '@/lib/ai/groq'
import { AIMemoryService } from '@/lib/ai/memory'

const ai = new BlindCharmAI()
// Train the AI with scenarios (do this once on startup)

BlindCharmTrainer.trainAI(ai)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message } = await request.json()
    const userId = session.user.id

    // Get user's AI friend
    const aiFriend = await AIMemoryService.getAIFriend(userId)
    if (!aiFriend) {
      return NextResponse.json({ error: 'AI friend not set up' }, { status: 400 })
    }

    // Get user memory and conversation history
    const [userMemory, conversationHistory] = await Promise.all([
      AIMemoryService.getUserMemory(userId),
      AIMemoryService.getConversationHistory(userId, 10)
    ])

    // Analyze user's communication tone
    const userTone = ai.analyzeUserTone(message)

    // Generate AI response
    const context = {
      friendName: aiFriend.name,
      friendPersonality: aiFriend.personality,
      userTone,
      userMemory,
      conversationHistory
    }

    const aiResponse = await ai.chat(message, context)

    // Extract and save new memory points
    const newMemories = ai.extractMemoryPoints(message)
    if (newMemories.length > 0) {
      await AIMemoryService.updateMemory(userId, newMemories)
    }

    // Save conversation
    await Promise.all([
      AIMemoryService.saveConversation(userId, message, true),
      AIMemoryService.saveConversation(userId, aiResponse, false)
    ])

    return NextResponse.json({ 
      response: aiResponse,
      friendName: aiFriend.name,
      avatar: aiFriend.avatar
    })

  } catch (error) {
    console.error('AI Chat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
  
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conversationHistory = await AIMemoryService.getConversationHistory(session.user.id, 50)
    const aiFriend = await AIMemoryService.getAIFriend(session.user.id)

   // Continue app/api/ai/chat/route.ts GET method
    return NextResponse.json({ 
      messages: conversationHistory,
      aiFriend
    })

  } catch (error) {
    console.error('AI Chat history error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
// // app/api/ai/chat/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/app/api/auth/[...nextauth]/route'
// import { BlindCharmAI, BlindCharmTrainer } from '@/lib/ai/groq'
// import { AIMemoryService } from '@/lib/ai/memory'

// // Initialize and train AI once
// const ai = new BlindCharmAI()
// let isAITrained = false

// // Train AI on first request (lazy loading)
// const ensureAITrained = () => {
//   if (!isAITrained) {
//     console.log('🤖 Training BlindCharm AI...')
//     BlindCharmTrainer.trainAI(ai)
//     isAITrained = true
//     console.log('✅ AI training complete!')
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     // Ensure AI is trained
//     ensureAITrained()

//     const session = await getServerSession(authOptions)
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     const { message } = await request.json()
    
//     if (!message?.trim()) {
//       return NextResponse.json({ error: 'Message is required' }, { status: 400 })
//     }

//     const userId = session.user.id

//     // Get user's AI friend
//     const aiFriend = await AIMemoryService.getAIFriend(userId)
//     if (!aiFriend) {
//       return NextResponse.json({ 
//         error: 'AI friend not set up. Please complete the setup first.',
//         redirectTo: '/ai-friend/setup'
//       }, { status: 400 })
//     }

//     // Get user memory and conversation history in parallel
//     const [userMemory, rawConversationHistory] = await Promise.all([
//       AIMemoryService.getUserMemory(userId),
//       AIMemoryService.getFormattedConversationForAI(userId, 12) // Use formatted version for AI
//     ])

//     // Analyze user's communication patterns
//     const userTone = ai.analyzeUserTone(message)
    
//     // Build comprehensive context for AI
//     const context = {
//       friendName: aiFriend.name,
//       friendPersonality: aiFriend.personality,
//       userTone,
//       userMemory,
//       conversationHistory: rawConversationHistory // This now has the correct format
//     }

//     // Generate AI response
//     const aiResponse = await ai.chat(message, context)

//     // Extract and save new memory points
//     const newMemories = ai.extractMemoryPoints(message)
//     const memoryPromises = []
    
//     if (newMemories.length > 0) {
//       memoryPromises.push(AIMemoryService.updateMemory(userId, newMemories))
//     }

//     // Save conversation to database
//     memoryPromises.push(
//       AIMemoryService.saveConversation(userId, message, true),
//       AIMemoryService.saveConversation(userId, aiResponse, false)
//     )

//     // Execute all database operations in parallel
//     await Promise.all(memoryPromises)

//     // Get conversation insights for analytics (optional)
//     const insights = ai.getConversationInsights(rawConversationHistory)

//     return NextResponse.json({ 
//       response: aiResponse,
//       friendName: aiFriend.name,
//       avatar: aiFriend.avatar,
//       userTone,
//       memoryPointsExtracted: newMemories.length,
//       insights: {
//         hinglishUsage: insights.hinglishUsage,
//         relationshipStage: insights.relationshipProgression
//       }
//     })

//   } catch (error: any) {
//     console.error('AI Chat error:', error)
    
//     // Handle specific error types
//     if (error.message?.includes('rate limit')) {
//       return NextResponse.json({ 
//         error: 'Too many requests. Please wait a moment before sending another message.',
//         type: 'rate_limit'
//       }, { status: 429 })
//     }

//     if (error.message?.includes('content filter')) {
//       return NextResponse.json({ 
//         error: 'Message contains inappropriate content. Please rephrase.',
//         type: 'content_filter'
//       }, { status: 400 })
//     }

//     // Generic error with friendly message
//     return NextResponse.json({ 
//       error: 'Sorry, I\'m having a technical issue right now. Please try again!',
//       type: 'server_error'
//     }, { status: 500 })
//   }
// }

// export async function GET(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions)
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     const userId = session.user.id
//     const url = new URL(request.url)
//     const limit = parseInt(url.searchParams.get('limit') || '50')
//     const includeInsights = url.searchParams.get('insights') === 'true'

//     // Get conversation data - use raw data for frontend
//     const [conversationHistory, aiFriend] = await Promise.all([
//       AIMemoryService.getConversationHistory(userId, limit), // Raw data
//       AIMemoryService.getAIFriend(userId)
//     ])

//     if (!aiFriend) {
//       return NextResponse.json({ 
//         error: 'AI friend not set up',
//         redirectTo: '/ai-friend/setup'
//       }, { status: 400 })
//     }

//     // Format messages for frontend - now we have the correct properties
//     const formattedMessages = conversationHistory.map((msg: any) => ({
//       id: msg.id || Math.random().toString(36),
//       content: msg.message, // This exists in raw data
//       isUser: msg.is_user, // This exists in raw data
//       timestamp: msg.created_at, // This exists in raw data
//       emotion: msg.emotion || null // This might be null
//     }))

//     const response: any = {
//       messages: formattedMessages,
//       aiFriend: {
//         id: aiFriend.id,
//         name: aiFriend.name,
//         avatar: aiFriend.avatar,
//         personality: aiFriend.personality
//       },
//       totalMessages: conversationHistory.length
//     }

//     // Add conversation insights if requested
//     if (includeInsights && formattedMessages.length > 0) {
//       ensureAITrained()
//       const historyForInsights = formattedMessages.map(msg => ({
//         role: msg.isUser ? 'user' : 'assistant',
//         content: msg.content
//       }))
//       response.insights = ai.getConversationInsights(historyForInsights)
//     }

//     return NextResponse.json(response)

//   } catch (error) {
//     console.error('AI Chat history error:', error)
//     return NextResponse.json({ 
//       error: 'Failed to load conversation history',
//       type: 'server_error'
//     }, { status: 500 })
//   }
// }

// // Health check endpoint
// export async function HEAD(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions)
//     if (!session?.user?.id) {
//       return new NextResponse(null, { status: 401 })
//     }
    
//     return new NextResponse(null, { status: 200 })
//   } catch (error) {
//     return new NextResponse(null, { status: 500 })
//   }
// }