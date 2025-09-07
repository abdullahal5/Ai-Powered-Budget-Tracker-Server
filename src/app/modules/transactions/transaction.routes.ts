import express from "express";
import { auth } from "../../middlewares";
import { UserRole } from "@prisma/client";
import { TransactionController } from "./transaction.controller";

const router = express.Router();

router.get(
  "/:id",
  auth(UserRole.ADMIN, UserRole.USER),
  TransactionController.getSingleTransaction
);

router.post(
  "/",
  auth(UserRole.ADMIN, UserRole.USER),
  TransactionController.createTransaction
);

router.put(
  "/:id",
  auth(UserRole.ADMIN, UserRole.USER),
  TransactionController.updateTransaction
);

export const transactionRoutes = router;
