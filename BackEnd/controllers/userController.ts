import { Request, Response } from "express";
import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize';
import { Category } from "../models/Category";
import { Post } from "../models/Post";
import { User } from "../models/User";
import { Like } from "../models/Like";
import { Follow } from "../models/Follow";
import { formatProfilePictureUrl } from '../utils/formatUrl';
import { formatPost } from '../utils/formatPost';
import {
  getLikedPostIds,
  getLikeCountMap,
  getCommentCountMap,
  getBookmarkedPostIds
} from "../utils/postHelper";

export const getProfile = async (req: Request, res: Response) => {
  const user = res.locals.user;

  const posts = await Post.findAll({
    where: { user_id: user.user_id },
    include: [User, Category],
    order: [['createdAt', 'DESC']],
  });

  const likedPostIds = await getLikedPostIds(user.user_id);
  const likeCountMap = await getLikeCountMap();
  const commentCountMap = await getCommentCountMap(posts.map(p => p.post_id));
  const bookmarkedPostIds = await getBookmarkedPostIds(user.user_id);

  const formattedPosts = posts.map(post =>
    formatPost(post, likedPostIds, likeCountMap, commentCountMap, bookmarkedPostIds, req)
  );

  const followersCount = await Follow.count({ where: { following_id: user.user_id } });
  const followingCount = await Follow.count({ where: { follower_id: user.user_id } });

  return res.json({
    user_id: user.user_id,
    username: user.username,
    email: user.email,
    bio: user.bio,
    profile_picture: formatProfilePictureUrl(user.profile_picture, req),
    followersCount,
    followingCount,
    posts: formattedPosts,
  });
};

export const getUserByUsername = async (req: Request, res: Response) => {
  const { username } = req.params;

  const user = await User.findOne({
    where: { username },
    attributes: ["user_id", "username", "profile_picture", "bio"],
  });

  if (!user) {
    res.locals.errorCode = 404;
    throw new Error("User not found");
  }

  const followersCount = await Follow.count({
    where: { following_id: user.user_id }
  });

  const followingCount = await Follow.count({
    where: { follower_id: user.user_id }
  });

  let isFollowing = false;

  if (res.locals.user && res.locals.user.user_id !== user.user_id) {
    const existing = await Follow.findOne({
      where: {
        follower_id: res.locals.user.user_id,
        following_id: user.user_id
      }
    });

    isFollowing = !!existing;
  }

  return res.json({
    ...user.toJSON(),
    followersCount,
    followingCount,
    isFollowing
  });
};


export const getPostsByUsername = async (req: Request, res: Response) => {
  const { username } = req.params;
  const page = parseInt(req.query.page as string) || 0;
  const limit = parseInt(req.query.limit as string) || 3;
  const offset = page * limit;

  const user = await User.findOne({ where: { username } });
  if (!user) {
    res.locals.errorCode = 404;
    throw new Error("User not found");
  }

  const currentUser = res.locals.user;

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

  const postIds = posts.map(p => p.post_id);
  const likedPostIds = currentUser ? await getLikedPostIds(currentUser.user_id) : [];
  const likeCountMap = await getLikeCountMap();
  const commentCountMap = await getCommentCountMap(postIds);
  const bookmarkedPostIds = currentUser ? await getBookmarkedPostIds(currentUser.user_id) : [];

  return posts.map(post =>
    formatPost(post, likedPostIds, likeCountMap, commentCountMap, bookmarkedPostIds, req)
  );
};

export const updateUserProfile = async (req: Request, res: Response) => {
  const { id } = req.params;
  const currentUser = res.locals.user;

  const { bio, username, email, remove_picture } = req.body;
  const file = req.file;

  if (currentUser.user_id !== id) {
    res.locals.errorCode = 403;
    throw new Error("Unauthorized to update this profile");
  }

  const user = await User.findByPk(id);
  if (!user) {
    res.locals.errorCode = 404;
    throw new Error("User not found");
  }

  if (bio !== undefined && bio.length > 500) {
    res.locals.errorCode = 400;
    throw new Error("Bio cannot exceed 500 characters");
  }

  if (username && username !== user.username) {
    const existing = await User.findOne({ where: { username } });
    if (existing) {
      res.locals.errorCode = 409;
      throw new Error("Username already taken");
    }
    user.username = username;
  }

  if (email && email !== user.email) {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      res.locals.errorCode = 409;
      throw new Error("Email already in use");
    }
    user.email = email;
  }

  user.bio = bio ?? user.bio;

  if (remove_picture === 'true' && user.profile_picture) {
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

  return {
    message: "Profile updated successfully",
    user: userJson
  };
};
