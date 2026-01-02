import { Server } from "socket.io";

let io: Server;

export function initSocket(server: any) {
  io = new Server(server, {
    // cors: {
    //   origin: '*', // Replace with your frontend origin in prod
    // },

    cors: {
      origin: "*", // Or your frontend URL in production
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
    transports: ["websocket"], // Important to avoid polling issues
  });

  io.on("connection", (socket) => {
    console.log("🔌 New client connected");

    // Store user ID in socket room for targeted messages
    socket.on("join", (clientAdminId) => {
      socket.join(clientAdminId);
      console.log(`🧑 Client joined room: ${clientAdminId}`);
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected");
    });
  });

  return io;
}

export { io };
