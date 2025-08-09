import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get all subscriptions
    const { data: allSubs, error: allError } = await supabase
      .from('push_subscriptions')
      .select('id, user_id, endpoint, created_at')
      .order('created_at', { ascending: false });

    if (allError) {
      return NextResponse.json({ error: allError.message }, { status: 500 });
    }

    // Get subscription count by user
    const { data: userCounts, error: countError } = await supabase
      .from('push_subscriptions')
      .select('user_id')
      .neq('user_id', null);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    // Count unique users
    const uniqueUsers = [...new Set(userCounts?.map(s => s.user_id) || [])];

    // Check for invalid subscriptions
    const { data: invalidSubs, error: invalidError } = await supabase
      .from('push_subscriptions')
      .select('id, user_id')
      .or('endpoint.is.null,p256dh.is.null,auth.is.null');

    return NextResponse.json({
      success: true,
      stats: {
        totalSubscriptions: allSubs?.length || 0,
        uniqueUsers: uniqueUsers.length,
        invalidSubscriptions: invalidSubs?.length || 0
      },
      recentSubscriptions: allSubs?.slice(0, 5).map(sub => ({
        id: sub.id,
        user_id: sub.user_id,
        endpoint: sub.endpoint ? 'Present' : 'Missing',
        created_at: sub.created_at
      })),
      userCounts: uniqueUsers.map(userId => ({
        user_id: userId,
        subscriptionCount: userCounts?.filter(s => s.user_id === userId).length || 0
      })).slice(0, 10)
    });

  } catch (error) {
    console.error('Debug subscriptions error:', error);
    return NextResponse.json(
      { error: 'Failed to debug subscriptions' },
      { status: 500 }
    );
  }
}