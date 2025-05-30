import express from "express";
import { getAllPosts, createPost, deletePost, updatePost, getTrendingPosts } from "../controllers/postController";
import { postUpload } from '../middlewares/uploadMiddleware';
import { authenticate } from "../middlewares/authMiddleware";
import { controllerWrapper } from "../utils/controllerWrapper";
import { likePost, unlikePost } from '../controllers/likeController';

const router = express.Router();

router.get("/", authenticate, controllerWrapper(getAllPosts));
router.get("/trending", authenticate, controllerWrapper(getTrendingPosts));
router.post("/", authenticate, postUpload.single("image"), controllerWrapper(createPost));
router.delete("/:post_id", authenticate, controllerWrapper(deletePost));
router.put("/:post_id", authenticate, controllerWrapper(updatePost));
router.post('/:postId/like', authenticate, controllerWrapper(likePost));
router.delete('/:postId/like', authenticate, controllerWrapper(unlikePost));

export default router;