import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getProfile, getSolvedProblemsStats, updateProfile } from "../controllers/user.controllers.js";

const userRoutes = express.Router();

userRoutes.get("/my-profile", authMiddleware, getProfile);
userRoutes.put("/update-profile", authMiddleware, updateProfile);
userRoutes.get("/solved-problems-stats", authMiddleware, getSolvedProblemsStats);

export default userRoutes;
