// import { NextRequest, NextResponse } from 'next/server';
// import webpush from 'web-push';
// import { createClient } from '@supabase/supabase-js';



// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

// // Configure web-push
// try {
//   webpush.setVapidDetails(
//     process.env.VAPID_EMAIL!,
//     process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
//     process.env.VAPID_PRIVATE_KEY!
//   );
//   console.log('✅ VAPID details configured successfully');
// } catch (vapidError) {
//   console.error('❌ VAPID configuration error:', vapidError);
// }

// export async function POST(request: NextRequest) {
//   try {
//     // Check environment variables first
//     if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
//       console.error('❌ Missing required environment variables');
//       return NextResponse.json(
//         { error: 'Server configuration error - missing database credentials' },
//         { status: 500 }
//       );
//     }

//     if (!process.env.VAPID_EMAIL || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
//       console.error('❌ Missing VAPID configuration');
//       return NextResponse.json(
//         { error: 'Server configuration error - missing VAPID keys' },
//         { status: 500 }
//       );
//     }

//     console.log('🔧 Environment check:');
//     console.log('- SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
//     console.log('- SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
//     console.log('- VAPID_EMAIL:', !!process.env.VAPID_EMAIL);
//     console.log('- VAPID_PUBLIC_KEY:', !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
//     console.log('- VAPID_PRIVATE_KEY:', !!process.env.VAPID_PRIVATE_KEY);
    
//     const requestBody = await request.json();
//     console.log('📨 Notification request received:', requestBody);
    
//     const { 
//       userId, 
//       userIds, 
//       title, 
//       body, 
//       type, 
//       url, 
//       matchId, 
//       image,
//       actions,
//       requireInteraction = false,
//       broadcast = false 
//     } = requestBody;

//     if (!title || !body) {
//       return NextResponse.json(
//         { error: 'Title and body are required' },
//         { status: 400 }
//       );
//     }

//     let targetUserIds: string[] = [];

//     if (broadcast) {
//       // Send to all users with push subscriptions
//       console.log('🌍 Fetching all subscriptions for broadcast...');
      
//       const { data: allSubscriptions, error } = await supabase
//         .from('push_subscriptions')
//         .select('user_id')
//         .neq('user_id', null);

//       if (error) {
//         console.error('❌ Error fetching all subscriptions:', error);
//         return NextResponse.json(
//           { error: 'Failed to fetch subscriptions', details: error.message },
//           { status: 500 }
//         );
//       }

//       console.log('📊 Found subscriptions:', allSubscriptions?.length || 0);
//       targetUserIds = allSubscriptions?.map(sub => sub.user_id) || [];
//       console.log('🎯 Unique target user IDs:', [...new Set(targetUserIds)].length);
//     } else if (userIds && Array.isArray(userIds)) {
//       targetUserIds = userIds;
//     } else if (userId) {
//       targetUserIds = [userId];
//     } else {
//       return NextResponse.json(
//         { error: 'Must specify userId, userIds array, or set broadcast to true' },
//         { status: 400 }
//       );
//     }

//     console.log('🎯 Target user IDs:', targetUserIds);

//     // Get subscriptions for target users
//     const { data: subscriptions, error: subError } = await supabase
//       .from('push_subscriptions')
//       .select('id, user_id, endpoint, p256dh, auth') // Explicitly select needed fields
//       .in('user_id', targetUserIds);

//     if (subError) {
//       console.error('❌ Error fetching subscriptions:', subError);
//       return NextResponse.json(
//         { error: 'Failed to fetch subscriptions', details: subError.message },
//         { status: 500 }
//       );
//     }

//     if (!subscriptions || subscriptions.length === 0) {
//       console.log('⚠️ No subscriptions found for target users');
//       return NextResponse.json(
//         { message: 'No subscriptions found for target users', sent: 0, failed: 0 },
//         { status: 200 }
//       );
//     }

//     // Prepare notification payload
//     const payload = JSON.stringify({
//       title,
//       body,
//       type: type || 'general',
//       url: url || '/',
//       matchId,
//       image,
//       actions: actions || [],
//       requireInteraction,
//       tag: `${type || 'general'}-${Date.now()}`
//     });

//     console.log('📦 Notification payload:', payload);

//     // Send notifications to all subscriptions
//     const sendPromises = subscriptions.map(async (subscription) => {
//       try {
//         if (!subscription.endpoint || !subscription.p256dh || !subscription.auth) {
//           throw new Error('Missing subscription keys');
//         }
//         const pushSubscription = {
//           endpoint: subscription.endpoint,
//           keys: {
//             p256dh: subscription.p256dh,
//             auth: subscription.auth
//           }
//         };

//         await webpush.sendNotification(pushSubscription, payload);
//         return { success: true, userId: subscription.user_id };
//       } catch (error: any) {
//         console.error(`❌ Failed to send notification to user ${subscription.user_id}:`, error);

//         // Remove invalid subscription
//         if (subscription.id && (error.statusCode === 410 || error.statusCode === 404)) {
//           await supabase
//             .from('push_subscriptions')
//             .delete()
//             .eq('id', subscription.id);
//         }

//         return { success: false, userId: subscription.user_id, error: error.message };
//       }
//     });

//     const results = await Promise.all(sendPromises);
//     const successful = results.filter(r => r.success).length;
//     const failed = results.filter(r => !r.success).length;

//     // Store notification in database for tracking (handle if table doesn't exist)
//     try {
//       await supabase
//         .from('notifications')
//         .insert({
//           title,
//           body,
//           type: type || 'general',
//           sent_count: successful,
//           failed_count: failed,
//           metadata: {
//             target_user_ids: targetUserIds,
//             image,
//             url,
//             actions,
//             requireInteraction
//           }
//         });
//     } catch (dbError) {
//       console.warn('Could not store notification in database (table may not exist):', dbError);
//       // Continue without storing - the notification was still sent
//     }

//     return NextResponse.json({
//       success: true,
//       sent: successful,
//       failed: failed,
//       results
//     });

//   } catch (error) {
//     console.error('❌ Error in send notification route:', error);
//     console.error('❌ Error details:', {
//       message: error instanceof Error ? error.message : 'Unknown error',
//       stack: error instanceof Error ? error.stack : 'No stack trace',
//       name: error instanceof Error ? error.name : 'Unknown'
//     });
    
//     return NextResponse.json(
//       { 
//         error: 'Internal server error',
//         details: error instanceof Error ? error.message : 'Unknown error'
//       },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configure web-push with proper error handling
try {
  if (process.env.VAPID_EMAIL && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      process.env.VAPID_EMAIL,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    console.log('✅ VAPID details configured successfully');
  } else {
    console.warn('⚠️ VAPID configuration incomplete - notifications may not work');
  }
} catch (vapidError) {
  console.error('❌ VAPID configuration error:', vapidError);
}

export async function POST(request: NextRequest) {
  try {
    // Environment check
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error - missing database credentials' },
        { status: 500 }
      );
    }

    const requestBody = await request.json();
    console.log('📨 Notification request received:', requestBody);
    
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
    } = requestBody;

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    let targetUserIds: string[] = [];

    if (broadcast) {
      console.log('🌍 Broadcasting to all users...');
      
      // Get all subscriptions for broadcast
      const { data: allSubscriptions, error } = await supabase
        .from('push_subscriptions')
        .select('user_id, external_user_id')
        .not('endpoint', 'is', null);

      if (error) {
        console.error('❌ Error fetching all subscriptions:', error);
        return NextResponse.json(
          { error: 'Failed to fetch subscriptions', details: error.message },
          { status: 500 }
        );
      }

      // Collect all user identifiers
      targetUserIds = allSubscriptions?.map(sub => sub.user_id || sub.external_user_id).filter(Boolean) || [];
      console.log('🎯 Broadcasting to', targetUserIds.length, 'users');
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

    if (targetUserIds.length === 0) {
      return NextResponse.json(
        { message: 'No target users specified', sent: 0, failed: 0 },
        { status: 200 }
      );
    }

    // ✅ Fixed UUID validation
    const isUUID = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

    // Separate UUID and external user IDs
    const uuidUsers = targetUserIds.filter(id => isUUID(id));
    const externalUsers = targetUserIds.filter(id => !isUUID(id));

    console.log('👥 UUID users:', uuidUsers.length);
    console.log('🔗 External users:', externalUsers.length);

    // Build query to get subscriptions
    let subscriptions: any[] = [];

    if (uuidUsers.length > 0) {
      const { data: uuidSubs, error: uuidError } = await supabase
        .from('push_subscriptions')
        .select('id, user_id, external_user_id, endpoint, p256dh, auth')
        .in('user_id', uuidUsers)
        .not('endpoint', 'is', null);

      if (uuidError) {
        console.error('❌ Error fetching UUID subscriptions:', uuidError);
      } else {
        subscriptions.push(...(uuidSubs || []));
      }
    }

    if (externalUsers.length > 0) {
      const { data: externalSubs, error: externalError } = await supabase
        .from('push_subscriptions')
        .select('id, user_id, external_user_id, endpoint, p256dh, auth')
        .in('external_user_id', externalUsers)
        .not('endpoint', 'is', null);

      if (externalError) {
        console.error('❌ Error fetching external subscriptions:', externalError);
      } else {
        subscriptions.push(...(externalSubs || []));
      }
    }

    if (subscriptions.length === 0) {
      console.log('⚠️ No subscriptions found for target users');
      return NextResponse.json(
        { message: 'No subscriptions found for target users', sent: 0, failed: 0 },
        { status: 200 }
      );
    }

    console.log('📱 Found', subscriptions.length, 'subscriptions');

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

    // Send notifications
    const sendPromises = subscriptions.map(async (subscription) => {
      try {
        if (!subscription.endpoint || !subscription.p256dh || !subscription.auth) {
          throw new Error('Missing subscription keys');
        }

        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        };

        await webpush.sendNotification(pushSubscription, payload);
        
        const userIdentifier = subscription.user_id || subscription.external_user_id;
        return { success: true, userId: userIdentifier };
      } catch (error: any) {
        const userIdentifier = subscription.user_id || subscription.external_user_id;
        console.error(`❌ Failed to send notification to user ${userIdentifier}:`, error);

        // Remove invalid subscription
        if (subscription.id && (error.statusCode === 410 || error.statusCode === 404)) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('id', subscription.id);
          console.log('🗑️ Removed invalid subscription for user:', userIdentifier);
        }

        return { success: false, userId: userIdentifier, error: error.message };
      }
    });

    const results = await Promise.all(sendPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`📊 Notification results: ${successful} sent, ${failed} failed`);

    return NextResponse.json({
      success: true,
      sent: successful,
      failed: failed,
      results: results
    });

  } catch (error) {
    console.error('❌ Error in send notification route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}