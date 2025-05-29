import express from "express";
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowStatus,
} from "../controllers/followController";
import { controllerWrapper } from "../utils/controllerWrapper";
import { authenticate } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/:userId", authenticate, controllerWrapper(followUser));
router.delete("/:userId", authenticate,controllerWrapper(unfollowUser));
router.get("/followers/:userId", authenticate, controllerWrapper(getFollowers));
router.get("/following/:userId", authenticate, controllerWrapper(getFollowing));
router.get("/status/:userId", authenticate, controllerWrapper(getFollowStatus));

export default router;
