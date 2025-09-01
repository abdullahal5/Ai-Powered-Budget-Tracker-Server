import express from "express";
import { userRoutes } from "../modules/user/user.routes";
import { accountRoutes } from "../modules/account/account.routes";

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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
