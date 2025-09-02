import status from "http-status";
import { catchAsync, sendResponse } from "../../../shared";
import { BudgetService } from "./budget.service";
import { JwtPayload } from "jsonwebtoken";

const getMyCurrentBudget = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await BudgetService.getCurrentBudget(
    req.params.accountId,
    user as JwtPayload
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "My account fetched successfully!",
    data: result,
  });
});

const updateBudget = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await BudgetService.updateBudget(
    req.body.amount,
    user as JwtPayload
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "My account fetched successfully!",
    data: result,
  });
});

export const BudgetController = {
  getMyCurrentBudget,
  updateBudget,
};