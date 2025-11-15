import { generateId } from "../utils/generateId.js";
import { rooms } from "../data/rooms.js";

export function createRoom(playerName, socketId) {
  const roomId = generateId(5);

  rooms[roomId] = {
    id: roomId,
    board: null, // board sẽ được tạo khi join
    players: [],
    currentTurnId: null,
  };

  const player = {
    id: socketId,
    name: playerName,
    symbol: "A",
    score: 0,
  };

  rooms[roomId].players.push(player);

  return { room: rooms[roomId], player };
}
