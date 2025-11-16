// ... imports
import { createRoom } from "../services/room.service.js"; // <--- Import hàm createRoom
import { rooms } from "../data/rooms.js";
import { processMove } from "../services/room.service.js";

// ...

// Hàm initialBoard() giữ nguyên

export function registerRoomHandlers(io, socket) {
  console.log("🟢 New socket:", socket.id);

  // === HÀM TẠO PHÒNG (MỚI) ===
  socket.on("room:create", ({ playerName }) => {
    try {
      const { room, player } = createRoom(playerName, socket.id);

      socket.join(room.id);

      // Trả về cho người tạo phòng
      socket.emit("room:created", {
        // <--- Gửi sự kiện "room:created"
        roomId: room.id,
        playerId: player.id,
        playerSymbol: player.symbol,
      });

      // Gửi state game (chỉ có 1 người chơi)
      io.to(room.id).emit("update_game_state", {
        board: room.board,
        players: room.players,
        currentTurnId: room.currentTurnId,
      });
    } catch (err) {
      socket.emit("error", { message: "Không thể tạo phòng." });
    }
  });

  // === HÀM VÀO PHÒNG (SỬA LẠI) ===
  socket.on("room:join", ({ roomId, playerName }) => {
    // Nếu phòng CHƯA tồn tại -> báo lỗi
    if (!rooms[roomId]) {
      return socket.emit("error", {
        message: "Phòng không tồn tại!",
      });
    }

    const room = rooms[roomId];

    // Không cho vào quá 2 người
    if (room.players.length >= 2) {
      return socket.emit("error", {
        message: "Phòng đã đủ người!",
      });
    }

    // (Các logic còn lại giữ nguyên: tạo player, push vào mảng, socket.join)
    const player = {
      id: socket.id,
      name: playerName,
      symbol: "B", // Người thứ 2 luôn là B
    };

    room.players.push(player);
    socket.join(roomId);

    // Trả dữ liệu riêng cho người mới vào
    socket.emit("room:joined", {
      playerId: player.id,
      playerSymbol: player.symbol,
    });

    // Thông báo cho người khác
    socket.to(roomId).emit("room:player-joined", {
      name: playerName,
    });

    // Gửi state đầy đủ cho tất cả (lúc này đã có 2 người chơi)
    io.to(roomId).emit("update_game_state", {
      board: room.board,
      players: room.players,
      currentTurnId: room.currentTurnId, // Lượt chơi vẫn là của người A
    });
  });
  // === XỬ LÝ NƯỚC ĐI (MỚI) ===
  socket.on("game:move", ({ roomId, playerId, startIndex }) => {
    const room = rooms[roomId];

    // Kiểm tra cơ bản
    if (!room)
      return socket.emit("error", { message: "Không tìm thấy phòng." });
    if (room.players.length < 2)
      return socket.emit("error", { message: "Chưa đủ người chơi." });
    if (room.currentTurnId !== playerId)
      return socket.emit("error", { message: "Chưa tới lượt của bạn." });
    if (room.board[startIndex] === 0)
      return socket.emit("error", { message: "Ô này đã hết quân." });
    io.to(roomId).emit("update_game_state", {
      board: room.board,
      players: room.players,
      currentTurnId: room.currentTurnId,
    });
    // === XỬ LÝ CHAT (MỚI) ===
    socket.on("chat:send", ({ roomId, message, senderName }) => {
      io.to(roomId).emit("chat:receive", {
        // Gửi lại cho cả phòng
        senderName,
        message,
      });
    });
    // ...
    socket.on("disconnect", () => {
      console.log("🔴 Disconnected:", socket.id);
      // TODO: Xử lý khi người chơi thoát
    });
  });
}
