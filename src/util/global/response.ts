import type { Response } from "express";

export class ApiResponse {
  static success<T>(
    res: Response,
    statusCode = 200,
    message: string,
    data?: T
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }
}
