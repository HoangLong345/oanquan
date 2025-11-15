<template>
  <div class="game-wrapper">
    <h2>Bàn chơi Ô Ăn Quan</h2>

    <!-- Board -->
    <div class="board">
      <div
        v-for="(cell, index) in board"
        :key="index"
        :class="['cell', { clickable: canMove(index) }]"
        @click="handleClick(index)"
      >
        <span>{{ cell }}</span>
      </div>
    </div>

    <!-- Turn -->
    <div class="turn-box"><strong>Lượt của:</strong> {{ currentTurnName }}</div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  board: Array,
  currentTurnId: String,
  players: Array,
  playerId: String,
});

const emits = defineEmits(["move"]);

// Xác định tên người đang chơi
const currentTurnName = computed(() => {
  const p = props.players.find((p) => p.id === props.currentTurnId);
  return p ? p.name : "Đang chờ";
});

// Kiểm tra ô có thể click không
function canMove(index) {
  // Ví dụ: chỉ được click ô dân (không phải ô quan)
  if (index === 0 || index === props.board.length - 1) return false;

  // Chỉ lượt của mình mới được đi
  return props.currentTurnId === props.playerId;
}

function handleClick(index) {
  if (!canMove(index)) return;
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
