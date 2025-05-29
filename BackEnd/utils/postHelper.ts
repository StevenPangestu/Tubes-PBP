import { Like } from "../models/Like";
import { Comment } from "../models/Comment";
import { CollectionPost } from "../models/CollectionPost";
import { Collection } from "../models/Collection";
import { Sequelize } from "sequelize";

export const getLikedPostIds = async (user_id: string) => {
  const likes = await Like.findAll({
    where: { user_id },
    attributes: ["post_id"],
  });
  return likes.map((like) => like.post_id);
};

export const getLikeCountMap = async () => {
  const likeCountsRaw = await Like.findAll({
    attributes: [
      "post_id",
      [Sequelize.fn("COUNT", Sequelize.col("like_id")), "likes_count"],
    ],
    group: ["post_id"],
  });

  return new Map(
    likeCountsRaw.map((like) => [
      like.getDataValue("post_id"),
      parseInt(like.getDataValue("likes_count")),
    ])
  );
};

export const getCommentCountMap = async (postIds: string[]) => {
  const commentCountsRaw = await Comment.findAll({
    attributes: [
      "post_id",
      [Sequelize.fn("COUNT", Sequelize.col("comment_id")), "comments_count"],
    ],
    where: { post_id: postIds },
    group: ["post_id"],
  });

  return new Map(
    commentCountsRaw.map((comment) => [
      comment.getDataValue("post_id"),
      parseInt(comment.getDataValue("comments_count")),
    ])
  );
};

export const getBookmarkedPostIds = async (user_id: string) => {
  const bookmarks = await CollectionPost.findAll({
    include: [
      {
        model: Collection,
        where: { user_id },
        required: true,
      },
    ],
  });
  return bookmarks.map((b) => b.post_id);
};
