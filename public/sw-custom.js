// Custom Service Worker for Push Notifications
self.addEventListener('push', function(event) {
  console.log('Push event received:', event);
  
  if (!event.data) {
    console.log('Push event but no data');
    return;
  }

  let notificationData;
  try {
    notificationData = event.data.json();
  } catch (e) {
    console.error('Error parsing push data:', e);
    notificationData = {
      title: 'BlindCharm',
      body: event.data.text() || 'You have a new notification',
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png'
    };
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon || '/icon-192x192.png',
    badge: notificationData.badge || '/icon-72x72.png',
    image: notificationData.image,
    data: {
      url: notificationData.url || '/',
      matchId: notificationData.matchId,
      type: notificationData.type || 'general'
    },
    actions: notificationData.actions || [],
    requireInteraction: notificationData.requireInteraction || false,
    tag: notificationData.type || 'general',
    renotify: true,
    vibrate: [200, 100, 200],
    timestamp: Date.now()
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no existing window/tab, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('notificationclose', function(event) {
  console.log('Notification closed:', event);
  // You can track notification dismissals here if needed
});

// Handle action button clicks
self.addEventListener('notificationclick', function(event) {
  if (event.action) {
    console.log('Notification action clicked:', event.action);
    
    event.notification.close();
    
    let urlToOpen = '/';
    
    switch (event.action) {
      case 'view':
      case 'chat':
      case 'reply':
        urlToOpen = event.notification.data?.url || '/';
        break;
      case 'join':
        urlToOpen = '/lobby';
        break;
      case 'explore':
        urlToOpen = '/lobby';
        break;
      default:
        urlToOpen = event.notification.data?.url || '/';
    }
    
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      }).then(function(clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
});

// Background sync for offline notifications
self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    // Handle background sync if needed
  }
});

console.log('BlindCharm Service Worker loaded successfully');