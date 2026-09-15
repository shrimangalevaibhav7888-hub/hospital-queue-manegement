import { Request, Response } from 'express';
import { analyticsService } from '../services';
import { sendSuccess, sendError } from '../utils/response';

export class AnalyticsController {
  static async getKPIs(req: Request, res: Response) {
    try {
      const { range, doctorId, departmentId } = req.query;
      const kpis = await analyticsService.getHospitalKPIs({
        range: range as any,
        doctorId: doctorId as string,
        departmentId: departmentId as string,
      });
      return sendSuccess(res, kpis);
    } catch (error: any) {
      return sendError(res, 'FETCH_KPIS_FAILED', error.message, 500);
    }
  }

  static async getCharts(req: Request, res: Response) {
    try {
      const { range, doctorId, departmentId } = req.query;
      const charts = await analyticsService.getChartData({
        range: range as any,
        doctorId: doctorId as string,
        departmentId: departmentId as string,
      });
      return sendSuccess(res, charts);
    } catch (error: any) {
      return sendError(res, 'FETCH_CHARTS_FAILED', error.message, 500);
    }
  }
}
