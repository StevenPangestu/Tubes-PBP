import express from "express";
import {
  checkMutualFollowing,
  followUser,
  getFollowers,
  getFollowing,
  getFollowStatus,
  unfollowUser,
} from "../controllers/followController";
import { authenticate } from "../middlewares/authMiddleware";
import { controllerWrapper } from "../utils/controllerWrapper";

const router = express.Router();

router.post("/:userId", authenticate, controllerWrapper(followUser));
router.delete("/:userId", authenticate,controllerWrapper(unfollowUser));
router.get("/followers/:userId", authenticate, controllerWrapper(getFollowers));
router.get("/following/:userId", authenticate, controllerWrapper(getFollowing));
router.get("/status/:userId", authenticate, controllerWrapper(getFollowStatus));
router.get('/mutual/:userId', authenticate, controllerWrapper(checkMutualFollowing));

export default router;
