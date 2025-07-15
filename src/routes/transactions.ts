import express from "express";
import TransactionController, {
  createTransactionValidation,
} from "../controllers/transactionController";
import { authenticateToken } from "../middlewares/auth";
import transactionController from "../controllers/transactionController";

const router = express.Router();

// // Create transaction
router.post(
  "/",
  authenticateToken,
  createTransactionValidation,
  transactionController.createTransaction
);
router.get("/", authenticateToken, transactionController.getAll);
// router.get("/:id",  authenticateToken, transactionController.getById);

export default router;

// import express from "express";
// import { authenticateToken } from "../middlewares/auth";
// import transactionController, {
//   createTransactionValidation,
// } from "../controllers/transactionController";

// const router = express.Router();

// // Create transaction
// router.post(
//   "/",
//   authenticateToken,
//   createTransactionValidation,
//   transactionController.createTransaction
// );

// export default router;
