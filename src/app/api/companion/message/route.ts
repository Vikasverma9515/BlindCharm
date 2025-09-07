import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { extractMemories, generateAssistantReply, type ChatMessage } from '@/lib/ai'

// This API:
// - accepts { userId, message }
// - verifies user exists in users table
// - stores the message in ai_messages
// - extracts basic memories and stores them (no embeddings yet)
// - returns assistant reply and optional suggestions (empty placeholder for now)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, message } = body as { userId?: string; message?: string }

    if (!userId || !message) {
      return NextResponse.json({ error: 'userId and message are required' }, { status: 400 })
    }

    // Check user existence
    const { data: userExists, error: userErr } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .limit(1)
    if (userErr) return NextResponse.json({ error: userErr.message }, { status: 500 })
    if (!userExists || userExists.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create tables lazily if migration not applied is out of scope; assume migration is applied

    // Store user message
    const { error: msgErr } = await supabase.from('ai_messages').insert({
      user_id: userId,
      role: 'user',
      content: message,
    })
    if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 })

    // Extract and persist memories (no embeddings yet)
    const memories = extractMemories(message)
    if (memories.length) {
      const rows = memories.map(m => ({
        user_id: userId,
        content: m.content,
        memory_kind: m.kind,
        importance: m.importance ?? 1,
      }))
      const { error: memErr } = await supabase.from('ai_memories').insert(rows)
      if (memErr) {
        // Non-fatal: continue
        console.warn('ai_memories insert error', memErr)
      }
    }

    // Build minimal history for reply (last 10 messages)
    const { data: historyData } = await supabase
      .from('ai_messages')
      .select('role, content')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    const history: ChatMessage[] = (historyData ?? []).reverse() as ChatMessage[]
    const reply = generateAssistantReply(history, message)

    // Store assistant reply
    const { error: aErr } = await supabase.from('ai_messages').insert({
      user_id: userId,
      role: 'assistant',
      content: reply,
    })
    if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 })

    return NextResponse.json({ reply, suggestions: [] })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Unknown error' }, { status: 500 })
  }
}