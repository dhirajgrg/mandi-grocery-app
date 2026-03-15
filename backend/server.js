import "dotenv/config";
import http from "http";
import app from "./src/app.js";
import connectDB from "./src/db/db.js";
import { initSocket } from "./src/socket.js";

const BASE_PORT = Number(process.env.PORT) || 3000;
const PORT_RETRY_ATTEMPTS = Number(process.env.PORT_RETRY_ATTEMPTS) || 5;

const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const startServer = () => {
  try {
    connectDB();
    const server = http.createServer(app);

    // Initialize Socket.IO
    initSocket(server, corsOrigins);

    const listenWithRetry = (port, remainingRetries) => {
      server.once("error", (error) => {
        if (error.code === "EADDRINUSE" && remainingRetries > 0) {
          const nextPort = port + 1;
          console.warn(
            `Port ${port} is in use. Retrying on port ${nextPort}...`,
          );
          listenWithRetry(nextPort, remainingRetries - 1);
          return;
        }

        console.error("unable to start server :", error.message);
        process.exit(1);
      });

      server.listen(port, () => {
        console.log(`server is listening on port : ${port} 😍😍😍`);
      });
    };

    listenWithRetry(BASE_PORT, PORT_RETRY_ATTEMPTS);
  } catch (error) {
    console.error("unable to start server :", error.message);
  }
};

startServer();
