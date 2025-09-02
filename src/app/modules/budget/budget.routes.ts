import { UserRole } from "@prisma/client";
import { auth } from "../../middlewares";
import { BudgetController } from "./budget.controller";
import express from "express";

const router = express.Router();

router.get(
  "/:accountId",
  auth(UserRole.ADMIN, UserRole.USER),
  BudgetController.getMyCurrentBudget
);

router.put(
  "/update",
  auth(UserRole.ADMIN, UserRole.USER),
  BudgetController.updateBudget
);

export const budgetRouter = router;