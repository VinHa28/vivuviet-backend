import express from "express";
import {
  getPartnerDashboardData,
  getPartnersPremium,
} from "./user.controller.js";
import { protect } from "../../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/premium", getPartnersPremium);
router.get("/profiles", protect, getPartnerDashboardData);

export default router;
