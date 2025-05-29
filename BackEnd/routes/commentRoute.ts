import express from 'express';
import {
    createComment,
    deleteComment,
    getPostComments,
    updateComment
} from '../controllers/commentController';
import { authenticate } from '../middlewares/authMiddleware';
import { controllerWrapper } from '../utils/controllerWrapper';

const router = express.Router();

router.post('/posts/:idPost/comments', authenticate, controllerWrapper(createComment));
router.get('/posts/:idPost/comments', controllerWrapper(getPostComments));
router.put('/comments/:idComment', authenticate, controllerWrapper(updateComment));
router.delete('/comments/:idComment', authenticate, controllerWrapper(deleteComment));

export default router;