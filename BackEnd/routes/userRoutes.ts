import { Router } from 'express';
import { getProfile, getUserByUsername, getPostsByUsername, updateUserProfile } from '../controllers/userController';
import { upload } from "../middlewares/userMiddleware";

const router = Router();

router.get('/profile', getProfile);
router.get('/:username', getUserByUsername);
router.get('/:username/posts', getPostsByUsername);

router.put('/:id', upload.single('profile_picture'), updateUserProfile);

export default router;
