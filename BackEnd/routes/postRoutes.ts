import express from "express";
import { getAllPosts, createPost } from "../controllers/postController";
import { upload } from "../middlewares/uploadMiddleware";

const router = express.Router();

router.get("/", getAllPosts);

router.post("/", upload.single("image"), createPost);

export default router;
