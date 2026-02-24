import { Router } from "express";
import {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    getUpcomingEvents,
    getActiveEvents,
} from "./event.controller.js";
import { protect, adminOnly } from "../../middlewares/authMiddleware.js";

const router = Router();

// Specific routes (must be before /:id)
router.get("/upcoming", getUpcomingEvents); // Lấy events sắp tới
router.get("/active", getActiveEvents); // Lấy events đang diễn ra

// General routes
router.get("/", getAllEvents); // Lấy tất cả events, có thể lọc theo month, status
router.get("/:id", getEventById); // Lấy chi tiết event

// Admin routes (protected)
router.post("/", protect, adminOnly, createEvent); // Tạo event mới
router.put("/:id", protect, adminOnly, updateEvent); // Cập nhật event
router.delete("/:id", protect, adminOnly, deleteEvent); // Xóa event (soft delete)

export default router;
