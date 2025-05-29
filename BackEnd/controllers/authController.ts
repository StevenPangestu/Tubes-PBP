import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Session } from "../models/Session";
import { User } from "../models/User";
import { comparePassword, hashPassword } from "../utils/hash";

export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  // Validasi input
  if (!username || !email || !password) {
    res.locals.errorCode = 400;
    throw new Error("Username, email, and password are required");
  }

  if (password.length < 6) {
    res.locals.errorCode = 400;
    throw new Error("Password must be at least 6 characters long");
  }

  // Validasi email format basic
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.locals.errorCode = 400;
    throw new Error("Invalid email format");
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    res.locals.errorCode = 400;
    throw new Error("Email already registered");
  }

  const user = await User.create({
    username,
    email,
    password: hashPassword(password),
  });

  res.locals.statusCode = 201;
  return {
    message: "User registered",
    user: {
      id: user.user_id,
      username: user.username,
      email: user.email,
    },
  };
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validasi input
  if (!email || !password) {
    res.locals.errorCode = 400;
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ where: { email } });
  if (!user || !comparePassword(password, user.password)) {
    res.locals.errorCode = 401;
    throw new Error("Invalid email or password");
  }

  await Session.destroy({ where: { user_id: user.user_id } });

  const token = uuidv4();
  const session = await Session.create({
    user_id: user.user_id,
    token,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return {
    message: "Login success",
    session: { token: session.token },
    user: {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
    },
  };
};
