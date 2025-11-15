import { Server } from "socket.io";
import { registerRoomHandlers } from "../src/sockets/room.socket.js";

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("⚡ Client connected:", socket.id);
    registerRoomHandlers(io, socket);
  });
}

export function getIO() {
  return io;
}
