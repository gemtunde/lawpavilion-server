import { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import userService from "../services/userService";

export const updateProfileValidation = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("First name cannot be empty"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Last name cannot be empty"),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
];

class UserController {
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const user = await userService.getUserById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get user profile",
      });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
        return;
      }

      const userId = (req as any).user.userId;
      const { firstName, lastName, email } = req.body;

      const user = await userService.updateProfile(userId, {
        firstName,
        lastName,
        email,
      });

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: { user },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update profile",
      });
    }
  }
}
export default new UserController();
