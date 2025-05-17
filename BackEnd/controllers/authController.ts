import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Session } from "../models/Session";
import { User } from "../models/User";
import { comparePassword, hashPassword } from "./hash";

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      username,
      email,
      password: hashPassword(password),
    });

    return res.status(201).json({
      message: "User registered",
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !comparePassword(password, user.password)) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    await Session.destroy({ where: { user_id: user.user_id } });

    const token = uuidv4();
    const session = await Session.create({
      user_id: user.user_id,
      token,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(200).json({
      message: "Login success",
      session: { token: session.token },
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};
