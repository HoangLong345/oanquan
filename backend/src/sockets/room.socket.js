import { rooms } from "../data/rooms.js";

function initialBoard() {
  return [
    5,
    5,
    5,
    5,
    5, // hàng A
    0, // ô quan trái
    5,
    5,
    5,
    5,
    5, // hàng B
    0, // ô quan phải
  ];
}

export function registerRoomHandlers(io, socket) {
  console.log("🟢 New socket:", socket.id);

  socket.on("room:join", ({ roomId, playerName }) => {
    // Nếu phòng chưa tồn tại → tạo phòng
    if (!rooms[roomId]) {
      rooms[roomId] = {
        id: roomId,
        board: initialBoard(),
        players: [],
        currentTurnId: null,
      };
    }

    const room = rooms[roomId];

    // Không cho vào quá 2 người
    if (room.players.length >= 2) {
      return socket.emit("error", {
        message: "Phòng đã đủ người!",
      });
    }

    const player = {
      id: socket.id,
      name: playerName,
      symbol: room.players.length === 0 ? "A" : "B",
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

    // Gửi state đầy đủ cho tất cả
    io.to(roomId).emit("update_game_state", {
      board: room.board,
      players: room.players,
      currentTurnId: room.currentTurnId,
    });
  });

  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);
  });
}
