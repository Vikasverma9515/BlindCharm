// Push notification service worker
self.addEventListener('push', function(event) {
  console.log('Push event received:', event);
  
  if (event.data) {
    const data = event.data.json();
    console.log('Push data:', data);
    
    const options = {
      body: data.body || 'You have a new notification!',
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      image: data.image || null,
      data: {
        url: data.url || '/',
        matchId: data.matchId || null,
        type: data.type || 'general'
      },
      actions: data.actions || [],
      tag: data.tag || 'default',
      requireInteraction: data.requireInteraction || false,
      silent: false,
      vibrate: [200, 100, 200],
      timestamp: Date.now()
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'BlindCharm', options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const data = event.notification.data;
  let url = '/';
  
  // Handle different notification types
  switch (data.type) {
    case 'match':
      url = `/matches/${data.matchId}`;
      break;
    case 'message':
      url = `/whispers/${data.matchId}`;
      break;
    case 'lobby':
      url = '/lobby';
      break;
    default:
      url = data.url || '/';
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(url.split('?')[0]) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no existing window/tab, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

self.addEventListener('notificationclose', function(event) {
  console.log('Notification closed:', event);
  // Track notification close events if needed
});

// Background sync for offline notifications
self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync for notifications
      console.log('Background sync triggered')
    );
  }
});