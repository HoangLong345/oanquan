import { getRoom } from "../services/room.service.js";

export function getRoomInfo(req, res) {
  const roomId = req.params.roomId;
  const room = getRoom(roomId);

  if (!room) return res.status(404).json({ message: "Phòng không tồn tại" });

  res.json(room);
}
