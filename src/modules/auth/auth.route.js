import { Router } from "express";
import { login, getCurrentUser, loginAdmin } from "./auth.controller.js";
import { protect } from "../../middlewares/authMiddleware.js";

const router = Router();

router.post("/login", login);
router.post("/admin/login", loginAdmin);
router.get("/me", protect, getCurrentUser);

export default router;
