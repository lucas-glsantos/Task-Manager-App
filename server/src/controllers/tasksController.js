import mongoose from "mongoose";
import Task from "../models/Task.js";
import { validateTask, validateTaskUpdate } from "../utils/validateUser.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const invalidId = (res) => res.status(400).json({ message: "ID de tarefa inválido" });

export async function getAllTasks(req, res, next) {
	try {
		const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
		res.status(200).json(tasks);
	} catch (error) {
		next(error);
	}
}

export async function getTaskById(req, res, next) {
	try {
		if (!isValidId(req.params.id)) return invalidId(res);
		const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
		if (!task) return res.status(404).json({ message: "Tarefa não encontrada" });
		res.status(200).json(task);
	} catch (error) {
		next(error);
	}
}

export async function createTask(req, res, next) {
	try {
		const { error: validationError, value } = validateTask(req.body);
		if (validationError) {
			return res.status(400).json({
				message: "Dados inválidos",
				details: validationError.details.map((d) => d.message),
			});
		}

		const task = new Task({ ...value, user: req.user._id });
		const savedTask = await task.save();
		res.status(201).json(savedTask);
	} catch (error) {
		next(error);
	}
}

export async function updateTask(req, res, next) {
	try {
		if (!isValidId(req.params.id)) return invalidId(res);

		const { error: validationError, value } = validateTaskUpdate(req.body);
		if (validationError) {
			return res.status(400).json({
				message: "Dados inválidos",
				details: validationError.details.map((d) => d.message),
			});
		}

		const updatedTask = await Task.findOneAndUpdate(
			{ _id: req.params.id, user: req.user._id },
			value,
			{ new: true, runValidators: true },
		);

		if (!updatedTask) return res.status(404).json({ message: "Tarefa não encontrada" });

		res.status(200).json(updatedTask);
	} catch (error) {
		next(error);
	}
}

export async function deleteTask(req, res, next) {
	try {
		if (!isValidId(req.params.id)) return invalidId(res);
		const deletedTask = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
		if (!deletedTask) return res.status(404).json({ message: "Tarefa não encontrada" });

		res.status(200).json({ message: "Tarefa deletada com sucesso!" });
	} catch (error) {
		next(error);
	}
}
