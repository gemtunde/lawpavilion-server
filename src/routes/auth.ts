import { Router } from "express";
import { body } from "express-validator";
import authController, {
  forgotPasswordValidation,
  loginValidation,
  registerValidation,
  resetPasswordValidation,
} from "../controllers/authController";
import { validateRequest } from "../middlewares/validationREquest";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

// Register
router.post(
  "/register",
  validateRequest,
  registerValidation,
  authController.register
);
router.post("/login", validateRequest, loginValidation, authController.login);

router.post("/refresh", authController.refreshToken);
router.post(
  "/forgot-password",
  validateRequest,
  forgotPasswordValidation,
  authController.forgotPassword
);

// Reset password
router.post(
  "/reset-password",
  resetPasswordValidation,
  authController.resetPassword
);

router.post(`/verify-email/:token`, authController.verifyEmail);

// Get current user
router.get("/me", authenticateToken, (req: any, res) => {
  res.json({
    user: {
      id: req.userId,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      isVerified: req.user.isVerified,
    },
  });
});

router.post("/logout", authenticateToken, authController.logout);
router.post("/logout-all", authenticateToken, authController.logoutAll);
router.post(
  "/resend-verification",
  authenticateToken,
  authController.resendEmailVerification
);

// Change password (requires authentication)
//router.post('/change-password', authenticateToken, authController.changePassword);

export default router;
