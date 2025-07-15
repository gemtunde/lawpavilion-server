import { IUser, User } from "../models/User";

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
}
class UserService {
  async getUserById(userId: string): Promise<IUser | null> {
    return User.findById(userId);
  }
  async updateProfile(
    userId: string,
    updateData: UpdateProfileData
  ): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if email is being changed and if it's already taken
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({ email: updateData.email });
      if (existingUser) {
        throw new Error("Email is already taken");
      }
      // If email is changed, mark as unverified
      user.isVerified = false;
      user.verificationToken = user.generateVerificationToken();
    }

    // Update fields
    if (updateData.firstName) user.firstName = updateData.firstName;
    if (updateData.lastName) user.lastName = updateData.lastName;
    if (updateData.email) user.email = updateData.email;

    await user.save();
    return user;
  }
}

export default new UserService();
