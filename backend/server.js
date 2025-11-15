import http from "http";
import app from "./src/app.js";
import { initSocket } from "./config/socket.config.js";

const PORT = 3000;

const server = http.createServer(app);

// Khởi động socket.io
initSocket(server);

server.listen(PORT, () => {
  console.log(`🔥 Backend đang chạy tại http://localhost:${PORT}`);
});
