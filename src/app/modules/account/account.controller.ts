import status from "http-status";
import { catchAsync, pick, sendResponse } from "../../../shared";
import { IAuthUser } from "../../interface";
import { accountService } from "./account.service";
import { accountFilterableFields } from "./account.constant";
import { JwtPayload } from "jsonwebtoken";

const getAllAccounts = catchAsync(async (req, res) => {
  const filters = pick(req.query, accountFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await accountService.getAllAccounts(filters, options);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Accounts fetched successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getMyAccount = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await accountService.getMyAccount(user as JwtPayload);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "My account fetched successfully!",
    data: result,
  });
});

const createAccount = catchAsync(async (req, res) => {
  const result = await accountService.createAccount(
    req.body,
    req.user as JwtPayload
  );

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Account created successfully!",
    data: result,
  });
});

const updateAccount = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await accountService.updateAccount(
    id,
    req.body,
    req.user as JwtPayload
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Account updated successfully!",
    data: result,
  });
});

const changeDefaultStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await accountService.changeDefaultStatus(
    id,
    req.body,
    req.user as JwtPayload
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Account Default Status Successfully!",
    data: result,
  });
});

const deleteAccount = catchAsync(async (req, res) => {
  const { id } = req.params;
  await accountService.deleteAccount(id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Account deleted successfully!",
    data: null,
  });
});

export const accountController = {
  getAllAccounts,
  getMyAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  changeDefaultStatus,
};
