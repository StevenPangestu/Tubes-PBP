import express from 'express';
import {
    createComment,
    deleteComment,
    getPostComments,
    updateComment
} from '../controllers/commentController';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/posts/:idPost/comments', authenticate, createComment);
router.get('/posts/:idPost/comments', getPostComments);
router.put('/comments/:idComment', authenticate, updateComment);
router.delete('/comments/:idComment', authenticate, deleteComment);

export default router;