# Push Notification Troubleshooting Guide

## Quick Test Steps

1. **Navigate to test pages:**
   - Simple test: `http://localhost:3001/simple-test`
   - Full test: `http://localhost:3001/test-notifications`
   - VAPID debug: `http://localhost:3001/debug-vapid`

2. **Check browser console for errors**

3. **Verify VAPID keys are working**

## Common Issues & Solutions

### 1. Notifications Not Appearing

**Possible Causes:**
- Permission not granted
- Service worker not registered
- Invalid VAPID keys
- Browser blocking notifications

**Solutions:**
```javascript
// Check permission status
console.log('Permission:', Notification.permission);

// Check if service worker is registered
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('SW registrations:', registrations);
});

// Check if subscribed
navigator.serviceWorker.ready.then(registration => {
  registration.pushManager.getSubscription().then(subscription => {
    console.log('Subscription:', subscription);
  });
});
```

### 2. Service Worker Issues

**Check if service worker is loading:**
- Open DevTools → Application → Service Workers
- Look for `/sw-custom.js` or `/sw.js`
- Check for errors in registration

**Manual registration test:**
```javascript
navigator.serviceWorker.register('/sw-custom.js')
  .then(registration => console.log('SW registered:', registration))
  .catch(error => console.error('SW error:', error));
```

### 3. VAPID Key Issues

**Verify VAPID keys:**
- Public key should be 88 characters long
- Should start with 'B'
- Should be base64url encoded

**Test VAPID conversion:**
```javascript
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Test your public key
const publicKey = 'YOUR_PUBLIC_KEY_HERE';
try {
  const converted = urlBase64ToUint8Array(publicKey);
  console.log('VAPID key conversion successful:', converted);
} catch (error) {
  console.error('VAPID key conversion failed:', error);
}
```

### 4. Database Issues

**Check if subscriptions are being saved:**
```sql
-- In Supabase SQL editor
SELECT * FROM push_subscriptions;
```

**Check subscription format:**
- `endpoint` should be a valid URL
- `p256dh` and `auth` should be base64 encoded strings

### 5. API Issues

**Test the send API directly:**
```javascript
fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'YOUR_USER_ID',
    title: 'Test',
    body: 'Test message',
    type: 'test'
  })
})
.then(response => response.json())
.then(data => console.log('API response:', data))
.catch(error => console.error('API error:', error));
```

## Browser-Specific Issues

### Chrome/Chromium
- Notifications work in background
- Requires HTTPS in production
- Check chrome://settings/content/notifications

### Firefox
- May require explicit user interaction
- Check about:preferences#privacy

### Safari
- Limited push notification support
- Requires user gesture for permission

## Environment Variables Check

Ensure these are set in `.env.local`:
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BC_CuXx8W-GrvkI-1TcGXwKAOkqALbytvN9ZJ2Dcw3iYeCSPqdPlQ9P4ip3j15HYF-ZEoMqtgNSPP-d4rx7BA3M
VAPID_PRIVATE_KEY=3nIzqrWhvG6OiiEEVH54XSXcGJrIUaCYF-BP-gEl9XE
VAPID_EMAIL=mailto:Blindcharm@gmail.com
```

## Testing Checklist

- [ ] Browser supports notifications
- [ ] Permission granted
- [ ] Service worker registered
- [ ] User authenticated
- [ ] Subscription saved to database
- [ ] VAPID keys valid
- [ ] API endpoint working
- [ ] Console shows no errors

## Debug Commands

```javascript
// Check all registrations
navigator.serviceWorker.getRegistrations().then(console.log);

// Check current subscription
navigator.serviceWorker.ready.then(reg => 
  reg.pushManager.getSubscription().then(console.log)
);

// Check permission
console.log('Permission:', Notification.permission);

// Test browser notification
new Notification('Test', { body: 'Browser test' });
```

## Production Considerations

1. **HTTPS Required:** Push notifications only work over HTTPS in production
2. **Domain Verification:** Ensure your domain is properly configured
3. **Rate Limiting:** Implement rate limiting for notification sending
4. **Error Handling:** Handle expired/invalid subscriptions
5. **User Preferences:** Allow users to customize notification types

## Getting Help

If notifications still don't work:

1. Check browser console for errors
2. Verify all environment variables
3. Test with simple browser notifications first
4. Check network tab for API call failures
5. Verify database permissions and data

## Current Implementation Status

✅ Service worker created (`/sw-custom.js`)
✅ VAPID keys configured
✅ Database tables created
✅ API endpoints implemented
✅ React hooks created
✅ UI components built
✅ Test pages available

## Next Steps for Testing

1. Open `http://localhost:3001/simple-test`
2. Click "Request Permission"
3. Click "Send Browser Notification"
4. If that works, try the full test at `/test-notifications`
5. Check console logs for any errors