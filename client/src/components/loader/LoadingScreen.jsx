// Componente reutilizável para Loading State

import { Loader2 } from "lucide-react";

export default function LoadingScreen({ textContent }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-2 transition-colors duration-300">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-primary">{textContent}</p>
        </div>
    );
}