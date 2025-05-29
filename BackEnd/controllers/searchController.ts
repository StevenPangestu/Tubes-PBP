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
import { getPaginationParams, calculateHasMore } from "../utils/pagination";

export const searchPosts = async (req: Request, res: Response) => {
  const user = res.locals.user;
  const { q: searchTermRaw } = req.query;
  const { page, limit, offset } = getPaginationParams(req, 3);

  if (!searchTermRaw || typeof searchTermRaw !== "string" || searchTermRaw.trim().length === 0) {
    res.locals.errorCode = 400;
    throw new Error("Search term is required");
  }

  const searchTerm = searchTermRaw.trim();

  const { count: totalCount, rows: posts } = await Post.findAndCountAll({
    where: {
      caption: {
        [Op.iLike]: `%${searchTerm}%`,
      },
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
    limit,
    offset,
  });

  const postIds = posts.map((post) => post.post_id);

  const likedPostIds = user ? await getLikedPostIds(user.user_id) : [];
  const likeCountMap = await getLikeCountMap();
  const commentCountMap = await getCommentCountMap(postIds);
  const bookmarkedPostIds = user ? await getBookmarkedPostIds(user.user_id) : [];

  const formattedPosts = posts.map((post) =>
    formatPost(post, likedPostIds, likeCountMap, commentCountMap, bookmarkedPostIds, req)
  );

  return res.json({
    searchTerm,
    posts: formattedPosts,
    totalCount,
    hasMore: calculateHasMore(totalCount, page, limit),
    page,
  });
};
