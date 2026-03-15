import express from "express";
import { protect } from "../../middlewares/authMiddleware.js";
import {
  createPartnerService,
  deleteService,
  getAllServices,
  getPartnerServices,
  updatePartnerService,
} from "./service.controller.js";
import { upload } from "../../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/", getAllServices);
router.post("/", protect, upload.single("image"), createPartnerService);

router.delete("/:id", protect, deleteService);
router.put("/:id", protect, upload.single("image"), updatePartnerService);
router.get("/my-services", protect, getPartnerServices);

export default router;
