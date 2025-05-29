import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Category } from "../models/Category";
import { Comment } from "../models/Comment";
import { Post } from "../models/Post";
import { User } from "../models/User";
import { Sequelize } from "sequelize";
import { formatPost } from "../utils/formatPost";
import {
  getLikedPostIds,
  getLikeCountMap,
  getCommentCountMap,
  getBookmarkedPostIds
} from "../utils/postHelper";

export const getAllPosts = async (req: Request, res: Response) => {
  const user = res.locals.user;
  const page = parseInt(req.query.page as string) || 0;
  const limit = parseInt(req.query.limit as string) || 3;
  const offset = page * limit;

  const posts = await Post.findAll({
    include: [
      {
        model: User,
        attributes: ["user_id", "username", "profile_picture"],
      },
      {
        model: Category,
        attributes: ["category_id", "category_name"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  const postIds = posts.map(post => post.post_id);

  const likedPostIds = user ? await getLikedPostIds(user.user_id) : [];
  const likeCountMap = await getLikeCountMap();
  const commentCountMap = await getCommentCountMap(postIds);
  const bookmarkedPostIds = user ? await getBookmarkedPostIds(user.user_id) : [];

  return posts.map(post =>
    formatPost(post, likedPostIds, likeCountMap, commentCountMap, bookmarkedPostIds, req)
  );
};

export const createPost = async (req: Request, res: Response) => {
  const user = res.locals.user;
  const { caption, category_id } = req.body;

  if (!req.file || !caption || !category_id) {
    res.locals.errorCode = 400;
    throw new Error("Image, caption, and category are required");
  }

  if (caption.trim().length === 0) {
    res.locals.errorCode = 400;
    throw new Error("Caption cannot be empty");
  }

  // Validasi apakah category exists
  const category = await Category.findByPk(category_id);
  if (!category) {
    res.locals.errorCode = 404;
    throw new Error("Category not found");
  }

  const image_url = `/uploads/${req.file.filename}`;

  const post = await Post.create({
    post_id: uuidv4(),
    user_id: user.user_id,
    image_url,
    caption: caption.trim(),
    category_id,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  res.locals.statusCode = 201;
  return { message: "Post created successfully", post };
};

export const deletePost = async (req: Request, res: Response) => {
  const { post_id } = req.params;
  const user = res.locals.user;

  const post = await Post.findByPk(post_id);

  if (!post) {
    res.locals.errorCode = 404;
    throw new Error("Post not found");
  }

  if (post.user_id !== user.user_id) {
    res.locals.errorCode = 403;
    throw new Error("Unauthorized to delete this post");
  }

  await post.destroy();

  return { message: "Post deleted successfully" };
};

export const updatePost = async (req: Request, res: Response) => {
  const { post_id } = req.params;
  const user = res.locals.user;
  const { caption, category_id } = req.body;

  // Validasi input
  if (!caption && !category_id) {
    res.locals.errorCode = 400;
    throw new Error("At least caption or category_id must be provided");
  }

  const post = await Post.findByPk(post_id);

  if (!post) {
    res.locals.errorCode = 404;
    throw new Error("Post not found");
  }

  if (post.user_id !== user.user_id) {
    res.locals.errorCode = 403;
    throw new Error("Unauthorized to edit this post");
  }

  // Validasi category jika diberikan
  if (category_id) {
    const category = await Category.findByPk(category_id);
    if (!category) {
      res.locals.errorCode = 404;
      throw new Error("Category not found");
    }
  }

  if (caption !== undefined) {
    if (caption.trim().length === 0) {
      res.locals.errorCode = 400;
      throw new Error("Caption cannot be empty");
    }
    post.caption = caption.trim();
  }
  
  if (category_id) post.category_id = category_id;

  await post.save();

  return { message: "Post updated successfully", post };
};

export const getTrendingPosts = async (req: Request, res: Response) => {
  const user = res.locals.user;
  const hours = parseInt(req.query.hours as string) || 24;
  const sinceDate = new Date(Date.now() - hours * 60 * 60 * 1000);

  const trendingPosts = await Post.findAll({
    include: [
      {
        model: User,
        attributes: ["user_id", "username", "profile_picture"],
      },
      {
        model: Category,
        attributes: ["category_id", "category_name"],
      },
    ],
    attributes: [
      "post_id",
      "user_id",
      "image_url",
      "caption",
      "category_id",
      "createdAt",
      "updatedAt",
      [
        Sequelize.literal(`(
          SELECT COUNT(*) FROM "Like" AS l
          WHERE l.post_id = "Post".post_id
            AND l."createdAt" >= '${sinceDate.toISOString()}'
        )`),
        "recent_likes",
      ],
    ],
    order: [
      [Sequelize.literal("recent_likes"), "DESC"],
      ["createdAt", "DESC"],
    ],
    limit: 10,
  });

  const postIds = trendingPosts.map((post: any) => post.post_id);

  const likedPostIds = user ? await getLikedPostIds(user.user_id) : [];
  const likeCountMap = await getLikeCountMap();
  const commentCountMap = await getCommentCountMap(postIds);
  const bookmarkedPostIds = user ? await getBookmarkedPostIds(user.user_id) : [];

  return trendingPosts.map(post =>
    formatPost(post, likedPostIds, likeCountMap, commentCountMap, bookmarkedPostIds, req)
  );
};