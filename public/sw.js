self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'Vocabulary Builder'
  const options = {
    body: data.body || 'Time to learn a new word!',
    icon: '/icon.svg',
    badge: '/icon.svg',
    data: {
      url: data.url || '/dashboard'
    },
    vibrate: [100, 50, 100],
    actions: [
      { action: 'open', title: 'Learn Now' }
    ]
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  const url = event.notification.data?.url || '/dashboard'
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      for (const client of clientList) {
        if (client.url.includes('/dashboard') && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})
