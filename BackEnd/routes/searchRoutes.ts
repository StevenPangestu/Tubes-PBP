import express from "express";
import { searchPosts } from "../controllers/searchController";
import { authenticate } from "../middlewares/authMiddleware";
import { controllerWrapper } from "../utils/controllerWrapper";

const router = express.Router();

router.get("/posts", authenticate, controllerWrapper(searchPosts));

export default router;