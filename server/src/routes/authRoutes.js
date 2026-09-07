import express from "express";
import rateLimit from "express-rate-limit";
import { register, login, logout, me } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { refreshTokenValidator } from "../middleware/refreshMiddleware.js";
import { refreshToken } from "../controllers/refreshController.js";

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	standardHeaders: "draft-7",
	legacyHeaders: false,
});

const authRoutes = express.Router();

authRoutes.post("/register", authLimiter, register); // Rota User Register
authRoutes.post("/login", authLimiter, login); // Rota User Login
authRoutes.get("/me", protect, me); // Rota User Logado
authRoutes.post("/refresh", refreshTokenValidator, refreshToken); // Aceita /refresh (padrão) e mantém /refresh-token por compatibilidade
authRoutes.post("/refresh-token", refreshTokenValidator, refreshToken);
authRoutes.post("/logout", protect, logout); // Rota User Logout

export default authRoutes;
