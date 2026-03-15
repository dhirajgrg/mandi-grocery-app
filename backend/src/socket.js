import { Server } from "socket.io";
import { jwtVerifyToken } from "./utils/jwtToken-utils.js";
import User from "./models/user-models.js";

let io;

export const initSocket = (httpServer, corsOrigins) => {
  io = new Server(httpServer, {
    cors: {
      origin: corsOrigins,
      credentials: true,
    },
  });

  // Authenticate socket connections via JWT
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.cookie
          ?.split(";")
          .find((c) => c.trim().startsWith("token="))
          ?.split("=")[1];

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwtVerifyToken(token);
      const user = await User.findById(decoded.id).select("_id role name");
      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    // Join user-specific room
    socket.join(`user:${socket.user._id}`);

    // Admins join the admins room
    if (socket.user.role === "admin") {
      socket.join("admins");
    }

    socket.on("disconnect", () => {
      // cleanup handled automatically
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};
