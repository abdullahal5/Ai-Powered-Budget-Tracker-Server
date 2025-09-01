import { prisma } from "../../../shared/prisma";
import { IPaginationOptions } from "../../interface";
import { paginationHelper } from "../../../helpers";
import { Account, Prisma } from "@prisma/client";
import { accountSearchableFields } from "./account.constant";
import { JwtPayload } from "jsonwebtoken";
import ApiError from "../../errors/ApiError";
import status from "http-status";
import { Decimal } from "@prisma/client/runtime/library";

const getAllAccounts = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.AccountWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: accountSearchableFields.map((field) => ({
        [field]: { contains: searchTerm, mode: "insensitive" },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: { equals: (filterData as any)[key] },
      })),
    });
  }

  const whereConditions: Prisma.AccountWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const data = await prisma.account.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: options.sortBy
      ? { [options.sortBy]: options.sortOrder }
      : { createdAt: "desc" },
  });

  const total = await prisma.account.count({ where: whereConditions });

  return {
    meta: { page, limit, total },
    data,
  };
};

const getMyAccount = async (user: JwtPayload) => {
  const findUser = await prisma.user.findUnique({
    where: {
      clerkUserId: user.sub,
    },
    select: { id: true },
  });

  if (!findUser) {
    throw new ApiError(status.NOT_FOUND, "User not found");
  }

  const findAccount = await prisma.account.findMany({
    where: {
      userId: findUser.id,
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          transactions: true,
        },
      },
    },
  });

  return findAccount;
};

const getAccountWithTransactions = async (
  user: JwtPayload,
  accountId: string
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

  const findAccount = await prisma.account.findUnique({
    where: {
      id: accountId,
      userId: findUser.id,
    },
    include: {
      transactions: {
        orderBy: { date: "desc" },
      },
      _count: {
        select: { transactions: true },
      },
    },
  });

  if (!findUser) {
    return null;
  }

  return findAccount;
};

const createAccount = async (payload: Account, user: JwtPayload) => {
  const findUser = await prisma.user.findUnique({
    where: { clerkUserId: user.sub },
    select: { id: true },
  });

  if (!findUser) {
    throw new ApiError(status.NOT_FOUND, "User not found");
  }

  const account = await prisma.$transaction(async (tx) => {
    if (payload.isDefault) {
      await tx.account.updateMany({
        where: { userId: findUser.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const newAccount = await tx.account.create({
      data: {
        ...payload,
        userId: findUser.id,
      },
    });

    return newAccount;
  });

  return account;
};

const updateAccount = async (
  id: string,
  payload: Partial<Account>,
  user: JwtPayload
) => {
  const findUser = await prisma.user.findUnique({
    where: { clerkUserId: user.sub },
    select: { id: true },
  });

  if (!findUser) {
    throw new ApiError(status.NOT_FOUND, "User not found");
  }

  const account = await prisma.account.update({
    where: { id },
    data: payload,
  });

  return account;
};

const changeDefaultStatus = async (
  id: string,
  payload: { isDefault: boolean },
  user: JwtPayload
) => {
  const findUser = await prisma.user.findUnique({
    where: { clerkUserId: user.sub },
    select: { id: true },
  });

  if (!findUser) {
    throw new ApiError(status.NOT_FOUND, "User not found");
  }

  if (payload.isDefault) {
    await prisma.account.updateMany({
      where: { userId: findUser.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  const account = await prisma.account.update({
    where: { id },
    data: { isDefault: payload.isDefault },
  });

  return account;
};

const bulkDeleteAccount = async (
  accountId: string,
  transactionIds: string[],
  user: JwtPayload
) => {
  // 1. Verify account belongs to user
  const findUser = await prisma.user.findUnique({
    where: { clerkUserId: user.sub },
    select: { id: true },
  });

  if (!findUser) {
    throw new ApiError(status.NOT_FOUND, "User not found");
  }

  const account = await prisma.account.findFirst({
    where: { id: accountId, userId: findUser.id },
  });

  if (!account)
    throw new ApiError(
      status.UNAUTHORIZED,
      "Account not found or unauthorized"
    );

  // 2. Fetch transactions to delete
  const transactions = await prisma.transaction.findMany({
    where: { id: { in: transactionIds }, accountId, userId: findUser.id },
  });

  if (!transactions.length)
    throw new ApiError(status.NOT_FOUND, "No transactions found to delete");

  // 3. Update account balance
  let balanceAdjustment: number = 0;
  for (const tx of transactions) {
    if (tx.type === "INCOME") balanceAdjustment -= Number(tx.amount);
    if (tx.type === "EXPENSE") balanceAdjustment += Number(tx.amount);
  }

  const newBalance = new Decimal(account.balance).plus(balanceAdjustment);

  await prisma.account.update({
    where: { id: accountId },
    data: { balance: newBalance },
  });

  // 4. Delete transactions
  await prisma.transaction.deleteMany({
    where: { id: { in: transactionIds }, accountId, userId: findUser.id },
  });

  return { deletedCount: transactions.length };
};

export const accountService = {
  getAllAccounts,
  getMyAccount,
  createAccount,
  updateAccount,
  bulkDeleteAccount,
  changeDefaultStatus,
  getAccountWithTransactions,
};
