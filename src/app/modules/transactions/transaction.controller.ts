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

const getSingleTransaction = catchAsync(async (req, res) => {
  const result = await TransactionService.getSingleTransactionFromDB(
    req.params.id
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Transaction fetched successfully!",
    data: result,
  });
});

const updateTransaction = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await TransactionService.editTransactionIntoDB(
    id,
    req.body,
    req.user as JwtPayload
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Transaction edited successfully!",
    data: result,
  });
});

export const TransactionController = {
  createTransaction,
  updateTransaction,
  getSingleTransaction,
};
