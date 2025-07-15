import { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import authService from "../services/authService";
import transactionService from "../services/transactionService";
//import authService from "../services/authService";

export const registerValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("firstName")
    .trim()
    .isLength({ min: 1 })
    .withMessage("First name is required"),
  body("lastName")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Last name is required"),
  body("country")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Last name is required"),
];

export const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const forgotPasswordValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
];
export const resetPasswordValidation = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, country } = req.body;
      const result = await authService.register({
        email,
        password,
        firstName,
        lastName,
        country,
      });

      res.status(201).json({
        success: true,
        message:
          "User registered successfully. Please check your email to verify your account.",
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Registration failed",
      });
    }
  }
  async resendEmailVerification(req: Request, res: Response): Promise<void> {
    try {
      //  const { email, password, firstName, lastName, country } = req.body;
      const user = (req as any).user;
      //  console.log("User in resendEmailVerification:", user);
      const result = await authService.resendEmailVerification(user);

      res.status(201).json({
        success: true,
        message:
          "User registered successfully. Please check your email to verify your account.",
        // data: {
        //   user: result.user,
        //   accessToken: result.tokens.accessToken,
        //   refreshToken: result.tokens.refreshToken,
        // },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Registration failed",
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });

      // Set cookies
      res.cookie("accessToken", result.tokens.accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 25 * 60 * 1000,
      });

      res.cookie("refreshToken", result.tokens.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        message: "Login successful",
        data: {
          id: result.user._id,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          email: result.user.email,
          isVerified: result.user.isVerified,
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
        },
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || "Login failed",
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const userId = (req as any).user.userId;

      if (refreshToken) {
        await authService.logout(userId, refreshToken);
      }

      res.json({
        success: true,
        message: "Logout successful",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Logout failed",
      });
    }
  }

  async logoutAll(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      await authService.logoutAll(userId);

      res.json({
        success: true,
        message: "Logged out from all devices successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Logout failed",
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      //const { refreshToken } = req.body;
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: "Refresh token is required",
        });
        return;
      }

      const tokens = await authService.refreshToken(refreshToken);
      res
        .cookie("accessToken", tokens.accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .cookie("refreshToken", tokens.refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        });

      res.json({
        success: true,
        message: "Tokens refreshed successfully",
        data: tokens,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || "Token refresh failed",
      });
    }
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      // const { token } = req.body;
      const { token } = req.params;
      console.log("Token received:", token);

      if (!token) {
        res.status(400).json({
          success: false,
          message: "Verification token is required",
        });
        return;
      }

      const user = await authService.verifyEmail(token);

      res.json({
        success: true,
        message: "Email verified successfully",
        data: { user },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Email verification failed",
      });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);

      res.json({
        success: true,
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to process password reset request",
      });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      await authService.resetPassword(token, newPassword);

      res.json({
        success: true,
        message: "Password reset successful",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Password reset failed",
      });
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = (req as any).user.userId;

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: "Current password and new password are required",
        });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters long",
        });
        return;
      }

      await authService.changePassword(userId, currentPassword, newPassword);

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Password change failed",
      });
    }
  }
}

export default new AuthController();
