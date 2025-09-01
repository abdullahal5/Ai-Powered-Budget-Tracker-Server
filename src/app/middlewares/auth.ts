import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../errors/ApiError";
import { prisma } from "../../shared";
import { jwtDecode } from "jwt-decode";

export const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
      }

      const token = authHeader.split(" ")[1] as string;
      const decoded = jwtDecode(token);

      let userRole: string | undefined;
      if (roles.length > 0) {
        const user = await prisma.user.findUnique({
          where: { clerkUserId: decoded.sub },
          select: { role: true },
        });

        if (!user) {
          throw new ApiError(httpStatus.UNAUTHORIZED, "User not found!");
        }
        userRole = user.role;
      }

      req.user = decoded;

      if (roles.length && userRole && !roles.includes(userRole)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
