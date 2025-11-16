// ... imports
import { initialBoard } from "../sockets/room.socket.js"; // Import hàm initialBoard

export function createRoom(playerName, socketId) {
  const roomId = generateId(5);

  rooms[roomId] = {
    id: roomId,
    board: initialBoard(), // <--- Gán bàn cờ ngay khi tạo
    players: [],
    currentTurnId: socketId, // <--- Gán lượt chơi cho người tạo phòng
  };

  const player = {
    id: socketId,
    name: playerName,
    symbol: "A",
    // score: 0, // Bạn có thể thêm điểm số sau
  };

  rooms[roomId].players.push(player);

  return { room: rooms[roomId], player };
}
