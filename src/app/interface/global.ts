import { IAuthUser } from "./common";

declare global {
  namespace Express {
    interface Request {
      user?: IAuthUser;
    }
  }
}


export type Stats = {
  totalExpenses: number;
  totalIncome: number;
  byCategory: Record<string, number>;
  transactionCount: number;
};