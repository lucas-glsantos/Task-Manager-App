import { PenSquareIcon, Trash2Icon } from "lucide-react";
import { Link } from "react-router";
import { formatDate } from "../lib/utils";
import api from "../lib/axios";
import toast from "react-hot-toast";

const TaskCard = ({ task, setTasks }) => {
    const handleDelete = async (e, id) => {
        e.preventDefault(); // livrar do comportamento de navegação

        if (!window.confirm("Tem certeza de que deseja excluir esta tarefa?"))
            return;

        try {
            await api.delete(`/tasks/${id}`);
            setTasks((prev) => prev.filter((task) => task._id !== id)); // Filtrar exluido
            toast.success("Tarefa excluída com sucesso!");
        } catch (error) {
            console.log("Error no handleDelete", error);
            toast.error("Falha ao excluir tarefa");
        }
    };

    return (
        <Link to={`/task/${task._id}`}
            className="card bg-base-100 hover:shadow-lg transition-all duration-200
     border-t-4 border-solid"
        >
            <div className="card-body">
                <h3 className="card-title text-base-content">{task.title}</h3>
                <p className="text-base-content/70 line-clamp-3">{task.content}</p>
                <div className="card-actions justify-between items-center mt-4">
                    <span className="text-sm text-base-content/60">{formatDate(new Date(task.createdAt))}</span>
                    <div className="flex items-center gap-1">
                        <PenSquareIcon className="size-4" />
                        <button className="btn btn-ghost btn-xs text-error" onClick={(e) => handleDelete(e,task._id)}>
                            <Trash2Icon className="size-4" />
                        </button>
                    </div>
                </div>

            </div>
        </Link>
    )
};

export default TaskCard;