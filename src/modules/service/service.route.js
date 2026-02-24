import express from "express";
import { protect } from "../../middlewares/authMiddleware.js";
import { createPartnerService } from "./service.controller.js";

const router = express.Router();

router.post("/partner-proposal", protect, createPartnerService);

export default router;
