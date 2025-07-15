//import Transaction, { ITransaction } from "../models/transaction";

import Transaction, { ITransaction } from "../models/Transaction";

class TransactionService {
  async createTransaction(data: Partial<ITransaction>): Promise<ITransaction> {
    return await Transaction.create(data);
  }

  // async getAllTransactions(userId: string): Promise<ITransaction[]> {
  //   return await Transaction.find({ userId }).sort({ createdAt: -1 });
  // }
  async getAllTransactions(
    userId: string,
    page: number,
    pageSize: number,
    search: string
  ): Promise<{ data: ITransaction[]; total: number; pages: number }> {
    const query: any = { userId };
    // return await Transaction.find({ userId }).sort({ createdAt: -1 });

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Transaction.countDocuments(query);
    const pages = Math.ceil(total / pageSize);
    const skip = (page - 1) * pageSize;

    const data = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    return { data, total, pages };
  }

  async getTransactionById(id: string): Promise<ITransaction | null> {
    return await Transaction.findById(id);
  }

  async createDemoTransactionsForUser(userId: string) {
    const demoTransactions = [
      {
        userId,
        amount: 50,
        currency: "usd",
        status: "succeeded",
        stripePaymentIntentId: "demo_pi_1",
      },
      {
        userId,
        amount: 75,
        currency: "usd",
        status: "succeeded",
        stripePaymentIntentId: "demo_pi_2",
      },
      {
        userId,
        amount: 100,
        currency: "usd",
        status: "failed",
        stripePaymentIntentId: "demo_pi_3",
      },
    ];

    await Transaction.insertMany(demoTransactions);
  }
}

export default new TransactionService();
