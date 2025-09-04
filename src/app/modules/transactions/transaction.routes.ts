import express from "express";
import { auth } from "../../middlewares";
import { UserRole } from "@prisma/client";
import { TransactionController } from "./transaction.controller";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.ADMIN, UserRole.USER),
  TransactionController.createTransaction
);

export const transactionRoutes = router;
