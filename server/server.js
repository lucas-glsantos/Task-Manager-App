import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import tasksRoutes from "./src/routes/tasksRoutes.js";
import { connectDB } from "./src/config/db.js";
import rateLimiter from "./src/middleware/rateLimiter.js";

import { setServers } from "node:dns/promises";
setServers(["1.1.1.1", "8.8.8.8"]); // Forçar o uso de DNS públicos no código Caso "Error: querySrv ECONNREFUSED"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(
	cors({
		origin: "http://localhost:5173",
	}),
);
app.use(express.json()); // Este middleware analisara JSON bodies: req.body
app.use(rateLimiter);

//app.use((req, res, next) => {
//    console.log(`Req method é ${req.method} & Req URL é ${req.url}`);
//    next();
//})

app.use("/api/tasks", tasksRoutes);

connectDB().then(() => {
	app.listen(PORT, () => {
		console.log("Servidor rodando na PORTA:", PORT);
	});
});
