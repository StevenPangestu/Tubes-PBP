import { Request, Response } from 'express';
import { Comment, User } from '../models';

export const createComment = async (req: Request, res: Response) => {
    try {
        const user = res.locals.user;
        const { idPost } = req.params;
        const { content, parent_id } = req.body;

        const comment = await Comment.create({
            user_id: user.user_id,
            post_id: idPost,
            content,
            parent_id: parent_id || null
        });

        const commentWithUser = await Comment.findOne({
            where: { comment_id: comment.comment_id },
            include: [{ model: User, attributes: ['username', 'profile_picture'] }]
        });

        res.status(201).json(commentWithUser);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create comment', error });
    }
};

export const getPostComments = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;

        const comments = await Comment.findAll({
            where: {
                post_id: postId,
                parent_id: null // Get only parent comments
            },
            include: [
                {
                    model: User,
                    attributes: ['username', 'profile_picture']
                },
                {
                    model: Comment,
                    as: 'replies',
                    include: [{
                        model: User,
                        attributes: ['username', 'profile_picture']
                    }]
                }
            ],
            order: [
                ['createdAt', 'DESC'],
                [{ model: Comment, as: 'replies' }, 'createdAt', 'ASC']
            ]
        });

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch comments', error });
    }
};

export const updateComment = async (req: Request, res: Response) => {
    try {
        const user = res.locals.user;
        const { idComment } = req.params;
        const { content } = req.body;

        const comment = await Comment.findOne({
            where: {
                comment_id: idComment,
                user_id: user.user_id
            }
        });

        if (!comment) {
            res.status(404).json({ message: 'Comment not found or unauthorized' });
            return;
        }

        await comment.update({ content });
        res.json({ message: 'Comment updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update comment', error });
    }
};

export const deleteComment = async (req: Request, res: Response) => {
    try {
        const user = res.locals.user;
        const { idComment } = req.params;

        const deleted = await Comment.destroy({
            where: {
                comment_id: idComment,
                user_id: user.user_id
            }
        });

        if (!deleted) {
            res.status(404).json({ message: 'Comment not found or unauthorized' });
            return;
        }

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete comment', error });
    }
};