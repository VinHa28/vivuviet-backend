import { Router } from "express";
import {
  getAcitveDestinations,
  getDestinationContent,
  getDestinationDetail,
} from "./destination.controller.js";

const router = Router();

router.get("/:code/posts", getDestinationContent);
router.get("/list", getAcitveDestinations);
router.get("/active", getAcitveDestinations);
router.get("/:slug", getDestinationDetail);
export default router;
