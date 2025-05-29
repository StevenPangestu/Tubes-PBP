import express from "express";
import { register, login } from "../controllers/authController";
import { controllerWrapper } from "../utils/controllerWrapper";

const router = express.Router();

router.post("/register", controllerWrapper(register));
router.post("/login", controllerWrapper(login));

export default router;