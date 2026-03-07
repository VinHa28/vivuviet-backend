import express from "express";
import { getPartnersPremium } from "./user.controller.js";
const router = express.Router();

router.get("/premium", getPartnersPremium);

export default router;
