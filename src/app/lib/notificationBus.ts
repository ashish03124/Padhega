export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: NotificationType;
  read: boolean;
  link?: string;
}

const NOTIFICATION_EVENT = 'padhega_app_notification';

export const addAppNotification = (
  title: string,
  message: string,
  type: NotificationType = 'info',
  link?: string
) => {
  if (typeof window === 'undefined') return;
  const event = new CustomEvent(NOTIFICATION_EVENT, {
    detail: {
      id: `${Date.now()}-${Math.random()}`,
      title,
      message,
      time: 'Just now',
      type,
      read: false,
      link
    } as AppNotification
  });
  window.dispatchEvent(event);
};

export const subscribeToNotifications = (callback: (notification: AppNotification) => void) => {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => {
    const notif = (e as CustomEvent<AppNotification>).detail;
    callback(notif);
  };
  window.addEventListener(NOTIFICATION_EVENT, handler);
  return () => window.removeEventListener(NOTIFICATION_EVENT, handler);
};
