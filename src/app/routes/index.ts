import express from "express";
import { userRoutes } from "../modules/user/user.routes";
import { accountRoutes } from "../modules/account/account.routes";
import { budgetRouter } from "../modules/budget/budget.routes";

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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
