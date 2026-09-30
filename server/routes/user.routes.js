import express from "express";

import { getMe, loginUser, registerUser } from "../controllers/user.controllers.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const userRoutes = express.Router()

userRoutes.post('/register' ,registerUser)
userRoutes.post('/login' ,loginUser)
userRoutes.get('/me' ,isAuthenticated, getMe)

export default userRoutes