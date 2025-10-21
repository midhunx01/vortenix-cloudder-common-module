// src/util/global/response.ts
var ApiResponse = class {
  static success(res, statusCode = 200, message, data) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }
};
export {
  ApiResponse
};
