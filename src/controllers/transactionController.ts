import { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import transactionService from "../services/transactionService";

export const createTransactionValidation = [
  body("type")
    .isIn(["purchase", "payment", "refund"])
    .withMessage("Invalid transaction type"),
  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),
  body("currency")
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be 3 characters"),
  // body("description")
  //   .trim()
  //   .isLength({ min: 1 })
  //   .withMessage("Description is required"),
  // body("paymentMethod")
  //   .trim()
  //   .isLength({ min: 1 })
  //   .withMessage("Payment method is required"),
];

class TransactionController {
  async createTransaction(req: Request, res: Response): Promise<void> {
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
      const { amount, currency } = req.body;

      const transaction = await transactionService.createTransaction({
        userId,
        amount,
        currency: currency.toUpperCase(),
      });

      res.status(201).json({
        success: true,
        message: "Transaction created successfully",
        data: { transaction },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create transaction",
      });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      // const transactions = await transactionService.getAllTransactions(userId);
      // res.json({ success: true, data: transactions });
      // Get query params (use defaults if not provided)
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const search = (req.query.search as string) || "";

      // Call service with params
      const result = await transactionService.getAllTransactions(
        userId,
        page,
        pageSize,
        search
      );

      res.json({ success: true, ...result });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to get transactions" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const transaction = await transactionService.getTransactionById(id);
      if (!transaction) {
        return res
          .status(404)
          .json({ success: false, message: "Transaction not found" });
      }
      res.json({ success: true, data: transaction });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to get transaction" });
    }
  }
}

export default new TransactionController();
