// Service Worker customizado para Push Notifications
// O next-pwa gera o sw.js principal — este lida com push events

self.addEventListener('push', function(event) {
  if (!event.data) return

  let data = {}
  try { data = event.data.json() } catch { data = { title: 'Método Billings', body: event.data.text() } }

  const options = {
    body: data.body ?? 'Lembre-se de registrar suas observações hoje!',
    icon: data.icon ?? '/icons/icon-192.png',
    badge: data.badge ?? '/icons/icon-72.png',
    vibrate: [200, 100, 200],
    data: { url: data.url ?? '/' },
    actions: [
      { action: 'registrar', title: '📝 Registrar agora' },
      { action: 'fechar',    title: 'Fechar' },
    ],
  }

  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Método Billings', options)
  )
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()

  if (event.action === 'fechar') return

  const url = event.notification.data?.url ?? '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
