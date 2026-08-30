import express from "express";
import rateLimit from "express-rate-limit";
import { register, login, me } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { refreshTokenValidator } from "../middleware/refreshMiddleware.js";
import { refreshToken } from "../controllers/refreshController.js";
import User from "../models/User.js";


const authLimiter = rateLimit({ 
    windowMs: 15 * 60 * 1000, // 15m
    max: 100 // req Max
});
const authRoutes = express.Router();

authRoutes.post("/register", authLimiter, register);
authRoutes.post("/login", authLimiter, login);
authRoutes.get("/me", protect, me);
authRoutes.post("/refresh-token", refreshTokenValidator, refreshToken);

authRoutes.post("/logout", protect, async (req, res) => {
	// Remover refreshToken do banco, invalidation imediata
	await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
	res.json({ message: "Logout bem-sucedido" });
});

export default authRoutes;