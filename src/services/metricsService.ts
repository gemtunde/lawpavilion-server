import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import Transaction from "../models/Transaction";

export const metricsService = {
  async computeMetrics(userId: string) {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // All transactions for user
    const allTransactions = await Transaction.find({ userId });

    // Revenue this month
    const revenueThisMonth = allTransactions
      .filter(
        (t) =>
          new Date(t.createdAt) >= thisMonthStart &&
          new Date(t.createdAt) <= thisMonthEnd
      )
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    // Monthly active users this month (distinct userId count)
    const activeUsersThisMonth = new Set(
      allTransactions
        .filter(
          (t) =>
            new Date(t.createdAt) >= thisMonthStart &&
            new Date(t.createdAt) <= thisMonthEnd
        )
        .map((t) => t.userId)
    ).size;

    // Last month active users
    const activeUsersLastMonth = new Set(
      allTransactions
        .filter(
          (t) =>
            new Date(t.createdAt) >= lastMonthStart &&
            new Date(t.createdAt) <= lastMonthEnd
        )
        .map((t) => t.userId)
    );

    // Churn: last month users who didn't transact this month
    const churnedUsers = Array.from(activeUsersLastMonth).filter(
      (user) =>
        !Array.from(
          new Set(
            allTransactions
              .filter(
                (t) =>
                  new Date(t.createdAt) >= thisMonthStart &&
                  new Date(t.createdAt) <= thisMonthEnd
              )
              .map((t) => t.userId)
          )
        ).includes(user)
    ).length;

    // Revenue trend (group by date)
    const revenueTrendMap: Record<string, number> = {};
    allTransactions.forEach((t) => {
      const dateKey = new Date(t.createdAt).toISOString().slice(0, 10);
      revenueTrendMap[dateKey] = (revenueTrendMap[dateKey] || 0) + t.amount;
    });

    const revenueTrend = Object.entries(revenueTrendMap)
      .map(([date, total]) => ({
        date,
        total,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      revenueThisMonth,
      activeUsersThisMonth,
      churnedUsers,
      revenueTrend,
    };
  },
};
