import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Comment, Follow, Post, User } from '../models';

export const createComment = async (req: Request, res: Response) => {
  const user = res.locals.user;
  const { idPost } = req.params;
  const { content, parent_id } = req.body;

  console.log("Creating comment for post:", idPost);
  console.log("Current user:", user.user_id);

  if (!content || !content.trim()) {
    res.locals.errorCode = 400;
    throw new Error("Comment content is required");
  }

  const post = await Post.findByPk(idPost, {
    include: [{ model: User, attributes: ['user_id'] }]
  });

  if (!post) {
    res.locals.errorCode = 404;
    throw new Error("Post not found");
  }

  const postOwnerId = post.user_id;
  console.log("Post owner ID:", postOwnerId);
  console.log("Is user the post owner?", user.user_id === postOwnerId);

  // Allow comments if the user is the post owner
  if (user.user_id !== postOwnerId) {
    // User is not the post owner, check for mutual following
    console.log("User is not post owner, checking mutual following");

    // Check if mutual following exists between the users
    const userFollowsPostOwner = await Follow.findOne({
      where: {
        follower_id: user.user_id,
        following_id: postOwnerId  // Changed from followed_id to following_id
      }
    });

    const postOwnerFollowsUser = await Follow.findOne({
      where: {
        follower_id: postOwnerId,
        following_id: user.user_id  // Changed from followed_id to following_id
      }
    });

    if (!userFollowsPostOwner || !postOwnerFollowsUser) {
      res.locals.errorCode = 403;
      throw new Error("You can only comment when there is mutual following (you both follow each other)");
    }
  } else {
    console.log("User is post owner, allowing comment");
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

  const post = await Post.findByPk(idPost, {
    include: [{ model: User, attributes: ['user_id', 'username', 'profile_picture'] }]
  });

  if (!post) {
    res.locals.errorCode = 404;
    throw new Error("Post not found");
  }

  const allComments = await Comment.findAll({
    where: {
      post_id: idPost
    },
    include: [
      { model: User, attributes: ['user_id', 'username', 'profile_picture'] }
    ],
    order: [['createdAt', 'ASC']]
  });

  const rootComments = allComments
    .filter(comment => comment.parent_id === null)
    .map(comment => comment.toJSON());

  const replies = allComments
    .filter(comment => comment.parent_id !== null)
    .map(comment => comment.toJSON());

  // Group replies by their parent comment
  const commentTree = rootComments.map(rootComment => {
    const commentReplies = replies.filter(reply =>
      reply.parent_id === rootComment.comment_id
    );
    return {
      ...rootComment,
      replies: commentReplies
    };
  });

  return {
    post: post.toJSON(),
    comments: commentTree
  };
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

export const checkFollowingStatus = async (req: Request, res: Response) => {
  const currentUserId = res.locals.user.user_id;
  const { userId } = req.params;

  const follow = await Follow.findOne({
    where: {
      follower_id: currentUserId,
      followed_id: userId
    }
  });

  return {
    isFollowing: !!follow
  };
};
