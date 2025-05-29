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

router.post('/:idPost/comments', authenticate, controllerWrapper(createComment));
router.get('/:idPost/comments', controllerWrapper(getPostComments));
router.put('/:idComment', authenticate, controllerWrapper(updateComment));
router.delete('/:idComment', authenticate, controllerWrapper(deleteComment));
export default router;