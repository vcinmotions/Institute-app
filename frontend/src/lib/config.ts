// Single place for the backend address. Override with NEXT_PUBLIC_API_BASE_URL
// (for example "https://example.com/api") when the API is not on this machine.
export const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001/api";

// Server origin without the "/api" suffix - used for uploaded files and sockets.
export const SERVER_ORIGIN: string = API_BASE_URL.replace(/\/api\/?$/, "");
