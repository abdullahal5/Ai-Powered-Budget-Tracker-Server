import status from "http-status";
import { catchAsync, pick, sendResponse } from "../../../shared";
import { Request, Response } from "express";
import { IAuthUser } from "../../interface";
import { userService } from "./user.service";
import { userFilterableFields } from "./user.constant";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createUser(req);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User Created successfuly!",
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, userFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await userService.getAllFromDB(filters, options);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Users data fetched!",
    meta: result.meta,
    data: result.data,
  });
});

const changeProfileStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await userService.changeProfileStatus(id, req.body);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Users profile status changed!",
    data: result,
  });
});

const getMyProfile = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user;

    const result = await userService.getMyProfile(user as IAuthUser);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "My profile data fetched!",
      data: result,
    });
  }
);

export const userController = {
  createUser,
  getAllFromDB,
  changeProfileStatus,
  getMyProfile,
};
