import { IAuthUser } from "./common";

declare global {
  namespace Express {
    interface Request {
      user?: IAuthUser;
    }
  }
}
