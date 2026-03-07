import express from "express";
import { adminOnly, protect } from "../../middlewares/authMiddleware.js";
import {
  adminGetServices,
  createPost,
  getAdminStats,
  getAllPartners,
  getAllPosts,
  getPartnerService,
  getPartnerStats,
} from "./admin.controller.js";
import { loginAdmin } from "../auth/auth.controller.js";

const router = express.Router();

router.get("/stats", protect, adminOnly, getAdminStats);
router.post("/login", loginAdmin);

router.get("/services", protect, adminOnly, adminGetServices);
router.get("/partners", protect, adminOnly, getAllPartners);
router.get("/partners/:id", protect, adminOnly, getPartnerStats);
router.get("/partners/:id/services", protect, adminOnly, getPartnerService);
router.get("/posts", protect, adminOnly, getAllPosts);
router.post("/posts", protect, adminOnly, createPost);

export default router;
