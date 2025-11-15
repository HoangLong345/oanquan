<template>
  <div class="game-wrapper">
    <h2>Bàn chơi Ô Ăn Quan</h2>

    <!-- BOARD -->
    <div class="board">
      <div
        v-for="(cell, index) in board"
        :key="index"
        :class="['cell', { clickable: isClickable(index) }]"
        @click="handleClick(index)"
      >
        <span>{{ cell }}</span>
      </div>
    </div>

    <!-- TURN INFO -->
    <div class="turn-box">
      <strong>Lượt của:</strong> {{ currentTurnName }}
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  board: { type: Array, required: true },
  players: { type: Array, required: true },
  playerId: { type: String, required: true },
  currentTurnId: { type: String, required: true },
});

const emits = defineEmits(["move"]);

// Tên người đang chơi
const currentTurnName = computed(() => {
  const p = props.players.find((x) => x.id === props.currentTurnId);
  return p ? p.name : "Đang chờ";
});

// Ô có thể bấm được không
function isClickable(index) {
  // Không cho bấm vào 2 ô Quan
  if (index === 0 || index === props.board.length - 1) return false;

  // Chỉ được bấm khi tới lượt mình
  return props.playerId === props.currentTurnId;
}

function handleClick(index) {
  if (!isClickable(index)) return;
  emits("move", index);
}
</script>

<style scoped>
.game-wrapper {
  margin-top: 20px;
  text-align: center;
}

.board {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 6px;
  margin: 20px auto;
  max-width: 850px;
}

.cell {
  padding: 14px 8px;
  background: white;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 18px;
}

.cell.clickable {
  background: #d1fae5;
  cursor: pointer;
}

.cell.clickable:hover {
  background: #bbf7d0;
}

.turn-box {
  margin-top: 12px;
  font-size: 18px;
}
</style>
