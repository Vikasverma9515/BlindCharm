import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { SmartMemoryService } from '@/lib/ai/smart-memory'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    
    const memory = await SmartMemoryService.getRelevantMemory(
      session.user.id, 
      query, 
      10
    )
    
    return NextResponse.json({ data: memory })
    
  } catch (error) {
    console.error('Memory API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch memory' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    if (!type) {
      return NextResponse.json({ error: 'Memory type is required' }, { status: 400 })
    }

    // Clear memories of specific type
    const { error } = await supabase
      .from('ai_user_memory')
      .delete()
      .eq('user_id', session.user.id)
      .eq('memory_type', type)

    if (error) {
      throw error
    }
    
    return NextResponse.json({ message: 'Memory cleared successfully' })
    
  } catch (error) {
    console.error('Memory DELETE Error:', error)
    return NextResponse.json({ error: 'Failed to clear memory' }, { status: 500 })
  }
}