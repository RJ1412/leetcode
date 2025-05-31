import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { addComment, getCommentsForProblem } from "../controllers/discussion.controller.js";
const router = express.Router();

router.post("/:problemId", authMiddleware, addComment);

router.get("/:problemId", getCommentsForProblem);

export default router;
