// File: src/app/api/matchmake/route.ts

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // Use the pre-configured supabase client
import { v4 as uuidv4 } from 'uuid';

export async function POST() {
  try {
    // Step 1: Get the active cycle
    const { data: activeCycle, error: cycleError } = await supabase
      .from('lobby_cycles')
      .select('*')
      .eq('status', 'active')
      .order('start_time', { ascending: true })
      .limit(1)
      .single();

    if (cycleError || !activeCycle) {
      console.error('Error fetching active cycle:', cycleError);
      return NextResponse.json({ error: 'No active lobby cycle found' }, { status: 400 });
    }

    // Step 2: Fetch waiting participants from the same cycle
    const { data: participants, error: participantError } = await supabase
      .from('lobby_participants')
      .select('*')
      .eq('status', 'waiting')
      .eq('join_cycle', activeCycle.cycle_number);

    if (participantError) {
      console.error('Error fetching participants:', participantError);
      return NextResponse.json({ error: 'Error fetching participants' }, { status: 500 });
    }

    if (!participants || participants.length < 2) {
      return NextResponse.json({ error: 'Not enough participants to match' }, { status: 400 });
    }

    // Step 3: Shuffle and pair participants
    const shuffled = participants.sort(() => 0.5 - Math.random());
    const matches = [];

    for (let i = 0; i < shuffled.length - 1; i += 2) {
      const user1 = shuffled[i];
      const user2 = shuffled[i + 1];
      const matchId = uuidv4();

      matches.push({
        id: matchId,
        user_id: user1.user_id,
        user2_id: user2.user_id,
        lobby_id: user1.lobby_id,
        status: 'matched',
        messages_count: 0,
        reveal_stage: 'initial',
      });

      // Update participant statuses
      const { error: user1Error } = await supabase
        .from('lobby_participants')
        .update({ status: 'matched' })
        .eq('id', user1.id);

      const { error: user2Error } = await supabase
        .from('lobby_participants')
        .update({ status: 'matched' })
        .eq('id', user2.id);

      if (user1Error || user2Error) {
        console.error('Error updating participant statuses:', { user1Error, user2Error });
        return NextResponse.json({ error: 'Error updating participant statuses' }, { status: 500 });
      }
    }

    // Handle odd participant (if any)
    if (shuffled.length % 2 !== 0) {
      const oddParticipant = shuffled[shuffled.length - 1];
      console.warn(`Odd participant found: ${oddParticipant.user_id}. No match created.`);
    }

    // Step 4: Insert match records
    const { error: insertError } = await supabase.from('matches').insert(matches);

    if (insertError) {
      console.error('Error inserting matches:', insertError);
      return NextResponse.json({ error: 'Failed to insert matches' }, { status: 500 });
    }

    return NextResponse.json({ message: `${matches.length} matches created`, matches });
  } catch (error) {
    console.error('Unexpected error in matchmaking:', error);
    return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 });
  }
}
