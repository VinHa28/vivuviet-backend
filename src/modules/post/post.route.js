import express from "express";
import { upload } from "../../middlewares/uploadMiddleware.js";
import { protect } from "../../middlewares/authMiddleware.js";
import { getPartnerPosts, partnerCreatePost } from "./post.controller.js";

const router = express.Router();

const uploadFields = upload.fields([
  { name: "bannerImage", maxCount: 1 },
  { name: "galleryImages", maxCount: 10 },
]);

router.get("/partner-posts", protect, uploadFields, getPartnerPosts);

router.post("/", protect, uploadFields, partnerCreatePost);

export default router;
