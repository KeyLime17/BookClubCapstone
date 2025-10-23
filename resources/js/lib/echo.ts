import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: any;
  }
}

window.Pusher = Pusher;

export const echo = new Echo<any>({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
  wsHost: import.meta.env.VITE_PUSHER_HOST || window.location.hostname,
  wsPort: Number(import.meta.env.VITE_PUSHER_PORT || 6001),
  wssPort: Number(import.meta.env.VITE_PUSHER_PORT || 6001),
  forceTLS: (import.meta.env.VITE_PUSHER_FORCE_TLS ?? 'false') === 'true',
  encrypted: (import.meta.env.VITE_PUSHER_FORCE_TLS ?? 'false') === 'true',
  disableStats: true,
  enabledTransports: ['ws', 'wss'],
});


window.Echo = echo;