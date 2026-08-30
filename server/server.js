import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";

import { setServers } from "node:dns/promises";
import { protect } from "./src/middleware/authMiddleware.js";
import { connectDB } from "./src/config/db.js";
import { refreshTokenValidator } from "./src/middleware/refreshMiddleware.js";

import rateLimiter from "./src/middleware/rateLimiter.js";
import tasksRoutes from "./src/routes/tasksRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";

import User from "./src/models/User.js";

setServers(["1.1.1.1", "8.8.8.8"]); // Forçar o uso de DNS públicos no código Caso "Error: querySrv ECONNREFUSED"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "../client/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.join(__dirname, "../client", "dist", "index.html"));
	});
}

// Cors Config
app.use(
	cors({
		origin: process.env.NODE_ENV === 'production'
			? "http://localhost:5173" // Dominio personalizado
			: "http://localhost:5173", // Local Address
		credentials: true, 
	}),
);

app.use(express.json());
app.use(rateLimiter);


app.use("/api/auth", authRoutes);
app.post("/api/auth/logout", protect, async (req, res) => {
	// Remover refreshToken do banco, invalidation imediata
	await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
	res.json({ message: "Logout bem-sucedido" });
});
app.use("/api/tasks", protect, tasksRoutes); // Tudo protegido

connectDB().then(() => {
	app.listen(PORT, () => {
		console.log("Servidor rodando na PORTA:", PORT);
	});
});
