import { SERVER_ORIGIN } from "@/lib/config";
// import { io, Socket } from 'socket.io-client';

// const SOCKET_URL = SERVER_ORIGIN; // 🔁 Replace with your backend URL in production

// // Export a single socket instance
// export const socket: Socket = io(SOCKET_URL, {
//   autoConnect: false, // Important: connect only after login
// });

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = SERVER_ORIGIN; // Use env variable in production

// ✅ Updated config
export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false, // Good: connect manually after login
  transports: ['websocket'], // ✅ Force WebSocket only
  withCredentials: false,    // Optional, if no auth cookies
});
