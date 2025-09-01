import express from "express";
import { accountController } from "./account.controller";
import { UserRole } from "@prisma/client";
import { auth } from "../../middlewares";

const router = express.Router();

router.get("/", auth(UserRole.ADMIN), accountController.getAllAccounts);

router.get(
  "/me",
  auth(UserRole.ADMIN, UserRole.USER),
  accountController.getMyAccount
);

router.post("/", auth(UserRole.ADMIN, UserRole.USER), accountController.createAccount);

router.patch("/:id", auth(UserRole.ADMIN, UserRole.USER), accountController.updateAccount);

router.patch("/default-status/:id", auth(UserRole.ADMIN, UserRole.USER), accountController.changeDefaultStatus);

router.delete("/:id", auth(UserRole.ADMIN), accountController.deleteAccount);

export const accountRoutes = router;
