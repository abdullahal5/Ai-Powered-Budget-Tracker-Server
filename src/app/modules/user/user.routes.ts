import express, { NextFunction, Request, Response } from "express";
import { userController } from "./user.controller";
import { UserRole } from "@prisma/client";
import { auth } from "../../middlewares";
import { fileUploader } from "../../../helpers";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.ADMIN),
  userController.getAllFromDB
);

router.get(
  "/me",
  auth(UserRole.ADMIN, UserRole.USER),
  userController.getMyProfile
);

router.patch(
  "/:id/status",
  auth(UserRole.ADMIN, UserRole.USER),
  //   validateRequest(userValidation.updateStatus),
  userController.changeProfileStatus
);

export const userRoutes = router;
