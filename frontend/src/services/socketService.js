import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";
let socket = null;

function connect() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ Connected to Socket.IO =", socket.id);
    });
  }
  return socket;
}

function getSocket() {
  if (!socket) return connect();
  return socket;
}

/* ========== EMIT EVENTS (C -> S) ========== */

// Tạo phòng (đúng event backend)
function createRoom(playerName) {
  getSocket().emit("room:create", { playerName });
}

// Vào phòng (đúng event backend)
function joinRoom(roomId, playerName) {
  getSocket().emit("room:join", { roomId, playerName });
}

/* ========== LISTEN EVENTS (S -> C) ========== */

function onRoomCreated(callback) {
  getSocket().on("room:created", callback);
}

function onError(callback) {
  getSocket().on("error", callback);
}

function offAll() {
  if (!socket) return;
  socket.off("room:created");
  socket.off("error");
}

export default {
  connect,
  getSocket,
  createRoom,
  joinRoom,
  onRoomCreated,
  onError,
  offAll,
};
