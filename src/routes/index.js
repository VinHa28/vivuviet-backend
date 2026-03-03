import { Router } from "express";
import authRoutes from "../modules/auth/auth.route.js";
import adminRoutes from "../modules/admin/admin.route.js";
import userRoutes from "../modules/user/user.route.js";
import eventRoutes from "../modules/event/event.route.js";
import destinationRoutes from "../modules/destionation/destination.route.js";
import serviceRoutes from "../modules/service/service.route.js";

const router = Router();

// Public routes
router.use("/auth", authRoutes);

// Event routes
router.use("/events", eventRoutes);

// Services routes
router.use("/services", serviceRoutes);
// Admin routes (consolidated)
router.use("/admin", adminRoutes);
router.use("/users", userRoutes);
router.use("/destinations", destinationRoutes);

export default router;
