import express from "express";
import { createTask, deleteTask, getAllTasks, getTaskById, updateTask } from "../controllers/tasksController.js";

const router = express.Router();

router.get("/", getAllTasks); // Obter todas as tarefas
router.get("/:id", getTaskById); // Obter tarefa por ID
router.post("/", createTask); // Criar tarefa
router.put("/:id", updateTask); // Atualizar tarefa
router.delete("/:id", deleteTask); // Deletar tarefa

export default router;
