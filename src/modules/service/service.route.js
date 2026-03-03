import express from "express";
import { protect } from "../../middlewares/authMiddleware.js";
import { createPartnerService, getAllServices } from "./service.controller.js";

const router = express.Router();

router.get("/", getAllServices);
router.post("/partner-proposal", protect, createPartnerService);

export default router;
