import { loadEnv } from "./src/utils/envLoader";
loadEnv(); // 👈 FIRST LINE

import app from "./src/app";
import { initSocket } from "./src/utils/socket";

console.log("APP_ENV IN SERVER:", process.env.APP_ENV);
console.log("DATABASE_URL  IN SERVER:", process.env.DATABASE_URL);

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Start socket server
initSocket(server);

// backend/server/server.ts
