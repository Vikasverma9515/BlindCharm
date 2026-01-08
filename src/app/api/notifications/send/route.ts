import { NextRequest, NextResponse } from 'next/server';
import { sendPushNotification } from '@/lib/push-notifications';

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
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

    // Resolve target IDs
    let targetUserIds: string[] = [];
    if (userIds && Array.isArray(userIds)) {
      targetUserIds = userIds;
    } else if (userId) {
      targetUserIds = [userId];
    }
    // Note: Broadcast logic is not fully supported in the helper yet unless we pass all IDs.
    // For now keeping it simple as the helper handles arrays.

    if (targetUserIds.length === 0 && !broadcast) {
      return NextResponse.json({ error: 'No targets specified' }, { status: 400 });
    }

    const result = await sendPushNotification({
      userIds: targetUserIds,
      title,
      body,
      type,
      url,
      matchId,
      image,
      actions,
      requireInteraction
    });

    return NextResponse.json({ success: true, ...result });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}