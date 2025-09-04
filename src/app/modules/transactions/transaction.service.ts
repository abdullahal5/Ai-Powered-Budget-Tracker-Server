import { Transaction } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import ApiError from "../../errors/ApiError";
import status from "http-status";
import { prisma } from "../../../shared";

function calculateNextRecurringDate(startDate: Date, interval: string) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}

const createTransactionIntoDB = async (
  payload: Transaction,
  user: JwtPayload
) => {
  const findUser = await prisma.user.findUnique({
    where: {
      clerkUserId: user.sub,
    },
    select: { id: true },
  });

  if (!findUser) {
    throw new ApiError(status.NOT_FOUND, "User not found");
  }

  const account = await prisma.account.findUnique({
    where: {
      id: payload.accountId,
      userId: findUser.id,
    },
  });

  if (!account) {
    throw new ApiError(status.NOT_FOUND, "Account not found");
  }

  const balanceChange =
    payload.type === "EXPENSE"
      ? -Number(payload.amount)
      : Number(payload.amount);

  const newBalance = account.balance.toNumber() + balanceChange;

  const transaction = await prisma.$transaction(async (tx) => {
    const newTransaction = await tx.transaction.create({
      data: {
        ...payload,
        userId: findUser.id,
        nextRecurringDate:
          payload.isRecurring && payload.recurringInterval
            ? calculateNextRecurringDate(
                payload.date as Date,
                payload.recurringInterval
              )
            : null,
      },
    });

    await tx.account.update({
      where: { id: payload.accountId },
      data: { balance: newBalance },
    });

    return newTransaction;
  });

  return transaction;
};

export const TransactionService = {
  createTransactionIntoDB,
};
