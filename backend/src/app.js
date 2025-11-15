import express from "express";
import cors from "cors";
import roomRoutes from "./routes/room.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// REST API
app.use("/api/rooms", roomRoutes);

export default app;
