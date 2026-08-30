import express from "express";
import { createTask, deleteTask, getAllTasks, getTaskById, updateTask } from "../controllers/tasksController.js";

const tasksRoutes = express.Router();

tasksRoutes.get("/", getAllTasks); // Obter todas as tarefas
tasksRoutes.get("/:id", getTaskById); // Obter tarefa por ID
tasksRoutes.post("/", createTask); // Criar tarefa
tasksRoutes.put("/:id", updateTask); // Atualizar tarefa
tasksRoutes.delete("/:id", deleteTask); // Deletar tarefa

export default tasksRoutes;
