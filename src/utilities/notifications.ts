export interface NotificationOptions {
  title: string;
  body: string;
}

export function showNotification(options: NotificationOptions): void {
  // In Electron: use the native notification API via IPC
  if (typeof window !== 'undefined' && window.electronAPI) {
    window.electronAPI.showNotification(options);
    return;
  }
  // Web fallback: use the browser Notification API
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(options.title, { body: options.body });
  } else if ('Notification' in window && Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(options.title, { body: options.body });
      }
    });
  }
}
