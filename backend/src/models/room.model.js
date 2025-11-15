export class Room {
  constructor(id) {
    this.id = id;
    this.players = []; // { id, name, symbol }
  }

  addPlayer(player) {
    if (this.players.length >= 2) {
      throw new Error("Phòng đã đủ người");
    }

    const symbol = this.players.length === 0 ? "A" : "B";
    const newPlayer = { ...player, symbol };

    this.players.push(newPlayer);
    return newPlayer;
  }
}
