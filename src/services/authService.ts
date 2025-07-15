import jwt from "jsonwebtoken";
import { IUser, User } from "../models/User";
import {
  sendEmailVerification,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "./emailService";
import transactionService from "./transactionService";
//import User, { IUser } from "../models/User";
//import emailService from "./emailService";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your-refresh-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  country: string;
}

interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  generateTokens(userId: string): TokenPair {
    const accessToken = jwt.sign({ userId }, JWT_SECRET, {
      expiresIn: "25m",
    });
    const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    return { accessToken, refreshToken };
  }

  async register(
    userData: RegisterData
  ): Promise<{ user: IUser; tokens: TokenPair }> {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    // Create new user
    const user = new User(userData);
    const verificationToken = user.generateVerificationToken();
    await user.save();

    // Generate tokens
    const tokens = this.generateTokens(user._id);

    // Add refresh token to user
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    // Seed demo transactions
    await transactionService.createDemoTransactionsForUser(user._id);

    // Send verification email
    try {
      await sendEmailVerification(
        user.email,
        verificationToken,
        user.firstName
      );
    } catch (error) {
      console.error("Failed to send verification email:", error);
    }

    return { user, tokens };
  }
  async resendEmailVerification(
    user: IUser
  ): Promise<{ user: IUser; tokens: TokenPair }> {
    // Check if user already exists
    // const existingUser = await User.findOne({ email: userData.email });
    // const userExist = await User.findById(userId);
    if (user.isVerified) {
      throw new Error("User already verified");
    }

    // Create new user
    // const user = new User(userData);
    const verificationToken = user.generateVerificationToken();
    await user.save();

    // Generate tokens
    const tokens = this.generateTokens(user._id);

    // Add refresh token to user
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    // Send verification email
    try {
      await sendEmailVerification(
        user.email,
        verificationToken,
        user.firstName
      );
    } catch (error) {
      console.error("Failed to send verification email:", error);
    }

    return { user, tokens };
  }

  async login(
    loginData: LoginData
  ): Promise<{ user: IUser; tokens: TokenPair }> {
    // Find user by email
    const user = await User.findOne({ email: loginData.email });
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Check password
    const isPasswordValid = await user.comparePassword(loginData.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate tokens
    const tokens = this.generateTokens(user._id);

    // Add refresh token to user
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    return { user, tokens };
  }
  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
        userId: string;
      };

      // Find user and check if refresh token exists
      const user = await User.findById(decoded.userId);
      if (!user || !user.refreshTokens.includes(refreshToken)) {
        throw new Error("Invalid refresh token");
      }

      // Generate new tokens
      const tokens = this.generateTokens(user._id);

      // Replace old refresh token with new one
      user.refreshTokens = user.refreshTokens.filter(
        (token) => token !== refreshToken
      );
      user.refreshTokens.push(tokens.refreshToken);
      await user.save();

      return tokens;
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    const user = await User.findById(userId);
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(
        (token) => token !== refreshToken
      );
      await user.save();
    }
  }
  async logoutAll(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (user) {
      user.refreshTokens = [];
      await user.save();
    }
  }

  async verifyEmail(token: string): Promise<IUser> {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      throw new Error("Invalid or expired verification token");
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.firstName);
    } catch (error) {
      console.error("Failed to send welcome email:", error);
    }

    return user;
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not
      return;
    }

    const resetToken = user.generateResetPasswordToken();
    await user.save();

    try {
      await sendPasswordResetEmail(user.email, resetToken, user.firstName);
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      throw new Error("Failed to send password reset email");
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new Error("Invalid or expired reset token");
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshTokens = []; // Logout from all devices
    await user.save();
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    user.password = newPassword;
    user.refreshTokens = []; // Logout from all devices
    await user.save();
  }
}

export default new AuthService();
