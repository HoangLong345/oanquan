<template>
  <div class="room-page">
    <h1>Phòng: {{ roomId }}</h1>
    <p>
      Bạn là: <strong>{{ playerName }}</strong>
    </p>

    <!-- ========== PLAYER INFO ========== -->
    <PlayerInfo
      :players="players"
      :currentTurnId="currentTurnId"
      class="player-box"
    />

    <!-- ========== GAME BOARD ========== -->
    <GameBoard
      v-if="board.length"
      :board="board"
      :canMove="playerId === currentTurnId"
      @move="handleMove"
    />

    <!-- ========== CHAT BOX ========== -->
    <ChatBox :messages="messages" @send="sendMessage" class="chat-box" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import socketService from "../services/socketService";

import ChatBox from "../components/ChatBox.vue";
import PlayerInfo from "../components/PlayerInfo.vue";
import GameBoard from "../components/GameBoard.vue"; // cần có file này

/* =======================================
                STATE
======================================= */

const route = useRoute();

const roomId = route.params.roomId;
const playerName = route.query.playerName;

const playerId = ref("");
const playerSymbol = ref("");

const players = ref([]);
const board = ref([]);

const currentTurnId = ref("");

const messages = ref([]);

/* =======================================
              SOCKET HANDLERS
======================================= */

onMounted(() => {
  console.log("▶ Joining room", roomId, "as", playerName);

  // gửi join_room
  socketService.joinRoom(roomId, playerName);

  // backend trả về thông tin phòng sau khi join
  socketService.getSocket().on("room:joined", (data) => {
    console.log("✔ Joined:", data);

    playerId.value = data.playerId;
    playerSymbol.value = data.playerSymbol;
  });

  // có người vào mới
  socketService.getSocket().on("room:player-joined", (data) => {
    messages.value.push({
      senderName: "Hệ thống",
      message: `${data.name} đã vào phòng`,
    });
  });

  // Cập nhật state game từ backend
  socketService.getSocket().on("update_game_state", (state) => {
    board.value = state.board;
    players.value = state.players;
    currentTurnId.value = state.currentTurnId;
  });

  // Nhận tin nhắn chat mới
  socketService.getSocket().on("new_message", (msg) => {
    messages.value.push(msg);
  });

  socketService.getSocket().on("error", (err) => {
    console.log("⚠ Backend error:", err);
    alert(err.message);
  });
});

onBeforeUnmount(() => {
  socketService.offAll();
});

/* =======================================
            USER ACTIONS
======================================= */

// gửi nước đi
function handleMove(index) {
  socketService.makeMove({
    roomId,
    playerId: playerId.value,
    startIndex: index,
  });
}

// gửi tin nhắn chat
function sendMessage(text) {
  socketService.sendMessage(roomId, text);
}
</script>

<style scoped>
.room-page {
  padding: 20px 30px;
}

.player-box {
  margin-bottom: 20px;
}

.chat-box {
  margin-top: 30px;
}
</style>
