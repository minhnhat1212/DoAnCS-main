// Service Worker for background notifications
self.addEventListener('push', function(event) {
  const data = event.data.json();
  
  // Play notification sound
  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  if (data.type === 'start') {
    // Ascending sound for task start
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(880, audioContext.currentTime + 1);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.5);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
  } else if (data.type === 'end') {
    // Descending sound for task end
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(440, audioContext.currentTime + 1);
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.5);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
  } else if (data.type === 'overdue') {
    // Warning sound for overdue tasks
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime + 0.2);
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.3);
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.4);
  }
  
  oscillator.start();
  oscillator.stop(audioContext.currentTime + (data.type === 'overdue' ? 0.4 : 1));

  // Show notification with more details
  const options = {
    body: data.message,
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      taskId: data.taskId,
      type: data.type
    },
    actions: [
      {
        action: 'open',
        title: 'Mở task'
      },
      {
        action: 'complete',
        title: 'Đánh dấu hoàn thành'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'complete') {
    // Send message to client to mark task as complete
    clients.matchAll().then(function(clientList) {
      clientList.forEach(function(client) {
        client.postMessage({
          type: 'completeTask',
          taskId: event.notification.data.taskId
        });
      });
    });
  } else {
    // Default action: open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
}); 