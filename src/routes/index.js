import { Router } from "express";
import authRoutes from "../modules/auth/auth.route.js";
import adminRoutes from "../modules/admin/admin.route.js";
import userRoutes from "../modules/user/user.route.js";
import eventRoutes from "../modules/event/event.route.js";
import destinationRoutes from "../modules/destionation/destination.route.js";
import serviceRoutes from "../modules/service/service.route.js";
import notificationRoutes from "../modules/notification/notification.route.js";
import { adminOnly, protect } from "../middlewares/authMiddleware.js";

const router = Router();

// Public routes
router.use("/auth", authRoutes);

// Event routes
router.use("/events", eventRoutes);

// Notification routes
router.use("/notifications", notificationRoutes);

// Services routes
router.use("/services", serviceRoutes);

// Destination routes
router.use("/destinations", destinationRoutes);

// User routes
router.use("/users", userRoutes);

// Admin routes (consolidated)
router.use("/admin", adminRoutes);

export default router;
