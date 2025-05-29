import { Router } from 'express';
import { getProfile, getUserByUsername, getPostsByUsername, updateUserProfile } from '../controllers/userController';
import { profileUpload } from '../middlewares/uploadMiddleware';
import { authenticate } from '../middlewares/authMiddleware';
import { controllerWrapper } from '../utils/controllerWrapper';

const router = Router();

router.get('/profile', authenticate, controllerWrapper(getProfile));
router.get('/:username', authenticate, controllerWrapper(getUserByUsername));
router.get('/:username/posts', authenticate, controllerWrapper(getPostsByUsername));
router.put('/:id', authenticate, profileUpload.single('profile_picture'), controllerWrapper(updateUserProfile));

export default router;
