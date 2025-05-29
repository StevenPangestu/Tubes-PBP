import { Request } from "express";
import { Post } from "../models/Post";
import { formatProfilePictureUrl } from "./formatUrl";

export const formatPost = (
  post: Post,
  likedPostIds: string[],
  likeCountMap: Map<string, number>,
  commentCountMap: Map<string, number>,
  bookmarkedPostIds: string[],
  req: Request
) => {
  const postJson = post.toJSON() as any;

  if (postJson.user?.profile_picture) {
    postJson.user.profile_picture = formatProfilePictureUrl(
      postJson.user.profile_picture,
      req
    );
  }

  postJson.is_liked = likedPostIds.includes(post.post_id);  
  postJson.likes_count = likeCountMap.get(post.post_id) || 0;
  postJson.comments_count = commentCountMap.get(post.post_id) || 0;
  postJson.is_bookmarked = bookmarkedPostIds.includes(post.post_id);


  return postJson;
};
