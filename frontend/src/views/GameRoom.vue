<template>
  <div class="game-room">
    <div v-if="gameState && gameState.board" class="game-container">
      <PlayerInfo
        :player="player1"
        :isMyTurn="isPlayer1Turn"
        :symbol="player1?.symbol"
      />

      <div class="board-area">
        <GameBoard
          :board="gameState.board"
          :scores="gameState.scores"
          :debt="gameState.debt"
          :isMyTurn="isMyTurn"
          :myPlayerSymbol="myPlayerSymbol"
          @make-move="handleMove"
        />
        <p class="game-message">{{ gameState.gameMessage }}</p>
      </div>

      <PlayerInfo
        :player="player2"
        :isMyTurn="isPlayer2Turn"
        :symbol="player2?.symbol"
      />

      <ChatBox
        :messages="messages"
        :myPlayerName="myPlayerName"
        @send-message="handleSendMessage"
      />
    </div>

    <div v-else class="loading-container">
      <h2>Đang tải bàn cờ hoặc chờ người chơi 2...</h2>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import socketService from "../services/socketService";
import GameBoard from "../components/GameBoard.vue";
import PlayerInfo from "../components/PlayerInfo.vue";
import ChatBox from "../components/ChatBox.vue";

const route = useRoute();
const router = useRouter();

// Lấy thông tin của chính mình từ URL Query (Đã sửa ở Home.vue)
const myPlayerId = ref(route.query.playerId);
const myPlayerName = ref(route.query.playerName);
const myPlayerSymbol = ref(route.query.playerSymbol);

const gameState = ref(null); // Bắt đầu là null
const messages = ref([]);

onMounted(() => {
  // Logic này đã đúng
  const initialState = history.state.initialState;

  if (initialState) {
    // --- DÀNH CHO P2 (Join) HOẶC P1/P2 (Matchmaking) ---
    console.log("P2/Matchmaking: Tải state từ router...");
    gameState.value = initialState;
    gameState.value.gameMessage = "Trận đấu bắt đầu!";
    history.replaceState({ ...history.state, initialState: null }, "");
  }

  // --- DÀNH CHO P1 (Tạo phòng) ---
  socketService.onGameStart((payload) => {
    if (!gameState.value) {
      console.log("P1: Nhận sự kiện game_start...");
      gameState.value = payload;
      gameState.value.gameMessage = "Trận đấu bắt đầu!";
    }
  });

  // --- Gắn các trình lắng nghe chung ---
  socketService.onUpdateGameState((payload) => {
    console.log("Cập nhật state:", payload);
    if (gameState.value) {
      gameState.value.board = payload.board;
      gameState.value.nextTurnPlayerId = payload.nextTurnPlayerId;
      gameState.value.scores = payload.scores;
      gameState.value.debt = payload.debt;
      gameState.value.gameMessage = payload.gameMessage;
    }
  });

  socketService.onInvalidMove((payload) => {
    if (gameState.value) {
      gameState.value.gameMessage = `Nước đi không hợp lệ: ${payload.message}`;
    }
  });

  socketService.onGameOver((payload) => {
    console.log("GAME OVER:", payload);
    if (gameState.value) {
      // Cập nhật điểm số lần cuối
      if (payload.finalScoresInStones) {
        gameState.value.scores = payload.finalScoresInStones;
      }
      gameState.value.gameMessage = `GAME OVER! ${payload.gameMessage}`;
    }
    setTimeout(() => {
      alert(`GAME OVER! ${payload.gameMessage}`);
    }, 500);
  });

  socketService.onNewMessage((payload) => {
    console.log("CHAT:", payload);
    messages.value.push(payload);
  });

  socketService.onKickedToMenu((payload) => {
    alert(payload.message);
    router.push({ name: "Home" });
  });
}); // Kết thúc onMounted

onBeforeUnmount(() => {
  // Dọn dẹp listener KHI RỜI PHÒNG GAME
  socketService.offAll();
  socketService.leaveRoom(); // Báo cho server biết mình rời đi
});

// ======================================================
// ⭐ SỬA LỖI: Thêm Optional Chaining ('?.')
// ======================================================
const player1 = computed(() => {
  return gameState.value?.players[0]; // Phải dùng '?.'
});

const player2 = computed(() => {
  return gameState.value?.players[1]; // Phải dùng '?.'
});

const isMyTurn = computed(() => {
  return gameState.value?.nextTurnPlayerId === myPlayerId.value; // Phải dùng '?.'
});

const isPlayer1Turn = computed(() => {
  return gameState.value?.nextTurnPlayerId === gameState.value?.players[0]?.id; // Phải dùng '?.'
});

const isPlayer2Turn = computed(() => {
  return gameState.value?.nextTurnPlayerId === gameState.value?.players[1]?.id; // Phải dùng '?.'
});

// === CÁC HÀM XỬ LÝ GAME ===
function handleMove(cellIndex, direction) {
  if (!isMyTurn.value) {
    console.log("Không phải lượt của bạn!");
    return;
  }
  console.log(`Gửi nước đi: Ô ${cellIndex}, Hướng ${direction}`);
  socketService.makeMove({ cellIndex, direction });
}

function handleSendMessage(messageText) {
  socketService.sendMessage(messageText);
}
</script>

<style scoped>
.loading-container {
  padding-top: 100px;
  text-align: center;
  color: white;
  font-size: 1.5rem;
}
.game-room {
  padding: 20px 30px;
  max-width: 1200px;
  margin: 0 auto;
}
.game-container {
  color: white;
  display: grid;
  grid-template-columns: 250px 1fr 250px;
  gap: 20px;
  align-items: flex-start;
}

/* Căn chỉnh lại layout (ví dụ) */
.game-container > :nth-child(1) {
  /* Player 1 Info */
  grid-column: 1;
}
.board-area {
  /* Vùng bàn cờ và tin nhắn */
  grid-column: 2;
  text-align: center;
}
.game-container > :nth-child(3) {
  /* Player 2 Info */
  grid-column: 3;
}
.game-container > :nth-child(4) {
  /* Chat Box */
  grid-column: 1 / 4; /* Chat box chiếm toàn bộ chiều rộng bên dưới */
  margin-top: 20px;
}
.game-message {
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffeb3b; /* Màu vàng */
  margin-top: 15px;
  min-height: 2em;
}
</style>
