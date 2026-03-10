import { Server } from "socket.io";
import { Server as HTTPServer } from "http";

let io: Server;

export function initSocket(server: HTTPServer) {
  io = new Server(server, {
    cors: {
      origin: "*", // Or your frontend URL in production
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
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
