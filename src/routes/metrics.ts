import express from "express";
import { authenticateToken } from "../middlewares/auth";
import { metricsController } from "../controllers/metricsController";
//import { authenticateToken } from "../middlewares/authMiddleware";
//import { dashboardController } from "../controllers/dashboardController";

const router = express.Router();

router.get("/", authenticateToken, metricsController.getMetrics);

export default router;
