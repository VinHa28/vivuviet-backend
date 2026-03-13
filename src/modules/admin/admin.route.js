import express from "express";
import { adminOnly, protect } from "../../middlewares/authMiddleware.js";
import {
  adminGetServices,
  approvePartner,
  createPost,
  deletePost,
  getAdminStats,
  getAllPartners,
  getAllPosts,
  getDestinations,
  getPartnerDetails,
  updateDestination,
  updatePost,
  updatePostStatus,
} from "./admin.controller.js";
import { loginAdmin } from "../auth/auth.controller.js";
import { getAllUsers } from "../user/user.controller.js";
import { upload } from "../../middlewares/uploadMiddleware.js";

const router = express.Router();

const uploadFields = upload.fields([
  { name: "bannerImage", maxCount: 1 },
  { name: "galleryImages", maxCount: 10 },
]);

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
router.post("/posts", protect, adminOnly, uploadFields, createPost);
router.put("/posts/:id", protect, adminOnly, uploadFields, updatePost);
router.delete("/posts/:id", protect, adminOnly, deletePost);
router.patch("/posts/:id/status", protect, adminOnly, updatePostStatus);

// Destinations
router.get("/destinations", protect, adminOnly, getDestinations);
router.patch("/destinations/:slug", protect, adminOnly, updateDestination);

// Notifications

export default router;
