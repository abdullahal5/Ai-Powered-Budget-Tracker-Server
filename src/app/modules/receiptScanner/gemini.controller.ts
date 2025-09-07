import { JwtPayload } from "jsonwebtoken";
import { catchAsync, sendResponse } from "../../../shared";
import { GeminiService } from "./gemini.service";
import status from "http-status";

const geminiFileScanner = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await GeminiService.getScannedTextFromGemini(
    req.file as unknown as Express.Multer.File,
    user as JwtPayload
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "File scanned successfully!",
    data: result,
  });
});

export const GeminiController = {
  geminiFileScanner,
};
