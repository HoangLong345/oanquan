// src/services/socketService.js
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

let socket = null;

function connect() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("🔌 Connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected");
    });
  }

  return socket;
}

function getSocket() {
  return socket ?? connect();
}

/* ================= EMIT (Gửi sự kiện LÊN server) ================= */
// ĐÃ CẬP NHẬT: Tên sự kiện dùng (dấu gạch dưới) để khớp với gameManager.js

/**
 * (C -> S) Yêu cầu tạo phòng mới
 */
function createRoom(playerName) {
  // SỬA: "room:create" -> "create_room"
  getSocket().emit("create_room", { playerName });
}

/**
 * (C -> S) Yêu cầu tham gia phòng
 */
function joinRoom(roomId, playerName) {
  // SỬA: "room:join" -> "join_room"
  getSocket().emit("join_room", { roomId, playerName });
}

/**
 * (C -> S) Gửi một nước đi
 * payload sẽ có dạng { cellIndex, direction }
 */
function joinMatchmaking(playerName) {
  getSocket().emit("join_matchmaking", { playerName }); //
}
function onQueueUpdate(cb) {
  getSocket().on("join_matchmaking", cb); //
}
function makeMove(payload) {
  // SỬA: "game:move" -> "make_move"
  getSocket().emit("make_move", payload);
}

/**
 * (C -> S) Gửi tin nhắn
 */
function sendMessage(messageText) {
  // SỬA: "chat:send" -> "send_message"
  getSocket().emit("send_message", {
    message: messageText,
  });
}

/**
 * (C -> S) THÊM MỚI: Rời phòng
 */
function leaveRoom() {
  getSocket().emit("leave_room"); //
}

/* ================= ON (Lắng nghe sự kiện TỪ server) ================= */
// ĐÃ CẬP NHẬT: Tên sự kiện để khớp với gameManager.js

/**
 * (S -> C) Server xác nhận TẠO PHÒNG thành công (chỉ gửi cho người tạo)
 */
function onRoomCreated(cb) {
  // SỬA: "room:created" -> "room_created"
  getSocket().on("room_created", cb);
}

/**
 * (S -> C) Server báo game BẮT ĐẦU (gửi cho cả 2)
 */
function onGameStart(cb) {
  // SỬA: "room:joined" -> "game_start"
  getSocket().on("game_start", cb);
}

/**
 * (S -> C) Server cập nhật lại bàn cờ sau một nước đi
 */
function onUpdateGameState(cb) {
  getSocket().on("update_game_state", cb); // Tên này vẫn giữ nguyên
}

/**
 * (S -> C) Nhận được tin nhắn mới
 */
function onNewMessage(cb) {
  // SỬA: "chat:receive" -> "new_message"
  getSocket().on("new_message", cb);
}

/**
 * (S -> C) Server báo lỗi (VD: phòng đầy, phòng không tồn tại)
 */
function onError(cb) {
  getSocket().on("error", cb); // Tên này vẫn giữ nguyên
}

/**
 * (S -> C) THÊM MỚI: Nước đi không hợp lệ
 */
function onInvalidMove(cb) {
  getSocket().on("invalid_move", cb); //
}

/**
 * (S -> C) THÊM MỚI: Game kết thúc
 */
function onGameOver(cb) {
  getSocket().on("game_over", cb); //
}

/**
 * (S -> C) THÊM MỚI: Bị đá về menu (do đối thủ thoát)
 */
function onKickedToMenu(cb) {
  getSocket().on("kicked_to_menu", cb); //
}

/**
 * Gỡ bỏ tất cả các trình lắng nghe
 */
function offAll() {
  if (!socket) return;

  // ĐÃ CẬP NHẬT TÊN SỰ KIỆN
  socket.off("room_created");
  socket.off("game_start");
  socket.off("update_game_state");
  socket.off("join_matchmaking");
  socket.off("make_move");
  socket.off("send_message");
  socket.off("leave_room");
  socket.off("new_message");
  socket.off("error");
  socket.off("invalid_move");
  socket.off("game_over");
  socket.off("kicked_to_menu");
}

export default {
  connect,
  getSocket,

  // Emits (Gửi đi)
  createRoom,
  joinRoom,
  makeMove,
  sendMessage,
  leaveRoom,
  joinMatchmaking,

  // Ons (Lắng nghe)
  onQueueUpdate,
  onRoomCreated,
  onGameStart,
  onUpdateGameState,
  onNewMessage,
  onError,
  onInvalidMove,
  onGameOver,
  onKickedToMenu,

  offAll,
};
