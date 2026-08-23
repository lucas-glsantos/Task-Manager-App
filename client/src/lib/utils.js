// Padronização de date dentro do TaskCard

export function formatDate(date) {
    return date.toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}