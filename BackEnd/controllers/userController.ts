import { Request, Response } from "express";
import fs from 'fs';
import path from 'path';
import { Category } from "../models/Category";
import { Post } from "../models/Post";
import { User } from "../models/User";
import { formatProfilePictureUrl } from './formatUrl';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;

    const userData = await User.findOne({
      where: { user_id: user.user_id },
      attributes: ["user_id", "username", "email", "profile_picture", "bio"],
      include: [
        {
          model: Post,
          include: [Category],
          order: [["createdAt", "DESC"]],
        },
      ],
    });

    console.log("userData:", userData);
    res.status(200).json(userData);
  } catch (error) {
    console.error("Error in /user/profile:", error);
    res.status(500).json({ message: "Failed to fetch profile", error });
  }
};
export const getUserByUsername = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;

    const user = await User.findOne({
      where: { username },
      attributes: ["user_id", "username", "email", "profile_picture", "bio"],
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in /users/:username:", error);
    res.status(500).json({ message: "Failed to fetch user", error });
  }
};

export const getPostsByUsername = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page as string) || 0;
    const limit = parseInt(req.query.limit as string) || 3;
    const offset = page * limit;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const posts = await Post.findAll({
      where: { user_id: user.user_id },
      include: [
        {
          model: User,
          attributes: ['user_id', 'username', 'profile_picture'],
        },
        Category,
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const formatted = posts.map(post => {
      const postJson = post.toJSON() as any;
      postJson.user.profile_picture = formatProfilePictureUrl(postJson.user.profile_picture, req);
      return postJson;
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error in /users/:username/posts:", error);
    res.status(500).json({ message: "Failed to fetch posts", error });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const bio = req.body.bio;
    const file = req.file;
    const removePicture = req.body.remove_picture === 'true';

    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    user.bio = bio;

    if (removePicture && user.profile_picture) {
      const filepath = path.join(__dirname, '..', '..', user.profile_picture);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      user.profile_picture = null;
    }

    if (file) {
      user.profile_picture = `/uploads/${file.filename}`;
    }

    await user.save();

    const userJson = user.toJSON() as any;
    userJson.profile_picture = formatProfilePictureUrl(userJson.profile_picture, req);

    res.json(userJson);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};
