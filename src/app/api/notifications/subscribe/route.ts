// import { NextRequest, NextResponse } from 'next/server';
// import { createClient } from '@supabase/supabase-js';

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

// export async function POST(request: NextRequest) {
//   try {
//     const { subscription, userId, authProvider = 'nextauth' } = await request.json();

//     if (!subscription) {
//       return NextResponse.json(
//         { error: 'Missing subscription' },
//         { status: 400 }
//       );
//     }

//     // Upsert by endpoint (unique), attach user_id if it's a valid UUID, else store external_user_id
//     const isUUID = (v: string) => /^(?i:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/.test(v);

//     const payload: any = {
//       endpoint: subscription.endpoint,
//       p256dh: subscription.keys.p256dh,
//       auth: subscription.keys.auth,
//       updated_at: new Date().toISOString(),
//       auth_provider: authProvider,
//     };

//     if (userId) {
//       if (isUUID(userId)) {
//         payload.user_id = userId;
//       } else {
//         payload.external_user_id = String(userId);
//       }
//     }

//     // Try to fetch existing by endpoint to decide insert/update
//     const { data: existing, error: fetchErr } = await supabase
//       .from('push_subscriptions')
//       .select('id')
//       .eq('endpoint', subscription.endpoint)
//       .maybeSingle();

//     if (fetchErr) {
//       console.error('Error checking existing subscription:', fetchErr);
//     }

//     let result;
//     if (existing?.id) {
//       result = await supabase
//         .from('push_subscriptions')
//         .update(payload)
//         .eq('id', existing.id)
//         .select();
//     } else {
//       payload.created_at = new Date().toISOString();
//       result = await supabase
//         .from('push_subscriptions')
//         .insert(payload)
//         .select();
//     }

//     if (result.error) {
//       console.error('Error storing subscription:', result.error);
//       return NextResponse.json(
//         { error: 'Failed to store subscription', details: result.error.message },
//         { status: 500 }
//       );
//     }

//     return NextResponse.json({ success: true, data: result.data });
//   } catch (error) {
//     console.error('Error in subscribe route:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(request: NextRequest) {
//   try {
//     const { endpoint, userId } = await request.json();

//     if (!endpoint) {
//       return NextResponse.json(
//         { error: 'Missing endpoint' },
//         { status: 400 }
//       );
//     }

//     // Remove by endpoint; optionally filter by userId if provided
//     let query = supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
//     if (userId) {
//       // Match either path
//       query = query.or(`user_id.eq.${userId},external_user_id.eq.${userId}`);
//     }

//     const { error } = await query;

//     if (error) {
//       console.error('Error removing subscription:', error);
//       return NextResponse.json(
//         { error: 'Failed to remove subscription' },
//         { status: 500 }
//       );
//     }

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error('Error in unsubscribe route:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }



import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { subscription, userId, authProvider = 'nextauth' } = await request.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Missing subscription data' },
        { status: 400 }
      );
    }

    if (!subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
      return NextResponse.json(
        { error: 'Missing subscription keys' },
        { status: 400 }
      );
    }

    // ✅ Fixed UUID validation with proper JavaScript regex syntax
    const isUUID = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

    // Prepare the payload based on your new schema
    const payload: any = {
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      auth_provider: authProvider,
      updated_at: new Date().toISOString(),
    };

    // Handle different user ID types based on your migration
    if (userId) {
      if (isUUID(userId)) {
        // Supabase UUID - goes in user_id column
        payload.user_id = userId;
        payload.external_user_id = null; // Clear external_user_id
      } else {
        // Firebase UID or other external ID - goes in external_user_id column
        payload.external_user_id = String(userId);
        payload.user_id = null; // Clear user_id
      }
    }

    // Check if subscription already exists by endpoint (your new unique constraint)
    const { data: existing, error: fetchErr } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('endpoint', subscription.endpoint)
      .maybeSingle();

    if (fetchErr) {
      console.error('Error checking existing subscription:', fetchErr);
    }

    let result;
    if (existing?.id) {
      // Update existing subscription
      result = await supabase
        .from('push_subscriptions')
        .update(payload)
        .eq('id', existing.id)
        .select();
    } else {
      // Insert new subscription
      payload.created_at = new Date().toISOString();
      result = await supabase
        .from('push_subscriptions')
        .insert(payload)
        .select();
    }

    if (result.error) {
      console.error('Error storing subscription:', result.error);
      return NextResponse.json(
        { error: 'Failed to store subscription', details: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Error in subscribe route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { endpoint, userId } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Missing endpoint' },
        { status: 400 }
      );
    }

    // Since your migration made endpoint unique, we can delete by endpoint alone
    // But if userId is provided, we can add additional filtering for safety
    let query = supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
    
    if (userId) {
      // ✅ Fixed UUID validation
      const isUUID = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
      
      if (isUUID(userId)) {
        query = query.eq('user_id', userId);
      } else {
        query = query.eq('external_user_id', userId);
      }
    }

    const { error } = await query;

    if (error) {
      console.error('Error removing subscription:', error);
      return NextResponse.json(
        { error: 'Failed to remove subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in unsubscribe route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}