import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
//import paymentRoutes from "./routes/payments";
import transactionRoutes from "./routes/transactions";
import { errorHandler } from "./middlewares/errorHandler";
//import webhookRoutes from "./routes/webhook";
import metricsRoutes from "./routes/metrics";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// 👇 Add this line after cors
//app.options("*", cors());

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Import routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/metrics", metricsRoutes);

// app.use("/api/payments", paymentRoutes);
// app.use("/api/webhook", webhookRoutes);

// Error handling
app.use(errorHandler);

export default app;
