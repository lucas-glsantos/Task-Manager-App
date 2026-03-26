import Task from "../models/Task.js";

export async function getAllTasks(_, res) {
    // Buscar todas as Tarefas
    try {
        const tasks = await Task.find().sort({ createdAt: -1 }); // -1 classifica em desc, ordem (mais recente primeiro)
        res.status(200).json(tasks);

    } catch (error) {
        console.error("Erro em getAllTasks controller", error);
        res.status(500).json({ message: "Erro interno no servidor" });
    }
};

export async function getTaskById(req, res) {
    // Buscar Tarefa pelo Id
    try {
        const task = await Task.findById(req.params.id);
        if(!task) return res.status(404).json({ message: "Tarefa não encontrada" });
        res.status(200).json(task);

    } catch (error) {
        console.error("Erro em getTaskById controller", error);
        res.status(500).json({ message: "Erro interno no servidor" });
    }
}

export async function createTask(req, res) {
    // Criar Tarefas
    try {
        const { title, content } = req.body;
        const task = new Task({ title, content });

        const savedTask = await task.save();
        res.status(201).json(savedTask);
    } catch (error) {
        console.error("Erro em createTask controller", error);
        res.status(500).json({ message: "Erro interno no servidor" });
    }
};

export async function updateTask(req, res) {
    // Atualizar Tarefas
    try {
        const { title, content } = req.body;
        const updateTask = await Task.findByIdAndUpdate(
            req.params.id,
            { title, content },
            {
                new: true,
            }
        );


        if (!updateTask) return res.status(404).json({ message: "Tarefa não encotrada" });


        res.status(200).json(updateTask);
    } catch (error) {
        console.error("Erro em updateTask controller", error);
        res.status(500).json({ message: "Erro interno no servidor" });
    }

};

export async function deleteTask(req, res) {
    // Deletar Tarefas
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        if(!deletedTask) return res.status(404).json({ message: "Tarefa não encontrado" });

        res.status(200).json({ message: "Tarefa deletada com sucesso!" });
    } catch (error) {
        console.error("Erro em deleteTask controller", error);
        res.status(500).json({ message: "Erro interno no servidor" });
    }
};

