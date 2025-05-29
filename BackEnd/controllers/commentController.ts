import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Comment, User, Post } from '../models';

export const createComment = async (req: Request, res: Response) => {
  const user = res.locals.user;
  const { idPost } = req.params;
  const { content, parent_id } = req.body;

  if (!content || !content.trim()) {
    res.locals.errorCode = 400;
    throw new Error("Comment content is required");
  }

  // Validasi apakah post exists
  const post = await Post.findByPk(idPost);
  if (!post) {
    res.locals.errorCode = 404;
    throw new Error("Post not found");
  }

  const comment = await Comment.create({
    comment_id: uuidv4(),
    user_id: user.user_id,
    post_id: idPost,
    content: content.trim(),
    parent_id: parent_id || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const commentWithUser = await Comment.findOne({
    where: { comment_id: comment.comment_id },
    include: [{ 
      model: User, 
      attributes: ['user_id', 'username', 'profile_picture'] 
    }]
  });

  res.locals.statusCode = 201;
  return {
    message: "Comment created successfully",
    comment: commentWithUser
  };
};

export const getPostComments = async (req: Request, res: Response) => {
  const { idPost } = req.params;

  // Validasi apakah post exists
  const post = await Post.findByPk(idPost);
  if (!post) {
    res.locals.errorCode = 404;
    throw new Error("Post not found");
  }

  const comments = await Comment.findAll({
    where: {
      post_id: idPost,
      parent_id: null // Get only parent comments
    },
    include: [
      {
        model: User,
        attributes: ['user_id', 'username', 'profile_picture']
      },
      {
        model: Comment,
        as: 'replies',
        include: [{
          model: User,
          attributes: ['user_id', 'username', 'profile_picture']
        }]
      }
    ],
    order: [
      ['createdAt', 'DESC'],
      [{ model: Comment, as: 'replies' }, 'createdAt', 'ASC']
    ]
  });

  return comments;
};

export const updateComment = async (req: Request, res: Response) => {
  const user = res.locals.user;
  const { idComment } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    res.locals.errorCode = 400;
    throw new Error("Comment content is required");
  }

  const comment = await Comment.findOne({
    where: {
      comment_id: idComment,
      user_id: user.user_id
    }
  });

  if (!comment) {
    res.locals.errorCode = 404;
    throw new Error('Comment not found or unauthorized');
  }

  await comment.update({ content: content.trim() });
  
  return { 
    message: 'Comment updated successfully',
    comment 
  };
};

export const deleteComment = async (req: Request, res: Response) => {
  const user = res.locals.user;
  const { idComment } = req.params;

  const deleted = await Comment.destroy({
    where: {
      comment_id: idComment,
      user_id: user.user_id
    }
  });

  if (!deleted) {
    res.locals.errorCode = 404;
    throw new Error('Comment not found or unauthorized');
  }

  return { message: 'Comment deleted successfully' };
};