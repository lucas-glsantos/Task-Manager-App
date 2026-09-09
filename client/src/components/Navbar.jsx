import { Link, useNavigate } from "react-router";
import { LogOutIcon, PlusIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    // Botão Logout
    const handleLogout = async () => {
        await logout();
        navigate("/login");
    }


    return (
        <header className="bg-base-300 border-b border-base-content/10 mt-auto">
            <div className="mx-auto max-w-6xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-primary font-mono tracking-tight">Task Manager</h1>
                    <div className="flex items-center gap-4">
                        <Link to={"/create"} className="btn btn-primary outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500">
                            <PlusIcon className="size-5" />
                            <span>Nova Tarefa</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="btn btn-ghost outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
                        >
                            <LogOutIcon className="size-5" />
                            <span>Sair</span>
                        </button>
                    </div>
                </div>

            </div>
        </header>
    )
};

export default Navbar;