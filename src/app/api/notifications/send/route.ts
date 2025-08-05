import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configure web-push
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      userIds, 
      title, 
      body, 
      type, 
      url, 
      matchId, 
      image,
      actions,
      requireInteraction = false,
      broadcast = false 
    } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    let targetUserIds: string[] = [];

    if (broadcast) {
      // Send to all users with push subscriptions
      const { data: allSubscriptions, error } = await supabase
        .from('push_subscriptions')
        .select('user_id')
        .neq('user_id', null);

      if (error) {
        console.error('Error fetching all subscriptions:', error);
        return NextResponse.json(
          { error: 'Failed to fetch subscriptions' },
          { status: 500 }
        );
      }

      targetUserIds = allSubscriptions?.map(sub => sub.user_id) || [];
    } else if (userIds && Array.isArray(userIds)) {
      targetUserIds = userIds;
    } else if (userId) {
      targetUserIds = [userId];
    } else {
      return NextResponse.json(
        { error: 'Must specify userId, userIds array, or set broadcast to true' },
        { status: 400 }
      );
    }

    // Get subscriptions for target users
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', targetUserIds);

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { message: 'No subscriptions found for target users' },
        { status: 200 }
      );
    }

    // Prepare notification payload
    const payload = JSON.stringify({
      title,
      body,
      type: type || 'general',
      url: url || '/',
      matchId,
      image,
      actions: actions || [],
      requireInteraction,
      tag: `${type || 'general'}-${Date.now()}`
    });

    // Send notifications to all subscriptions
    const sendPromises = subscriptions.map(async (subscription) => {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        };

        await webpush.sendNotification(pushSubscription, payload);
        return { success: true, userId: subscription.user_id };
      } catch (error: any) {
        console.error(`Failed to send notification to user ${subscription.user_id}:`, error);
        
        // If subscription is invalid, remove it from database
        if (error.statusCode === 410 || error.statusCode === 404) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('id', subscription.id);
        }
        
        return { success: false, userId: subscription.user_id, error: error.message };
      }
    });

    const results = await Promise.all(sendPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    // Store notification in database for tracking
    await supabase
      .from('notifications')
      .insert({
        title,
        body,
        type: type || 'general',
        target_user_ids: targetUserIds,
        sent_count: successful,
        failed_count: failed,
        created_at: new Date().toISOString()
      });

    return NextResponse.json({
      success: true,
      sent: successful,
      failed: failed,
      results
    });

  } catch (error) {
    console.error('Error in send notification route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}