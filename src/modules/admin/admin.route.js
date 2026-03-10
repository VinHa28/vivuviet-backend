import express from "express";
import { adminOnly, protect } from "../../middlewares/authMiddleware.js";
import {
  adminGetServices,
  approvePartner,
  createPost,
  getAdminStats,
  getAllPartners,
  getAllPosts,
  getDestinations,
  getPartnerDetails,
  updateDestination,
} from "./admin.controller.js";
import { loginAdmin } from "../auth/auth.controller.js";
import { getAllUsers } from "../user/user.controller.js";

const router = express.Router();

router.get("/stats", protect, adminOnly, getAdminStats);
router.post("/login", loginAdmin);

// Services
router.get("/services", protect, adminOnly, adminGetServices);

// Users/Partners
router.get("/partners", protect, adminOnly, getAllPartners);
router.get("/partners/:id", protect, adminOnly, getPartnerDetails);
router.get("/users", protect, adminOnly, getAllUsers);
router.patch(
  "/partners/update-status/:userId",
  protect,
  adminOnly,
  approvePartner,
);

// Posts
router.get("/posts", protect, adminOnly, getAllPosts);
router.post("/posts", protect, adminOnly, createPost);

// Destinations
router.get("/destinations", protect, adminOnly, getDestinations);
router.patch("/destinations/:slug", protect, adminOnly, updateDestination);

// Notifications

export default router;
