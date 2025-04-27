import express from 'express'
import { authMiddleware, checkAdmin } from '../middleware/auth.middleware.js';
import { createProblem, deleteProblem, getAllProblems, getAllProblemsSolvedByUser, getProblemById, updateProblem } from '../controllers/problems.controller.js';
const problemRoutes = express.Router();

problemRoutes.post("/create-problem" , authMiddleware , checkAdmin ,createProblem)

problemRoutes.post("/get-all-problem" , authMiddleware , getAllProblems)
problemRoutes.post("/get-problem/:id" , authMiddleware , getProblemById)
problemRoutes.post("/update-problem/:id" , authMiddleware , checkAdmin , updateProblem)
problemRoutes.post("/delete-problem/:id" , authMiddleware , checkAdmin , deleteProblem)
problemRoutes.post("/get-solved-problem" , authMiddleware , getAllProblemsSolvedByUser)

export default problemRoutes;