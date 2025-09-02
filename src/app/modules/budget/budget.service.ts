import status from "http-status";
import { prisma } from "../../../shared";
import ApiError from "../../errors/ApiError";
import { JwtPayload } from "jsonwebtoken";
import { endOfDay, endOfMonth, startOfMonth } from "date-fns";

const getCurrentBudget = async (accountId: string, user: JwtPayload) => {
  const findUser = await prisma.user.findUnique({
    where: {
      clerkUserId: user.sub,
    },
    select: { id: true },
  });

  if (!findUser) {
    throw new ApiError(status.NOT_FOUND, "User not found");
  }

  const budget = await prisma.budget.findFirst({
    where: {
      userId: findUser.id,
    },
  });

  const now = new Date();
  const monthStart = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
  );
  const monthEnd = new Date(
    Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  );

  const expenses = await prisma.transaction.aggregate({
    where: {
      userId: findUser.id,
      type: "EXPENSE",
      // date: {
      //   gte: monthStart,
      //   lte: monthEnd,
      // },
      accountId,
    },
    _sum: {
      amount: true,
    },
  });

  return {
    budget: budget ? { ...budget, amount: budget.amount.toNumber() } : null,
    currentExpenses: expenses._sum.amount ? expenses._sum.amount.toNumber() : 0,
  };
};

const updateBudget = async (amount: string, user: JwtPayload) => {
  const findUser = await prisma.user.findUnique({
    where: {
      clerkUserId: user.sub,
    },
    select: { id: true },
  });

  if (!findUser) {
    throw new ApiError(status.NOT_FOUND, "User not found");
  }

  const budget = await prisma.budget.upsert({
    where: {
      userId: findUser.id,
    },
    update: {
      amount,
    },
    create: {
      userId: findUser.id,
      amount,
    },
  });

  return { ...budget, amount: budget.amount.toNumber() };
};

export const BudgetService = {
  getCurrentBudget,
  updateBudget,
};
