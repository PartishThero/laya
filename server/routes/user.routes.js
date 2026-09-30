import express from "express";

import { registerUser } from "../controllers/user.controllers.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const userRoutes = express.Router()

userRoutes.post('/register' ,registerUser)

export default userRoutes