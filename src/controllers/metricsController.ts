import { Request, Response } from "express";
import { metricsService } from "../services/metricsService";

export const metricsController = {
  async getMetrics(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const metrics = await metricsService.computeMetrics(userId);
      res.json({ success: true, data: metrics });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to get metrics" });
    }
  },
};
