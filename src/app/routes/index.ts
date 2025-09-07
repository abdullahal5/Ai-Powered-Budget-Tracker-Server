import express from "express";
import { userRoutes } from "../modules/user/user.routes";
import { accountRoutes } from "../modules/account/account.routes";
import { budgetRouter } from "../modules/budget/budget.routes";
import { transactionRoutes } from "../modules/transactions/transaction.routes";
import { geminiRoute } from "../modules/receiptScanner/gemini.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/user",
    route: userRoutes,
  },
  {
    path: "/accounts",
    route: accountRoutes,
  },
  {
    path: "/budget",
    route: budgetRouter,
  },
  {
    path: "/transactions",
    route: transactionRoutes,
  },
  {
    path: "/gemini",
    route: geminiRoute,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
