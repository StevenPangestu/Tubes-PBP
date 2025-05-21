import express from "express";
import { createPost, getAllPosts, getPostCommentCount, updateCommentCount } from "../controllers/postController";
import { authenticate } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/uploadMiddleware";

const router = express.Router();

router.get("/", getAllPosts);

router.post("/", upload.single("image"), createPost);

router.post('/:idPost/update-comment-count', authenticate, updateCommentCount);

router.get('/:idPost/comment-count', authenticate, getPostCommentCount);

export default router;

