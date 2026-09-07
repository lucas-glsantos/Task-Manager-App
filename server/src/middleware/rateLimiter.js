import ratelimit from "../config/upstash.js";

// Reserva: o rate limiting ativo hoje é o express-rate-limit nas authRoutes.
// Este middleware Upstash fica disponível para uso futuro com chave por IP
// (a versão anterior usava chave estática "my-rate-limit", que fazia todos
// os usuários dividirem o mesmo bucket — um usuário abusivo bloqueava todos).
const rateLimiter = async (req, res, next) => {
	try {
		const key = req.ip || req.headers["x-forwarded-for"] || "global";
		const { success } = await ratelimit.limit(key);

		if (!success) {
			return res.status(429).json({
				message: "Muitos pedidos, tente novamente mais tarde...",
			});
		}

		return next();
	} catch (error) {
		console.log("Erro Rate limit (fail-open)", error);
		return next();
	}
};

export default rateLimiter;
