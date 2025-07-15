import express from "express";
import { authenticateToken } from "../middlewares/auth";
import userController, {
  updateProfileValidation,
} from "../controllers/userController";

const router = express.Router();

// Get user profile
//router.get("/profile", authenticateToken, userController.getProfile);

// Update user profile
router.post(
  "/profile",
  authenticateToken,
  updateProfileValidation,
  userController.updateProfile
);

export default router;
