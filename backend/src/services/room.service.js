import { rooms } from "../data/rooms.js";
import { Room } from "../models/room.model.js";
import { generateId } from "../utils/generateId.js";

export function createRoom(playerName, socketId) {
  const roomId = generateId(5);
  const room = new Room(roomId);

  const player = room.addPlayer({ id: socketId, name: playerName });

  rooms.set(roomId, room);
  return { room, player };
}

export function joinRoom(roomId, playerName, socketId) {
  const room = rooms.get(roomId);

  if (!room) throw new Error("Phòng không tồn tại");

  const player = room.addPlayer({ id: socketId, name: playerName });

  return { room, player };
}

export function getRoom(roomId) {
  return rooms.get(roomId) || null;
}
