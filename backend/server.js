import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { registerRoomHandlers } from "./src/sockets/room.socket.js";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);
  registerRoomHandlers(io, socket);
});

server.listen(3000, () => {
  console.log("🚀 Server chạy cổng 3000");
});
