import { NextFunction, Request, Response } from "express";
import { middlewareWrapper } from "../utils/middlewareWrapper";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

import { Session } from "../models/Session";
import { User } from "../models/User";

const authenticateMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Missing or invalid token" });
    return;
  }

  const token = authHeader.split(" ")[1];
  const session = await Session.findOne({ where: { token }, include: [User] });

  if (!session) {
    res.status(401).json({ message: "Session not found or expired" });
    return;
  }

  res.locals.user = session.user;
};

export const authenticate = middlewareWrapper(authenticateMiddleware);
