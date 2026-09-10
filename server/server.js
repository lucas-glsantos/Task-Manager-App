import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setServers } from "node:dns/promises";

import { protect } from "./src/middleware/authMiddleware.js";
import { connectDB } from "./src/config/db.js";
import tasksRoutes from "./src/routes/tasksRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";

dotenv.config();

setServers(["1.1.1.1", "8.8.8.8"]); // DNS públicos (evita querySrv ECONNREFUSED)

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigin = [process.env.CLIENT_ORIGIN, "http://localhost:5173"].filter(Boolean);

app.use(
	cors({
		origin: (origin, cb) => {
			if (!origin) return cb(null, true);
			if (allowedOrigin.includes(origin)) return cb(null, true);
			if (process.env.VERCEL_ENV === "preview" && origin.endsWith(".vercel.app")) return cb(null, true);

			return cb(new Error("Error CORS"));
		},
		credentials: true,
	}),
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", protect, tasksRoutes);

// 404 para rotas /api desconhecidas (antes do static)
app.use("/api", (req, res) => res.status(404).json({ message: "Rota não encontrada" }));

if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
	const dist = path.join(__dirname, "../client/dist");
	app.use(express.static(dist));

	// Express 5: "*" puro é inválido (path-to-regexp v8). Usar /*splat.
	app.get("/*splat", (req, res) => {
		res.sendFile(path.join(dist, "index.html"));
	});
}

// Error handler global ÚNICO (elimina os handlers duplicados por router)
app.use((error, req, res, next) => {
	console.error("Erro não tratado:", error);
	if (error?.code === 11000) {
		return res.status(400).json({ message: "Email já cadastrado" });
	}
	if (error?.name === "ValidationError") {
		return res.status(400).json({ message: "Dados inválidos", error: error.message });
	}
	if (error?.name === "CastError") {
		return res.status(400).json({ message: "ID inválido" });
	}
	return res.status(500).json({ message: "Erro interno no servidor" });
});

if (!process.env.VERCEL){
	connectDB().then(() => {
		app.listen(PORT, () => {
			console.log("Servidor rodando na PORTA:", PORT);
		});
	});
} else {
	connectDB(); // Conecta Lazy por invocação com cache
};