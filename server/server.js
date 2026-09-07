import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setServers } from "node:dns/promises";

import { protect } from "./src/middleware/authMiddleware.js";
import { connectDB } from "./src/config/db.js";
import tasksRoutes from "./src/routes/tasksRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";

setServers(["1.1.1.1", "8.8.8.8"]); // DNS públicos (evita querySrv ECONNREFUSED)

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(
	cors({
		origin: CLIENT_ORIGIN,
		credentials: true,
	}),
);

app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/tasks", protect, tasksRoutes);

// 404 para rotas /api desconhecidas (antes do static)
app.use("/api", (req, res) => res.status(404).json({ message: "Rota não encontrada" }));

if (process.env.NODE_ENV === "production") {
	const dist = path.join(__dirname, "../client/dist");
	app.use(express.static(dist));

	// Express 5: "*" puro é inválido (path-to-regexp v8). Usar /*splat.
	app.get("/*splat", (req, res) => {
		res.sendFile(path.join(dist, "index.html"));
	});
}

// Error handler global ÚNICO (elimina os handlers duplicados por router)
app.use((err, req, res, next) => {
	console.error("Erro não tratado:", err);
	if (err?.code === 11000) {
		return res.status(400).json({ message: "Email já cadastrado" });
	}
	if (err?.name === "ValidationError") {
		return res.status(400).json({ message: "Dados inválidos", error: err.message });
	}
	return res.status(500).json({ message: "Erro interno no servidor" });
});

connectDB().then(() => {
	app.listen(PORT, () => {
		console.log("Servidor rodando na PORTA:", PORT);
	});
});
