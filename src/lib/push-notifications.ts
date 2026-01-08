import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client (Admin context)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configure web-push
try {
    if (process.env.VAPID_EMAIL && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
        webpush.setVapidDetails(
            process.env.VAPID_EMAIL,
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );
    }
} catch (error) {
    console.error('VAPID Configuration Error:', error);
}

interface NotificationPayload {
    userIds: string[];
    title: string;
    body: string;
    type?: string;
    url?: string;
    matchId?: string; // Optional: specific to match notifications
    image?: string;
    actions?: any[];
    requireInteraction?: boolean;
}

export async function sendPushNotification({
    userIds,
    title,
    body,
    type = 'general',
    url = '/',
    matchId,
    image,
    actions = [],
    requireInteraction = false,
}: NotificationPayload) {
    if (!userIds || userIds.length === 0) return { sent: 0, failed: 0 };

    console.log(`🚀 Sending push notification to ${userIds.length} users:`, title);

    try {
        // 1. Fetch Subscriptions
        // We need to handle both `user_id` (UUID) and `external_user_id` (Firebase UID strings if used)
        const isUUID = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
        const uuidUsers = userIds.filter(id => isUUID(id));
        const externalUsers = userIds.filter(id => !isUUID(id));

        let subscriptions: any[] = [];

        if (uuidUsers.length > 0) {
            const { data: uuidSubs } = await supabase
                .from('push_subscriptions')
                .select('*')
                .in('user_id', uuidUsers)
                .not('endpoint', 'is', null);
            if (uuidSubs) subscriptions.push(...uuidSubs);
        }

        if (externalUsers.length > 0) {
            const { data: extSubs } = await supabase
                .from('push_subscriptions')
                .select('*')
                .in('external_user_id', externalUsers)
                .not('endpoint', 'is', null);
            if (extSubs) subscriptions.push(...extSubs);
        }

        if (subscriptions.length === 0) {
            console.log('⚠️ No subscriptions found');
            return { sent: 0, failed: 0 };
        }

        // 2. Prepare Payload
        const payload = JSON.stringify({
            title,
            body,
            type,
            url,
            matchId,
            image,
            actions,
            requireInteraction,
            tag: `${type}-${Date.now()}` // Unique tag to prevent overwriting unless desired
        });

        // 3. Send
        const promises = subscriptions.map(async (sub) => {
            try {
                if (!sub.endpoint || !sub.p256dh || !sub.auth) return false;

                await webpush.sendNotification({
                    endpoint: sub.endpoint,
                    keys: { p256dh: sub.p256dh, auth: sub.auth }
                }, payload);

                return true;
            } catch (err: any) {
                console.error(`❌ Push failed for ${sub.user_id}:`, err?.statusCode);

                // Cleanup invalid subscriptions
                if (err?.statusCode === 410 || err?.statusCode === 404) {
                    await supabase.from('push_subscriptions').delete().eq('id', sub.id);
                }
                return false;
            }
        });

        const results = await Promise.all(promises);
        const sent = results.filter(Boolean).length;
        const failed = results.length - sent;

        console.log(`✅ Push result: ${sent} sent, ${failed} failed`);
        return { sent, failed };

    } catch (error) {
        console.error('🔥 Critical Push Error:', error);
        return { sent: 0, failed: 0, error };
    }
}
