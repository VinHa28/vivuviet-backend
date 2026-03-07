import { Router } from "express";
import { login, getCurrentUser, registerPartner } from "./auth.controller.js";
import { protect } from "../../middlewares/authMiddleware.js";

const router = Router();

router.post("/register-partner", registerPartner);
router.post("/login", login);
router.get("/me", protect, getCurrentUser);

export default router;
