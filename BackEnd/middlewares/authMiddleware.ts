import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

import { Session } from "../../models/Session";
import { User } from "../../models/User";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
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
    next();
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};
