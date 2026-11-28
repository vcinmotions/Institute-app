import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import { isAllowedOrigin } from "./allowedOrigins";

let io: Server;

export function initSocket(server: HTTPServer) {
  io = new Server(server, {
    // Same rule as the API (utils/allowedOrigins.ts). The cors option only covers HTTP polling;
    // browsers don't apply CORS to WebSocket upgrades, so allowRequest checks the Origin as well.
    cors: {
      origin: (origin, cb) => cb(null, isAllowedOrigin(origin)),
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
    allowRequest: (req, cb) => cb(null, isAllowedOrigin(req.headers.origin)),
    transports: ["websocket"], // Important to avoid polling issues
  });

  io.on("connection", (socket) => {
    console.log("🔌 New client connected", socket.id);

    // Store user ID in socket room for targeted messages
    socket.on("join", (clientAdminId: string) => {
      socket.join(clientAdminId);
      console.log(`🧑 Client joined room: ${clientAdminId}`);
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected", socket.id);
    });
  });

  return io;
}

export { io };
