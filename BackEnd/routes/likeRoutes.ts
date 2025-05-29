import express from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { likePost, unlikePost } from '../controllers/likeController';
import { controllerWrapper } from '../utils/controllerWrapper';

const router = express.Router();

router.post('/:postId/like', authenticate, controllerWrapper(likePost));
router.delete('/:postId/like', authenticate, controllerWrapper(unlikePost));

export default router;
