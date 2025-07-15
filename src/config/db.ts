import mongoose from "mongoose";

const connectDatabase = async () => {
  const uri = process.env.MONGO_URI;
  console.log("Mongo URI at runtime:", uri);

  if (!uri) {
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDatabase;
