import express from "express";
import { protect } from "../../middlewares/authMiddleware.js";
import { getNotifications } from "./notification.controller.js";

const router = express.Router();

router.get("/", protect, getNotifications);

export default router;
