import { Request, Response } from "express";
import { Op } from "sequelize";
import { Post } from "../models/Post";
import { User } from "../models/User";
import { Category } from "../models/Category";
import { formatPost } from "../utils/formatPost";
import {
  getLikedPostIds,
  getLikeCountMap,
  getCommentCountMap,
  getBookmarkedPostIds
} from "../utils/postHelper";

export const searchPosts = async (req: Request, res: Response) => {
  const user = res.locals.user;
  const { q: searchTerm, page = 0, limit = 3 } = req.query;
  const offset = parseInt(page as string) * parseInt(limit as string);

  if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length === 0) {
    res.locals.errorCode = 400;
    throw new Error('Search term is required');
  }

  const trimmedSearch = searchTerm.trim();

  const posts = await Post.findAll({
    where: {
      caption: {
        [Op.iLike]: `%${trimmedSearch}%`
      }
    },
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
    limit: parseInt(limit as string),
    offset,
  });

  const postIds = posts.map(post => post.post_id);

  const likedPostIds = user ? await getLikedPostIds(user.user_id) : [];
  const likeCountMap = await getLikeCountMap();
  const commentCountMap = await getCommentCountMap(postIds);
  const bookmarkedPostIds = user ? await getBookmarkedPostIds(user.user_id) : [];

  const formattedPosts = posts.map(post =>
    formatPost(post, likedPostIds, likeCountMap, commentCountMap, bookmarkedPostIds, req)
  );

  return {
    searchTerm: trimmedSearch,
    posts: formattedPosts,
    totalResults: posts.length,
    hasMore: posts.length >= parseInt(limit as string),
    page: parseInt(page as string)
  };
};