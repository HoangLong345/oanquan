import { Router } from "express";
import { getRoomInfo } from "../controllers/room.controller.js";

const router = Router();

router.get("/:roomId", getRoomInfo);

export default router;
