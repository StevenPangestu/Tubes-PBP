import { Request, Response } from "express";
import { Follow, User } from "../models";
import { v4 as uuidv4 } from "uuid";

export const followUser = async (req: Request, res: Response) => {
  const follower = res.locals.user;
  const following_id = req.params.userId;

  if (follower.user_id === following_id) {
    res.locals.errorCode = 400;
    throw new Error("You cannot follow yourself");
  }

  const userToFollow = await User.findByPk(following_id);
  if (!userToFollow) {
    res.locals.errorCode = 404;
    throw new Error("User not found");
  }

  const existing = await Follow.findOne({
    where: {
      follower_id: follower.user_id,
      following_id,
    },
  });

  if (existing) {
    return { message: "Already followed" };
  }

  await Follow.create({
    follow_id: uuidv4(),
    follower_id: follower.user_id,
    following_id,
  });

  return { message: "Followed user" };
};

export const unfollowUser = async (req: Request, res: Response) => {
  const follower = res.locals.user;
  const following_id = req.params.userId;

  const deleted = await Follow.destroy({
    where: {
      follower_id: follower.user_id,
      following_id,
    },
  });

  if (!deleted) {
    res.locals.errorCode = 404;
    throw new Error("Follow relationship not found");
  }

  return { message: "Unfollowed user" };
};

export const getFollowers = async (req: Request, res: Response) => {
  const userId = req.params.userId;

  // Validasi apakah user exists
  const user = await User.findByPk(userId);
  if (!user) {
    res.locals.errorCode = 404;
    throw new Error("User not found");
  }

  const followers = await Follow.findAll({
    where: { following_id: userId },
    include: [{ 
      model: User, 
      as: 'follower', 
      attributes: ['user_id', 'username', 'profile_picture'] 
    }],
  });

  return followers.map(f => f.follower);
};

export const getFollowing = async (req: Request, res: Response) => {
  const userId = req.params.userId;

  // Validasi apakah user exists
  const user = await User.findByPk(userId);
  if (!user) {
    res.locals.errorCode = 404;
    throw new Error("User not found");
  }

  const followings = await Follow.findAll({
    where: { follower_id: userId },
    include: [{ 
      model: User, 
      as: 'following', 
      attributes: ['user_id', 'username', 'profile_picture'] 
    }],
  });

  return followings.map(f => f.following);
};

export const getFollowStatus = async (req: Request, res: Response) => {
  const follower = res.locals.user;
  const following_id = req.params.userId;

  const isFollowing = await Follow.findOne({
    where: {
      follower_id: follower.user_id,
      following_id,
    },
  });

  return { isFollowing: !!isFollowing };
};
