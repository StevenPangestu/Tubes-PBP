import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Like } from '../models/Like';
import { Post } from '../models/Post';

export const likePost = async (req: Request, res: Response) => {
  const user = res.locals.user;
  const { postId } = req.params;

  // Validasi apakah post exists
  const post = await Post.findByPk(postId);
  if (!post) {
    res.locals.errorCode = 404;
    throw new Error('Post not found');
  }

  const existingLike = await Like.findOne({
    where: { user_id: user.user_id, post_id: postId },
  });

  if (existingLike) {
    return { message: 'Post already liked', liked: true };
  }

  await Like.create({
    like_id: uuidv4(),
    user_id: user.user_id,
    post_id: postId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return { message: 'Post liked successfully', liked: true };
};

export const unlikePost = async (req: Request, res: Response) => {
  const user = res.locals.user;
  const { postId } = req.params;

  // Validasi apakah post exists
  const post = await Post.findByPk(postId);
  if (!post) {
    res.locals.errorCode = 404;
    throw new Error('Post not found');
  }

  const deleted = await Like.destroy({
    where: { user_id: user.user_id, post_id: postId },
  });

  if (!deleted) {
    res.locals.errorCode = 404;
    throw new Error('Like not found');
  }

  return { message: 'Post unliked successfully', liked: false };
};
