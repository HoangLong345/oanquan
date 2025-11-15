import { createRoom, joinRoom } from "../services/room.service.js";

export function registerRoomHandlers(io, socket) {
  console.log("🟢 New socket:", socket.id);

  // Tạo phòng
  socket.on("room:create", ({ playerName }) => {
    try {
      const { room, player } = createRoom(playerName, socket.id);

      socket.join(room.id);

      socket.emit("room:created", {
        roomId: room.id,
        playerId: player.id,
        playerSymbol: player.symbol,
      });
    } catch (err) {
      socket.emit("error", { message: err.message });
    }
  });

  // Vào phòng
  socket.on("room:join", ({ roomId, playerName }) => {
    try {
      const { room, player } = joinRoom(roomId, playerName, socket.id);

      socket.join(room.id);

      socket.emit("room:joined", {
        roomId: room.id,
        playerId: player.id,
        playerSymbol: player.symbol,
      });

      socket.to(room.id).emit("room:player-joined", {
        name: player.name,
      });
    } catch (err) {
      socket.emit("error", { message: err.message });
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
}
