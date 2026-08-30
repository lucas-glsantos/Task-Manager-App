import Task from "../models/Task.js";

export async function getAllTasks(req, res) {
    try {
        const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(tasks);
    } catch (error) {
        console.error("Erro em getAllTasks controller", error);
        res.status(500).json({ message: "Erro interno no servidor" });
    }
};

export async function getTaskById(req, res) {
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
        if (!task) return res.status(404).json({ message: "Tarefa não encontrada" });
        res.status(200).json(task);
    } catch (error) {
        console.error("Erro em getTaskById controller", error);
        res.status(500).json({ message: "Erro interno no servidor" });
    }
};

export async function createTask(req, res) {
    try {
        const { title, content } = req.body;
        const task = new Task({ title, content, user: req.user._id });

        const savedTask = await task.save();
        res.status(201).json(savedTask);
    } catch (error) {
        console.error("Erro em createTask controller", error);
        res.status(500).json({ message: "Erro interno no servidor" });
    }
};

export async function updateTask(req, res) {
    try {
        const { title, content } = req.body;
        const updatedTask = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { title, content },
            { new: true }
        );

        if (!updatedTask) return res.status(404).json({ message: "Tarefa não encontrada" });

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error("Erro em updateTask controller", error);
        res.status(500).json({ message: "Erro interno no servidor" });
    }
};

export async function deleteTask(req, res) {
    try {
        const deletedTask = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!deletedTask) return res.status(404).json({ message: "Tarefa não encontrada" });

        res.status(200).json({ message: "Tarefa deletada com sucesso!" });
    } catch (error) {
        console.error("Erro em deleteTask controller", error);
        res.status(500).json({ message: "Erro interno no servidor" });
    }
};