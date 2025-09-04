import status from "http-status";
import { catchAsync, sendResponse } from "../../../shared";
import { TransactionService } from "./transaction.service";
import { JwtPayload } from "jsonwebtoken";

const createTransaction = catchAsync(async (req, res) => {
  const result = await TransactionService.createTransactionIntoDB(
    req.body,
    req.user as JwtPayload
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Transaction created successfully!",
    data: result,
  });
});

export const TransactionController = {
  createTransaction,
};
