// Single place for the backend address.
//
// Resolution order:
//  1. NEXT_PUBLIC_API_BASE_URL (build-time override, e.g. "https://example.com/api")
//  2. LAN: when this page was opened from another computer (http://<server-ip>:3000),
//     the API is on that same computer at port 5001.
//  3. Default: the API runs on this machine.
const API_PORT = 5001;

function resolveApiBase(): string {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) return process.env.NEXT_PUBLIC_API_BASE_URL;
  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
      return `${protocol}//${hostname}:${API_PORT}/api`;
    }
  }
  return `http://localhost:${API_PORT}/api`;
}

export const API_BASE_URL: string = resolveApiBase();

// Server origin without the "/api" suffix - used for uploaded files and sockets.
export const SERVER_ORIGIN: string = API_BASE_URL.replace(/\/api\/?$/, "");
