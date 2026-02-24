import express from "express";
import { adminOnly, protect } from "../../middlewares/authMiddleware.js";
import { getAllUsers, getPartnersPremium } from "./user.controller.js";
const router = express.Router();

router.get("/", protect, adminOnly, getAllUsers);
router.get("/premium", getPartnersPremium);

export default router;
